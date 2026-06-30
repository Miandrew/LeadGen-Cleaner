import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerClient, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ verified: false }, { status: 503 })
  }

  const cookieStore = cookies()
  const supabase = createSupabaseServerClient((name) => cookieStore.get(name)?.value)
  if (!supabase) {
    return NextResponse.json({ verified: false }, { status: 503 })
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.email) {
    return NextResponse.json({ verified: false }, { status: 401 })
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('companies(verification_status)')
    .eq('email', session.user.email)
    .single()

  const company = user?.companies as Record<string, unknown> | null
  const verified = company?.verification_status === 'verified'

  return NextResponse.json({ verified })
}
