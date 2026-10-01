'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderItem, PaymentStatus, ShirtSize } from '../types/order';
import { AVAILABLE_SIZES } from '../data/initialData';
import { X, Plus, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface OrderFormModalProps {
  isOpen: boolean;
  orderToEdit?: Order | null;
  onClose: () => void;
  onSave: (data: {
    personName: string;
    items: Array<{ size: ShirtSize; quantity: number }>;
    status: PaymentStatus;
    notes?: string;
  }) => void;
}

export function OrderFormModal({
  isOpen,
  orderToEdit,
  onClose,
  onSave,
}: OrderFormModalProps) {
  const [personName, setPersonName] = useState('');
  const [items, setItems] = useState<Array<{ id: string; size: ShirtSize; quantity: number }>>([
    { id: '1', size: 'M', quantity: 1 },
  ]);
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Pre-fill if editing or reset if new
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (orderToEdit) {
      setPersonName(orderToEdit.personName);
      setItems(
        orderToEdit.items.map((it, idx) => ({
          id: String(idx + 1),
          size: it.size as ShirtSize,
          quantity: it.quantity || 1,
        }))
      );
      setStatus(orderToEdit.status);
      setNotes(orderToEdit.notes || '');
      setError('');
      return;
    }

    // Default new
    setPersonName('');
    setItems([{ id: '1', size: 'M', quantity: 1 }]);
    setStatus('pending');
    setNotes('');
    setError('');
  }, [isOpen, orderToEdit]);

  if (!isOpen) {
    return null;
  }

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), size: 'M', quantity: 1 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItemSize = (id: string, size: ShirtSize) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }
        return { ...item, size };
      })
    );
  };

  const handleUpdateItemQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = personName.trim();
    if (!trimmedName) {
      setError('Por favor, informe o nome da pessoa.');
      return;
    }

    if (items.length === 0) {
      setError('Selecione pelo menos um tamanho de camisa.');
      return;
    }

    onSave({
      personName: trimmedName,
      items: items.map((it) => ({
        size: it.size,
        quantity: it.quantity,
      })),
      status,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#0e111e] border border-[#1e233d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e233d] bg-[#121524]">
          <h2 className="font-display text-lg tracking-wider text-white uppercase">
            {orderToEdit ? 'Editar Pedido' : 'Novo Pedido de Camisa'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a2038] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Nome da Pessoa *
            </label>
            <input
              type="text"
              autoFocus
              value={personName}
              onChange={(e) => {
                setPersonName(e.target.value);
                if (error) {
                  setError('');
                }
              }}
              placeholder="Ex: Amanda Pardim, Luís..."
              className="w-full bg-[#15192c] border border-[#222846] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Camisas e Tamanhos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Camisas & Tamanhos ({items.reduce((s, i) => s + i.quantity, 0)})
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar mais uma peça
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#15192c]/90 rounded-xl border border-[#222846] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-neutral-400">
                      Peça #{index + 1}
                    </span>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-[#0e111e] rounded-lg border border-[#222846] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-neutral-300 hover:bg-[#1a2038] text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-neutral-300 hover:bg-[#1a2038] text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-neutral-400 hover:text-rose-400 transition"
                          title="Remover peça"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Size Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_SIZES.map((sz) => {
                      const isSelected = item.size === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleUpdateItemSize(item.id, sz)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                              : 'bg-[#0e111e] text-neutral-300 hover:bg-[#1a2038] hover:text-white border border-[#222846]'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status do Pagamento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Status do Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Pendente */}
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                  status === 'pending'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500 shadow-md shadow-rose-500/20'
                    : 'bg-[#15192c] border-[#222846] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 mb-1 text-rose-400" />
                <span>Pendente</span>
              </button>

              {/* Metade */}
              <button
                type="button"
                onClick={() => setStatus('half')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                  status === 'half'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-[#15192c] border-[#222846] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Clock className="w-4 h-4 mb-1 text-amber-400" />
                <span>Metade</span>
              </button>

              {/* Completo */}
              <button
                type="button"
                onClick={() => setStatus('paid')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                  status === 'paid'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'bg-[#15192c] border-[#222846] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mb-1 text-emerald-400" />
                <span>Completo</span>
              </button>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Observações (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: pago no pix, entregar para fulano..."
              className="w-full bg-[#15192c] border border-[#222846] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1e233d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-[#1a2038] text-xs sm:text-sm font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-blue-600/30 border border-blue-400/30"
            >
              {orderToEdit ? 'Atualizar Pedido' : 'Adicionar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
