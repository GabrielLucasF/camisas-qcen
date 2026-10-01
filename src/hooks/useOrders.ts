'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, AppSettings, SizeSummaryItem, PaymentStatus, OrderItem } from '../types/order';
import { INITIAL_ORDERS, DEFAULT_SETTINGS, AVAILABLE_SIZES } from '../data/initialData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { mapRowToOrder, mapOrderToRow } from '../lib/ordersService';

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

  // Load orders (Supabase if configured, otherwise localStorage)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && isMounted) {
            const mappedOrders = data.map(mapRowToOrder);
            setOrders(mappedOrders);
            setIsLoaded(true);
            return;
          }
        } catch {
          // fall through to local storage if network error
        }
      }

      // Local storage fallback
      try {
        const storedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
        const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);

        const parsedOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;
        const parsedSettings: AppSettings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;

        let activeSettings = parsedSettings;
        if (!parsedSettings.unitPrice || parsedSettings.unitPrice === 35) {
          activeSettings = { ...parsedSettings, unitPrice: 70.0 };
        }

        if (isMounted) {
          setOrders(parsedOrders);
          setSettings(activeSettings);
        }
      } catch {
        if (isMounted) {
          setOrders(INITIAL_ORDERS);
          setSettings(DEFAULT_SETTINGS);
        }
      }

      if (isMounted) {
        setIsLoaded(true);
      }
    }

    loadData();

    // Supabase Realtime subscription
    const client = getSupabaseClient();
    if (!client) {
      return () => {
        isMounted = false;
      };
    }

    const channel = client
      .channel('realtime:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = mapRowToOrder(payload.new);
            setOrders((prev) => {
              const alreadyExists = prev.some((o) => o.id === newOrder.id);
              if (alreadyExists) {
                return prev;
              }
              return [newOrder, ...prev];
            });
            return;
          }

          if (payload.eventType === 'UPDATE') {
            const updated = mapRowToOrder(payload.new);
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            return;
          }

          if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setOrders((prev) => prev.filter((o) => o.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      client.removeChannel(channel);
    };
  }, []);

  // Sync to localStorage as backup/cache
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

      const client = getSupabaseClient();
      if (client) {
        await client.from('orders').insert(mapOrderToRow(newOrder));
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

      const client = getSupabaseClient();
      if (client) {
        const patch: any = { updated_at: now };
        if (updates.personName !== undefined) {
          patch.person_name = updates.personName;
        }
        if (updates.whatsapp !== undefined) {
          patch.whatsapp = updates.whatsapp;
        }
        if (updates.status !== undefined) {
          patch.status = updates.status;
        }
        if (updates.items !== undefined) {
          patch.items = updates.items;
        }
        if (updates.notes !== undefined) {
          patch.notes = updates.notes;
        }
        await client.from('orders').update(patch).eq('id', id);
      }
    },
    []
  );

  const deleteOrder = useCallback(async (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));

    const client = getSupabaseClient();
    if (client) {
      await client.from('orders').delete().eq('id', id);
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

      const client = getSupabaseClient();
      if (client) {
        client.from('orders').update({ status: nextStatus, updated_at: now }).eq('id', id);
      }

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

    const client = getSupabaseClient();
    if (client) {
      client.from('orders').update({ status, updated_at: now }).eq('id', id);
    }
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
    const client = getSupabaseClient();
    if (client) {
      await client.from('orders').delete().neq('id', '');
    }
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
