// ============================================
// API Helper - Backend ile iletişim
// ============================================
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || `API hatası: ${response.status}`);
  }
  return json.data;
}

export { API_BASE };
