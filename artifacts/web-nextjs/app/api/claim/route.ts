import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      company_id, slug, full_name, email, password, phone, role,
      how_getting_clients, biggest_challenge, new_clients_per_month, marketing_budget,
    } = body

    if (!company_id || !slug || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    await supabaseAdmin.from('companies').update({ claimed: true }).eq('id', company_id)

    const segment = determineSegment(biggest_challenge, marketing_budget)

    await supabaseAdmin.from('company_onboarding').insert({
      company_id,
      how_getting_clients,
      biggest_challenge,
      new_clients_per_month,
      marketing_budget,
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
            <p>Leads available from $25 each in your dashboard.</p>
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
         <p><strong>Budget:</strong> ${marketing_budget}</p>
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

function determineSegment(biggest_challenge: string, marketing_budget: string): string {
  if (biggest_challenge === 'Not getting enough leads' &&
    (marketing_budget === '$500–$1,000/month' || marketing_budget === 'Over $1,000/month')) {
    return 'HOT'
  }
  if (biggest_challenge === 'Not getting enough leads' && marketing_budget === '$200–$500/month') {
    return 'WARM'
  }
  return 'NURTURE'
}
