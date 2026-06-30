import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { finalizeClaim, generateSlug } from '@/lib/claim'

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 })
    }

    const body = await req.json()
    const {
      company_name, city, state, phone, website, services,
      full_name, email, password, role,
      lead_source, biggest_challenge, active_accounts, growth_capacity,
    } = body

    if (!company_name || !city || !state || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json({ error: 'Select at least one service.' }, { status: 400 })
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

    // Insert the brand-new company as UNCLAIMED first. finalizeClaim() flips it
    // to claimed only after the auth user + downstream writes succeed, so a
    // failure can't leave a permanently-claimed orphan listing.
    const { data: newCompany, error: insertError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: company_name,
        slug: generateSlug(company_name, city, state),
        city,
        state,
        phone: phone || null,
        website: website || null,
        services,
        primary_service: services[0],
        claimed: false,
        active: true,
        source: 'self-added',
      })
      .select('id, name, city, state')
      .single()

    if (insertError || !newCompany) {
      console.error('New company insert error:', insertError)
      return NextResponse.json({ error: 'Could not create your company listing.' }, { status: 500 })
    }

    const result = await finalizeClaim({
      company: {
        id: newCompany.id,
        name: newCompany.name,
        city: newCompany.city,
        state: newCompany.state,
      },
      full_name, email, password, phone, role,
      lead_source, biggest_challenge, active_accounts, growth_capacity,
    })

    if (!result.ok) {
      // Roll back the orphan company so a failed signup doesn't pollute the directory
      await supabaseAdmin.from('companies').delete().eq('id', newCompany.id)
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
    console.error('Claim-new error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
