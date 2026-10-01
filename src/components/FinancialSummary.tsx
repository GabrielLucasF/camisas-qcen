'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { PaymentStatus } from '../types/order';

interface FinancialSummaryProps {
  stats: {
    paidCount: number;
    halfCount: number;
    pendingCount: number;
    paidShirts: number;
    halfShirts: number;
    pendingShirts: number;
    totalRevenueExpected: number;
    totalCollected: number;
    totalRemaining: number;
  };
  unitPrice: number;
  selectedStatus: PaymentStatus | 'all';
  onSelectStatus: (status: PaymentStatus | 'all') => void;
}

export function FinancialSummary({
  stats,
  unitPrice,
  selectedStatus,
  onSelectStatus,
}: FinancialSummaryProps) {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide">
            Controle de Pagamentos
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            ({formatCurrency(unitPrice)}/unid)
          </span>
        </div>

        {/* Financial Highlights */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-neutral-400">
            Arrecadado: <strong className="text-emerald-400">{formatCurrency(stats.totalCollected)}</strong>
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-400">
            Falta: <strong className="text-amber-400">{formatCurrency(stats.totalRemaining)}</strong>
          </span>
        </div>
      </div>

      {/* Status Cards / Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Pago Completo */}
        <button
          type="button"
          onClick={() => onSelectStatus(selectedStatus === 'paid' ? 'all' : 'paid')}
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition select-none active:scale-[0.98] ${
            selectedStatus === 'paid'
              ? 'bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500'
              : 'bg-neutral-800/60 hover:bg-neutral-800 border-neutral-700/60 text-neutral-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-emerald-300 truncate">
                Pago Completo
              </div>
              <div className="text-[11px] text-neutral-400">
                {stats.paidShirts} {stats.paidShirts === 1 ? 'camisa' : 'camisas'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-white">
              {stats.paidCount}
            </span>
            <div className="text-[10px] text-neutral-400">pedidos</div>
          </div>
        </button>

        {/* Pago Metade */}
        <button
          type="button"
          onClick={() => onSelectStatus(selectedStatus === 'half' ? 'all' : 'half')}
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition select-none active:scale-[0.98] ${
            selectedStatus === 'half'
              ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500'
              : 'bg-neutral-800/60 hover:bg-neutral-800 border-neutral-700/60 text-neutral-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-amber-300 truncate">
                Pago Metade (50%)
              </div>
              <div className="text-[11px] text-neutral-400">
                {stats.halfShirts} {stats.halfShirts === 1 ? 'camisa' : 'camisas'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-white">
              {stats.halfCount}
            </span>
            <div className="text-[10px] text-neutral-400">pedidos</div>
          </div>
        </button>

        {/* Pendente */}
        <button
          type="button"
          onClick={() => onSelectStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition select-none active:scale-[0.98] ${
            selectedStatus === 'pending'
              ? 'bg-rose-500/20 border-rose-500 ring-1 ring-rose-500'
              : 'bg-neutral-800/60 hover:bg-neutral-800 border-neutral-700/60 text-neutral-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-rose-300 truncate">
                Pendente
              </div>
              <div className="text-[11px] text-neutral-400">
                {stats.pendingShirts} {stats.pendingShirts === 1 ? 'camisa' : 'camisas'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-white">
              {stats.pendingCount}
            </span>
            <div className="text-[10px] text-neutral-400">pedidos</div>
          </div>
        </button>
      </div>
    </div>
  );
}
