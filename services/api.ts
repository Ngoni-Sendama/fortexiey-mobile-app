const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://forty.test/api';

console.log('[API] Using base URL:', API_URL);

export interface ApiContact {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data: ApiContact[];
}

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_URL}${path}`;
  console.log('[API]', options?.method ?? 'GET', url);
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.log('[API] Error response:', res.status, text);
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return res;
  } catch (e) {
    console.log('[API] Network error:', e);
    throw e;
  }
}

export async function fetchContacts(): Promise<ApiContact[]> {
  const res = await apiFetch('/contacts');
  const json: ApiResponse = await res.json();
  return json.data;
}

export async function markContactRead(id: number): Promise<void> {
  await apiFetch(`/contacts/${id}/read`, { method: 'PATCH' });
}

export async function registerPushToken(token: string, device?: string): Promise<void> {
  await apiFetch('/push-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, device }),
  });
}
