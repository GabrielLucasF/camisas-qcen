'use client';

import React from 'react';
import { Order, PaymentStatus } from '../types/order';
import { CheckCircle2, Clock, AlertCircle, Edit2, Trash2 } from 'lucide-react';

interface OrderItemRowProps {
  order: Order;
  onToggleStatus: (id: string) => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  paid: {
    label: 'Pago Completo',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  half: {
    label: 'Pago Metade',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  pending: {
    label: 'Pendente',
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

export function OrderItemRow({
  order,
  onToggleStatus,
  onEdit,
  onDelete,
}: OrderItemRowProps) {
  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const totalItemsCount = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 transition group">
      {/* Left: Person & Sizes */}
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-neutral-800 text-neutral-200 font-semibold flex items-center justify-center text-sm border border-neutral-700 shrink-0">
          {order.personName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-sm sm:text-base tracking-tight truncate">
              {order.personName}
            </h3>

            {/* Badges for sizes */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {order.items.map((item) => (
                <span
                  key={item.id}
                  className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-neutral-800 text-neutral-200 border border-neutral-700"
                >
                  Tam {item.size}
                  {item.quantity > 1 && (
                    <span className="text-emerald-400 font-bold ml-1">×{item.quantity}</span>
                  )}
                </span>
              ))}

              {totalItemsCount > 1 && (
                <span className="text-[11px] text-neutral-400 font-medium">
                  ({totalItemsCount} unids)
                </span>
              )}
            </div>
          </div>

          {order.notes && (
            <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1 italic">
              Obs: {order.notes}
            </p>
          )}
        </div>
      </div>

      {/* Right: Payment Status Button & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-neutral-800/80 pt-2 sm:pt-0">
        {/* Toggle Status Button */}
        <button
          type="button"
          onClick={() => onToggleStatus(order.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer select-none active:scale-95 ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
          title="Clique para alternar o status do pagamento"
        >
          {statusInfo.icon}
          <span>{statusInfo.label}</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(order)}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Editar pedido"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(order.id)}
            className="p-1.5 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Excluir pedido"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
