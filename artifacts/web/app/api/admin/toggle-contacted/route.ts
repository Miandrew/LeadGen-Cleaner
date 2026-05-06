import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
  const { id, contacted } = await req.json()
  await supabaseAdmin.from('company_onboarding').update({ contacted }).eq('id', id)
  return NextResponse.json({ success: true })
}
