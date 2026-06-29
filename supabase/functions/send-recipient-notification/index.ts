import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type NotificationEvent = 'shipped' | 'delivered';

type OrderRow = {
  id: string;
  vendor_id: string;
  recipient_name: string;
  recipient_phone: string | null;
  recipient_email: string | null;
  notify_recipient: boolean;
  delivery_token: string;
  status: string;
  recipient_notified_shipped_at: string | null;
  recipient_notified_delivered_at: string | null;
  gift: { title: string } | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildRecipientLink(appUrl: string, token: string) {
  return `${appUrl.replace(/\/$/, '')}/r/${token}`;
}

async function sendTwilioSms(to: string, body: string) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const from = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !from) {
    console.log('[send-recipient-notification] Twilio not configured. SMS skipped:', { to, body });
    return { sent: false, reason: 'twilio_not_configured' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const payload = new URLSearchParams({ To: to, From: from, Body: body });
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio error: ${errorText}`);
  }

  return { sent: true };
}

async function sendResendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Gifty <onboarding@resend.dev>';

  if (!apiKey) {
    console.log('[send-recipient-notification] Resend not configured. Email skipped:', { to, subject });
    return { sent: false, reason: 'resend_not_configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${errorText}`);
  }

  return { sent: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const appUrl = Deno.env.get('RECIPIENT_APP_URL') ?? 'http://localhost:8081';

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse({ error: 'Missing Supabase env vars.' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { orderId, event } = (await req.json()) as {
      orderId?: string;
      event?: NotificationEvent;
    };

    if (!orderId || (event !== 'shipped' && event !== 'delivered')) {
      return jsonResponse({ error: 'Invalid payload.' }, 400);
    }

    const { data: order, error: orderError } = await adminClient
      .from('vendor_orders')
      .select(
        'id, vendor_id, recipient_name, recipient_phone, recipient_email, notify_recipient, delivery_token, status, recipient_notified_shipped_at, recipient_notified_delivered_at, gift:gifts(title)',
      )
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return jsonResponse({ error: 'Order not found.' }, 404);
    }

    const row = order as OrderRow;

    if (row.vendor_id !== user.id) {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }

    if (!row.notify_recipient) {
      return jsonResponse({ skipped: true, reason: 'notify_disabled' });
    }

    if (row.status !== event) {
      return jsonResponse({ skipped: true, reason: 'status_mismatch' });
    }

    if (event === 'shipped' && row.recipient_notified_shipped_at) {
      return jsonResponse({ skipped: true, reason: 'already_notified' });
    }

    if (event === 'delivered' && row.recipient_notified_delivered_at) {
      return jsonResponse({ skipped: true, reason: 'already_notified' });
    }

    const giftTitle = row.gift?.title ?? 'your gift';
    const link = buildRecipientLink(appUrl, row.delivery_token);
    const smsBody =
      event === 'shipped'
        ? `Hi ${row.recipient_name}, your gift "${giftTitle}" is on the way. Track it: ${link}`
        : `Hi ${row.recipient_name}, your gift "${giftTitle}" has been delivered. Confirm receipt: ${link}`;

    const emailSubject =
      event === 'shipped' ? 'Your gift is on the way' : 'Your gift has been delivered';
    const emailHtml = `<p>Hi ${row.recipient_name},</p><p>${
      event === 'shipped'
        ? `Your gift <strong>${giftTitle}</strong> is on the way.`
        : `Your gift <strong>${giftTitle}</strong> has been delivered.`
    }</p><p><a href="${link}">Open your gift delivery page</a></p>`;

    const results: Record<string, unknown> = {};

    if (row.recipient_phone) {
      results.sms = await sendTwilioSms(row.recipient_phone, smsBody);
    }

    if (row.recipient_email) {
      results.email = await sendResendEmail(row.recipient_email, emailSubject, emailHtml);
    }

    const updatePayload =
      event === 'shipped'
        ? { recipient_notified_shipped_at: new Date().toISOString() }
        : { recipient_notified_delivered_at: new Date().toISOString() };

    await adminClient.from('vendor_orders').update(updatePayload).eq('id', orderId);

    return jsonResponse({ ok: true, results });
  } catch (error) {
    console.error('[send-recipient-notification]', error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      500,
    );
  }
});
