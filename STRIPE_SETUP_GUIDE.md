# Stripe Payment Setup Guide

This guide will help you configure Stripe payments for the signup flow.

## Prerequisites

1. A Stripe account (create one at https://dashboard.stripe.com/register)
2. Access to your Supabase project dashboard

## Step 1: Get Your Stripe Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** > **API keys**
3. Copy your **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)
4. Keep this window open - you'll need it for the next steps

## Step 2: Create a Stripe Price

1. In your Stripe Dashboard, go to **Products** > **Add product**
2. Fill in the product details:
   - **Name**: Youth Bible in a Year Premium (or your app name)
   - **Description**: Annual subscription with full access
   - **Pricing**:
     - Select **Recurring**
     - Set price to **$24.99**
     - Set billing period to **Yearly**
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_`)

## Step 3: Configure Supabase Edge Function

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Edge Functions** > **Secrets**
4. Add the following secrets:
   - **STRIPE_SECRET_KEY**: Your Stripe secret key from Step 1
   - **STRIPE_WEBHOOK_SECRET**: Leave this for now (we'll set it up in Step 5)

## Step 4: Update Environment Variables

1. In your project, update the `.env` file:
   ```
   EXPO_PUBLIC_STRIPE_PRICE_ID=price_your_actual_price_id_here
   ```
2. Replace `price_your_actual_price_id_here` with the Price ID from Step 2

## Step 5: Set Up Stripe Webhooks (Important!)

Webhooks are required to keep your database in sync with Stripe subscription status.

1. In your Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
   Replace `YOUR_PROJECT_REF` with your actual Supabase project reference (found in your project URL)
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Click on your newly created webhook
7. Click **Reveal** next to **Signing secret**
8. Copy the webhook secret (starts with `whsec_`)
9. Go back to your Supabase Dashboard > Edge Functions > Secrets
10. Update **STRIPE_WEBHOOK_SECRET** with the value you just copied

## Step 6: Test Your Integration

1. Start your development server
2. Create a new account (or sign out and sign back in)
3. After signup, you should be redirected to the subscription page
4. Click "Subscribe Now"
5. You'll be redirected to Stripe Checkout
6. Use a [test card](https://stripe.com/docs/testing#cards):
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
7. Complete the checkout
8. You should be redirected back to your app with an active subscription

## Step 7: Verify Everything Works

1. Check your Stripe Dashboard to see if the subscription was created
2. In your Supabase Dashboard, check these tables:
   - `stripe_customers` - Should have a new customer entry
   - `stripe_subscriptions` - Should show subscription status as 'active' or 'trialing'
3. Try accessing premium features in your app

## Troubleshooting

### "No Stripe Price ID configured"
- Make sure you updated the `.env` file with your actual Price ID
- Restart your development server after updating environment variables

### Webhook not receiving events
- Verify your webhook URL is correct in Stripe Dashboard
- Check that you've selected the correct events
- Make sure STRIPE_WEBHOOK_SECRET is set in Supabase Edge Function secrets

### Checkout session not creating
- Verify STRIPE_SECRET_KEY is set in Supabase Edge Function secrets
- Check the Edge Function logs in Supabase Dashboard for errors
- Ensure your Stripe account is not in restricted mode

### Subscription not showing as active
- Check that webhooks are properly configured
- Look at the Stripe webhook logs to see if events are being delivered
- Check Supabase Edge Function logs for the stripe-webhook function

## Going Live

When you're ready to accept real payments:

1. In Stripe Dashboard, toggle from Test mode to Live mode
2. Get your **Live** mode API keys and Price IDs
3. Update your Supabase secrets with live keys
4. Update your `.env` file with live Price ID
5. Set up webhooks again in live mode
6. Test thoroughly with small amounts before full launch

## Security Notes

- Never commit your `.env` file to version control
- Never expose your Stripe Secret Key in client-side code
- Always use the Edge Function to create checkout sessions
- Verify webhook signatures to prevent fraud

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Testing Guide](./STRIPE_TESTING_GUIDE.md)
