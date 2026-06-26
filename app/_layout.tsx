import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider as AppThemeProvider, useTheme } from '@/hooks/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotificationSetup } from '@/hooks/use-notification-setup';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  useNotificationSetup();

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const systemScheme = useSystemColorScheme() ?? 'light';

  return (
    <AppThemeProvider systemScheme={systemScheme}>
      <RootLayoutInner />
    </AppThemeProvider>
  );
}
