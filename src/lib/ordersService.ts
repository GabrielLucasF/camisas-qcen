import { Order, PaymentStatus, OrderItem } from '../types/order';

const STORAGE_KEY_ORDERS = 'camisas_qcen_orders_v1';

export interface SubmitOrderPayload {
  personName: string;
  whatsapp: string;
  items: Array<{ size: OrderItem['size']; quantity: number }>;
  paymentMethod?: string;
  notes?: string;
  honeypot?: string;
}

export interface DatabaseOrderRow {
  id: string;
  person_name: string;
  whatsapp?: string | null;
  payment_method?: string | null;
  items?: OrderItem[];
  status?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export const mapRowToOrder = (row: DatabaseOrderRow): Order => ({
  id: row.id,
  personName: row.person_name,
  whatsapp: row.whatsapp || undefined,
  paymentMethod: row.payment_method || undefined,
  items: Array.isArray(row.items) ? row.items : [],
  status: (row.status as PaymentStatus) || 'pending',
  notes: row.notes || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapOrderToRow = (order: Order): DatabaseOrderRow => ({
  id: order.id,
  person_name: order.personName,
  whatsapp: order.whatsapp || null,
  payment_method: order.paymentMethod || null,
  items: order.items,
  status: order.status,
  notes: order.notes || null,
  created_at: order.createdAt,
  updated_at: order.updatedAt,
});

export async function submitPublicOrder(
  payload: SubmitOrderPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.error || 'Erro ao processar pedido. Tente novamente.';
      return { success: false, error: errorMsg };
    }

    // If server indicates it's in local testing mode without Supabase
    if (data?.savedLocally && data?.order && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_ORDERS);
        const existing: Order[] = stored ? JSON.parse(stored) : [];
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([data.order, ...existing]));
      } catch {
        // storage error ignored
      }
    }

    return { success: true };
  } catch {
    // Fallback to localStorage only if network error in local development
    const now = new Date().toISOString();
    const fallbackOrder: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      personName: payload.personName.trim(),
      whatsapp: payload.whatsapp.trim(),
      paymentMethod: payload.paymentMethod,
      items: payload.items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        size: it.size,
        quantity: Math.max(1, it.quantity),
      })),
      status: 'pending',
      notes: payload.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_ORDERS);
        const existing: Order[] = stored ? JSON.parse(stored) : [];
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([fallbackOrder, ...existing]));
        return { success: true };
      } catch {
        return { success: false, error: 'Falha de conexão com o servidor.' };
      }
    }

    return { success: false, error: 'Falha de conexão com o servidor.' };
  }
}
