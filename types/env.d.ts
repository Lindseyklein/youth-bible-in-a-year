declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_API_BIBLE_KEY: string;
      EXPO_PUBLIC_ESV_API_KEY: string;
      EXPO_PUBLIC_APP_URL: string;
      EXPO_PUBLIC_STRIPE_PRICE_ID: string;
      APP_URL: string;
    }
  }
}

export {};
