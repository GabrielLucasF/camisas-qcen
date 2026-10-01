'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Wallet } from 'lucide-react';
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
      {/* Top Header & Highlights */}
      <div className="mb-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <h2 className="font-display text-base sm:text-lg tracking-wider text-white uppercase truncate">
              Controle Financeiro
            </h2>
          </div>
          <span className="text-[11px] font-mono font-bold text-neutral-300 bg-[#161a2c] px-2 py-0.5 rounded-lg border border-[#232944] shrink-0">
            R$ 70 / R$ 35
          </span>
        </div>

        {/* Financial Highlights - 2 Clean Cards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <span className="text-[10px] text-neutral-400 block uppercase font-bold tracking-wider">Arrecadado</span>
            <strong className="text-emerald-400 font-mono text-sm sm:text-base font-bold block mt-0.5">
              {formatCurrency(stats.totalCollected)}
            </strong>
          </div>
          <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <span className="text-[10px] text-neutral-400 block uppercase font-bold tracking-wider">Falta receber</span>
            <strong className="text-amber-400 font-mono text-sm sm:text-base font-bold block mt-0.5">
              {formatCurrency(stats.totalRemaining)}
            </strong>
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
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-300 truncate uppercase tracking-wider">
                Pago Completo
              </div>
              <div className="text-[11px] text-neutral-400 truncate">
                {stats.paidShirts} {stats.paidShirts === 1 ? 'camisa' : 'camisas'}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-display text-2xl text-white tracking-wider block leading-none">
              {stats.paidCount}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">pessoas</span>
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
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-300 truncate uppercase tracking-wider">
                Pago Metade (50%)
              </div>
              <div className="text-[11px] text-neutral-400 truncate">
                {stats.halfShirts} {stats.halfShirts === 1 ? 'camisa' : 'camisas'}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-display text-2xl text-white tracking-wider block leading-none">
              {stats.halfCount}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">pessoas</span>
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
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-rose-300 truncate uppercase tracking-wider">
                Pendente
              </div>
              <div className="text-[11px] text-neutral-400 truncate">
                {stats.pendingShirts} {stats.pendingShirts === 1 ? 'camisa' : 'camisas'}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-display text-2xl text-white tracking-wider block leading-none">
              {stats.pendingCount}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">pessoas</span>
          </div>
        </button>
      </div>
    </div>
  );
}
