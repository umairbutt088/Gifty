import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { VendorOrderStatus } from '@/types/vendor';

type NotificationsModule = typeof import('expo-notifications');
type OrderPushEvent = 'new_order' | 'status_change' | 'buyer_cancelled';

let notificationsModule: NotificationsModule | null | undefined;

function getNotifications(): NotificationsModule | null {
  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  try {
    // Lazy load so a missing native module does not crash app startup.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notificationsModule = require('expo-notifications') as NotificationsModule;
  } catch (error) {
    console.warn(
      '[push] expo-notifications is unavailable on this install. Rebuild the native app with `npx expo run:ios` or `npx expo run:android`.',
      error,
    );
    notificationsModule = null;
  }

  return notificationsModule;
}

function getEasProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

export function configurePushNotifications(): void {
  const Notifications = getNotifications();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const Notifications = getNotifications();
  if (!Notifications || Platform.OS === 'web') {
    return null;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[push] permission not granted:', finalStatus);
      return null;
    }

    const projectId = getEasProjectId();

    if (!projectId) {
      console.warn('[push] missing EAS projectId in app config');
      return null;
    }

    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenResult.data;
  } catch (error) {
    console.warn('[push] registerForPushNotificationsAsync failed:', error);
    return null;
  }
}

export async function syncPushToken(userId: string): Promise<boolean> {
  const token = await registerForPushNotificationsAsync();
  if (!token) return false;

  const { error: rpcError } = await supabase.rpc('upsert_push_token', {
    p_expo_push_token: token,
    p_platform: Platform.OS,
  });

  if (!rpcError) {
    console.log('[push] token synced for user', userId.slice(0, 8), Platform.OS);
    return true;
  }

  console.warn('[push] upsert_push_token rpc failed, falling back to upsert:', rpcError.message);

  // Claim existing device token then insert (works around older RLS on conflict).
  await supabase.from('push_tokens').delete().eq('expo_push_token', token);

  const { error } = await supabase.from('push_tokens').insert({
    user_id: userId,
    expo_push_token: token,
    platform: Platform.OS,
  });

  if (error) {
    console.warn('[push] failed to store push token:', error.message);
    return false;
  }

  console.log('[push] token synced for user', userId.slice(0, 8), Platform.OS);
  return true;
}

async function invokeOrderPushNotification(
  payload: { orderId: string; event: OrderPushEvent; status?: VendorOrderStatus },
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('send-order-push-notification', {
    body: payload,
  });

  if (error) {
    console.warn('[push] send-order-push-notification failed:', error.message);
    return;
  }

  if (data && typeof data === 'object') {
    if ('error' in data && data.error) {
      console.warn('[push] send-order-push-notification error:', data.error);
      return;
    }

    if ('skipped' in data && data.skipped) {
      console.warn('[push] notification skipped:', 'reason' in data ? data.reason : 'unknown');
      return;
    }

    if ('ok' in data && data.ok) {
      console.log('[push] notification sent:', payload.event, payload.orderId);
    }
  }
}

export async function notifyVendorOfNewOrder(orderId: string): Promise<void> {
  await invokeOrderPushNotification({ orderId, event: 'new_order' });
}

export async function notifyBuyerOfOrderStatusChange(
  orderId: string,
  status: VendorOrderStatus,
): Promise<void> {
  await invokeOrderPushNotification({ orderId, event: 'status_change', status });
}

export async function notifyVendorOfBuyerCancellation(orderId: string): Promise<void> {
  await invokeOrderPushNotification({ orderId, event: 'buyer_cancelled' });
}
