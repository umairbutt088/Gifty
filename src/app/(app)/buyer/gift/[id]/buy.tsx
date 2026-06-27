import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { ScreenShell } from '@/components/dashboard';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { fetchLiveGiftById } from '@/lib/gifts';
import { useCart } from '@/providers/cart-provider';

export default function LegacyBuyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addGift } = useCart();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) {
      setReady(true);
      return;
    }

    fetchLiveGiftById(id).then((gift) => {
      if (gift) {
        addGift(gift, 1);
      }
      setReady(true);
    });
  }, [id, addGift]);

  if (!ready) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  return <Redirect href="/buyer/checkout" />;
}
