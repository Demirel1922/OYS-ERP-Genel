// ============================================
// MÜŞTERİ STORE - API Tabanlı
// ============================================
import { create } from 'zustand';
import type { Musteri, MusteriFormData } from '@/types';
import { apiFetch } from '@/lib/api';

// Backend alan adlarını frontend'e çevir
function toFrontend(row: any): Musteri {
  return {
    id: String(row.id),
    ormeciMusteriNo: row.ormeci_musteri_no || '',
    musteriKisaKod: row.musteri_kisa_kod || '',
    musteriUnvan: row.musteri_unvan || '',
    bolge: row.bolge || 'IHRACAT',
    ulke: row.ulke || 'Türkiye',
    adres: row.adres || '',
    vergiNo: row.vergi_no || '',
    odemeVadesiDeger: row.odeme_vadesi_deger || 30,
    odemeVadesiBirim: row.odeme_vadesi_birim || 'GUN',
    odemeTipi: row.odeme_tipi || '',
    durum: row.durum || 'AKTIF',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function toBackend(data: Partial<MusteriFormData> & { durum?: string }) {
  const map: any = {};
  if (data.ormeciMusteriNo !== undefined) map.ormeci_musteri_no = data.ormeciMusteriNo;
  if (data.musteriKisaKod !== undefined) map.musteri_kisa_kod = data.musteriKisaKod;
  if (data.musteriUnvan !== undefined) map.musteri_unvan = data.musteriUnvan;
  if (data.bolge !== undefined) map.bolge = data.bolge;
  if (data.ulke !== undefined) map.ulke = data.ulke;
  if (data.adres !== undefined) map.adres = data.adres;
  if (data.vergiNo !== undefined) map.vergi_no = data.vergiNo;
  if (data.odemeVadesiDeger !== undefined) map.odeme_vadesi_deger = data.odemeVadesiDeger;
  if (data.odemeVadesiBirim !== undefined) map.odeme_vadesi_birim = data.odemeVadesiBirim;
  if (data.odemeTipi !== undefined) map.odeme_tipi = data.odemeTipi;
  if (data.durum !== undefined) map.durum = data.durum;
  return map;
}

interface MusteriState {
  musteriler: Musteri[];
  loading: boolean;
  addMusteri: (data: MusteriFormData) => Promise<{ success: boolean; error?: string }>;
  updateMusteri: (id: string, data: Partial<MusteriFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteMusteri: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  seedData: () => void;
  fetchAll: () => Promise<void>;
}

export const useMusteriStore = create<MusteriState>()((set, get) => ({
  musteriler: [],
  loading: false,

  fetchAll: async () => {
    try {
      set({ loading: true });
      const rows = await apiFetch<any[]>('/customers');
      set({ musteriler: rows.map(toFrontend), loading: false });
    } catch (err) {
      console.error('Müşteri yükleme hatası:', err);
      set({ loading: false });
    }
  },

  addMusteri: async (data) => {
    try {
      await apiFetch('/customers', { method: 'POST', body: JSON.stringify(toBackend(data)) });
      await get().fetchAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updateMusteri: async (id, data) => {
    try {
      await apiFetch(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(toBackend(data)) });
      await get().fetchAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  deleteMusteri: async (id) => {
    try {
      await apiFetch(`/customers/${id}`, { method: 'DELETE' });
      await get().fetchAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  pasifYap: async (id) => {
    try {
      await apiFetch(`/customers/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) });
      await get().fetchAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  aktifYap: async (id) => {
    try {
      await apiFetch(`/customers/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) });
      await get().fetchAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  seedData: () => {
    get().fetchAll();
  },
}));
