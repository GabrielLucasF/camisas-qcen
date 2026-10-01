'use client';

import React, { useState, useMemo } from 'react';
import { Order, SizeSummaryItem, AppSettings } from '../types/order';
import { X, Copy, Check, ExternalLink, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  sizeSummary: SizeSummaryItem[];
  totalShirts: number;
  totalPeople: number;
  settings: AppSettings;
}

export function ShareModal({
  isOpen,
  onClose,
  orders,
  sizeSummary,
  totalShirts,
  totalPeople,
  settings,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [includePendingList, setIncludePendingList] = useState(true);
  const [includePaidList, setIncludePaidList] = useState(false);

  const formattedText = useMemo(() => {
    const lines: string[] = [];

    lines.push(`👕 *${settings.title.toUpperCase()}* 👕\n`);

    lines.push(`📊 *RESUMO DE TAMANHOS:*`);
    sizeSummary
      .filter((item) => item.count > 0)
      .forEach((item) => {
        lines.push(`• Tam *${item.size}*: ${item.count} un (${item.percentage}%)`);
      });
    lines.push(`👉 *TOTAL:* ${totalShirts} camisas (${totalPeople} pessoas)\n`);

    const paidOrders = orders.filter((o) => o.status === 'paid');
    const halfOrders = orders.filter((o) => o.status === 'half');
    const pendingOrders = orders.filter((o) => o.status === 'pending');

    lines.push(`💰 *STATUS DOS PAGAMENTOS:*`);
    lines.push(`✅ Pago Completo: ${paidOrders.length} pessoas`);
    lines.push(`⏳ Pago Metade: ${halfOrders.length} pessoas`);
    lines.push(`❌ Pendente: ${pendingOrders.length} pessoas\n`);

    if (includePendingList && (pendingOrders.length > 0 || halfOrders.length > 0)) {
      lines.push(`⚠️ *A PAGAR / METADE:*`);
      halfOrders.forEach((o) => {
        const sizesStr = o.items.map((i) => `${i.size}${i.quantity > 1 ? `x${i.quantity}` : ''}`).join(', ');
        lines.push(`• ⏳ ${o.personName} (${sizesStr}) - Metade paga`);
      });
      pendingOrders.forEach((o) => {
        const sizesStr = o.items.map((i) => `${i.size}${i.quantity > 1 ? `x${i.quantity}` : ''}`).join(', ');
        lines.push(`• ❌ ${o.personName} (${sizesStr}) - Pendente`);
      });
      lines.push('');
    }

    if (includePaidList && paidOrders.length > 0) {
      lines.push(`✅ *PAGOS COMPLETOS:*`);
      paidOrders.forEach((o) => {
        const sizesStr = o.items.map((i) => `${i.size}${i.quantity > 1 ? `x${i.quantity}` : ''}`).join(', ');
        lines.push(`• ✅ ${o.personName} (${sizesStr})`);
      });
      lines.push('');
    }

    lines.push(`_Atualizado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}_`);

    return lines.join('\n');
  }, [
    settings.title,
    sizeSummary,
    totalShirts,
    totalPeople,
    orders,
    includePendingList,
    includePaidList,
  ]);

  if (!isOpen) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Compartilhar no WhatsApp
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Options */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/80 text-xs text-neutral-300">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includePendingList}
                onChange={(e) => setIncludePendingList(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-neutral-800 border-neutral-600 focus:ring-emerald-500"
              />
              <span>Listar pendentes / metade</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includePaidList}
                onChange={(e) => setIncludePaidList(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-neutral-800 border-neutral-600 focus:ring-emerald-500"
              />
              <span>Listar pagos completos</span>
            </label>
          </div>

          {/* Textarea Preview */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Pré-visualização do texto
            </label>
            <textarea
              readOnly
              rows={11}
              value={formattedText}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-200 select-all focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copiado com sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-neutral-300" />
                  <span>Copiar Mensagem</span>
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs sm:text-sm font-bold transition shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <span>Abrir no WhatsApp</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
