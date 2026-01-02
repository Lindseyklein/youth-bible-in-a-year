import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InviteRequest {
  method: 'email' | 'phone';
  to: string;
  inviterName?: string;
}

interface TwilioErrorResponse {
  code?: number;
  message?: string;
  more_info?: string;
  status?: number;
}

// Normalize and validate phone number to E.164 format
function normalizePhoneNumber(phoneNumber: string): { phone: string; valid: boolean; error?: string } {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return { phone: '', valid: false, error: 'Phone number cannot be empty' };
  }

  // Remove all non-digit characters except leading +
  let cleaned = phoneNumber.trim();
  const hasPlus = cleaned.startsWith('+');
  cleaned = cleaned.replace(/\D/g, '');

  // If no digits remain, invalid
  if (cleaned.length === 0) {
    return { phone: '', valid: false, error: 'Phone number must contain digits' };
  }

  // If already has country code (11+ digits starting with 1, or starts with +)
  if (hasPlus || cleaned.length === 11 && cleaned.startsWith('1')) {
    // Remove leading 1 if present without +
    if (!hasPlus && cleaned.startsWith('1')) {
      cleaned = cleaned.substring(1);
    }
    const normalized = `+${cleaned}`;

    // Validate E.164 format
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (!e164Regex.test(normalized)) {
      return { phone: '', valid: false, error: 'Invalid phone number format' };
    }

    return { phone: normalized, valid: true };
  }

  // Assume US number if 10 digits
  if (cleaned.length === 10) {
    const normalized = `+1${cleaned}`;
    return { phone: normalized, valid: true };
  }

  // If not 10 or 11 digits, likely invalid
  return {
    phone: '',
    valid: false,
    error: `Invalid phone number. Please enter a 10-digit US number (e.g., 2025551234) or use international format with country code (e.g., +442071234567)`
  };
}

// Validate email format
function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email address cannot be empty' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address format' };
  }

  return { valid: true };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body. Expected JSON.'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { method, to, inviterName = 'Your friend' }: InviteRequest = body;

    // Validate method
    if (!method || (method !== 'email' && method !== 'phone')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid method. Must be \"email\" or \"phone\"'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const message = `Hey! ${inviterName} just invited you to join a Bible-in-a-Year group on the Youth Bible In A Year app. Join the journey to grow in faith together this year!\n\nDownload: https://yourbibleinayear.app`;

    // ============================================
    // EMAIL HANDLING
    // ============================================
    if (method === 'email') {
      // Validate email format
      const emailValidation = validateEmail(to);
      if (!emailValidation.valid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: emailValidation.error
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Check for Resend API key
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      if (!RESEND_API_KEY) {
        console.error('Missing environment variable: RESEND_API_KEY');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Email service not configured. Missing RESEND_API_KEY environment variable.'
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Youth Bible In A Year <info@youthbibleinayear.com>',
            to: [to],
            subject: `${inviterName} invited you to Bible In A Year!`,
            text: message,
            html: `
              <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
                <h2 style=\"color: #2563EB;\">You're Invited!</h2>
                <p style=\"font-size: 16px; line-height: 1.6; color: #333;\">${message.replace(/\n/g, '<br>')}</p>
                <a href=\"https://yourbibleinayear.app\" style=\"display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;\">Download App</a>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error('Resend API Error:', errorData);
          return new Response(
            JSON.stringify({
              success: false,
              error: `Email delivery failed: ${errorData.message || 'Unknown error'}`
            }),
            {
              status: emailResponse.status,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }

        const responseData = await emailResponse.json();
        console.log('Email sent successfully:', responseData);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email sent successfully',
            data: responseData
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return new Response(
          JSON.stringify({
            success: false,
            error: emailError instanceof Error ? emailError.message : 'Failed to send email'
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // ============================================
    // SMS/PHONE HANDLING WITH TWILIO
    // ============================================
    if (method === 'phone') {
      // Normalize and validate phone number
      const phoneValidation = normalizePhoneNumber(to);
      if (!phoneValidation.valid) {
        console.error('Phone validation failed:', phoneValidation.error);
        return new Response(
          JSON.stringify({
            success: false,
            error: phoneValidation.error
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Use normalized phone number
      const normalizedPhone = phoneValidation.phone;

      // Check for all required Twilio environment variables
      const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
      const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
      const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

      const missingVars: string[] = [];
      if (!TWILIO_ACCOUNT_SID) missingVars.push('TWILIO_ACCOUNT_SID');
      if (!TWILIO_AUTH_TOKEN) missingVars.push('TWILIO_AUTH_TOKEN');
      if (!TWILIO_PHONE_NUMBER) missingVars.push('TWILIO_PHONE_NUMBER');

      if (missingVars.length > 0) {
        const errorMsg = `SMS service not configured. Missing environment variables: ${missingVars.join(', ')}`;
        console.error(errorMsg);
        return new Response(
          JSON.stringify({
            success: false,
            error: errorMsg
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Validate Twilio phone number format
      const twilioPhoneValidation = normalizePhoneNumber(TWILIO_PHONE_NUMBER!);
      if (!twilioPhoneValidation.valid) {
        console.error('Twilio phone number invalid:', twilioPhoneValidation.error);
        return new Response(
          JSON.stringify({
            success: false,
            error: `TWILIO_PHONE_NUMBER is not in valid E.164 format: ${twilioPhoneValidation.error}`
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

        const formData = new URLSearchParams();
        formData.append('To', normalizedPhone);
        formData.append('From', twilioPhoneValidation.phone);
        formData.append('Body', message);

        console.log(`Sending SMS to ${normalizedPhone} from ${twilioPhoneValidation.phone}`);

        const smsResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const responseData = await smsResponse.json();

        if (!smsResponse.ok) {
          const twilioError = responseData as TwilioErrorResponse;

          // Log detailed Twilio error information
          console.error('Twilio API Error:', {
            status: smsResponse.status,
            code: twilioError.code,
            message: twilioError.message,
            moreInfo: twilioError.more_info,
            to: normalizedPhone,
            from: twilioPhoneValidation.phone,
          });

          // Provide user-friendly error messages based on common Twilio error codes
          let userMessage = twilioError.message || 'Failed to send SMS';

          if (twilioError.code === 21211) {
            userMessage = 'Invalid phone number. Please check the number and try again.';
          } else if (twilioError.code === 21608) {
            userMessage = 'The phone number is not verified. For trial accounts, you must verify the recipient number in your Twilio console.';
          } else if (twilioError.code === 21614) {
            userMessage = 'Invalid Twilio phone number. Please check your TWILIO_PHONE_NUMBER configuration.';
          } else if (twilioError.code === 20003) {
            userMessage = 'Authentication failed. Please check your Twilio credentials.';
          } else if (twilioError.code === 21606) {
            userMessage = 'SMS cannot be sent from this phone number type. Please use a valid SMS-enabled number.';
          }

          return new Response(
            JSON.stringify({
              success: false,
              error: userMessage,
              twilioCode: twilioError.code,
              details: twilioError.message
            }),
            {
              status: smsResponse.status,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }

        console.log('SMS sent successfully:', {
          sid: responseData.sid,
          status: responseData.status,
          to: normalizedPhone,
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'SMS sent successfully',
            data: {
              sid: responseData.sid,
              status: responseData.status,
            }
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (smsError) {
        console.error('SMS sending error:', smsError);
        return new Response(
          JSON.stringify({
            success: false,
            error: smsError instanceof Error ? smsError.message : 'Failed to send SMS. Please try again.'
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // Should never reach here due to method validation above
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request method'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    // Catch-all error handler
    console.error('Unexpected error in send-invite function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});