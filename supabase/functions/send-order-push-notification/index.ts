import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type NotificationEvent = 'new_order' | 'status_change' | 'sla_escalated' | 'buyer_cancelled';

type OrderRow = {
  id: string;
  vendor_id: string;
  buyer_id: string | null;
  status: string;
  gift: { title: string } | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function titleAndBodyFor(event: NotificationEvent, giftTitle: string, status?: string) {
  if (event === 'new_order') {
    return { title: 'New order', body: `You have a new order for "${giftTitle}".` };
  }

  if (event === 'sla_escalated') {
    return {
      title: 'Order needs attention',
      body: `An order for "${giftTitle}" hasn't been accepted or rejected yet.`,
    };
  }

  if (event === 'buyer_cancelled') {
    return {
      title: 'Order cancelled',
      body: `A buyer cancelled their order for "${giftTitle}".`,
    };
  }

  return {
    title: 'Order update',
    body: status ? `Your order for "${giftTitle}" is now ${status}.` : `Your order for "${giftTitle}" was updated.`,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse({ error: 'Missing Supabase env vars.' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { orderId, event, status } = (await req.json()) as {
      orderId?: string;
      event?: NotificationEvent;
      status?: string;
    };

    if (!orderId || (event !== 'new_order' && event !== 'status_change' && event !== 'sla_escalated' && event !== 'buyer_cancelled')) {
      return jsonResponse({ error: 'Invalid payload.' }, 400);
    }

    const isServiceRoleCall = authHeader === `Bearer ${serviceRoleKey}`;

    if (event === 'sla_escalated' && !isServiceRoleCall) {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }

    if (event !== 'sla_escalated' && !isServiceRoleCall) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const {
        data: { user },
        error: userError,
      } = await userClient.auth.getUser();

      if (userError || !user) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      const { data: order, error: orderError } = await adminClient
        .from('vendor_orders')
        .select('id, vendor_id, buyer_id, status, gift:gifts(title)')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError || !order) {
        return jsonResponse({ error: 'Order not found.' }, 404);
      }

      const row = order as OrderRow;

      if (event === 'new_order' && row.buyer_id !== user.id) {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }

      if (event === 'buyer_cancelled' && row.buyer_id !== user.id) {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }

      if (event === 'status_change' && row.vendor_id !== user.id) {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }
    }

    const { data: order, error: orderError } = await adminClient
      .from('vendor_orders')
      .select('id, vendor_id, buyer_id, status, gift:gifts(title)')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return jsonResponse({ error: 'Order not found.' }, 404);
    }

    const row = order as OrderRow;
    const recipientUserId =
      event === 'status_change' ? row.buyer_id : row.vendor_id;

    if (!recipientUserId) {
      return jsonResponse({ skipped: true, reason: 'no_recipient' });
    }

    const { data: tokens, error: tokensError } = await adminClient
      .from('push_tokens')
      .select('expo_push_token')
      .eq('user_id', recipientUserId);

    if (tokensError) {
      return jsonResponse({ error: tokensError.message }, 500);
    }

    if (!tokens || tokens.length === 0) {
      return jsonResponse({ skipped: true, reason: 'no_push_tokens' });
    }

    const giftTitle = row.gift?.title ?? 'a gift';
    const { title, body } = titleAndBodyFor(event, giftTitle, status ?? row.status);

    const messages = tokens.map((row) => ({
      to: row.expo_push_token,
      sound: 'default',
      title,
      body,
      data: { orderId },
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return jsonResponse({ error: `Expo push error: ${errorText}` }, 502);
    }

    return jsonResponse({ ok: true, sent: messages.length });
  } catch (error) {
    console.error('[send-order-push-notification]', error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      500,
    );
  }
});
