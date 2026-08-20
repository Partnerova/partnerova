import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ATTENTION : la clé service_role contourne toutes les règles de sécurité (RLS).
// Ce fichier ne doit JAMAIS être importé dans un composant 'use client'.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
