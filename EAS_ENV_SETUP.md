# EAS Environment Variables Setup Guide

This guide will help you set up all required environment variables for your EAS builds.

## Required Environment Variables

You need to set these 6 environment variables for your production builds:

1. `EXPO_PUBLIC_SUPABASE_URL`
2. `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. `EXPO_PUBLIC_API_BIBLE_KEY` (optional but recommended)
4. `EXPO_PUBLIC_ESV_API_KEY` (required for ESV translation)
5. `EXPO_PUBLIC_APP_URL`
6. `EXPO_PUBLIC_STRIPE_PRICE_ID`

## Where to Find Each Value

### 1. EXPO_PUBLIC_SUPABASE_URL
**Where to get it:**
- Go to your [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to **Settings** > **API**
- Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)

**Example:** `https://abcdefghijklmnop.supabase.co`

---

### 2. EXPO_PUBLIC_SUPABASE_ANON_KEY
**Where to get it:**
- Same location as above (Supabase Dashboard > Settings > API)
- Copy the **anon/public** key (starts with `eyJ...`)

**Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### 3. EXPO_PUBLIC_API_BIBLE_KEY (Optional)
**Where to get it:**
- Visit [scripture.api.bible](https://scripture.api.bible/)
- Sign up for a free account
- Generate an API key
- Copy the key

**Note:** This is optional but recommended for better Bible API fallback support.

---

### 4. EXPO_PUBLIC_ESV_API_KEY (Required for ESV)
**Where to get it:**
- Visit [api.esv.org](https://api.esv.org/)
- Create an account
- Request an API key for non-commercial use
- Copy the token

**Note:** Required if you want ESV Bible translation support.

---

### 5. EXPO_PUBLIC_APP_URL
**Based on your codebase, use one of these:**

**Option A:** If you have a custom domain:
- Use your app's website URL (e.g., `https://youthbibleinayear.com`)

**Option B:** If using Expo hosting:
- Use your Expo app URL (e.g., `https://yourbibleinayear.app`)

**Option C:** For development/testing:
- Use `http://localhost:8081` (but this won't work in production builds)

**Recommended:** `https://youthbibleinayear.com` or `https://yourbibleinayear.app`

---

### 6. EXPO_PUBLIC_STRIPE_PRICE_ID
**Where to get it:**
- Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
- Go to **Products** > Select your product
- Find the **Price ID** (starts with `price_`)
- Copy it

**Example:** `price_1234567890abcdef`

---

## How to Set Environment Variables

Run these commands one at a time, replacing the placeholder values with your actual values:

```bash
# 1. Supabase URL
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co" --environment production

# 2. Supabase Anon Key
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." --environment production

# 3. API Bible Key (optional)
eas env:create --scope project --name EXPO_PUBLIC_API_BIBLE_KEY --value "your-api-bible-key" --environment production

# 4. ESV API Key
eas env:create --scope project --name EXPO_PUBLIC_ESV_API_KEY --value "your-esv-api-key" --environment production

# 5. App URL
eas env:create --scope project --name EXPO_PUBLIC_APP_URL --value "https://youthbibleinayear.com" --environment production

# 6. Stripe Price ID
eas env:create --scope project --name EXPO_PUBLIC_STRIPE_PRICE_ID --value "price_1234567890" --environment production
```

## Set for All Environments (Optional)

If you want the same values for preview and development builds, add `--environment preview` and `--environment development`:

```bash
eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-value" --environment production --environment preview --environment development
```

## Verify Your Environment Variables

After setting them, verify they're set correctly:

```bash
eas env:list --environment production
```

## Rebuild Your App

After setting all environment variables, rebuild your app:

```bash
eas build --platform ios --profile production
```

## Troubleshooting

- **Missing values:** Make sure you've set all 6 variables before building
- **Wrong values:** Double-check each value is correct (no extra spaces, correct URLs)
- **Build still fails:** Check the build logs for specific error messages

