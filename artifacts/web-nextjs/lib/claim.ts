import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'

export interface ClaimCompany {
  id: string
  name: string
  city: string
  state: string
}

export interface FinalizeClaimInput {
  company: ClaimCompany
  full_name?: string
  email: string
  password: string
  phone?: string
  role?: string
  lead_source: string[]
  biggest_challenge: string
  active_accounts: string
  growth_capacity: string
}

export type FinalizeClaimResult =
  | {
      ok: true
      session: unknown | null
      requiresLogin?: boolean
      segment: string
      company: { id: string; name: string; city: string } | null
    }
  | { ok: false; status: number; error: string }

export function computeFlags(biggest_challenge: string) {
  return {
    cashflow_flag: biggest_challenge === 'Cash flow — getting paid on time',
    acquisition_flag:
      biggest_challenge === 'Already busy — thinking about growth or eventually selling the business',
  }
}

export function determineSegment(
  biggest_challenge: string,
  active_accounts: string,
  growth_capacity: string,
): string {
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

/**
 * Shared claim completion: creates the auth user, the users row, the onboarding
 * record, sets company flags, sends the segment + admin emails, and signs the
 * user in. The caller is responsible for ensuring `company` already exists and
 * is claimed (existing-listing update or brand-new insert).
 */
export async function finalizeClaim(input: FinalizeClaimInput): Promise<FinalizeClaimResult> {
  const {
    company, full_name, email, password, phone, role,
    lead_source, biggest_challenge, active_accounts, growth_capacity,
  } = input

  const { error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { ok: false, status: 400, error: authError.message }
  }

  await supabaseAdmin.from('users').insert({
    email,
    company_id: company.id,
    role: role || 'company',
  })

  const segment = determineSegment(biggest_challenge, active_accounts, growth_capacity)
  const { cashflow_flag, acquisition_flag } = computeFlags(biggest_challenge)

  await supabaseAdmin
    .from('companies')
    .update({ claimed: true, cashflow_flag, acquisition_flag })
    .eq('id', company.id)

  await supabaseAdmin.from('company_onboarding').insert({
    company_id: company.id,
    lead_source,
    biggest_challenge,
    active_accounts,
    growth_capacity,
    segment,
    contacted: false,
  })

  const firstName = full_name?.split(' ')[0] || 'there'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const adminEmail = process.env.ADMIN_EMAIL

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

  if (adminEmail) {
    await sendEmail(
      adminEmail,
      `New listing claimed — ${company.name}`,
      `<p><strong>Company:</strong> ${company.name}</p>
       <p><strong>City:</strong> ${company.city}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Phone:</strong> ${phone || ''}</p>
       <p><strong>Segment:</strong> ${segment}</p>
       <p><strong>Challenge:</strong> ${biggest_challenge}</p>
       <p><strong>Active accounts:</strong> ${active_accounts}</p>
       <p><strong>Growth capacity:</strong> ${growth_capacity}</p>
       ${cashflow_flag ? '<p><strong>⚑ Cash-flow flag</strong></p>' : ''}
       ${acquisition_flag ? '<p><strong>⚑ Acquisition flag</strong></p>' : ''}
       <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>`
    )
  }

  const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error('Sign in after claim failed:', signInError)
    return {
      ok: true,
      session: null,
      requiresLogin: true,
      segment,
      company: { id: company.id, name: company.name, city: company.city },
    }
  }

  return {
    ok: true,
    session: signInData.session,
    segment,
    company: { id: company.id, name: company.name, city: company.city },
  }
}

export function generateSlug(name: string, city?: string | null, state?: string | null): string {
  const base = [name, city, state]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60)
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${base}-${suffix}`.replace(/-+/g, '-').replace(/^-|-$/g, '')
}
