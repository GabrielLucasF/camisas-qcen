'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useOrders } from '../../hooks/useOrders';
import { Header } from '../../components/Header';
import { SizeSummary } from '../../components/SizeSummary';
import { FinancialSummary } from '../../components/FinancialSummary';
import { OrderList } from '../../components/OrderList';
import { OrderFormModal } from '../../components/OrderFormModal';
import { ShareModal } from '../../components/ShareModal';
import { SettingsModal } from '../../components/SettingsModal';
import { Order, PaymentStatus } from '../../types/order';
import { Plus, Flame, Lock, KeyRound } from 'lucide-react';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1827';
const AUTH_STORAGE_KEY = 'qcen_leader_auth_ts_v1';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function LeaderPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const {
    orders,
    settings,
    isLoaded,
    addOrder,
    updateOrder,
    deleteOrder,
    togglePaymentStatus,
    updateSettings,
    resetToInitial,
    clearAll,
    importOrders,
    totalPeople,
    totalShirts,
    sizeSummary,
    paymentStats,
  } = useOrders();

  // Check saved session on mount (valid for 1 day)
  useEffect(() => {
    try {
      const savedAuthTs = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuthTs) {
        const authTime = parseInt(savedAuthTs, 10);
        const isValid = !Number.isNaN(authTime) && Date.now() - authTime < ONE_DAY_MS;
        if (isValid) {
          setIsAuthenticated(true);
        }
      }
    } catch {
      // storage error ignored
    }
    setIsCheckingAuth(false);
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, Date.now().toString());
      } catch {
        // storage error ignored
      }
      return;
    }

    setPinError(true);
    setPinInput('');
  };

  // Filter States
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'all'>('all');

  // Modal States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenNewOrder = () => {
    setOrderToEdit(null);
    setIsOrderModalOpen(true);
  };

  const handleOpenEditOrder = (order: Order) => {
    setOrderToEdit(order);
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (data: {
    personName: string;
    items: Array<{ size: any; quantity: number }>;
    status: PaymentStatus;
    notes?: string;
  }) => {
    if (orderToEdit) {
      updateOrder(orderToEdit.id, {
        personName: data.personName,
        items: data.items.map((it, idx) => ({
          id: orderToEdit.items[idx]?.id || `item-${Date.now()}-${idx}`,
          size: it.size,
          quantity: it.quantity,
        })),
        status: data.status,
        notes: data.notes,
      });
      return;
    }

    addOrder(data);
  };

  const handleClearFilters = () => {
    setSelectedSize(null);
    setSelectedStatus('all');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#07080d] text-neutral-400 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-blue-600/20 p-2 border border-blue-500/30 flex items-center justify-center animate-pulse">
          <Image src="/qcen-logo.png" alt="QCEN" width={28} height={28} />
        </div>
      </div>
    );
  }

  // TELA DE BLOQUEIO POR PIN DO LÍDER
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07080d] text-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0e111d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center p-2.5">
              <Image src="/qcen-logo.png" alt="QCEN" width={44} height={44} className="object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Acesso Restrito
              </span>
              <h1 className="text-2xl font-black text-white tracking-wider mt-1.5 font-display uppercase">
                Painel da Liderança
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Digite o PIN para desbloquear o gerenciamento de pedidos
              </p>
            </div>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) {
                      setPinError(false);
                    }
                  }}
                  placeholder="••••"
                  className={`w-full bg-[#131625] border text-center text-2xl tracking-[0.5em] font-mono py-3.5 px-4 rounded-2xl text-white placeholder-neutral-600 focus:outline-none transition ${
                    pinError
                      ? 'border-rose-500 focus:border-rose-400 text-rose-300'
                      : 'border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {pinError && (
                <p className="text-xs text-rose-400 font-semibold animate-shake">
                  PIN incorreto. Tente novamente.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider glow-electric hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Desbloquear Painel</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 text-[11px] text-neutral-500">
            QCEN • Que Comece Em Nós
          </div>
        </div>
      </div>
    );
  }

  // TELA DO PAINEL DO LÍDER (AUTENTICADO)
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#090a10] text-neutral-400 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 p-2 border border-blue-500/30 flex items-center justify-center animate-pulse">
            <Image src="/qcen-logo.png" alt="QCEN" width={32} height={32} />
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-blue-400">
            Carregando Pedidos do QCEN...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-neutral-100 flex flex-col pb-24 sm:pb-12">
      <Header
        title={settings.title}
        totalShirts={totalShirts}
        totalPeople={totalPeople}
        onOpenNewOrder={handleOpenNewOrder}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Top Summary: Sizes */}
        <SizeSummary
          summary={sizeSummary}
          totalShirts={totalShirts}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
        />

        {/* Financial & Status Summary */}
        <FinancialSummary
          stats={paymentStats}
          unitPrice={settings.unitPrice}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
        />

        {/* Orders List Section */}
        <section className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl tracking-wider text-white uppercase">
                Lista de Pedidos
              </h2>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-[#181d33] text-blue-300 border border-[#273054]">
                {orders.length}
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenNewOrder}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo</span>
            </button>
          </div>

          <OrderList
            orders={orders}
            selectedSize={selectedSize}
            selectedStatus={selectedStatus}
            onClearFilters={handleClearFilters}
            onToggleStatus={togglePaymentStatus}
            onEdit={handleOpenEditOrder}
            onDelete={deleteOrder}
            onOpenNewOrder={handleOpenNewOrder}
          />
        </section>

        {/* QCEN Footer */}
        <footer className="pt-8 pb-4 text-center border-t border-[#1a1e34] space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Que Comece Em Nós</span>
          </div>
          <p className="text-[11px] text-neutral-400 italic">
            &quot;O avivamento não começa em um palco. Começa em nós.&quot;
          </p>
        </footer>
      </main>

      {/* Modals */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        orderToEdit={orderToEdit}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        orders={orders}
        sizeSummary={sizeSummary}
        totalShirts={totalShirts}
        totalPeople={totalPeople}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        orders={orders}
        onUpdateSettings={updateSettings}
        onResetToInitial={resetToInitial}
        onClearAll={clearAll}
        onImportOrders={importOrders}
      />
    </div>
  );
}
