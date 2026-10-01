'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, DollarSign, Wallet } from 'lucide-react';
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
    <div className="bg-[#101322]/90 border border-[#1e233d] rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-display text-base sm:text-lg tracking-wider text-white uppercase">
            Controle Financeiro
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            ({formatCurrency(unitPrice)}/peça)
          </span>
        </div>

        {/* Financial Highlights */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-neutral-300">
            Arrecadado: <strong className="text-emerald-400 font-mono">{formatCurrency(stats.totalCollected)}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-neutral-300">
            Falta receber: <strong className="text-amber-400 font-mono">{formatCurrency(stats.totalRemaining)}</strong>
          </div>
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
              ? 'bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500 shadow-md shadow-emerald-500/20'
              : 'bg-[#15192c]/90 hover:bg-[#1a2038] border-[#222846] text-neutral-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-300 truncate uppercase tracking-wider">
                Pago Completo
              </div>
              <div className="text-[11px] text-neutral-400">
                {stats.paidShirts} {stats.paidShirts === 1 ? 'camisa' : 'camisas'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-display text-2xl text-white tracking-wider">
              {stats.paidCount}
            </span>
            <div className="text-[10px] text-neutral-400 uppercase">pedidos</div>
          </div>
        </button>

        {/* Pago Metade */}
        <button
          type="button"
          onClick={() => onSelectStatus(selectedStatus === 'half' ? 'all' : 'half')}
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition select-none active:scale-[0.98] ${
            selectedStatus === 'half'
              ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500 shadow-md shadow-amber-500/20'
              : 'bg-[#15192c]/90 hover:bg-[#1a2038] border-[#222846] text-neutral-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-300 truncate uppercase tracking-wider">
                Pago Metade (50%)
              </div>
              <div className="text-[11px] text-neutral-400">
                {stats.halfShirts} {stats.halfShirts === 1 ? 'camisa' : 'camisas'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-display text-2xl text-white tracking-wider">
              {stats.halfCount}
            </span>
            <div className="text-[10px] text-neutral-400 uppercase">pedidos</div>
          </div>
        </button>

        {/* Pendente */}
        <button
          type="button"
          onClick={() => onSelectStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
          className={`flex items-center justify-between p-3 rounded-xl border text-left transition select-none active:scale-[0.98] ${
            selectedStatus === 'pending'
              ? 'bg-rose-500/20 border-rose-500 ring-1 ring-rose-500 shadow-md shadow-rose-500/20'
              : 'bg-[#15192c]/90 hover:bg-[#1a2038] border-[#222846] text-neutral-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-rose-300 truncate uppercase tracking-wider">
                Pendente
              </div>
              <div className="text-[11px] text-neutral-400">
                {stats.pendingShirts} {stats.pendingShirts === 1 ? 'camisa' : 'camisas'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-display text-2xl text-white tracking-wider">
              {stats.pendingCount}
            </span>
            <div className="text-[10px] text-neutral-400 uppercase">pedidos</div>
          </div>
        </button>
      </div>
    </div>
  );
}
