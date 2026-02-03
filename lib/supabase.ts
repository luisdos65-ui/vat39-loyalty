import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Public client for Auth and public reads (if any)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Admin client (Bypass RLS)
// ONLY use in API Routes or Server Actions
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey.includes('PASTE_YOUR')) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is missing or invalid');
    // In development, this might fail calls.
    // We throw to prevent accidental security holes or silent failures
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
