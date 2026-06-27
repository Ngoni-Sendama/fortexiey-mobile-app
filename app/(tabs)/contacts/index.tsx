import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getContacts, fetchAndSetContacts, subscribe, SERVICE_COLORS, type Contact } from '@/data/contacts';

type Filter = 'all' | 'unread' | 'read';

const FILTERS: { key: Filter; label: string; getLabel?: (count: number) => string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread', getLabel: (count) => `Unread (${count})` },
  { key: 'read', label: 'Read' },
];

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return 'Today';
  }
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function extractDate(iso: string): string {
  return iso.split('T')[0];
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function groupByDate(contacts: Contact[]) {
  const groups: Record<string, Contact[]> = {};
  for (const c of contacts) {
    const key = extractDate(c.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }
  return Object.entries(groups).map(([date, data]) => ({
    title: date,
    data,
  }));
}

function ContactCard({ contact }: { contact: Contact }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      onPress={() =>
        router.navigate({ pathname: '/contacts/[id]', params: { id: contact.id } })
      }
      style={({ pressed }) => [
        { backgroundColor: pressed ? colors.icon + '20' : 'transparent' },
      ]}>
      <ThemedView style={styles.row}>
        <ThemedView style={styles.rowBody}>
          <ThemedView style={styles.topRow}>
            <ThemedView style={styles.nameRow}>
              {!contact.read && <ThemedView style={styles.unreadDot} />}
              <ThemedText
                style={[styles.name, !contact.read && styles.nameUnread]}
                numberOfLines={1}>
                {contact.name}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.rightColumn}>
              <ThemedText style={styles.date}>{formatTime(contact.date)}</ThemedText>
              <ThemedView style={[styles.serviceBadge, { backgroundColor: SERVICE_COLORS[contact.service] }]}>
                <ThemedText style={styles.serviceText}>{contact.service}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
          <ThemedText style={styles.email} numberOfLines={1} ellipsizeMode="tail">
            {contact.email}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

export default function ContactListScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const loadContacts = useCallback(async () => {
    try {
      setError(null);
      await fetchAndSetContacts();
      setContacts(getContacts());
    } catch (e) {
      console.log('[Contacts] Fetch error:', e);
      setError(`Failed to load contacts: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts])
  );

  useEffect(() => {
    return subscribe(() => setContacts(getContacts()));
  }, []);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? [...contacts]
        : contacts.filter((c) => (filter === 'read' ? c.read : !c.read)),
    [filter, contacts, refreshKey]
  );

  const unreadCount = useMemo(() => contacts.filter((c) => !c.read).length, [contacts]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Contacts</ThemedText>
        {!loading && (
          <ThemedText style={styles.subtitle}>
            {filtered.length} contact{filtered.length !== 1 ? 's' : ''}
          </ThemedText>
        )}
      </ThemedView>

      {!loading && (
        <ThemedView style={styles.filterRow}>
          {FILTERS.map((f) => {
            const label = f.getLabel ? f.getLabel(unreadCount) : f.label;
            return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterChip,
                { borderColor: colors.icon + '60' },
                filter === f.key && { backgroundColor: colors.tint, borderColor: colors.tint },
              ]}>
              <ThemedText
                style={[
                  styles.filterLabel,
                  filter === f.key && { color: colors.background },
                ]}>
                {label}
              </ThemedText>
            </Pressable>
          );
          })}
        </ThemedView>
      )}

      {loading && (
        <ThemedView style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      )}

      {error && !loading && (
        <ThemedView style={styles.center}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Pressable onPress={loadContacts} style={[styles.retryButton, { backgroundColor: colors.tint }]}>
            <ThemedText style={[styles.retryText, { color: colors.background }]}>Retry</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      {!loading && !error && (
        <SectionList
          key={refreshKey}
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContactCard contact={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <ThemedView style={styles.sectionHeader}>
              <ThemedText style={styles.sectionHeaderText}>
                {formatDateLabel(title)}
              </ThemedText>
            </ThemedView>
          )}
          ItemSeparatorComponent={() => (
            <ThemedView style={[styles.separator, { borderBottomColor: colors.icon + '20' }]} />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 125,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  subtitle: {
    opacity: 0.6,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    opacity: 0.6,
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingTop: 16,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  rowBody: {
    flex: 1,
    gap: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
  },
  nameUnread: {
    fontWeight: '700',
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  date: {
    fontSize: 13,
    opacity: 0.4,
  },
  serviceBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  serviceText: {
    color: '#fff',
    fontSize: 9,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a7ea4',
    marginRight: 8,
  },
  email: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: -18,
  },
  separator: {
    marginLeft: 20,
    borderBottomWidth: 0.5,
  },
});
