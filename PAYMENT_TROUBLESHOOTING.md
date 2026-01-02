# Payment Flow Troubleshooting Guide

## Issue: Payment Not Loading at Login

If the payment page isn't appearing after login, follow these steps:

### Step 1: Check Your Stripe Configuration

1. **Verify Stripe Secrets are Set in Supabase:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Navigate to your project > Edge Functions > Secrets
   - Ensure these are set:
     - `STRIPE_SECRET_KEY` (from Stripe Dashboard)
     - `STRIPE_WEBHOOK_SECRET` (from Stripe Webhook setup)

2. **Update Your Price ID:**
   - Open `.env` file
   - Update `EXPO_PUBLIC_STRIPE_PRICE_ID=price_1234567890` with your actual Price ID from Stripe
   - Get your Price ID from: [Stripe Dashboard > Products](https://dashboard.stripe.com/products)

### Step 2: Check Browser Console for Errors

1. Open your browser's Developer Tools (F12 or Right-click > Inspect)
2. Go to the Console tab
3. Sign in to your app
4. Look for these log messages:
   - "Creating checkout with price ID: ..."
   - "Checkout response: ..."
   - Any error messages

### Step 3: Common Issues and Solutions

#### Issue: "Missing required parameter price_id"
**Solution:** Your Price ID is not set correctly in `.env`
```bash
# Update .env with your actual Stripe Price ID
EXPO_PUBLIC_STRIPE_PRICE_ID=price_YOUR_ACTUAL_PRICE_ID
```
Then restart your dev server.

#### Issue: "Failed to authenticate user"
**Solution:** Edge function secrets not configured
- Go to Supabase Dashboard > Edge Functions > Secrets
- Add `STRIPE_SECRET_KEY` with your Stripe secret key

#### Issue: "No such price"
**Solution:** Invalid Price ID or using test mode key with live Price ID
- Verify your Price ID exists in [Stripe Dashboard](https://dashboard.stripe.com/products)
- Ensure you're using matching environments (test key with test Price ID, or live key with live Price ID)

#### Issue: Subscribe button does nothing
**Solution:** Check for JavaScript errors in browser console
- Look for CORS errors
- Check if the Edge Function is deployed
- Verify the function is accessible at: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-checkout`

### Step 4: Test the Edge Function Directly

Test if your stripe-checkout function is working:

```bash
# Get your auth token from browser console after logging in
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/stripe-checkout \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price_id": "price_YOUR_PRICE_ID",
    "mode": "subscription",
    "success_url": "https://yourdomain.com/success",
    "cancel_url": "https://yourdomain.com/cancel"
  }'
```

Expected response:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Step 5: Verify Webhook Configuration

Even though webhooks don't affect initial checkout, they're required for subscription updates:

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Check that your webhook endpoint is configured:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
   ```
3. Selected events should include:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Step 6: Check the Login Flow

The updated login flow should:
1. Sign in user
2. Check parental consent (if under 18)
3. Check email verification
4. **Check subscription status**
5. Redirect to subscribe page if no active subscription
6. Redirect to app if subscription is active

To verify this is working, check the browser console during login for any errors.

### Step 7: Test with Existing User

If you already have an account:

1. Sign out completely
2. Sign in again
3. You should be redirected to `/auth/subscribe`
4. Click "Subscribe Now"
5. Browser console should show:
   - "Creating checkout with price ID: ..."
   - "Checkout response: ..."
   - "Redirecting to Stripe checkout: ..."
6. You should be redirected to Stripe's checkout page

### Step 8: Allow Skip for Testing

If you want to test the app without setting up payments first, you can click "Skip for now" on the subscribe page. This gives limited access but lets you explore the app.

## Quick Checklist

- [ ] STRIPE_SECRET_KEY set in Supabase Edge Function secrets
- [ ] EXPO_PUBLIC_STRIPE_PRICE_ID set in .env file
- [ ] Price ID exists in Stripe Dashboard
- [ ] Dev server restarted after .env changes
- [ ] Browser console shows no errors
- [ ] Webhook configured (for subscription updates)

## Still Not Working?

1. Check the Edge Function logs in Supabase Dashboard
2. Look for error messages in browser console
3. Verify your Stripe account is not in restricted mode
4. Make sure you're using test mode keys for testing

## Contact Support

If you're still experiencing issues, please provide:
- Error messages from browser console
- Edge function logs from Supabase Dashboard
- Your Stripe Price ID (starts with `price_`)
- Whether you're using test mode or live mode
