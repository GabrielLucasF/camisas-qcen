'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, AppSettings, SizeSummaryItem, PaymentStatus, OrderItem, ShirtSize } from '../types/order';
import { INITIAL_ORDERS, DEFAULT_SETTINGS, AVAILABLE_SIZES } from '../data/initialData';

const STORAGE_KEY_ORDERS = 'camisas_qcen_orders_v1';
const STORAGE_KEY_SETTINGS = 'camisas_qcen_settings_v1';

const NEXT_PAYMENT_STATUS: Record<PaymentStatus, PaymentStatus> = {
  pending: 'half',
  half: 'paid',
  paid: 'pending',
};

export function useOrders(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load orders from secure API (fallback to localStorage if offline/unconfigured)
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.orders) && data.configured && isMounted) {
            setOrders(data.orders);
            setIsLoaded(true);
            return;
          }
        }
      } catch {
        // Network error, fall back to localStorage
      }

      if (!isMounted) {
        return;
      }

      // Local storage fallback only if enabled
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
    }

    loadData();

    // Poll server every 20 seconds to keep leader dashboard synchronized
    const interval = setInterval(() => {
      fetch('/api/orders')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.configured && Array.isArray(data.orders) && isMounted) {
            setOrders(data.orders);
          }
        })
        .catch(() => {});
    }, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [enabled]);

  // Sync to localStorage as backup/cache
  useEffect(() => {
    if (!enabled || !isLoaded) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {
      // storage error handled silently
    }
  }, [orders, isLoaded, enabled]);

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

  const addOrder = useCallback(
    async (data: {
      personName: string;
      whatsapp?: string;
      items: Array<{ size: OrderItem['size']; quantity: number }>;
      status: PaymentStatus;
      notes?: string;
    }) => {
      const now = new Date().toISOString();
      const newOrder: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        personName: data.personName.trim(),
        whatsapp: data.whatsapp?.trim() || undefined,
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

      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personName: newOrder.personName,
            whatsapp: newOrder.whatsapp || '0000000000',
            items: newOrder.items,
            status: newOrder.status,
            notes: newOrder.notes,
          }),
        });
      } catch {
        // Handled via local state and localStorage
      }
    },
    []
  );

  const updateOrder = useCallback(
    async (id: string, updates: Partial<Order>) => {
      const now = new Date().toISOString();
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== id) {
            return order;
          }
          return {
            ...order,
            ...updates,
            updatedAt: now,
          };
        })
      );

      try {
        await fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, updates }),
        });
      } catch {
        // Handled via local state
      }
    },
    []
  );

  const deleteOrder = useCallback(async (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));

    try {
      await fetch(`/api/orders?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch {
      // Handled via local state
    }
  }, []);

  const togglePaymentStatus = useCallback((id: string) => {
    setOrders((prev) => {
      const target = prev.find((o) => o.id === id);
      if (!target) {
        return prev;
      }
      const nextStatus = NEXT_PAYMENT_STATUS[target.status];
      const now = new Date().toISOString();

      fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { status: nextStatus } }),
      }).catch(() => {});

      return prev.map((order) => {
        if (order.id !== id) {
          return order;
        }
        return {
          ...order,
          status: nextStatus,
          updatedAt: now,
        };
      });
    });
  }, []);

  const setPaymentStatus = useCallback((id: string, status: PaymentStatus) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) {
          return order;
        }
        return {
          ...order,
          status,
          updatedAt: now,
        };
      })
    );

    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: { status } }),
    }).catch(() => {});
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

  const clearAll = useCallback(async () => {
    setOrders([]);
    try {
      await fetch('/api/orders?all=true', {
        method: 'DELETE',
      });
    } catch {
      // Handled via local state
    }
  }, []);

  const importOrders = useCallback((newOrders: Order[]) => {
    if (!Array.isArray(newOrders)) {
      return;
    }
    setOrders(newOrders);
  }, []);

  const activeOrders = useMemo(() => (enabled ? orders : []), [enabled, orders]);
  const activeLoaded = enabled ? isLoaded : false;

  // Summary calculations
  const totalPeople = activeOrders.length;

  const totalShirts = useMemo(() => {
    return activeOrders.reduce((sum, order) => {
      const itemsCount = order.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
      return sum + itemsCount;
    }, 0);
  }, [activeOrders]);

  const sizeSummary = useMemo((): SizeSummaryItem[] => {
    const counts: Record<string, number> = {};

    AVAILABLE_SIZES.forEach((s) => {
      counts[s] = 0;
    });

    activeOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.size;
        counts[key] = (counts[key] ?? 0) + (item.quantity || 1);
      });
    });

    const defaultSizes: ShirtSize[] = ['P', 'M', 'G', 'GG', 'G1'];
    const list = Object.entries(counts)
      .map(([size, count]) => ({
        size,
        count,
        percentage: totalShirts > 0 ? Math.round((count / totalShirts) * 100) : 0,
      }))
      .filter((item) => item.count > 0 || defaultSizes.includes(item.size as ShirtSize));

    return list;
  }, [activeOrders, totalShirts]);

  const paymentStats = useMemo(() => {
    let paidShirts = 0;
    let halfShirts = 0;
    let pendingShirts = 0;

    activeOrders.forEach((order) => {
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
    const totalCollected = paidShirts * price + halfShirts * (price / 2);
    const totalRemaining = totalRevenueExpected - totalCollected;

    return {
      paidCount: activeOrders.filter((o) => o.status === 'paid').length,
      halfCount: activeOrders.filter((o) => o.status === 'half').length,
      pendingCount: activeOrders.filter((o) => o.status === 'pending').length,
      paidShirts,
      halfShirts,
      pendingShirts,
      totalRevenueExpected,
      totalCollected,
      totalRemaining,
    };
  }, [activeOrders, totalShirts, settings.unitPrice]);

  return {
    orders: activeOrders,
    settings,
    isLoaded: activeLoaded,
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
