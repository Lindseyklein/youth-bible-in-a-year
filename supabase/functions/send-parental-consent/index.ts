import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { parentEmail, userEmail, displayName, consentToken } = await req.json();

    console.log('Received parental consent email request for:', parentEmail);

    const consentUrl = `https://youthbibleinayear.com/parental-consent?token=${consentToken}`;

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
              <h1>Parental Consent Required</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your child, <strong>${displayName}</strong> (${userEmail}), has created an account on Bible in a Year.</p>
              <p>As a parent or guardian, your consent is required for users under 18 years old to use our app.</p>
              <p><strong>What we collect:</strong></p>
              <ul>
                <li>Email address and display name</li>
                <li>Bible reading progress</li>
                <li>Group participation (if they join a group)</li>
              </ul>
              <p><strong>Your rights:</strong></p>
              <ul>
                <li>Request to view your child's data</li>
                <li>Request data deletion</li>
                <li>Revoke consent at any time</li>
              </ul>
              <p>Please click the button below to review and provide your consent:</p>
              <a href="${consentUrl}" class="button">Review and Give Consent</a>
              <p style="font-size: 12px; color: #666;">Or copy this link: ${consentUrl}</p>
              <p>This link will expire in 30 days.</p>
            </div>
            <div class="footer">
              <p>Bible in a Year - Helping youth grow in faith</p>
              <p>If you did not expect this email, please ignore it.</p>
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
            to: [parentEmail],
            subject: 'Parental Consent Required for Bible in a Year',
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
            message: 'Parental consent email sent',
            consentUrl,
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
    console.log('Consent URL:', consentUrl);
    console.log('Parent email would be sent to:', parentEmail);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Parental consent email prepared (not sent - no email service configured)',
        consentUrl,
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
    console.error('Error in send-parental-consent:', error);
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