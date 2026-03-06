import { create } from 'zustand';
import type { TedarikciKategorisi, TedarikciKategorisiFormData } from '@/types';
import { apiFetch } from '@/lib/api';

function toFrontend(row: any): TedarikciKategorisi {
  return {
    id: String(row.id), kategoriKodu: row.kategori_kodu || '', kategoriAdi: row.kategori_adi || '',
    aciklama: row.aciklama || '', durum: row.durum || 'AKTIF',
    createdAt: row.created_at || '', updatedAt: row.updated_at || '',
  };
}
function toBackend(data: Partial<TedarikciKategorisiFormData> & { durum?: string }) {
  const m: any = {};
  if (data.kategoriKodu !== undefined) m.kategori_kodu = data.kategoriKodu;
  if (data.kategoriAdi !== undefined) m.kategori_adi = data.kategoriAdi;
  if (data.aciklama !== undefined) m.aciklama = data.aciklama;
  if (data.durum !== undefined) m.durum = data.durum;
  return m;
}

interface TedarikciKategorisiState {
  kategoriler: TedarikciKategorisi[]; loading: boolean;
  addKategori: (data: TedarikciKategorisiFormData) => Promise<{ success: boolean; error?: string }>;
  updateKategori: (id: string, data: Partial<TedarikciKategorisiFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteKategori: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  getKategoriById: (id: string) => TedarikciKategorisi | undefined;
  getKategoriAdiById: (id: string) => string;
  seedData: () => void; fetchAll: () => Promise<void>;
}

export const useTedarikciKategoriStore = create<TedarikciKategorisiState>()((set, get) => ({
  kategoriler: [], loading: false,
  fetchAll: async () => {
    try { set({ loading: true }); const rows = await apiFetch<any[]>('/supplier-categories'); set({ kategoriler: rows.map(toFrontend), loading: false }); }
    catch (err) { console.error(err); set({ loading: false }); }
  },
  addKategori: async (data) => {
    try { await apiFetch('/supplier-categories', { method: 'POST', body: JSON.stringify(toBackend(data)) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  updateKategori: async (id, data) => {
    try { await apiFetch(`/supplier-categories/${id}`, { method: 'PUT', body: JSON.stringify(toBackend(data)) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  deleteKategori: async (id) => {
    try { await apiFetch(`/supplier-categories/${id}`, { method: 'DELETE' }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  pasifYap: async (id) => {
    try { await apiFetch(`/supplier-categories/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  aktifYap: async (id) => {
    try { await apiFetch(`/supplier-categories/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  getKategoriById: (id) => get().kategoriler.find(k => k.id === id),
  getKategoriAdiById: (id) => get().kategoriler.find(k => k.id === id)?.kategoriAdi || 'Bilinmiyor',
  seedData: () => { get().fetchAll(); },
}));
