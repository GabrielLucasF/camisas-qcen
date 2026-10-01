'use client';

import React, { useState, useMemo } from 'react';
import { Order, PaymentStatus } from '../types/order';
import { OrderItemRow } from './OrderItemRow';
import { Search, Plus, X, ArrowUpDown, Filter } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  selectedSize: string | null;
  selectedStatus: PaymentStatus | 'all';
  onClearFilters: () => void;
  onToggleStatus: (id: string) => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onOpenNewOrder: () => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'status' | 'newest';

export function OrderList({
  orders,
  selectedSize,
  selectedStatus,
  onClearFilters,
  onToggleStatus,
  onEdit,
  onDelete,
  onOpenNewOrder,
}: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      // Name search
      const matchesSearch =
        !searchLower ||
        order.personName.toLowerCase().includes(searchLower) ||
        order.items.some((item) => item.size.toLowerCase().includes(searchLower)) ||
        (order.notes && order.notes.toLowerCase().includes(searchLower));

      if (!matchesSearch) {
        return false;
      }

      // Size filter
      if (selectedSize) {
        const hasSize = order.items.some((item) => item.size === selectedSize);
        if (!hasSize) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (order.status !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [orders, searchTerm, selectedSize, selectedStatus]);

  // Sorted orders
  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];

    list.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.personName.localeCompare(b.personName, 'pt-BR');
      }
      if (sortBy === 'name-desc') {
        return b.personName.localeCompare(a.personName, 'pt-BR');
      }
      if (sortBy === 'status') {
        const orderPriority: Record<PaymentStatus, number> = {
          pending: 1,
          half: 2,
          paid: 3,
        };
        return orderPriority[a.status] - orderPriority[b.status];
      }
      // 'newest'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [filteredOrders, sortBy]);

  const hasActiveFilters = Boolean(searchTerm || selectedSize || selectedStatus !== 'all');

  return (
    <div className="space-y-3.5">
      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou tamanho..."
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="name-asc">Nome (A - Z)</option>
              <option value="name-desc">Nome (Z - A)</option>
              <option value="status">Status (Pendentes primeiro)</option>
              <option value="newest">Mais recentes</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onClearFilters();
              }}
              className="px-2.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs flex items-center gap-1 transition shrink-0"
              title="Limpar todos os filtros"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-400">
          <span>Filtrando por:</span>
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-200 border border-neutral-700">
              Busca: &quot;{searchTerm}&quot;
              <button type="button" onClick={() => setSearchTerm('')}>
                <X className="w-3 h-3 hover:text-white" />
              </button>
            </span>
          )}
          {selectedSize && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Tamanho: {selectedSize}
            </span>
          )}
          {selectedStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-200 border border-neutral-700">
              Status:{' '}
              {selectedStatus === 'paid'
                ? 'Pago'
                : selectedStatus === 'half'
                ? 'Metade'
                : 'Pendente'}
            </span>
          )}
          <span className="text-neutral-500">
            ({sortedOrders.length} {sortedOrders.length === 1 ? 'resultado' : 'resultados'})
          </span>
        </div>
      )}

      {/* Order Rows */}
      {sortedOrders.length > 0 ? (
        <div className="space-y-2">
          {sortedOrders.map((order) => (
            <OrderItemRow
              key={order.id}
              order={order}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-neutral-900/40 border border-neutral-800/80 rounded-2xl">
          <p className="text-sm text-neutral-400">
            Nenhum pedido encontrado com os filtros aplicados.
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onClearFilters();
              }}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition"
            >
              <Filter className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenNewOrder}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar primeiro pedido
            </button>
          )}
        </div>
      )}
    </div>
  );
}
