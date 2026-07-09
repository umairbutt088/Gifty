import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

const SLA_HOURS = 4;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const cronSecret = Deno.env.get('CRON_SECRET');

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: 'Missing Supabase env vars.' }, 500);
    }

    if (!cronSecret) {
      return jsonResponse({ error: 'CRON_SECRET is not configured.' }, 500);
    }

    const providedSecret = req.headers.get('x-cron-secret');
    if (providedSecret !== cronSecret) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const cutoff = new Date(Date.now() - SLA_HOURS * 60 * 60 * 1000).toISOString();

    const { data: staleOrders, error: staleError } = await adminClient
      .from('vendor_orders')
      .select('id, vendor_id, buyer_id')
      .eq('status', 'new')
      .is('sla_escalated_at', null)
      .lt('status_changed_at', cutoff);

    if (staleError) {
      return jsonResponse({ error: staleError.message }, 500);
    }

    if (!staleOrders || staleOrders.length === 0) {
      return jsonResponse({ ok: true, escalated: 0 });
    }

    const escalatedAt = new Date().toISOString();
    const ids = staleOrders.map((order) => order.id);

    const { error: updateError } = await adminClient
      .from('vendor_orders')
      .update({ sla_escalated_at: escalatedAt })
      .in('id', ids);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500);
    }

    await adminClient.from('order_status_events').insert(
      staleOrders.map((order) => ({
        order_id: order.id,
        buyer_id: order.buyer_id,
        vendor_id: order.vendor_id,
        from_status: 'new',
        to_status: 'new',
        changed_by: null,
        note: `SLA breached: vendor has not responded within ${SLA_HOURS} hours.`,
      })),
    );

    const pushResults = await Promise.all(
      ids.map((orderId) =>
        fetch(`${supabaseUrl}/functions/v1/send-order-push-notification`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId, event: 'sla_escalated' }),
        }).then((response) => response.ok),
      ),
    );

    return jsonResponse({
      ok: true,
      escalated: ids.length,
      pushed: pushResults.filter(Boolean).length,
    });
  } catch (error) {
    console.error('[escalate-stale-orders]', error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      500,
    );
  }
});
