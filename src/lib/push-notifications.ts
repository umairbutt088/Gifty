import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { VendorOrderStatus } from '@/types/vendor';

type OrderPushEvent = 'new_order' | 'status_change' | 'buyer_cancelled';

function getEasProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

export function configurePushNotifications(): void {
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
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
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

  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: userId, expo_push_token: token, platform: Platform.OS },
      { onConflict: 'expo_push_token' },
    );

  if (error) {
    console.warn('[push] failed to store push token:', error.message);
    return false;
  }

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
