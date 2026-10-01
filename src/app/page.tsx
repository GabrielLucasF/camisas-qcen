'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useOrders } from '../hooks/useOrders';
import { Header } from '../components/Header';
import { SizeSummary } from '../components/SizeSummary';
import { FinancialSummary } from '../components/FinancialSummary';
import { OrderList } from '../components/OrderList';
import { OrderFormModal } from '../components/OrderFormModal';
import { ShareModal } from '../components/ShareModal';
import { SettingsModal } from '../components/SettingsModal';
import { Order, PaymentStatus } from '../types/order';
import { Plus, Flame } from 'lucide-react';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Home() {
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#090a10] text-neutral-400 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 p-2 border border-blue-500/30 flex items-center justify-center animate-pulse">
            <Image
              src="/qcen-logo.png"
              alt="QCEN"
              width={32}
              height={32}
            />
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-blue-400">
            Carregando QCEN...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a10] text-neutral-100 flex flex-col pb-24 sm:pb-12">
      {/* Top Bar */}
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

        {/* QCEN Footer Note */}
        <footer className="pt-8 pb-4 text-center border-t border-[#1a1e34] space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Que Comece Em Nós — Governador Valadares</span>
          </div>
          <p className="text-[11px] text-neutral-400 italic">
            &quot;O avivamento não começa em um palco. Começa em nós.&quot;
          </p>
          <div className="pt-1 flex items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/comeceemnos/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-blue-400 transition"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>@comeceemnos</span>
            </a>
          </div>
        </footer>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-5 right-5 sm:hidden z-30">
        <button
          type="button"
          onClick={handleOpenNewOrder}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center transition active:scale-90 border border-blue-400/40"
          title="Adicionar Novo Pedido"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

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
