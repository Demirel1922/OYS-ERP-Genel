import { create } from 'zustand';
import type { Tedarikci, TedarikciFormData } from '@/types';
import { apiFetch } from '@/lib/api';

function toFrontend(row: any): Tedarikci {
  return {
    id: String(row.id),
    tedarikciKodu: row.tedarikci_kodu || '',
    tedarikciAdi: row.tedarikci_adi || '',
    tedarikciUnvan: row.tedarikci_unvan || '',
    bolge: row.bolge || 'ITHALAT',
    ulke: row.ulke || '',
    adres: row.adres || '',
    vkn: row.vkn || '',
    vergiDairesi: row.vergi_dairesi || '',
    kategoriIds: (row.kategori_ids || []).map(String),
    durum: row.durum || 'AKTIF',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function toBackend(data: Partial<TedarikciFormData> & { durum?: string }) {
  const map: any = {};
  if (data.tedarikciKodu !== undefined) map.tedarikci_kodu = data.tedarikciKodu;
  if (data.tedarikciAdi !== undefined) map.tedarikci_adi = data.tedarikciAdi;
  if (data.tedarikciUnvan !== undefined) map.tedarikci_unvan = data.tedarikciUnvan;
  if (data.bolge !== undefined) map.bolge = data.bolge;
  if (data.ulke !== undefined) map.ulke = data.ulke;
  if (data.adres !== undefined) map.adres = data.adres;
  if (data.vkn !== undefined) map.vkn = data.vkn;
  if (data.vergiDairesi !== undefined) map.vergi_dairesi = data.vergiDairesi;
  if (data.kategoriIds !== undefined) map.kategori_ids = data.kategoriIds.map(Number);
  if (data.durum !== undefined) map.durum = data.durum;
  return map;
}

interface TedarikciState {
  tedarikciler: Tedarikci[];
  loading: boolean;
  addTedarikci: (data: TedarikciFormData) => Promise<{ success: boolean; error?: string }>;
  updateTedarikci: (id: string, data: Partial<TedarikciFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteTedarikci: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  seedData: () => void;
  fetchAll: () => Promise<void>;
}

export const useTedarikciStore = create<TedarikciState>()((set, get) => ({
  tedarikciler: [],
  loading: false,
  fetchAll: async () => {
    try {
      set({ loading: true });
      const rows = await apiFetch<any[]>('/suppliers');
      set({ tedarikciler: rows.map(toFrontend), loading: false });
    } catch (err) { console.error(err); set({ loading: false }); }
  },
  addTedarikci: async (data) => {
    try { await apiFetch('/suppliers', { method: 'POST', body: JSON.stringify(toBackend(data)) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  updateTedarikci: async (id, data) => {
    try { await apiFetch(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(toBackend(data)) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  deleteTedarikci: async (id) => {
    try { await apiFetch(`/suppliers/${id}`, { method: 'DELETE' }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  pasifYap: async (id) => {
    try { await apiFetch(`/suppliers/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  aktifYap: async (id) => {
    try { await apiFetch(`/suppliers/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  seedData: () => { get().fetchAll(); },
}));
