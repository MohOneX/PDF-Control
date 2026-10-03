import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { STIRLING_SAAS_URL, SUPABASE_KEY } from "@app/constants/connection";

/**
 * Supabase client for desktop application
 * Used to call Supabase edge functions for billing and other SaaS features
 *
 * Note: Desktop uses authService for authentication (JWT stored in Tauri secure store),
 * but this client is needed for calling Supabase edge functions like get-usage-billing
 *
 * Local/self-hosted desktop leaves VITE_SAAS_SERVER_URL blank on purpose; createClient
 * throws "supabaseUrl is required" on an empty string, so only build the client when
 * both URL and key are present.
 */

export const isSupabaseConfigured = !!(STIRLING_SAAS_URL && SUPABASE_KEY);

if (!STIRLING_SAAS_URL) {
  console.warn(
    "[Desktop Supabase] VITE_SAAS_SERVER_URL not configured - SaaS features will not work",
  );
}

if (!SUPABASE_KEY) {
  console.warn(
    "[Desktop Supabase] VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY not configured - SaaS features will not work",
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(STIRLING_SAAS_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false, // Desktop manages auth via authService + Tauri secure store
        autoRefreshToken: false, // Desktop manually refreshes tokens via authService
        detectSessionInUrl: false, // Desktop uses deep links, not URL hash fragments
      },
    })
  : null;
