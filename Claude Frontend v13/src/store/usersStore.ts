import { create } from 'zustand';
import type { User } from '@/types';
import { apiFetch } from '@/lib/api';

export interface UserWithModules extends User {
  password?: string;
}

interface UsersState {
  users: UserWithModules[];
  addUser: (user: Omit<UserWithModules, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<UserWithModules>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useUsersStore = create<UsersState>()((set, get) => ({
  users: [],
  fetchAll: async () => {
    try {
      const rows = await apiFetch<any[]>('/users');
      set({
        users: rows.map((r: any) => ({
          id: String(r.id),
          username: r.username || '',
          fullName: r.full_name || '',
          email: r.email || '',
          isAdmin: !!r.is_admin,
          modules: JSON.parse(r.modules || '[]'),
          password: r.password_hash,
        }))
      });
    } catch (err) { console.error(err); }
  },
  addUser: async (userData) => {
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          username: userData.username,
          password_hash: userData.password || 'password123',
          full_name: userData.fullName,
          email: userData.email || '',
          is_admin: userData.isAdmin ? 1 : 0,
          modules: JSON.stringify(userData.modules || []),
        }),
      });
      await get().fetchAll();
    } catch (err) { console.error(err); }
  },
  updateUser: async (id, updates) => {
    const m: any = {};
    if (updates.username !== undefined) m.username = updates.username;
    if (updates.fullName !== undefined) m.full_name = updates.fullName;
    if (updates.email !== undefined) m.email = updates.email;
    if (updates.isAdmin !== undefined) m.is_admin = updates.isAdmin ? 1 : 0;
    if (updates.modules !== undefined) m.modules = JSON.stringify(updates.modules);
    if (updates.password !== undefined) m.password_hash = updates.password;
    try {
      await apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(m) });
      await get().fetchAll();
    } catch (err) { console.error(err); }
  },
  deleteUser: async (id) => {
    try { await apiFetch(`/users/${id}`, { method: 'DELETE' }); await get().fetchAll(); } catch (err) { console.error(err); }
  },
}));
