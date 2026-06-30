import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'

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

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    await supabaseAdmin.from('users').insert({
      email,
      company_id,
      role: role || 'company',
    })

    const segment = determineSegment(biggest_challenge, active_accounts, growth_capacity)
    const cashflow_flag = biggest_challenge === 'Cash flow — getting paid on time'
    const acquisition_flag = biggest_challenge === 'Already busy — thinking about growth or eventually selling the business'

    await supabaseAdmin
      .from('companies')
      .update({ claimed: true, cashflow_flag, acquisition_flag })
      .eq('id', company_id)

    await supabaseAdmin.from('company_onboarding').insert({
      company_id,
      lead_source,
      biggest_challenge,
      active_accounts,
      growth_capacity,
      segment,
      contacted: false,
    })

    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('name, city, state')
      .eq('id', company_id)
      .single()

    const firstName = full_name?.split(' ')[0] || 'there'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const adminEmail = process.env.ADMIN_EMAIL!

    if (company) {
      if (segment === 'HOT') {
        await sendEmail(
          email,
          `Leads available in ${company.city} this week — ${company.name}`,
          `<p>Hi ${firstName},</p>
           <p>Welcome to CommercialCleaningNearMe.com. Based on what you shared, getting more leads is your main challenge — and that's exactly what we do.</p>
           <p>I want to personally show you what leads are available in your area right now, no commitment required. Reply to this email and I'll send you a preview.</p>
           <p>Best,<br/>The CCNearMe Team</p>`
        )
      } else if (segment === 'WARM') {
        await sendEmail(
          email,
          `Your listing is live — leads available in ${company.city}`,
          `<div style="font-family:sans-serif;max-width:600px">
            <p>Hi ${firstName},</p>
            <p>Your listing is now live. Facility managers in ${company.city} are actively searching.</p>
            <p>New leads are waiting for you in your dashboard.</p>
            <a href="${siteUrl}/dashboard/leads" style="display:inline-block;background:#1B3A6B;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">View Available Leads</a>
          </div>`
        )
      } else {
        await sendEmail(
          email,
          `Your listing is live on CommercialCleaningNearMe.com`,
          `<div style="font-family:sans-serif;max-width:600px">
            <p>Hi ${firstName},</p>
            <p>Your listing is live and visible to facility managers in ${company.city}. Complete your profile to appear higher in search results.</p>
            <a href="${siteUrl}/dashboard/listing" style="display:inline-block;background:#1B3A6B;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Complete Your Profile</a>
          </div>`
        )
      }

      await sendEmail(
        adminEmail,
        `New listing claimed — ${company.name}`,
        `<p><strong>Company:</strong> ${company.name}</p>
         <p><strong>City:</strong> ${company.city}</p>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Segment:</strong> ${segment}</p>
         <p><strong>Challenge:</strong> ${biggest_challenge}</p>
         <p><strong>Active accounts:</strong> ${active_accounts}</p>
         <p><strong>Growth capacity:</strong> ${growth_capacity}</p>
         ${cashflow_flag ? '<p><strong>⚑ Cash-flow flag</strong></p>' : ''}
         ${acquisition_flag ? '<p><strong>⚑ Acquisition flag</strong></p>' : ''}
         <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>`
      )
    }

    // Sign the user in so they land on dashboard with an active session
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Sign in after claim failed:', signInError)
      return NextResponse.json({ success: true, requiresLogin: true })
    }

    return NextResponse.json({
      success: true,
      session: signInData.session,
      segment,
      company: company ? { name: company.name, city: company.city } : null,
    })
  } catch (err) {
    console.error('Claim error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

function determineSegment(biggest_challenge: string, active_accounts: string, growth_capacity: string): string {
  const leadChallenge =
    biggest_challenge === 'Not enough leads / inconsistent work' ||
    biggest_challenge === 'Missed calls or slow follow-up'
  const hasVolume =
    active_accounts === '6-20' || active_accounts === '21-50' || active_accounts === '50+' ||
    growth_capacity === '5-9' || growth_capacity === '10+'

  if (leadChallenge && hasVolume) {
    return 'HOT'
  }

  if (
    biggest_challenge === 'Hiring and keeping good staff' ||
    biggest_challenge === 'Managing scheduling and operations' ||
    (biggest_challenge === 'Not enough leads / inconsistent work' && active_accounts === '1-5')
  ) {
    return 'WARM'
  }

  if (active_accounts === '1-5' && growth_capacity === "0-1, we're at capacity") {
    return 'NURTURE'
  }

  return 'WARM'
}
