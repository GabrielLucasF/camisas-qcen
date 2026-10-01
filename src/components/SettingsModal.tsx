'use client';

import React, { useState, useRef } from 'react';
import { AppSettings, Order } from '../types/order';
import { X, Download, Upload, RotateCcw, Trash2, FileSpreadsheet, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  orders: Order[];
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onResetToInitial: () => void;
  onClearAll: () => void;
  onImportOrders: (orders: Order[]) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  orders,
  onUpdateSettings,
  onResetToInitial,
  onClearAll,
  onImportOrders,
}: SettingsModalProps) {
  const [title, setTitle] = useState(settings.title);
  const [unitPrice, setUnitPrice] = useState(String(settings.unitPrice));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) {
    return null;
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(unitPrice.replace(',', '.')) || 0;
    onUpdateSettings({
      title: title.trim() || 'Camisas do QCEN',
      unitPrice: Math.max(0, priceNum),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ settings, orders }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${settings.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Tamanhos', 'Quantidade', 'Status Pagamento', 'Observações'];
    const rows = orders.map((order) => {
      const sizes = order.items.map((i) => i.size).join(' + ');
      const totalQty = order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
      const statusLabel =
        order.status === 'paid'
          ? 'Pago Completo'
          : order.status === 'half'
          ? 'Pago Metade'
          : 'Pendente';

      return [
        `"${order.personName.replace(/"/g, '""')}"`,
        `"${sizes}"`,
        totalQty,
        `"${statusLabel}"`,
        `"${(order.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos-${settings.title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedOrders = Array.isArray(parsed) ? parsed : parsed.orders;
        if (Array.isArray(importedOrders)) {
          onImportOrders(importedOrders);
        }
        if (parsed.settings) {
          onUpdateSettings(parsed.settings);
        }
        alert('Dados importados com sucesso!');
        onClose();
      } catch {
        alert('Erro ao carregar arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
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
            Configurações e Dados
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a2038] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* General settings form */}
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Nome do Projeto / Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Camisas do QCEN"
                className="w-full bg-[#15192c] border border-[#222846] rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Valor Unitário da Camisa (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  R$
                </span>
                <input
                  type="text"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="35,00"
                  className="w-full bg-[#15192c] border border-[#222846] rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Usado para calcular automaticamente os totais arrecadados e pendentes.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 border border-blue-400/30"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Salvo com sucesso!</span>
                </>
              ) : (
                <span>Salvar Configurações</span>
              )}
            </button>
          </form>

          {/* Backup & Export */}
          <div className="border-t border-[#1e233d] pt-5 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Backup e Exportação
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#15192c] hover:bg-[#1d233e] text-xs font-bold text-neutral-200 border border-[#222846] transition"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Exportar JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#15192c] hover:bg-[#1d233e] text-xs font-bold text-neutral-200 border border-[#222846] transition"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Restaurar JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={handleExportCSV}
                className="sm:col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#15192c] hover:bg-[#1d233e] text-xs font-bold text-neutral-200 border border-[#222846] transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Baixar Planilha (Excel / CSV)</span>
              </button>
            </div>
          </div>

          {/* Reset / Clear Data */}
          <div className="border-t border-[#1e233d] pt-5 space-y-2">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Zona de Redefinição
            </h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    'Deseja restaurar a lista inicial com as anotações do bloco original?'
                  );
                  if (!confirmed) {
                    return;
                  }
                  onResetToInitial();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#15192c] hover:bg-[#1e243f] text-xs text-neutral-300 transition border border-[#222846]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Anotação Original</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    'Tem certeza que deseja apagar todos os pedidos?'
                  );
                  if (!confirmed) {
                    return;
                  }
                  onClearAll();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-300 transition border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Tudo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
