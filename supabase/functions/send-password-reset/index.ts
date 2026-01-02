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
    const { email } = await req.json();

    console.log('Received password reset request for:', email);

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

    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('Error fetching users:', userError);
      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const user = userData.users.find(u => u.email === email);

    if (!user) {
      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const resetToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        reset_token: resetToken,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error inserting reset token:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create reset token' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const appUrl = Deno.env.get('APP_URL') || Deno.env.get('EXPO_PUBLIC_APP_URL') || 'http://localhost:8081';
    const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`;

    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563EB; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested to reset your password for your Bible in a Year account.</p>
              <p>Please click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p style="font-size: 12px; color: #666;">Or copy this link: ${resetUrl}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you did not request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Bible in a Year - Your daily journey through Scripture</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (resendApiKey) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Bible in a Year <info@youthbibleinayear.com>',
            to: [email],
            subject: 'Reset Your Password - Bible in a Year',
            html: emailHtml,
          }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
          console.error('Resend API error:', resendData);
          throw new Error('Failed to send email via Resend');
        }

        console.log('Email sent successfully via Resend:', resendData);

        return new Response(
          JSON.stringify({
            success: true,
            resetUrl,
            emailSent: true
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (emailError) {
        console.error('Failed to send via Resend:', emailError);
      }
    }

    console.log('No RESEND_API_KEY configured. Email not sent.');
    console.log('Reset URL:', resetUrl);
    console.log('Email would be sent to:', email);

    return new Response(
      JSON.stringify({
        success: true,
        resetUrl,
        emailSent: false,
        note: 'Configure RESEND_API_KEY environment variable to enable email sending'
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error in send-password-reset:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
