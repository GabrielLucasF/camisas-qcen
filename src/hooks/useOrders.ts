'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, AppSettings, SizeSummaryItem, PaymentStatus, OrderItem } from '../types/order';
import { INITIAL_ORDERS, DEFAULT_SETTINGS, AVAILABLE_SIZES } from '../data/initialData';

const STORAGE_KEY_ORDERS = 'camisas_qcen_orders_v1';
const STORAGE_KEY_SETTINGS = 'camisas_qcen_settings_v1';

const NEXT_PAYMENT_STATUS: Record<PaymentStatus, PaymentStatus> = {
  pending: 'half',
  half: 'paid',
  paid: 'pending',
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);

      const parsedOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;
      const parsedSettings: AppSettings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;

      let activeSettings = parsedSettings;
      if (!parsedSettings.unitPrice || parsedSettings.unitPrice === 35) {
        activeSettings = { ...parsedSettings, unitPrice: 70.0 };
      }

      setOrders(parsedOrders);
      setSettings(activeSettings);
    } catch {
      setOrders(INITIAL_ORDERS);
      setSettings(DEFAULT_SETTINGS);
    }
    setIsLoaded(true);
  }, []);

  // Save orders to localStorage
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      // storage error handled silently
    }
  }, [orders, isLoaded]);

  // Save settings to localStorage
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // storage error handled silently
    }
  }, [settings, isLoaded]);

  const addOrder = useCallback((data: {
    personName: string;
    items: Array<{ size: OrderItem['size']; quantity: number }>;
    status: PaymentStatus;
    notes?: string;
  }) => {
    const now = new Date().toISOString();
    const newOrder: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      personName: data.personName.trim(),
      items: data.items.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        size: item.size,
        quantity: Math.max(1, item.quantity),
      })),
      status: data.status,
      notes: data.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    setOrders((prev) => [newOrder, ...prev]);
  }, []);

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) {
          return order;
        }
        return {
          ...order,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }, []);

  const togglePaymentStatus = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) {
          return order;
        }
        const nextStatus = NEXT_PAYMENT_STATUS[order.status];
        return {
          ...order,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const setPaymentStatus = useCallback((id: string, status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) {
          return order;
        }
        return {
          ...order,
          status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  const resetToInitial = useCallback(() => {
    setOrders(INITIAL_ORDERS);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const clearAll = useCallback(() => {
    setOrders([]);
  }, []);

  const importOrders = useCallback((newOrders: Order[]) => {
    if (!Array.isArray(newOrders)) {
      return;
    }
    setOrders(newOrders);
  }, []);

  // Summary calculations
  const totalPeople = orders.length;

  const totalShirts = useMemo(() => {
    return orders.reduce((sum, order) => {
      const itemsCount = order.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
      return sum + itemsCount;
    }, 0);
  }, [orders]);

  const sizeSummary = useMemo((): SizeSummaryItem[] => {
    const counts: Record<string, number> = {};

    AVAILABLE_SIZES.forEach((s) => {
      counts[s] = 0;
    });

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.size;
        counts[key] = (counts[key] ?? 0) + (item.quantity || 1);
      });
    });

    const list = Object.entries(counts)
      .map(([size, count]) => ({
        size,
        count,
        percentage: totalShirts > 0 ? Math.round((count / totalShirts) * 100) : 0,
      }))
      .filter((item) => item.count > 0 || AVAILABLE_SIZES.slice(0, 5).includes(item.size as any));

    return list;
  }, [orders, totalShirts]);

  const paymentStats = useMemo(() => {
    let paidShirts = 0;
    let halfShirts = 0;
    let pendingShirts = 0;

    orders.forEach((order) => {
      const shirtsCount = order.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
      const isPaid = order.status === 'paid';
      const isHalf = order.status === 'half';

      if (isPaid) {
        paidShirts += shirtsCount;
        return;
      }
      if (isHalf) {
        halfShirts += shirtsCount;
        return;
      }
      pendingShirts += shirtsCount;
    });

    const price = settings.unitPrice || 0;
    const totalRevenueExpected = totalShirts * price;
    const totalCollected = (paidShirts * price) + (halfShirts * (price / 2));
    const totalRemaining = totalRevenueExpected - totalCollected;

    return {
      paidCount: orders.filter((o) => o.status === 'paid').length,
      halfCount: orders.filter((o) => o.status === 'half').length,
      pendingCount: orders.filter((o) => o.status === 'pending').length,
      paidShirts,
      halfShirts,
      pendingShirts,
      totalRevenueExpected,
      totalCollected,
      totalRemaining,
    };
  }, [orders, totalShirts, settings.unitPrice]);

  return {
    orders,
    settings,
    isLoaded,
    addOrder,
    updateOrder,
    deleteOrder,
    togglePaymentStatus,
    setPaymentStatus,
    updateSettings,
    resetToInitial,
    clearAll,
    importOrders,
    totalPeople,
    totalShirts,
    sizeSummary,
    paymentStats,
  };
}
