'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Share2, Settings, Users, Shirt, ExternalLink } from 'lucide-react';

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
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#090a10]/85 border-b border-[#1e2238] px-4 py-3 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* QCEN Logo & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 p-0.5 shadow-lg shadow-blue-950/60 shrink-0 ring-1 ring-blue-400/30">
            <div className="w-full h-full bg-[#0d0f1a] rounded-[10px] flex items-center justify-center overflow-hidden">
              <Image
                src="/qcen-logo.png"
                alt="QCEN Logo"
                width={40}
                height={40}
                className="object-contain scale-110 drop-shadow-md"
                priority
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl sm:text-2xl text-white tracking-wider uppercase drop-shadow-sm">
                QCEN
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 hidden xs:inline-block">
                Que Comece Em Nós
              </span>
              <a
                href="https://www.instagram.com/comeceemnos/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-blue-400 transition"
                title="Abrir Instagram @comeceemnos"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="text-neutral-300 font-medium truncate">
                {title}
              </span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-1 font-semibold text-blue-400">
                <Shirt className="w-3 h-3" />
                {totalShirts} {totalShirts === 1 ? 'camisa' : 'camisas'}
              </span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {totalPeople}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenShare}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#141829] hover:bg-[#1a2037] text-neutral-200 hover:text-white transition flex items-center gap-1.5 text-xs sm:text-sm font-medium border border-[#242b49] active:scale-95 shadow-sm"
            title="Compartilhar resumo no WhatsApp"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 sm:p-2.5 rounded-xl bg-[#141829] hover:bg-[#1a2037] text-neutral-300 hover:text-white transition border border-[#242b49] active:scale-95"
            title="Configurações e Backup"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenNewOrder}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition flex items-center gap-1.5 text-xs sm:text-sm shadow-lg shadow-blue-600/30 active:scale-95 border border-blue-400/30"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
