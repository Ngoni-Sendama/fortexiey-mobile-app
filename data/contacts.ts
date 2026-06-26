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

export function markContactRead(id: string, read: boolean) {
  const contact = mockContacts.find((c) => c.id === id);
  if (contact) {
    contact.read = read;
  }
}

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    service: 'Film & Television',
    phone: '+1 234 567 890',
    message: 'Interested in your film production services for a documentary project.',
    date: '2026-06-25 14:30',
    read: false,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    service: 'Aerial Media',
    phone: '+1 345 678 901',
    message: 'Need aerial footage for a real estate marketing campaign.',
    date: '2026-06-24 09:15',
    read: false,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    service: 'Live Streaming',
    phone: '+1 456 789 012',
    message: 'Looking for live streaming setup for our annual conference.',
    date: '2026-06-23 16:45',
    read: true,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    service: 'Starlink Sales & Support',
    phone: '+1 567 890 123',
    message: 'Inquiry about Starlink installation for rural farm.',
    date: '2026-06-22 11:00',
    read: false,
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david@example.com',
    service: 'Website Development',
    phone: '+1 678 901 234',
    message: 'Need a new e-commerce website built for my retail business.',
    date: '2026-06-21 08:30',
    read: true,
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily@example.com',
    service: 'Mobile App Development',
    phone: '+1 789 012 345',
    message: 'Looking to build a cross-platform mobile app for my startup.',
    date: '2026-06-20 13:00',
    read: false,
  },
];
