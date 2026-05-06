import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, subscription_tier')
    .eq('subscription_status', 'active')

  for (const user of users || []) {
    let leads_remaining = 0
    if (user.subscription_tier === 'starter') leads_remaining = 3
    else if (user.subscription_tier === 'growth') leads_remaining = 8
    else if (user.subscription_tier === 'unlimited') leads_remaining = 999

    await supabaseAdmin.from('users').update({ leads_remaining }).eq('id', user.id)
  }

  return NextResponse.json({ success: true, reset: users?.length || 0 })
}
