import { create } from 'zustand';
import type { Depo, DepoFormData } from '@/types';
import { apiFetch } from '@/lib/api';

function toFrontend(row: any): Depo {
  return {
    id: String(row.id), depoAdi: row.depo_adi || '', depoKodu: row.depo_kodu || 0,
    depoTipi: row.depo_tipi || 'IC_DEPO', disDepoAdres: row.dis_depo_adres || '',
    disDepoVKN: row.dis_depo_vkn || '', disDepoVergiDairesi: row.dis_depo_vergi_dairesi || '',
    durum: row.durum || 'AKTIF', createdAt: row.created_at || '', updatedAt: row.updated_at || '',
  };
}
function toBackend(data: Partial<DepoFormData> & { durum?: string }) {
  const m: any = {};
  if (data.depoAdi !== undefined) m.depo_adi = data.depoAdi;
  if (data.depoKodu !== undefined) m.depo_kodu = data.depoKodu;
  if (data.depoTipi !== undefined) m.depo_tipi = data.depoTipi;
  if (data.disDepoAdres !== undefined) m.dis_depo_adres = data.disDepoAdres;
  if (data.disDepoVKN !== undefined) m.dis_depo_vkn = data.disDepoVKN;
  if (data.disDepoVergiDairesi !== undefined) m.dis_depo_vergi_dairesi = data.disDepoVergiDairesi;
  if (data.durum !== undefined) m.durum = data.durum;
  return m;
}

interface DepoState {
  depolar: Depo[]; loading: boolean;
  addDepo: (data: DepoFormData) => Promise<{ success: boolean; error?: string }>;
  updateDepo: (id: string, data: Partial<DepoFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteDepo: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  seedData: () => void; fetchAll: () => Promise<void>;
}

export const useDepoStore = create<DepoState>()((set, get) => ({
  depolar: [], loading: false,
  fetchAll: async () => {
    try { set({ loading: true }); const rows = await apiFetch<any[]>('/warehouses'); set({ depolar: rows.map(toFrontend), loading: false }); }
    catch (err) { console.error(err); set({ loading: false }); }
  },
  addDepo: async (data) => {
    try { await apiFetch('/warehouses', { method: 'POST', body: JSON.stringify(toBackend(data)) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  updateDepo: async (id, data) => {
    try { await apiFetch(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(toBackend(data)) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  deleteDepo: async (id) => {
    try { await apiFetch(`/warehouses/${id}`, { method: 'DELETE' }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  pasifYap: async (id) => {
    try { await apiFetch(`/warehouses/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  aktifYap: async (id) => {
    try { await apiFetch(`/warehouses/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  seedData: () => { get().fetchAll(); },
}));
