import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  const q = req.nextUrl.searchParams.get('q')

  if (slug) {
    const { data } = await supabaseAdmin
      .from('companies')
      .select('id, name, slug, city, state')
      .eq('slug', slug)
      .single()
    return NextResponse.json({ company: data })
  }

  if (q && q.trim()) {
    const term = q.trim()
    const { data } = await supabaseAdmin
      .from('companies')
      .select('id, name, slug, city, state')
      .eq('active', true)
      .eq('claimed', false)
      .or(`name.ilike.%${term}%,city.ilike.%${term}%`)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(15)
    return NextResponse.json(data || [])
  }

  return NextResponse.json({ error: 'Provide slug or q' }, { status: 400 })
}
