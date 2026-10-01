import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { Order, PaymentStatus, OrderItem } from '../types/order';

const STORAGE_KEY_ORDERS = 'camisas_qcen_orders_v1';

export interface SubmitOrderPayload {
  personName: string;
  whatsapp: string;
  items: Array<{ size: OrderItem['size']; quantity: number }>;
  paymentMethod?: string;
  notes?: string;
}

export const mapRowToOrder = (row: any): Order => ({
  id: row.id,
  personName: row.person_name,
  whatsapp: row.whatsapp || undefined,
  paymentMethod: row.payment_method || undefined,
  items: row.items || [],
  status: row.status as PaymentStatus,
  notes: row.notes || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapOrderToRow = (order: Order) => ({
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

export async function submitPublicOrder(payload: SubmitOrderPayload): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();
  const newOrder: Order = {
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

  const client = getSupabaseClient();
  if (client) {
    const { error } = await client.from('orders').insert(mapOrderToRow(newOrder));
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  // Fallback to localStorage for local testing when Supabase is not yet configured
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ORDERS);
      const existing: Order[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([newOrder, ...existing]));
    } catch {
      // storage error ignored
    }
  }

  return { success: true };
}
