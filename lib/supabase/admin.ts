import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service-role Supabase client used strictly for:
// 1. Antigravity MCP requests (authenticated via personal API token)
// 2. Cron reminder delivery workers
// 3. Google Calendar webhook sync callbacks
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-role-key';

  return createSupabaseClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
