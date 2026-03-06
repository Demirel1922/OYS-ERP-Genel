import { useState, useCallback, useEffect } from 'react';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';
import { apiFetch } from '@/lib/api';

export function useSalesOrder(id: string | undefined) {
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await apiFetch<any>(`/orders/${id}`);
      setOrder({
        ...data,
        id: String(data.id),
        customer_id: String(data.customer_id),
        lines: (data.lines || []).map((l: any) => ({
          ...l,
          id: l.line_id || String(l.id),
          quantity: l.quantity || 0,
          line_total_pairs: l.line_total_pairs || 0,
        })),
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sipariş yüklenemedi'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}
