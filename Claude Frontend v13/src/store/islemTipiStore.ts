import { create } from 'zustand';
import type { IslemTipi, IslemTipiFormData } from '@/types';
import { apiFetch } from '@/lib/api';

function toFrontend(row: any): IslemTipi {
  return { id: String(row.id), islemAdi: row.islem_adi || '', hareketYonu: row.hareket_yonu || 'GIRIS', aciklama: row.aciklama || '', durum: row.durum || 'AKTIF', createdAt: row.created_at || '', updatedAt: row.updated_at || '' };
}
function toBackend(data: any) {
  const m: any = {};
  if (data.islemAdi !== undefined) m.islem_adi = data.islemAdi;
  if (data.hareketYonu !== undefined) m.hareket_yonu = data.hareketYonu;
  if (data.aciklama !== undefined) m.aciklama = data.aciklama;
  if (data.durum !== undefined) m.durum = data.durum;
  return m;
}

interface IslemTipiState {
  islemTipleri: IslemTipi[]; loading: boolean;
  addIslemTipi: (data: IslemTipiFormData) => Promise<{ success: boolean; error?: string }>;
  updateIslemTipi: (id: string, data: Partial<IslemTipiFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteIslemTipi: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  seedData: () => void; fetchAll: () => Promise<void>;
}

export const useIslemTipiStore = create<IslemTipiState>()((set, get) => ({
  islemTipleri: [], loading: false,
  fetchAll: async () => { try { set({ loading: true }); const rows = await apiFetch<any[]>('/transaction-types'); set({ islemTipleri: rows.map(toFrontend), loading: false }); } catch (err) { console.error(err); set({ loading: false }); } },
  addIslemTipi: async (data) => { try { await apiFetch('/transaction-types', { method: 'POST', body: JSON.stringify(toBackend(data)) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  updateIslemTipi: async (id, data) => { try { await apiFetch(`/transaction-types/${id}`, { method: 'PUT', body: JSON.stringify(toBackend(data)) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  deleteIslemTipi: async (id) => { try { await apiFetch(`/transaction-types/${id}`, { method: 'DELETE' }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  pasifYap: async (id) => { try { await apiFetch(`/transaction-types/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  aktifYap: async (id) => { try { await apiFetch(`/transaction-types/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  seedData: () => { get().fetchAll(); },
}));
