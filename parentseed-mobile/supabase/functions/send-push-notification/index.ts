import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // This function is called by pg_cron with the service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get today's date in JST
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const today = jst.toISOString().slice(0, 10);

    // Get all push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token, user_id');

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      return new Response(JSON.stringify({ error: 'Failed to fetch tokens' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get today's entries to skip users who already recorded
    const { data: todayEntries } = await supabase
      .from('entries')
      .select('user_id')
      .eq('date', today);

    const usersWhoRecorded = new Set(todayEntries?.map((e: { user_id: string }) => e.user_id) ?? []);

    // Filter out users who already recorded today
    const tokensToNotify = tokens?.filter(
      (t: { user_id: string }) => !usersWhoRecorded.has(t.user_id)
    ) ?? [];

    if (tokensToNotify.length === 0) {
      return new Response(JSON.stringify({ message: 'No users to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send via Expo Push API
    const messages = tokensToNotify.map((t: { token: string }) => ({
      to: t.token,
      title: 'ParentSeed',
      body: '今日の気持ちを記録しませんか？',
      data: { screen: 'Record' },
      sound: 'default',
    }));

    // Expo Push API supports batches of up to 100
    const batchSize = 100;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });
    }

    return new Response(
      JSON.stringify({ message: `Sent ${tokensToNotify.length} notifications` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return new Response(JSON.stringify({ error: 'Failed to send notifications' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
