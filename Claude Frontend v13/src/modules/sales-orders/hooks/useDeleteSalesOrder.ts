import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export function useDeleteSalesOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteOrderById = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiFetch(`/orders/${id}`, { method: 'DELETE' });
      setSuccess(true);
      toast.success('Sipariş başarıyla silindi');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sipariş silinirken hata oluştu';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteOrderById, loading, error, success };
}
