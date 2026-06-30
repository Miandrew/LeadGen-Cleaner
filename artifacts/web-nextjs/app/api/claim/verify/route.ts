import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('company_id')
    .eq('email', user.email)
    .single()

  if (!userRow?.company_id) {
    return NextResponse.json({ error: 'No company found for this user' }, { status: 404 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('companies')
    .update({ verification_status: 'verified' })
    .eq('id', userRow.company_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
