import { NextResponse } from 'next/server';
import {
  verifyLeaderRequest,
  verifyRequestOrigin,
  checkRateLimit,
  getClientIp,
  sanitizeString,
  sanitizePhone,
} from '@/lib/security';
import { getSupabaseServerClient } from '@/lib/supabase';
import { Order, OrderItem, PaymentStatus, ShirtSize } from '@/types/order';

const VALID_SIZES: ShirtSize[] = ['P', 'M', 'G', 'GG', 'G1', 'A definir'];
const VALID_STATUSES: PaymentStatus[] = ['pending', 'half', 'paid'];

interface DatabaseRow {
  id: string;
  person_name: string;
  whatsapp: string | null;
  payment_method: string | null;
  items: OrderItem[];
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToOrder(row: DatabaseRow): Order {
  return {
    id: row.id,
    personName: row.person_name,
    whatsapp: row.whatsapp || undefined,
    paymentMethod: row.payment_method || undefined,
    items: Array.isArray(row.items) ? row.items : [],
    status: (VALID_STATUSES.includes(row.status as PaymentStatus)
      ? row.status
      : 'pending') as PaymentStatus,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * GET /api/orders
 * Returns all orders. Protected: Requires leader authentication.
 */
export async function GET(request: Request) {
  const isLeader = verifyLeaderRequest(request);
  if (!isLeader) {
    return NextResponse.json(
      { error: 'Não autorizado. Faça login com o PIN de liderança.' },
      { status: 401 }
    );
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json({ configured: false, orders: [] });
  }

  const { data, error } = await client
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mapped = ((data || []) as unknown as DatabaseRow[]).map(mapRowToOrder);
  return NextResponse.json({ configured: true, orders: mapped });
}

/**
 * POST /api/orders
 * Public order submission (with anti-bot honeypot and rate limiting)
 * or leader creation (if authenticated).
 */
export async function POST(request: Request) {
  if (!verifyRequestOrigin(request)) {
    return NextResponse.json({ error: 'Origem da requisição não permitida.' }, { status: 403 });
  }

  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > 65536) {
    return NextResponse.json({ error: 'Payload excede o limite máximo permitido.' }, { status: 413 });
  }

  const clientIp = getClientIp(request);
  const isLeader = verifyLeaderRequest(request);

  // Rate limiting for public submissions (10 orders per 10 minutes per IP)
  if (!isLeader) {
    const rateCheck = checkRateLimit(`submit_order_${clientIp}`, 10, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Muitos pedidos enviados recentemente. Aguarde ${rateCheck.retryAfterSeconds} segundos.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  // Honeypot check for bots
  const honeypot = typeof body.honeypot === 'string' ? body.honeypot : '';
  const websiteTrap = typeof body.website === 'string' ? body.website : '';
  if (honeypot.trim().length > 0 || websiteTrap.trim().length > 0) {
    // Tarpit: return fake success to trick spam bots without recording data
    return NextResponse.json({ success: true });
  }

  // Input Sanitization & Validation
  const personName = sanitizeString(body.personName, 100);
  if (personName.length < 2) {
    return NextResponse.json(
      { error: 'Por favor, informe seu nome completo (mínimo 2 caracteres).' },
      { status: 400 }
    );
  }

  const rawWhatsapp = typeof body.whatsapp === 'string' ? body.whatsapp : '';
  const whatsapp = sanitizePhone(rawWhatsapp);
  const digitsOnly = whatsapp.replace(/\D/g, '');
  if (digitsOnly.length < 8) {
    return NextResponse.json(
      { error: 'Por favor, informe um número de WhatsApp válido com DDD.' },
      { status: 400 }
    );
  }

  // Items validation
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) {
    return NextResponse.json(
      { error: 'O pedido deve conter entre 1 e 20 itens.' },
      { status: 400 }
    );
  }

  const validatedItems: OrderItem[] = [];
  const now = new Date().toISOString();

  for (let idx = 0; idx < body.items.length; idx += 1) {
    const it = body.items[idx] as Record<string, unknown>;
    const rawSize = String(it?.size || '').trim() as ShirtSize;
    if (!VALID_SIZES.includes(rawSize)) {
      return NextResponse.json(
        { error: `Tamanho inválido: "${rawSize}". Escolha entre: ${VALID_SIZES.join(', ')}.` },
        { status: 400 }
      );
    }

    const qty = parseInt(String(it?.quantity), 10);
    if (Number.isNaN(qty) || qty < 1 || qty > 20) {
      return NextResponse.json(
        { error: 'Quantidade de camisas deve ser um número entre 1 e 20 por item.' },
        { status: 400 }
      );
    }

    validatedItems.push({
      id: `item-${Date.now()}-${idx}`,
      size: rawSize,
      quantity: qty,
    });
  }

  const notes = sanitizeString(body.notes, 500);

  // Status: leaders can specify, public orders are strictly 'pending'
  let status: PaymentStatus = 'pending';
  if (isLeader && typeof body.status === 'string') {
    const candidateStatus = body.status as PaymentStatus;
    if (VALID_STATUSES.includes(candidateStatus)) {
      status = candidateStatus;
    }
  }

  const newOrder: Order = {
    id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    personName,
    whatsapp: whatsapp || undefined,
    paymentMethod: typeof body.paymentMethod === 'string' ? sanitizeString(body.paymentMethod, 50) : undefined,
    items: validatedItems,
    status,
    notes: notes || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const client = getSupabaseServerClient();
  if (client) {
    const { error } = await client.from('orders').insert({
      id: newOrder.id,
      person_name: newOrder.personName,
      whatsapp: newOrder.whatsapp || null,
      payment_method: newOrder.paymentMethod || null,
      items: newOrder.items,
      status: newOrder.status,
      notes: newOrder.notes || null,
      created_at: newOrder.createdAt,
      updated_at: newOrder.updatedAt,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: newOrder });
  }

  return NextResponse.json({ success: true, savedLocally: true, order: newOrder });
}

/**
 * PATCH /api/orders
 * Updates an order. Protected: Requires leader authentication.
 */
export async function PATCH(request: Request) {
  if (!verifyRequestOrigin(request)) {
    return NextResponse.json({ error: 'Origem da requisição não permitida.' }, { status: 403 });
  }

  const isLeader = verifyLeaderRequest(request);
  if (!isLeader) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > 65536) {
    return NextResponse.json({ error: 'Payload excede o limite máximo permitido.' }, { status: 413 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  if (!id) {
    return NextResponse.json({ error: 'ID do pedido obrigatório.' }, { status: 400 });
  }

  const updates = (body.updates || {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof updates.personName === 'string') {
    patch.person_name = sanitizeString(updates.personName, 100);
  }

  if (typeof updates.whatsapp === 'string') {
    patch.whatsapp = sanitizePhone(updates.whatsapp);
  }

  if (typeof updates.status === 'string' && VALID_STATUSES.includes(updates.status as PaymentStatus)) {
    patch.status = updates.status;
  }

  if (typeof updates.notes === 'string') {
    patch.notes = sanitizeString(updates.notes, 500);
  }

  if (Array.isArray(updates.items)) {
    const validatedItems: OrderItem[] = [];
    for (let idx = 0; idx < updates.items.length; idx += 1) {
      const it = updates.items[idx] as Record<string, unknown>;
      const rawSize = String(it?.size || '').trim() as ShirtSize;
      if (!VALID_SIZES.includes(rawSize)) {
        return NextResponse.json({ error: `Tamanho inválido: "${rawSize}".` }, { status: 400 });
      }
      const qty = parseInt(String(it?.quantity), 10);
      if (Number.isNaN(qty) || qty < 1 || qty > 20) {
        return NextResponse.json({ error: 'Quantidade de camisas inválida.' }, { status: 400 });
      }
      validatedItems.push({
        id: String(it?.id || `item-${Date.now()}-${idx}`),
        size: rawSize,
        quantity: qty,
      });
    }
    patch.items = validatedItems;
  }

  const client = getSupabaseServerClient();
  if (client) {
    const { error } = await client.from('orders').update(patch).eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/orders
 * Deletes an order or clears all. Protected: Requires leader authentication.
 */
export async function DELETE(request: Request) {
  if (!verifyRequestOrigin(request)) {
    return NextResponse.json({ error: 'Origem da requisição não permitida.' }, { status: 403 });
  }

  const isLeader = verifyLeaderRequest(request);
  if (!isLeader) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const clearAll = searchParams.get('all') === 'true';

  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json({ success: true, localOnly: true });
  }

  if (clearAll) {
    const { error } = await client.from('orders').delete().neq('id', '');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (id) {
    const { error } = await client.from('orders').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Parâmetro id ou all é obrigatório.' }, { status: 400 });
}
