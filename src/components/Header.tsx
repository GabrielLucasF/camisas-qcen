'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Share2, Settings, Shirt, Users } from 'lucide-react';

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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07080d]/85 border-b border-white/10 px-3.5 py-2.5 sm:px-6 sm:py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2.5">
        {/* QCEN Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0">
            <Image
              src="/qcen-logo.png"
              alt="QCEN Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl sm:text-2xl text-white tracking-wider uppercase leading-none">
                QCEN
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-neutral-400 mt-0.5 truncate">
              <span className="font-semibold text-blue-400 flex items-center gap-1" title={`${totalShirts} camisas`}>
                <Shirt className="w-3 h-3 shrink-0" />
                {totalShirts}
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-300 flex items-center gap-1 font-medium" title={`${totalPeople} pessoas`}>
                <Users className="w-3 h-3 shrink-0 text-neutral-400" />
                {totalPeople}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenShare}
            className="p-2 sm:px-3 sm:py-2 rounded-full bg-[#131625] hover:bg-[#1a2037] text-neutral-200 hover:text-white transition flex items-center gap-1.5 text-xs sm:text-sm font-medium border border-white/10 active:scale-95 shadow-sm cursor-pointer"
            title="Compartilhar resumo no WhatsApp"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 sm:p-2.5 rounded-full bg-[#131625] hover:bg-[#1a2037] text-neutral-300 hover:text-white transition border border-white/10 active:scale-95 cursor-pointer"
            title="Configurações e Backup"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenNewOrder}
            className="px-3.5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-1 text-xs sm:text-sm glow-electric active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
