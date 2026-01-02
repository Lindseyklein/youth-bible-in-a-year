import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PolarWebhookEvent {
  type: string;
  data: {
    id: string;
    customer_email: string;
    status: string;
    started_at?: string;
    ends_at?: string;
    customer_id?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const webhookEvent: PolarWebhookEvent = await req.json();
    const { type, data } = webhookEvent;

    console.log('Received Polar webhook:', { type, customerEmail: data.customer_email });

    const customerEmail = data.customer_email;
    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Customer email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('Profile not found for email:', customerEmail);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let subscriptionStatus = 'none';
    let subscriptionStartedAt = null;
    let subscriptionEndsAt = null;
    let polarCustomerId = data.customer_id || null;

    switch (type) {
      case 'subscription.created':
      case 'subscription.active':
        subscriptionStatus = data.status === 'trialing' ? 'trial' : 'active';
        subscriptionStartedAt = data.started_at || new Date().toISOString();
        subscriptionEndsAt = data.ends_at || null;
        break;

      case 'subscription.cancelled':
      case 'subscription.revoked':
        subscriptionStatus = 'cancelled';
        subscriptionEndsAt = data.ends_at || null;
        break;

      case 'subscription.updated':
        if (data.status === 'active') {
          subscriptionStatus = 'active';
        } else if (data.status === 'trialing') {
          subscriptionStatus = 'trial';
        } else if (data.status === 'past_due') {
          subscriptionStatus = 'expired';
        } else if (data.status === 'canceled') {
          subscriptionStatus = 'cancelled';
        }
        subscriptionStartedAt = data.started_at || null;
        subscriptionEndsAt = data.ends_at || null;
        break;

      default:
        console.log('Unhandled webhook type:', type);
        return new Response(
          JSON.stringify({ message: 'Webhook received but not processed' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    const updateData: any = {
      subscription_status: subscriptionStatus,
      subscription_ends_at: subscriptionEndsAt,
    };

    if (subscriptionStartedAt) {
      updateData.subscription_started_at = subscriptionStartedAt;
    }

    if (polarCustomerId) {
      updateData.polar_customer_id = polarCustomerId;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update subscription status' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Successfully updated subscription for user:', profile.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription updated successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});