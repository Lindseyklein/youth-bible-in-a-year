# Stripe Removal/Refactoring Checklist

This document lists all files and code locations that reference Stripe and need to be removed or refactored.

## Application Files (App Code)

### `app/auth/sign-up.tsx`
**Lines: 130-168**
- **REMOVE**: Entire Stripe checkout flow after signup (lines 130-168)
- Calls `/functions/v1/stripe-checkout` endpoint
- Uses `EXPO_PUBLIC_STRIPE_PRICE_ID` environment variable
- Error handling for payment setup
- **Action**: Remove checkout logic, keep signup flow clean

### `app/auth/sign-in.tsx`
**Lines: 47-98**
- **REMOVE**: Subscription check and Stripe checkout redirect (lines 47-98)
- Queries `stripe_user_subscriptions` view
- Redirects to Stripe checkout if no active subscription
- Uses `EXPO_PUBLIC_STRIPE_PRICE_ID` environment variable
- **Action**: Remove subscription checks, allow normal sign-in flow

### `app/auth/subscribe.tsx`
**Lines: Entire file**
- **REMOVE OR REPLACE**: Entire subscribe screen component
- Full Stripe subscription UI
- Calls `/functions/v1/stripe-checkout` endpoint
- Queries `stripe_user_subscriptions` view
- Uses `EXPO_PUBLIC_STRIPE_PRICE_ID` environment variable
- **Action**: Delete entire file OR replace with alternative payment/subscription flow

### `app/_layout.tsx`
**Lines: 30-41, 105-109, 120**
- **REFACTOR**: Subscription status checks (lines 30-41)
- Queries `stripe_user_subscriptions` view
- Navigation logic based on subscription status (lines 105-109)
- Route registration for `/auth/subscribe` (line 120)
- **Action**: Remove subscription checks, simplify navigation logic, remove subscribe route

### `app/(tabs)/stripe-test.tsx`
**Lines: Entire file**
- **REMOVE**: Entire test screen for Stripe integration
- Test buttons for subscription and one-time payments
- Queries `stripe_user_subscriptions` and `stripe_user_orders` views
- Calls `/functions/v1/stripe-checkout` endpoint multiple times
- Uses `EXPO_PUBLIC_STRIPE_PRICE_ID` environment variable
- **Action**: Delete entire file (testing/debugging tool)

### `app/test-stripe.tsx`
**Lines: Entire file**
- **REMOVE**: Another Stripe test screen
- Configuration testing, checkout creation testing
- Queries `stripe_user_subscriptions` view
- Calls `/functions/v1/stripe-checkout` endpoint
- Uses `EXPO_PUBLIC_STRIPE_PRICE_ID` environment variable
- **Action**: Delete entire file (testing/debugging tool)

## Type Definitions

### `types/env.d.ts`
**Line: 9**
- **REMOVE**: `EXPO_PUBLIC_STRIPE_PRICE_ID: string;` type definition
- **Action**: Remove this environment variable type

## Supabase Edge Functions

### `supabase/functions/stripe-checkout/index.ts`
**Lines: Entire file**
- **REMOVE**: Entire Stripe checkout edge function
- Creates Stripe checkout sessions
- Manages `stripe_customers` and `stripe_subscriptions` tables
- Uses `STRIPE_SECRET_KEY` environment variable
- **Action**: Delete entire function directory

### `supabase/functions/stripe-webhook/index.ts`
**Lines: Entire file**
- **REMOVE**: Entire Stripe webhook handler
- Processes Stripe webhook events (subscriptions, payments)
- Updates `stripe_subscriptions` and `stripe_orders` tables
- Uses `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` environment variables
- **Action**: Delete entire function directory

## Database Migrations

### `supabase/migrations/20251228021137_withered_cave.sql`
**Lines: Entire file**
- **NOTE**: Creates Stripe schema (tables, views, types, RLS policies)
- Creates `stripe_customers`, `stripe_subscriptions`, `stripe_orders` tables
- Creates `stripe_subscription_status` and `stripe_order_status` ENUM types
- Creates `stripe_user_subscriptions` and `stripe_user_orders` views
- **Action**: Decide if migration should be reversed (DROP statements) or left as historical record

### `supabase/migrations/20251228021210_ivory_wood.sql`
**Lines: Entire file**
- **NOTE**: Duplicate Stripe schema creation (appears to be retry migration)
- Same content as above migration
- **Action**: Historical record, but ensure schema cleanup

### `supabase/migrations/20251228021337_ancient_sun.sql`
**Lines: Entire file**
- **NOTE**: Another duplicate Stripe schema creation
- Same content as previous migrations
- **Action**: Historical record, but ensure schema cleanup

### `supabase/migrations/20260101200028_fix_stripe_user_subscriptions_view.sql`
**Lines: Entire file**
- **REMOVE OR REVERT**: Fix for Stripe view
- Drops and recreates `stripe_user_subscriptions` view
- **Action**: If removing Stripe, this becomes obsolete

### `supabase/migrations/20260101200038_fix_stripe_view_null_handling.sql`
**Lines: Entire file**
- **REMOVE OR REVERT**: Another fix for Stripe view
- Improves NULL handling in `stripe_user_subscriptions` view
- **Action**: If removing Stripe, this becomes obsolete

### `supabase/migrations/20260101200905_optimize_rls_policies_auth_initialization_v3.sql`
**Lines: 11-13, 43-73**
- **REMOVE**: RLS policy drops for Stripe tables (lines 11-13, 43-73)
- References to `stripe_customers`, `stripe_subscriptions`, `stripe_orders`
- Policy definitions for these tables
- **Action**: Remove Stripe-related policy code

### `all-migrations-combined.sql`
**Lines: Multiple sections (11865-12250+ approximately)**
- **NOTE**: Combined migration file includes all Stripe migrations
- Contains all Stripe schema definitions
- **Action**: Historical/documentation file, but note Stripe sections are obsolete

## Documentation Files

### `STRIPE_SETUP_GUIDE.md`
**Lines: Entire file**
- **REMOVE**: Setup guide for Stripe integration
- **Action**: Delete entire file

### `STRIPE_TESTING_GUIDE.md`
**Lines: Entire file**
- **REMOVE**: Testing guide for Stripe integration
- **Action**: Delete entire file

### `PAYMENT_TROUBLESHOOTING.md`
**Lines: Entire file**
- **REMOVE OR REFACTOR**: Payment troubleshooting guide (Stripe-focused)
- **Action**: Delete if Stripe-only, or refactor for alternative payment system

### `EAS_ENV_SETUP.md`
**Lines: 14, 76-83, 108**
- **REFACTOR**: Environment variable setup documentation
- References `EXPO_PUBLIC_STRIPE_PRICE_ID` setup (lines 76-83, 108)
- **Action**: Remove Stripe environment variable instructions

## Database Schema Cleanup (If Removing Completely)

If you want to completely remove Stripe from the database, you'll need to create a new migration to:

1. **DROP VIEWS**:
   - `DROP VIEW IF EXISTS stripe_user_subscriptions;`
   - `DROP VIEW IF EXISTS stripe_user_orders;`

2. **DROP TABLES**:
   - `DROP TABLE IF EXISTS stripe_orders;`
   - `DROP TABLE IF EXISTS stripe_subscriptions;`
   - `DROP TABLE IF EXISTS stripe_customers;`

3. **DROP TYPES**:
   - `DROP TYPE IF EXISTS stripe_order_status;`
   - `DROP TYPE IF EXISTS stripe_subscription_status;`

4. **DROP POLICIES** (if they still exist):
   - Policies on `stripe_customers`, `stripe_subscriptions`, `stripe_orders`

## Environment Variables to Remove

From your environment configuration:
- `EXPO_PUBLIC_STRIPE_PRICE_ID` (client-side)
- `STRIPE_SECRET_KEY` (Supabase Edge Function secret)
- `STRIPE_WEBHOOK_SECRET` (Supabase Edge Function secret)

## Summary by Priority

### High Priority (Breaks Application Flow)
1. `app/auth/sign-up.tsx` - Checkout flow blocks signup
2. `app/auth/sign-in.tsx` - Subscription check blocks sign-in
3. `app/_layout.tsx` - Subscription checks affect navigation
4. `app/auth/subscribe.tsx` - Entire route depends on Stripe

### Medium Priority (Feature Removal)
5. `supabase/functions/stripe-checkout/` - Edge function directory
6. `supabase/functions/stripe-webhook/` - Edge function directory
7. `app/(tabs)/stripe-test.tsx` - Test screen
8. `app/test-stripe.tsx` - Test screen

### Low Priority (Cleanup)
9. Documentation files (STRIPE_*.md, PAYMENT_TROUBLESHOOTING.md)
10. Environment variable types (`types/env.d.ts`)
11. Database migrations (historical, but consider cleanup migration)
12. Environment variable references in docs (`EAS_ENV_SETUP.md`)

