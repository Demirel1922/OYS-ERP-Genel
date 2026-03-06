import { useState, useCallback, useEffect } from 'react';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';
import { apiFetch } from '@/lib/api';

function mapOrder(row: any): SalesOrder {
  return {
    ...row,
    id: String(row.id),
    customer_id: String(row.customer_id),
    lines: (row.lines || []).map((l: any) => ({
      ...l,
      id: l.line_id || String(l.id),
      quantity: l.quantity || 0,
      line_total_pairs: l.line_total_pairs || 0,
    })),
  };
}

export function useSalesOrders() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<any[]>('/orders');
      setOrders(data.map(mapOrder));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Siparişler yüklenemedi'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
