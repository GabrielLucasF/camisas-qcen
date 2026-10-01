'use client';

import React from 'react';
import { SizeSummaryItem } from '../types/order';
import { Shirt, Filter, X } from 'lucide-react';

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
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Shirt className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide">
            Resumo por Tamanho
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {totalShirts} {totalShirts === 1 ? 'peça' : 'peças'}
          </span>
        </div>

        {selectedSize && (
          <button
            type="button"
            onClick={() => onSelectSize(null)}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition px-2 py-1 rounded-md bg-neutral-800"
          >
            <Filter className="w-3 h-3 text-emerald-400" />
            <span>Filtrado: <b className="text-emerald-400">{selectedSize}</b></span>
            <X className="w-3 h-3 ml-0.5" />
          </button>
        )}
      </div>

      {/* Grid of Sizes */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-2.5">
        {summary.map((item) => {
          const isSelected = selectedSize === item.size;
          const hasCount = item.count > 0;

          return (
            <button
              key={item.size}
              type="button"
              onClick={() => onSelectSize(isSelected ? null : item.size)}
              className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition text-center select-none active:scale-95 ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500'
                  : hasCount
                  ? 'bg-neutral-800/80 hover:bg-neutral-800 border-neutral-700/80 text-neutral-200 hover:border-neutral-600'
                  : 'bg-neutral-900/40 border-neutral-800/60 text-neutral-500 opacity-60 hover:opacity-90'
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Tam {item.size}
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold my-0.5 ${
                  isSelected
                    ? 'text-emerald-300'
                    : hasCount
                    ? 'text-white'
                    : 'text-neutral-500'
                }`}
              >
                {item.count}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {item.percentage}%
              </span>

              {/* Mini progress indicator */}
              <div className="w-full bg-neutral-700/40 rounded-full h-1 mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isSelected ? 'bg-emerald-400' : 'bg-emerald-500/70'
                  }`}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-neutral-400 mt-2.5 text-center sm:text-left">
        💡 Toque em um tamanho para filtrar os pedidos na lista abaixo.
      </p>
    </div>
  );
}
