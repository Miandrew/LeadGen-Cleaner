import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20
}

function createSafeClient(url: string, key: string): SupabaseClient | null {
  if (!url.startsWith('https://') || key.length < 20) return null
  return createClient(url, key)
}

export const supabase: SupabaseClient = createSafeClient(SUPABASE_URL, SUPABASE_ANON_KEY) as SupabaseClient
export const supabaseAdmin: SupabaseClient = (
  createSafeClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) ??
  createSafeClient(SUPABASE_URL, SUPABASE_ANON_KEY)
) as SupabaseClient

export function createSupabaseServerClient(cookieGetter: (name: string) => string | undefined): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  const { createServerClient } = require('@supabase/ssr') as typeof import('@supabase/ssr')
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: { get: cookieGetter },
  })
}
