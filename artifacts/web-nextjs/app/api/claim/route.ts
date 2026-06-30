import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { finalizeClaim } from '@/lib/claim'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      company_id, slug, full_name, email, password, phone, role,
      lead_source, biggest_challenge, active_accounts, growth_capacity,
    } = body

    if (!company_id || !slug || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Enforce the 4 mandatory survey answers server-side (not just in the UI)
    if (
      !Array.isArray(lead_source) || lead_source.length === 0 ||
      !biggest_challenge ||
      !active_accounts ||
      !growth_capacity
    ) {
      return NextResponse.json({ error: 'Please answer all survey questions.' }, { status: 400 })
    }

    const { data: targetCompany, error: targetErr } = await supabaseAdmin
      .from('companies')
      .select('id, slug, claimed, name, city, state')
      .eq('id', company_id)
      .single()

    if (targetErr || !targetCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    if (targetCompany.slug !== slug) {
      return NextResponse.json({ error: 'Company/slug mismatch' }, { status: 400 })
    }
    if (targetCompany.claimed) {
      return NextResponse.json({ error: 'This listing has already been claimed' }, { status: 409 })
    }

    const result = await finalizeClaim({
      company: {
        id: targetCompany.id,
        name: targetCompany.name,
        city: targetCompany.city,
        state: targetCompany.state,
      },
      full_name, email, password, phone, role,
      lead_source, biggest_challenge, active_accounts, growth_capacity,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    if (result.requiresLogin) {
      return NextResponse.json({ success: true, requiresLogin: true })
    }

    return NextResponse.json({
      success: true,
      session: result.session,
      segment: result.segment,
      company: result.company,
    })
  } catch (err) {
    console.error('Claim error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
