'use client';

import React, { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { Header } from '../components/Header';
import { SizeSummary } from '../components/SizeSummary';
import { FinancialSummary } from '../components/FinancialSummary';
import { OrderList } from '../components/OrderList';
import { OrderFormModal } from '../components/OrderFormModal';
import { ShareModal } from '../components/ShareModal';
import { SettingsModal } from '../components/SettingsModal';
import { Order, PaymentStatus } from '../types/order';
import { Plus } from 'lucide-react';

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
      <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Carregando pedidos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col pb-24 sm:pb-12">
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
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Lista de Pedidos
            </h2>
            <span className="text-xs text-neutral-400">
              {orders.length} cadastrados
            </span>
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
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-5 right-5 sm:hidden z-30">
        <button
          type="button"
          onClick={handleOpenNewOrder}
          className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-xl shadow-emerald-500/30 flex items-center justify-center transition active:scale-90"
          title="Adicionar Novo Pedido"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
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
