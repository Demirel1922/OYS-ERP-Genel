import { create } from 'zustand';
import type { Renk, RenkFormData } from '@/types';
import { apiFetch } from '@/lib/api';

function toFrontend(row: any): Renk {
  return { id: String(row.id), renkAdi: row.renk_adi || '', durum: row.durum || 'AKTIF', createdAt: row.created_at || '', updatedAt: row.updated_at || '' };
}

interface RenkState {
  renkler: Renk[]; loading: boolean;
  addRenk: (data: RenkFormData) => Promise<{ success: boolean; error?: string }>;
  updateRenk: (id: string, data: Partial<RenkFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteRenk: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  seedData: () => void; fetchAll: () => Promise<void>;
}

export const useRenkStore = create<RenkState>()((set, get) => ({
  renkler: [], loading: false,
  fetchAll: async () => { try { set({ loading: true }); const rows = await apiFetch<any[]>('/colors'); set({ renkler: rows.map(toFrontend), loading: false }); } catch (err) { console.error(err); set({ loading: false }); } },
  addRenk: async (data) => { try { await apiFetch('/colors', { method: 'POST', body: JSON.stringify({ renk_adi: data.renkAdi, durum: data.durum || 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  updateRenk: async (id, data) => { const m: any = {}; if (data.renkAdi !== undefined) m.renk_adi = data.renkAdi; if (data.durum !== undefined) m.durum = data.durum; try { await apiFetch(`/colors/${id}`, { method: 'PUT', body: JSON.stringify(m) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  deleteRenk: async (id) => { try { await apiFetch(`/colors/${id}`, { method: 'DELETE' }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  pasifYap: async (id) => { try { await apiFetch(`/colors/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  aktifYap: async (id) => { try { await apiFetch(`/colors/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  seedData: () => { get().fetchAll(); },
}));
