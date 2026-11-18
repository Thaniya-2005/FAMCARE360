import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { APP_CONFIG } from '@/config';

const rawUrl = APP_CONFIG.supabase.url;
const rawKey = APP_CONFIG.supabase.publishableKey;

// Clean possible quotation marks from environment variables
const SUPABASE_URL = rawUrl.replace(/^["']|["']$/g, '').trim();
const SUPABASE_PUBLISHABLE_KEY = rawKey.replace(/^["']|["']$/g, '').trim();

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('⚠️ Supabase credentials missing or incomplete in environment.');
}

export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_PUBLISHABLE_KEY || 'placeholder-key',
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
