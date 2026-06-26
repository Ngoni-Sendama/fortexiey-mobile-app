import { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mockContacts, SERVICE_COLORS, type Contact } from '@/data/contacts';

type Filter = 'all' | 'unread' | 'read';

const FILTERS: { key: Filter; label: string; getLabel?: (count: number) => string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread', getLabel: (count) => `Unread (${count})` },
  { key: 'read', label: 'Read' },
];

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
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

function extractDate(datetime: string): string {
  return datetime.split(' ')[0];
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
        styles.card,
        { backgroundColor: colors.background, borderColor: colors.icon + '40' },
        pressed && { opacity: 0.7 },
      ]}>
      <ThemedView style={styles.avatar}>
        <ThemedText type="subtitle" style={styles.avatarText}>
          {contact.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.cardBody}>
        <ThemedView style={styles.topRow}>
          <ThemedText
            type="defaultSemiBold"
            style={styles.name}
            numberOfLines={1}>
            {contact.name}
          </ThemedText>
          <ThemedView style={styles.dateColumn}>
            <ThemedText style={styles.date}>{contact.date}</ThemedText>
            {!contact.read && <ThemedView style={styles.unreadDot} />}
          </ThemedView>
        </ThemedView>
        <ThemedText style={styles.email} numberOfLines={1}>
          {contact.email}
        </ThemedText>
        <ThemedView style={styles.bottomRow}>
          <ThemedView style={[styles.serviceBadge, { backgroundColor: SERVICE_COLORS[contact.service] }]}>
            <ThemedText style={styles.serviceText}>{contact.service}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <IconSymbol name="chevron.right" size={20} color={colors.icon} />
    </Pressable>
  );
}

export default function ContactListScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, [])
  );

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? [...mockContacts]
        : mockContacts.filter((c) => (filter === 'read' ? c.read : !c.read)),
    [filter, refreshKey]
  );

  const unreadCount = useMemo(() => mockContacts.filter((c) => !c.read).length, [refreshKey]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Contacts</ThemedText>
        <ThemedText style={styles.subtitle}>
          {filtered.length} contact{filtered.length !== 1 ? 's' : ''}
        </ThemedText>
      </ThemedView>

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
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    paddingVertical: 12,
    paddingTop: 20,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
  },
  avatarText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'normal',
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 15,
    marginRight: 8,
  },
  dateColumn: {
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    opacity: 0.4,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0a7ea4',
    marginTop: 3,
  },
  email: {
    fontSize: 13,
    opacity: 0.6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  serviceBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  serviceText: {
    color: '#fff',
    fontSize: 11,
  },
});
