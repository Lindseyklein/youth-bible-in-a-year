import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { token, approved } = await req.json();

    if (!token || typeof approved !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Fetch the consent record
    const { data: consentData, error: fetchError } = await supabase
      .from('parental_consents')
      .select('*')
      .eq('consent_token', token)
      .maybeSingle();

    if (fetchError || !consentData) {
      return new Response(
        JSON.stringify({ error: 'Consent request not found' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (consentData.consent_status !== 'pending') {
      return new Response(
        JSON.stringify({ error: `Consent has already been ${consentData.consent_status}` }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const expiresAt = new Date(consentData.expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Consent link has expired' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update the consent status
    const { error: updateError } = await supabase
      .from('parental_consents')
      .update({
        consent_status: approved ? 'approved' : 'denied',
        consent_given_at: new Date().toISOString(),
      })
      .eq('consent_token', token);

    if (updateError) {
      console.error('Error updating consent:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update consent status' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // If approved, update the profile
    if (approved) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          parental_consent_obtained: true,
        })
        .eq('id', consentData.user_id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return new Response(
          JSON.stringify({ error: 'Failed to update profile' }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: approved ? 'approved' : 'denied',
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error in confirm-parental-consent:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});