import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

/**
 * Supabase Auth defaults to the Navigator LockManager (`lock:<storageKey>`).
 * In dev, React Strict Mode + Vite HMR can overlap auth work and trigger
 * "lock was stolen" / NavigatorLockAcquireTimeoutError. A no-op lock matches
 * auth-js's internal fallback when LockManager isn't used.
 * (Fine for a single-tab vendor dashboard; revisit if you need multi-tab sync.)
 */
async function authLockNoOp(_name, _acquireTimeout, fn) {
  return await fn()
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'vendor-session',
      // Dev-only: avoid Navigator LockManager races with React Strict Mode + HMR.
      // Production: use the default lock so multiple tabs coordinate token refresh.
      ...(import.meta.env.DEV ? { lock: authLockNoOp } : {}),
    },
    realtime: {
      params: { eventsPerSecond: 20 }
    }
  }
)
