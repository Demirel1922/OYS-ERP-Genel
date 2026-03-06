import { create } from 'zustand';
import type { Kalinlik, KalinlikFormData } from '@/types';
import { apiFetch } from '@/lib/api';

function toFrontend(row: any): Kalinlik {
  return { id: String(row.id), birim: row.birim || 'Ne', deger: row.deger || '', ozellik: row.ozellik || '', durum: row.durum || 'AKTIF', createdAt: row.created_at || '', updatedAt: row.updated_at || '' };
}

interface KalinlikState {
  kalinliklar: Kalinlik[]; loading: boolean;
  addKalinlik: (data: KalinlikFormData) => Promise<{ success: boolean; error?: string }>;
  updateKalinlik: (id: string, data: Partial<KalinlikFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteKalinlik: (id: string) => Promise<{ success: boolean; error?: string }>;
  pasifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  aktifYap: (id: string) => Promise<{ success: boolean; error?: string }>;
  seedData: () => void; fetchAll: () => Promise<void>;
}

export const useKalinlikStore = create<KalinlikState>()((set, get) => ({
  kalinliklar: [], loading: false,
  fetchAll: async () => { try { set({ loading: true }); const rows = await apiFetch<any[]>('/thicknesses'); set({ kalinliklar: rows.map(toFrontend), loading: false }); } catch (err) { console.error(err); set({ loading: false }); } },
  addKalinlik: async (data) => { try { await apiFetch('/thicknesses', { method: 'POST', body: JSON.stringify({ birim: data.birim, deger: data.deger, ozellik: data.ozellik, durum: data.durum || 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  updateKalinlik: async (id, data) => { const m: any = {}; if (data.birim !== undefined) m.birim = data.birim; if (data.deger !== undefined) m.deger = data.deger; if (data.ozellik !== undefined) m.ozellik = data.ozellik; if (data.durum !== undefined) m.durum = data.durum; try { await apiFetch(`/thicknesses/${id}`, { method: 'PUT', body: JSON.stringify(m) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  deleteKalinlik: async (id) => { try { await apiFetch(`/thicknesses/${id}`, { method: 'DELETE' }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  pasifYap: async (id) => { try { await apiFetch(`/thicknesses/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'PASIF' }) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  aktifYap: async (id) => { try { await apiFetch(`/thicknesses/${id}/durum`, { method: 'PATCH', body: JSON.stringify({ durum: 'AKTIF' }) }); await get().fetchAll(); return { success: true }; } catch (err: any) { return { success: false, error: err.message }; } },
  seedData: () => { get().fetchAll(); },
}));
