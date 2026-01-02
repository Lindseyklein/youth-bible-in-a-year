import { Resend } from 'npm:resend@4.0.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface NotificationPreference {
  user_id: string;
  daily_reminder_enabled: boolean;
  reminder_time: string;
  reminder_timezone: string;
  email_notifications: boolean;
  last_reminder_sent: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  current_day: number;
}

interface BiblePlanDay {
  day_number: number;
  reading_reference: string;
  title: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time in UTC
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    console.log(`Running daily reminder job at ${now.toISOString()}`);

    // Get users who should receive reminders (within the current hour)
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('user_id, daily_reminder_enabled, reminder_time, reminder_timezone, email_notifications, last_reminder_sent')
      .eq('daily_reminder_enabled', true)
      .eq('email_notifications', true);

    if (prefError) {
      throw new Error(`Failed to fetch preferences: ${prefError.message}`);
    }

    if (!preferences || preferences.length === 0) {
      console.log('No users with daily reminders enabled');
      return new Response(
        JSON.stringify({ message: 'No users to notify', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter users whose reminder time matches current hour (accounting for timezone)
    const usersToNotify = preferences.filter((pref: NotificationPreference) => {
      const reminderHour = parseInt(pref.reminder_time.split(':')[0]);
      // Simple check: if reminder time hour matches current UTC hour
      // Note: Full timezone conversion would require additional logic
      return Math.abs(reminderHour - currentHour) <= 1;
    });

    if (usersToNotify.length === 0) {
      console.log('No users to notify at this time');
      return new Response(
        JSON.stringify({ message: 'No users to notify at this time', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profiles and current reading day
    const userIds = usersToNotify.map((p: NotificationPreference) => p.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, current_day')
      .in('id', userIds);

    if (profileError) {
      throw new Error(`Failed to fetch profiles: ${profileError.message}`);
    }

    // Get auth users to get email addresses
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const emailsSent: string[] = [];
    const errors: string[] = [];

    for (const profile of profiles) {
      try {
        const authUser = users.find(u => u.id === profile.id);
        if (!authUser?.email) {
          console.log(`No email found for user ${profile.id}`);
          continue;
        }

        // Get today's reading
        const { data: reading, error: readingError } = await supabase
          .from('bible_plan_days')
          .select('day_number, reading_reference, title')
          .eq('day_number', profile.current_day)
          .maybeSingle();

        if (readingError || !reading) {
          console.log(`No reading found for user ${profile.id} on day ${profile.current_day}`);
          continue;
        }

        // Send email via Resend
        const { data, error } = await resend.emails.send({
          from: 'Bible in a Year <info@youthbibleinayear.com>',
          to: [authUser.email],
          subject: `Day ${reading.day_number}: ${reading.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Your Daily Reading</h1>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 18px; color: #555; margin-bottom: 10px;">Hello ${profile.display_name},</p>
                
                <p style="font-size: 16px; color: #666;">Your reading for today is ready:</p>
                
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <h2 style="color: #2d3748; margin: 0 0 10px 0; font-size: 22px;">Day ${reading.day_number}</h2>
                  <h3 style="color: #4a5568; margin: 0 0 15px 0; font-size: 18px;">${reading.title}</h3>
                  <p style="color: #667eea; font-size: 16px; font-weight: 600; margin: 0;">${reading.reading_reference}</p>
                </div>
                
                <p style="font-size: 16px; color: #666; margin: 20px 0;">Continue your journey through the Bible and discover God's redemptive story today.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${supabaseUrl.replace('https://', 'https://app.')}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Open App</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #999; text-align: center;">You're receiving this because you have daily reminders enabled in your Redemption Journey settings.</p>
              </div>
            </body>
            </html>
          `,
        });

        if (error) {
          console.error(`Failed to send email to ${authUser.email}:`, error);
          errors.push(`${authUser.email}: ${error.message}`);
        } else {
          console.log(`Email sent to ${authUser.email}`);
          emailsSent.push(authUser.email);

          // Update last_reminder_sent
          await supabase
            .from('notification_preferences')
            .update({ last_reminder_sent: now.toISOString() })
            .eq('user_id', profile.id);
        }
      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
        errors.push(`User ${profile.id}: ${userError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Daily reminders processed',
        sent: emailsSent.length,
        emails: emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Fatal error in daily-reminder function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Check function logs for more information',
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
