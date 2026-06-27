import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/theme-context';
import { getContacts, subscribe } from '@/data/contacts';

export default function TabLayout() {
  const [unread, setUnread] = useState(0);
  const colorScheme = useColorScheme();
  const { toggle } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    setUnread(getContacts().filter((c) => !c.read).length);
    return subscribe(() => setUnread(getContacts().filter((c) => !c.read).length));
  }, []);

  return (
    <>
      <ThemedView
        style={[
          styles.header,
          { backgroundColor: colors.background, borderBottomColor: colors.icon + '30' },
        ]}>
        <Image
          source={require('@/assets/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Pressable onPress={toggle} style={[styles.themeToggle, { borderColor: colors.icon + '60' }]}>
          <IconSymbol
            size={22}
            name={colorScheme === 'dark' ? 'sun.max.fill' : 'moon.fill'}
            color={colors.tint}
          />
        </Pressable>
      </ThemedView>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            title: 'Contacts',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            tabBarBadge: unread > 0 ? unread : undefined,
          }}
        />
        <Tabs.Screen
          name="invoices"
          options={{
            title: 'Invoices',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  logo: {
    width: 80,
    height: 50,
  },
  themeToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
