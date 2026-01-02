# Email Setup Guide

The parental consent system is now configured and working. However, **actual email sending requires additional setup**.

## Current Status

The email functions are working and can be tested:

- Parental consent emails are prepared and logged
- Email verification emails are prepared and logged
- Password reset emails are prepared and logged
- All consent URLs and verification links are returned in the API response

**Without email configuration**, the system will:
- Create all database records correctly
- Generate valid consent/verification tokens
- Log the URLs to the console
- Return URLs in the API response for testing

## Testing Without Email

You can test the entire flow by:

1. Sign up as a 13-17 year old with a parent email
2. Check the console logs for the consent URL
3. Copy the URL from the logs
4. Open it in a browser to simulate the parent clicking the link
5. Approve or deny consent

The same process works for email verification and password reset.

## Enabling Actual Email Sending

To enable real email sending, set up Resend:

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email address

### 2. Get Your API Key

1. Go to API Keys in your Resend dashboard
2. Create a new API key
3. Copy the key (starts with `re_`)

### 3. Add Domain (Optional but Recommended)

For production, add your domain:

1. Go to Domains in Resend
2. Add your domain
3. Add the DNS records they provide
4. Verify the domain

For testing, you can use `onboarding@resend.dev` as the sender email.

### 4. Configure Supabase

Add the Resend API key to your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to Project Settings > Edge Functions
3. Add a new secret:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key

### 5. Update Email Sender (Optional)

If you have a verified domain, update the sender email in the edge functions:

- `/supabase/functions/send-parental-consent/index.ts`
- `/supabase/functions/send-verification-email/index.ts`
- `/supabase/functions/send-password-reset/index.ts`

Change:
```typescript
from: 'Bible in a Year <noreply@yourdomain.com>',
```

To your verified domain:
```typescript
from: 'Bible in a Year <noreply@yourdomain.com>',
```

## How It Works

### Sign-Up Flow

**For 18+ users:**
1. Enter birthdate → Create account
2. Verification email sent
3. Click link to verify
4. Access app

**For 13-17 users:**
1. Enter birthdate + parent email → Create account
2. Parental consent email sent to parent
3. Wait on pending consent screen
4. Parent approves via email link
5. Verification email sent to user
6. Click link to verify
7. Access app

### Email Functions

All three email edge functions follow the same pattern:

1. **Check for RESEND_API_KEY**
   - If present: Send email via Resend
   - If not present: Log URL and return it in response

2. **Return Response**
   - `success`: true/false
   - `emailSent`: true if sent via Resend, false otherwise
   - URL for the action (consent/verification/reset)
   - `note`: Message about email configuration

### Console Logs

Check your browser console or server logs for:

```
Sending parental consent email to: parent@example.com
Using Supabase URL: https://xgnuuphbaipsqgzetvqw.supabase.co
Email function response: {
  success: true,
  consentUrl: "http://localhost:8081/auth/parent-consent?token=...",
  emailSent: false,
  note: "Configure RESEND_API_KEY environment variable to enable email sending"
}
```

## Troubleshooting

### Emails Not Sending

1. Check that `RESEND_API_KEY` is configured in Supabase
2. Verify the API key is correct
3. Check Resend dashboard for any errors
4. Make sure sender domain is verified (if using custom domain)

### URLs Not Working

1. Ensure `APP_URL` environment variable is set correctly
2. For local development, use `http://localhost:8081`
3. For production, use your actual domain

### Consent Not Being Approved

1. Check that the parent is clicking the correct link
2. Verify the token hasn't expired (30 days for consent)
3. Check Supabase database `parental_consents` table

### Email Verification Issues

1. Tokens expire after 7 days
2. Use the "Resend" button if needed
3. Check `email_verifications` table in database

## Production Recommendations

1. **Use a Custom Domain**: More professional and better deliverability
2. **Monitor Email Logs**: Check Resend dashboard regularly
3. **Set Up Webhooks**: Get notified of bounces and complaints
4. **Add Rate Limiting**: Prevent abuse of email endpoints
5. **Customize Templates**: Match your brand identity

## Security Notes

- All email functions use CORS headers for web access
- Tokens are generated with `crypto.randomUUID()` for security
- Consent tokens expire after 30 days
- Verification tokens expire after 7 days
- Password reset tokens expire after 1 hour
- No JWT verification required for email functions (they need to be publicly accessible)

## Support

For issues:
- Check console logs first
- Verify database records in Supabase
- Review Resend logs for delivery issues
- Contact Resend support for email delivery problems
