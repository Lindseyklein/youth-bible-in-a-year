# Polar Payments Integration

## Overview
The app now includes Polar payment integration for subscriptions. Users see a trial modal after sign-up offering a 7-day free trial for $24.99/year.

## What Was Fixed

### Issue: Modal Not Appearing
The subscription modal wasn't showing because the `useSubscription` hook had incorrect default values:

**Fixed:**
1. Changed `hasSeenTrialModal` default from `true` to `false`
2. Updated the fallback value from `?? true` to `?? false`
3. Added proper loading state checks before showing modal
4. Updated existing profiles in database with correct default values

### Changes Made

**Database:**
- Added email field to profiles table
- Added subscription tracking fields (status, dates, customer ID)
- Added `has_seen_trial_modal` flag to control modal display

**Components:**
- `SubscriptionTrialModal` - Beautiful modal with Polar embedded checkout
- `SubscriptionPrompt` - Inline prompt for users who skipped trial
- `useSubscription` hook - Manages subscription state

**Flow:**
1. User signs up → Modal appears automatically
2. User clicks "Start 7-Day Trial" → Opens Polar checkout
3. User completes payment → Webhook updates subscription status
4. User gains full app access

## Testing the Payment Flow

### For New Users:
1. Sign up with a new account
2. Complete the registration form
3. **The subscription modal should appear automatically**
4. Click "Start 7-Day Trial" to test checkout

### For Existing Users:
If you're testing with an existing account and the modal doesn't show:
1. Go to your Profile tab
2. You'll see subscription status
3. Click "Start Free Trial" button

### On the Home Screen:
- Users without subscriptions who've seen the modal will see an inline subscription prompt
- Users with active subscriptions see full content

## Webhook Configuration

Set up the Polar webhook in your Polar dashboard:

**Webhook URL:**
```
https://xgnuuphbaipsqgzetvqw.supabase.co/functions/v1/polar-webhook
```

**Events to Subscribe:**
- `subscription.created`
- `subscription.active`
- `subscription.updated`
- `subscription.cancelled`
- `subscription.revoked`

## Platform Support

- **Web (Expo Web):** Full embedded checkout experience
- **Mobile (iOS/Android):** Opens checkout in external browser

## Troubleshooting

### Modal Still Not Showing?

**Check Database:**
Run this query in Supabase SQL editor:
```sql
SELECT id, email, subscription_status, has_seen_trial_modal
FROM profiles
WHERE id = 'your-user-id';
```

**Reset for Testing:**
```sql
UPDATE profiles
SET has_seen_trial_modal = false,
    subscription_status = 'none'
WHERE id = 'your-user-id';
```

Then refresh the app.

### Verify Webhook is Working:

After a test payment, check the Supabase logs:
1. Go to Supabase Dashboard
2. Functions → polar-webhook → Logs
3. Look for successful webhook events

## Files Modified

- `/hooks/useSubscription.ts` - Fixed default values
- `/app/(tabs)/index.tsx` - Added modal logic
- `/app/auth/sign-up.tsx` - Shows modal after signup
- `/app/(tabs)/profile.tsx` - Subscription management
- `/components/SubscriptionTrialModal.tsx` - Payment modal
- `/contexts/AuthContext.tsx` - Saves email on signup
- `/supabase/functions/polar-webhook/index.ts` - Webhook handler
- `/types/database.ts` - Updated types
