import { useState, useCallback } from 'react';
import { addOrder, checkOrderNoExists } from '@/lib/db';
import { toast } from 'sonner';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';

interface UseCreateSalesOrderReturn {
  createOrder: (order: Omit<SalesOrder, 'id'>, customOrderNo?: string) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

function generateOrderNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 900) + 100;
  return `SIP-${dateStr}-${random}`;
}

export function useCreateSalesOrder(): UseCreateSalesOrderReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const createOrder = useCallback(async (
    order: Omit<SalesOrder, 'id'>, 
    customOrderNo?: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      let orderNo = customOrderNo?.trim();
      
      if (!orderNo) {
        orderNo = generateOrderNo();
      }

      const exists = await checkOrderNoExists(orderNo);
      if (exists) {
        throw new Error(`"${orderNo}" sipariş numarası zaten kullanılıyor. Lütfen başka bir numara deneyin.`);
      }

      const orderWithNo = {
        ...order,
        order_no: orderNo,
      };

      const id = await addOrder(orderWithNo);
      setSuccess(true);
      toast.success(`Sipariş başarıyla oluşturuldu: ${orderNo}`);
      return id;
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
