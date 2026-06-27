import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getContactById, markContactRead, SERVICE_COLORS } from '@/data/contacts';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refresh, setRefresh] = useState(0);
  const contact = getContactById(id);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!contact) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Contact not found.</ThemedText>
      </ThemedView>
    );
  }

  const toggleRead = async () => {
    const wasRead = contact.read;
    await markContactRead(contact.id, !contact.read);
    setRefresh((k) => k + 1);
    Alert.alert('Success', wasRead ? 'Marked as unread' : 'Marked as read');
  };

  const d = new Date(contact.date);
  const formattedDate = d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {contact.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </ThemedText>
        </ThemedView>
        <ThemedText type="title" style={styles.name}>
          {contact.name}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <FieldRow label="Date" value={formattedDate} />
        <FieldRow label="Email" value={contact.email} />
        <FieldRow label="Phone" value={contact.phone} />
        <FieldRow label="Service" value={contact.service} />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Message
        </ThemedText>
        <ThemedText style={styles.message}>{contact.message}</ThemedText>
      </ThemedView>

      <Pressable
        onPress={toggleRead}
        style={[styles.markButton, { backgroundColor: colors.tint }]}>
        <ThemedText style={[styles.markButtonText, { color: colors.background }]}>
          {contact.read ? 'Mark as Unread' : 'Mark as Read'}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView style={styles.fieldRow}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.fieldValue}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    padding: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    padding: 4,
  },
  name: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  fieldLabel: {
    opacity: 0.6,
    fontSize: 14,
  },
  fieldValue: {
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
  message: {
    lineHeight: 22,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  markButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  markButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
