# Stripe Testing Guide

This guide walks you through testing the Stripe integration in your app.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Stripe test API keys
3. A test product and price created in Stripe

## Step 1: Get Your Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in the top right)
3. Go to **Developers** > **API Keys**
4. Copy your **Secret Key** (starts with `sk_test_`)

## Step 2: Set Up Environment Variables in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** > **Manage Secrets**
3. Add the following secrets:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (from Step 1)
   - `STRIPE_WEBHOOK_SECRET`: Leave this blank for now (we'll set it up later)

## Step 3: Create a Test Product and Price

1. In your Stripe Dashboard, go to **Products** > **Add Product**
2. Create a test product (e.g., "Premium Subscription")
3. Add a price (e.g., $24.99/year or $9.99/month)
4. After creating, copy the **Price ID** (starts with `price_`)

## Step 4: Update the Test Page

1. Open `app/(tabs)/stripe-test.tsx`
2. Find the line: `const testPriceId = 'price_1234567890';`
3. Replace `'price_1234567890'` with your actual Price ID from Step 3

## Step 5: Test the Checkout Flow

1. Run your app and navigate to the **Stripe** tab
2. Make sure you're signed in
3. Click either:
   - **Test Subscription Checkout** (for recurring payments)
   - **Test One-Time Payment** (for single purchases)
4. You should see an alert with a Stripe checkout URL
5. Copy and open that URL in a browser to complete the test payment

### Test Card Numbers

Use these test card numbers in the Stripe checkout:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **3D Secure required**: `4000 0027 6000 3184`

For all test cards:
- Use any future expiration date (e.g., 12/25)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

## Step 6: Set Up Webhooks (For Production)

Webhooks allow Stripe to notify your app about payment events.

1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to:
   ```
   https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to Supabase Edge Functions secrets as `STRIPE_WEBHOOK_SECRET`

## Step 7: Verify the Integration

After completing a test payment:

1. Go back to the Stripe tab in your app
2. Click the refresh icon next to "Your Stripe Data"
3. You should see:
   - Your subscription status (if you tested subscription)
   - Your order history (if you tested one-time payment)

## Database Tables

The Stripe integration uses these tables:

- **stripe_customers**: Links your app users to Stripe customers
- **stripe_subscriptions**: Stores subscription data
- **stripe_orders**: Records one-time payments

You can query these directly in the Supabase SQL Editor if needed.

## Troubleshooting

### "No auth token found"
- Make sure you're signed in to the app
- Try signing out and signing back in

### "Failed to create checkout session"
- Check that `STRIPE_SECRET_KEY` is set correctly in Supabase
- Verify the Price ID is correct
- Check the edge function logs in Supabase

### Webhook not working
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check the webhook endpoint URL is correct
- Look at webhook delivery logs in Stripe Dashboard

### No data showing after payment
- Make sure webhooks are set up correctly
- Check the `stripe-webhook` function logs for errors
- Verify RLS policies allow your user to read the data

## Going to Production

Before launching:

1. Switch to **Live Mode** in Stripe
2. Get your live API keys (starts with `sk_live_`)
3. Update `STRIPE_SECRET_KEY` in Supabase with the live key
4. Create real products and prices
5. Update the app with real Price IDs
6. Set up webhooks for the production domain
7. Test thoroughly with live mode test cards first
