import { fetchContacts as apiFetchContacts, markContactRead as apiMarkRead, type ApiContact } from '@/services/api';

export const SERVICES = [
  'Film & Television',
  'Aerial Media',
  'Live Streaming',
  'Starlink Sales & Support',
  'Website Development',
  'Mobile App Development',
] as const;

export const SERVICE_COLORS: Record<string, string> = {
  'Film & Television': '#e74c3c',
  'Aerial Media': '#3498db',
  'Live Streaming': '#2ecc71',
  'Starlink Sales & Support': '#9b59b6',
  'Website Development': '#f39c12',
  'Mobile App Development': '#1abc9c',
};

export interface Contact {
  id: string;
  name: string;
  email: string;
  service: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
}

let contacts: Contact[] = [];

function toContact(a: ApiContact): Contact {
  return {
    id: String(a.id),
    name: a.name,
    email: a.email,
    service: a.service,
    phone: a.phone,
    message: a.message,
    date: a.created_at,
    read: a.read,
  };
}

export async function fetchAndSetContacts(): Promise<void> {
  const data = await apiFetchContacts();
  contacts = data.map(toContact);
}

export function getContacts(): Contact[] {
  return contacts;
}

export function getContactById(id: string): Contact | undefined {
  return contacts.find((c) => c.id === id);
}

export async function markContactRead(id: string, read: boolean): Promise<void> {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;
  contact.read = read;
  if (read) {
    await apiMarkRead(Number(id)).catch(() => {});
  }
}
