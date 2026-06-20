import { createClient } from '@supabase/supabase-js';

// Lazily create the Supabase client so it doesn't crash at build time
// when env vars are still placeholders.
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return createClient(url, key);
}

// Convenience singleton-like export for server components / API routes.
// Called at request time (not module-eval time), so env vars are populated.
export const supabase = {
  from: (table: string) => getSupabaseClient().from(table),
  auth: {} as ReturnType<typeof getSupabaseClient>['auth'],
};

// Type helpers
export type LabStatus = 'not_started' | 'in_progress' | 'done';
export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface Lab {
  id: string;
  category: string;
  name: string;
  status: LabStatus;
  notes: string | null;
  created_at: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  date_applied: string | null;
  link: string | null;
  notes: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  log_date: string;
  count: number;
}

export interface DailyFocus {
  id: string;
  focus_date: string;
  suggestion: string;
  created_at: string;
}
