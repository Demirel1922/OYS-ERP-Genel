import { create } from 'zustand';
import type { IplikKategori, IplikKategoriFormData, IplikCins, IplikCinsFormData, IplikDetay, IplikDetayFormData } from '@/types';
import { apiFetch } from '@/lib/api';

function toKategori(r: any): IplikKategori { return { id: String(r.id), kategoriAdi: r.kategori_adi || '', durum: r.durum || 'AKTIF', createdAt: r.created_at || '', updatedAt: r.updated_at || '' }; }
function toCins(r: any): IplikCins { return { id: String(r.id), kategoriId: String(r.kategori_id), cinsAdi: r.cins_adi || '', durum: r.durum || 'AKTIF', createdAt: r.created_at || '', updatedAt: r.updated_at || '' }; }
function toDetay(r: any): IplikDetay { return { id: String(r.id), cinsId: String(r.cins_id), detayAdi: r.detay_adi || '', durum: r.durum || 'AKTIF', createdAt: r.created_at || '', updatedAt: r.updated_at || '' }; }

interface IplikDetayState {
  kategoriler: IplikKategori[]; cinsler: IplikCins[]; detaylar: IplikDetay[]; loading: boolean;
  addKategori: (data: IplikKategoriFormData) => Promise<{ success: boolean; error?: string }>;
  updateKategori: (id: string, data: Partial<IplikKategoriFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteKategori: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYapKategori: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYapKategori: (id: string) => Promise<{ success: boolean; error?: string }>;
  addCins: (data: IplikCinsFormData) => Promise<{ success: boolean; error?: string }>;
  updateCins: (id: string, data: Partial<IplikCinsFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteCins: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYapCins: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYapCins: (id: string) => Promise<{ success: boolean; error?: string }>;
  addDetay: (data: IplikDetayFormData) => Promise<{ success: boolean; error?: string }>;
  updateDetay: (id: string, data: Partial<IplikDetayFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteDetay: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYapDetay: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYapDetay: (id: string) => Promise<{ success: boolean; error?: string }>;
  seedData: () => void; fetchAll: () => Promise<void>;
}

export const useIplikDetayStore = create<IplikDetayState>()((set, get) => ({
  kategoriler: [], cinsler: [], detaylar: [], loading: false,
  fetchAll: async () => {
    try {
      set({ loading: true });
      const [kats, cinss, dets] = await Promise.all([
        apiFetch<any[]>('/yarn-categories'),
        apiFetch<any[]>('/yarn-types'),
        apiFetch<any[]>('/yarn-details'),
      ]);
      set({ kategoriler: kats.map(toKategori), cinsler: cinss.map(toCins), detaylar: dets.map(toDetay), loading: false });
    } catch (err) { console.error(err); set({ loading: false }); }
  },
  // Kategori
  addKategori: async (data) => { try { await apiFetch('/yarn-categories', { method: 'POST', body: JSON.stringify({ kategori_adi: data.kategoriAdi, durum: data.durum || 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  updateKategori: async (id, data) => { const m: any = {}; if (data.kategoriAdi !== undefined) m.kategori_adi = data.kategoriAdi; if (data.durum !== undefined) m.durum = data.durum; try { await apiFetch(`/yarn-categories/${id}`, { method: 'PUT', body: JSON.stringify(m) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  deleteKategori: async (id) => { try { await apiFetch(`/yarn-categories/${id}`, { method: 'DELETE' }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  pasifYapKategori: async (id) => { try { await apiFetch(`/yarn-categories/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  aktifYapKategori: async (id) => { try { await apiFetch(`/yarn-categories/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  // Cins
  addCins: async (data) => { try { await apiFetch('/yarn-types', { method: 'POST', body: JSON.stringify({ kategori_id: Number(data.kategoriId), cins_adi: data.cinsAdi, durum: data.durum || 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  updateCins: async (id, data) => { const m: any = {}; if (data.kategoriId !== undefined) m.kategori_id = Number(data.kategoriId); if (data.cinsAdi !== undefined) m.cins_adi = data.cinsAdi; if (data.durum !== undefined) m.durum = data.durum; try { await apiFetch(`/yarn-types/${id}`, { method: 'PUT', body: JSON.stringify(m) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  deleteCins: async (id) => { try { await apiFetch(`/yarn-types/${id}`, { method: 'DELETE' }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  pasifYapCins: async (id) => { try { await apiFetch(`/yarn-types/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  aktifYapCins: async (id) => { try { await apiFetch(`/yarn-types/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  // Detay
  addDetay: async (data) => { try { await apiFetch('/yarn-details', { method: 'POST', body: JSON.stringify({ cins_id: Number(data.cinsId), detay_adi: data.detayAdi, durum: data.durum || 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  updateDetay: async (id, data) => { const m: any = {}; if (data.cinsId !== undefined) m.cins_id = Number(data.cinsId); if (data.detayAdi !== undefined) m.detay_adi = data.detayAdi; if (data.durum !== undefined) m.durum = data.durum; try { await apiFetch(`/yarn-details/${id}`, { method: 'PUT', body: JSON.stringify(m) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  deleteDetay: async (id) => { try { await apiFetch(`/yarn-details/${id}`, { method: 'DELETE' }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  pasifYapDetay: async (id) => { try { await apiFetch(`/yarn-details/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  aktifYapDetay: async (id) => { try { await apiFetch(`/yarn-details/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (e: any) { return { success: false, error: e.message }; } },
  seedData: () => { get().fetchAll(); },
}));
