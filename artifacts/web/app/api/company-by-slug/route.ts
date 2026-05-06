import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'No slug' }, { status: 400 })

  const { data } = await supabaseAdmin
    .from('companies')
    .select('id, name, city, state')
    .eq('slug', slug)
    .single()

  return NextResponse.json({ company: data })
}
