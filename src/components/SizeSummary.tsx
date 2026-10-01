'use client';

import React from 'react';
import { SizeSummaryItem } from '../types/order';
import { Shirt, Flame } from 'lucide-react';

interface SizeSummaryProps {
  summary: SizeSummaryItem[];
  totalShirts: number;
  selectedSize: string | null;
  onSelectSize: (size: string | null) => void;
}

export function SizeSummary({
  summary,
  totalShirts,
  selectedSize,
  onSelectSize,
}: SizeSummaryProps) {
  return (
    <div className="bg-[#101322]/90 border border-[#1e233d] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-blue-600/10 blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-48 h-24 bg-orange-500/5 blur-2xl pointer-events-none -z-0" />

      <div className="relative z-10 flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Shirt className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-display text-base sm:text-lg tracking-wider text-white uppercase">
            Resumo de Tamanhos
          </h2>
        </div>

        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          {totalShirts} {totalShirts === 1 ? 'camisa' : 'camisas'}
        </span>
      </div>

      {/* Grid of Sizes */}
      <div className="relative z-10 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-2.5">
        {summary.map((item) => {
          const isSelected = selectedSize === item.size;
          const hasCount = item.count > 0;

          return (
            <button
              key={item.size}
              type="button"
              onClick={() => onSelectSize(isSelected ? null : item.size)}
              className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition text-center select-none active:scale-95 group ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-600/30 to-indigo-700/30 border-blue-400 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400'
                  : hasCount
                  ? 'bg-[#15192c]/90 hover:bg-[#1a2038] border-[#222846] text-neutral-200 hover:border-blue-500/40 shadow-sm'
                  : 'bg-[#0e111e]/60 border-[#1a1e32] text-neutral-600 opacity-60 hover:opacity-80'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Tam {item.size}
              </span>
              <span
                className={`font-display text-2xl sm:text-3xl my-0.5 tracking-wider ${
                  isSelected
                    ? 'text-blue-300'
                    : hasCount
                    ? 'text-white'
                    : 'text-neutral-600'
                }`}
              >
                {item.count}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {item.percentage}%
              </span>

              {/* Mini progress indicator */}
              <div className="w-full bg-[#0d0f1b] rounded-full h-1.5 mt-2 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-400 to-indigo-400'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 mt-3 pt-2.5 border-t border-[#1a1f36] flex items-center justify-between text-[11px] text-neutral-400">
        <p>💡 Toque no tamanho para filtrar</p>
        <span className="text-orange-400/90 font-bold flex items-center gap-1 shrink-0">
          <Flame className="w-3 h-3 text-orange-400" />
          QCEN
        </span>
      </div>
    </div>
  );
}
