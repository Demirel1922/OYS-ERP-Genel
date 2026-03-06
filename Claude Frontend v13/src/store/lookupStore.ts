import { create } from 'zustand';
import type { LookupItem, LookupItemFormData, LookupType } from '@/types';
import { apiFetch } from '@/lib/api';

function toFrontend(row: any): LookupItem {
  return {
    id: String(row.id), lookupType: row.lookup_type || 'BEDEN', kod: row.kod || '', ad: row.ad || '',
    durum: row.durum || 'AKTIF', sira: row.sira, carpan: row.carpan,
    createdAt: row.created_at || '', updatedAt: row.updated_at || '',
  };
}
function toBackend(data: any) {
  const m: any = {};
  if (data.lookupType !== undefined) m.lookup_type = data.lookupType;
  if (data.kod !== undefined) m.kod = data.kod;
  if (data.ad !== undefined) m.ad = data.ad;
  if (data.sira !== undefined) m.sira = data.sira;
  if (data.carpan !== undefined) m.carpan = data.carpan;
  if (data.durum !== undefined) m.durum = data.durum;
  return m;
}

interface LookupState {
  items: LookupItem[]; loading: boolean;
  addItem: (data: LookupItemFormData) => Promise<{ success: boolean; error?: string }>;
  updateItem: (id: string, data: Partial<LookupItemFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  getItemById: (id: string) => LookupItem | undefined;
  getItemsByType: (type: LookupType) => LookupItem[];
  getSortedItemsByType: (type: LookupType) => LookupItem[];
  checkKodExists: (kod: string, excludeId?: string) => boolean;
  checkAdExists: (ad: string, excludeId?: string) => boolean;
  seedData: () => void; fetchAll: () => Promise<void>;
}

export const useLookupStore = create<LookupState>()((set, get) => ({
  items: [], loading: false,
  fetchAll: async () => {
    try { set({ loading: true }); const rows = await apiFetch<any[]>('/lookups'); set({ items: rows.map(toFrontend), loading: false }); }
    catch (err) { console.error(err); set({ loading: false }); }
  },
  addItem: async (data) => {
    try { await apiFetch('/lookups', { method: 'POST', body: JSON.stringify({ ...toBackend(data), durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  updateItem: async (id, data) => {
    try { await apiFetch(`/lookups/${id}`, { method: 'PUT', body: JSON.stringify(toBackend(data)) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  deleteItem: async (id) => {
    try { await apiFetch(`/lookups/${id}`, { method: 'DELETE' }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  pasifYap: async (id) => {
    try { await apiFetch(`/lookups/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  aktifYap: async (id) => {
    try { await apiFetch(`/lookups/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; }
    catch (err: any) { return { success: false, error: err.message }; }
  },
  getItemById: (id) => get().items.find(i => i.id === id),
  getItemsByType: (type) => get().items.filter(i => i.lookupType === type),
  getSortedItemsByType: (type) => get().items.filter(i => i.lookupType === type && i.durum === 'AKTIF')
    .sort((a, b) => { if (a.sira !== undefined && b.sira !== undefined) return a.sira - b.sira; if (a.sira !== undefined) return -1; if (b.sira !== undefined) return 1; return a.ad.localeCompare(b.ad); }),
  checkKodExists: (kod, excludeId) => get().items.some(i => i.kod === kod && i.id !== excludeId),
  checkAdExists: (ad, excludeId) => get().items.some(i => i.ad === ad && i.id !== excludeId),
  seedData: () => { get().fetchAll(); },
}));
