'use client';

import React from 'react';
import { Shirt, Plus, Share2, Settings, Users } from 'lucide-react';

interface HeaderProps {
  title: string;
  totalShirts: number;
  totalPeople: number;
  onOpenNewOrder: () => void;
  onOpenShare: () => void;
  onOpenSettings: () => void;
}

export function Header({
  title,
  totalShirts,
  totalPeople,
  onOpenNewOrder,
  onOpenShare,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-neutral-900/90 border-b border-neutral-800 px-4 py-3 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Title & Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-neutral-950 font-bold shrink-0">
            <Shirt className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1 font-medium text-emerald-400">
                <Shirt className="w-3.5 h-3.5" />
                {totalShirts} {totalShirts === 1 ? 'camisa' : 'camisas'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {totalPeople} {totalPeople === 1 ? 'pessoa' : 'pessoas'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenShare}
            className="p-2.5 sm:px-3 sm:py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition flex items-center gap-1.5 text-xs sm:text-sm font-medium border border-neutral-700/60"
            title="Compartilhar resumo no WhatsApp"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition border border-neutral-700/60"
            title="Configurações e Backup"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenNewOrder}
            className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold transition flex items-center gap-1.5 text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
