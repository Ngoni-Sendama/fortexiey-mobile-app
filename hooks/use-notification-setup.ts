import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { fetchAndSetContacts } from '@/data/contacts';
import { registerPushToken } from '@/services/api';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function redirect(notification: Notifications.Notification) {
  const data = notification.request.content.data;
  if (data?.type === 'new_contact' && typeof data.contactId === 'string') {
    router.navigate({
      pathname: '/contacts/[id]',
      params: { id: data.contactId },
    });
  }
}

export function useNotificationSetup() {
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotifications();

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) {
      redirect(lastResponse.notification);
    }

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      }
    );

    notificationListener.current = Notifications.addNotificationReceivedListener(
      () => {
        fetchAndSetContacts();
      }
    );

    return () => {
      responseListener.current?.remove();
      notificationListener.current?.remove();
    };
  }, []);
}

async function registerForPushNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      console.log('[Push] No projectId found — push token registration skipped');
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('[Push] Got Expo token:', token);
    await registerPushToken(token, Platform.OS);
    console.log('[Push] Token registered successfully');
  } catch (e) {
    console.log('Failed to get push token:', e);
  }
}
