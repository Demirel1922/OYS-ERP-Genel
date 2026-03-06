import { useState, useCallback } from 'react';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

interface UseCreateSalesOrderReturn {
  createOrder: (order: Omit<SalesOrder, 'id'>, musteriNo: string) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export function useCreateSalesOrder(): UseCreateSalesOrderReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const createOrder = useCallback(async (
    order: Omit<SalesOrder, 'id'>,
    musteriNo: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const result = await apiFetch<{ id: number; order_no: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...order,
          ormeci_musteri_no: musteriNo,
        }),
      });

      setSuccess(true);
      toast.success(`Sipariş başarıyla oluşturuldu: ${result.order_no}`);
      return String(result.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sipariş oluşturulurken hata oluştu';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOrder, loading, error, success };
}
