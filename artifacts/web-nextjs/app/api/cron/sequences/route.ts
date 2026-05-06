import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'
import { createHmac } from 'crypto'

function makeUnsubscribeUrl(companyId: string): string {
  const token = createHmac('sha256', process.env.ADMIN_PASSWORD || '').update(companyId).digest('hex')
  return `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?company=${companyId}&token=${token}`
}

const unsubscribeFooter = (companyId: string) =>
  `<p style="color:#999;font-size:11px;margin-top:24px">
    <a href="${makeUnsubscribeUrl(companyId)}" style="color:#999">Unsubscribe</a> from all emails.
  </p>`

export async function GET() {
  const now = new Date()

  const hot48hStart = new Date(now.getTime() - 49 * 60 * 60 * 1000).toISOString()
  const hot48hEnd = new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString()

  const { data: hot48 } = await supabaseAdmin
    .from('company_onboarding')
    .select('company_id, companies(id, name, city, state, email, do_not_email)')
    .eq('segment', 'HOT')
    .eq('contacted', false)
    .gte('created_at', hot48hStart)
    .lte('created_at', hot48hEnd)

  for (const row of hot48 || []) {
    const company = Array.isArray(row.companies) ? row.companies[0] : row.companies as { id: string; name: string; city: string; state: string; email: string; do_not_email: boolean } | null
    if (!company || !company.email || company.do_not_email) continue

    const { data: seq } = await supabaseAdmin
      .from('email_sequences')
      .select('id')
      .eq('company_id', row.company_id)
      .eq('sequence_name', 'hot_48h')
      .single()
    if (seq) continue

    const { count } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .ilike('city', `%${company.city}%`)
      .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const firstName = company.name.split(' ')[0]
    await sendEmail(
      company.email,
      `Quick question about leads in ${company.city}`,
      `<p>Hi ${firstName},</p>
       <p>I noticed you claimed your listing a couple of days ago and wanted to personally check in. We had ${count || 0} new leads come through in ${company.city} this week.</p>
       <p>I think there might be a good fit here. Have you had a chance to look at the leads in your dashboard? Reply to this email and I'll walk you through it.</p>
       <p>Best,<br/>The CCNearMe Team</p>
       ${unsubscribeFooter(company.id)}`
    )

    await supabaseAdmin.from('email_sequences').insert({ company_id: row.company_id, sequence_name: 'hot_48h' })
  }

  const warm7dStart = new Date(now.getTime() - 7.5 * 24 * 60 * 60 * 1000).toISOString()
  const warm7dEnd = new Date(now.getTime() - 6.5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: warm7 } = await supabaseAdmin
    .from('company_onboarding')
    .select('company_id, companies(id, name, city, state, email, do_not_email)')
    .eq('segment', 'WARM')
    .gte('created_at', warm7dStart)
    .lte('created_at', warm7dEnd)

  for (const row of warm7 || []) {
    const company = Array.isArray(row.companies) ? row.companies[0] : row.companies as { id: string; name: string; city: string; state: string; email: string; do_not_email: boolean } | null
    if (!company || !company.email || company.do_not_email) continue

    const { data: purchase } = await supabaseAdmin
      .from('lead_purchases')
      .select('id')
      .eq('company_id', row.company_id)
      .single()
    if (purchase) continue

    const { data: seq } = await supabaseAdmin
      .from('email_sequences')
      .select('id')
      .eq('company_id', row.company_id)
      .eq('sequence_name', 'warm_7d')
      .single()
    if (seq) continue

    const { count } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .ilike('city', `%${company.city}%`)
      .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    await sendEmail(
      company.email,
      `${count || 0} leads in ${company.city} this week — ${company.name}`,
      `<div style="font-family:sans-serif;max-width:600px">
        <p>Hi ${company.name.split(' ')[0]},</p>
        <p>There were ${count || 0} new leads in ${company.city} this week. Each lead is available to unlock for $35.</p>
        <a href="${siteUrl}/dashboard/leads" style="display:inline-block;background:#1B3A6B;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">View Available Leads</a>
        ${unsubscribeFooter(company.id)}
      </div>`
    )

    await supabaseAdmin.from('email_sequences').insert({ company_id: row.company_id, sequence_name: 'warm_7d' })
  }

  const all14dStart = new Date(now.getTime() - 14.5 * 24 * 60 * 60 * 1000).toISOString()
  const all14dEnd = new Date(now.getTime() - 13.5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: all14 } = await supabaseAdmin
    .from('companies')
    .select('id, name, city, state, email, do_not_email')
    .eq('claimed', true)
    .gte('created_at', all14dStart)
    .lte('created_at', all14dEnd)

  for (const company of all14 || []) {
    if (!company.email || company.do_not_email) continue
    const { data: purchase } = await supabaseAdmin.from('lead_purchases').select('id').eq('company_id', company.id).single()
    if (purchase) continue
    const { data: seq } = await supabaseAdmin.from('email_sequences').select('id').eq('company_id', company.id).eq('sequence_name', 'all_14d').single()
    if (seq) continue

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    await sendEmail(
      company.email,
      `How your listing is performing — ${company.name}`,
      `<div style="font-family:sans-serif;max-width:600px">
        <p>Hi ${company.name.split(' ')[0]},</p>
        <p>Your listing on CommercialCleaningNearMe.com has been live for two weeks. Facility managers in ${company.city} are actively searching for cleaning services.</p>
        <p>Check the leads available in your area and start connecting with potential clients.</p>
        <a href="${siteUrl}/dashboard/leads" style="display:inline-block;background:#1B3A6B;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">View Available Leads</a>
        ${unsubscribeFooter(company.id)}
      </div>`
    )
    await supabaseAdmin.from('email_sequences').insert({ company_id: company.id, sequence_name: 'all_14d' })
  }

  const all30dStart = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString()
  const all30dEnd = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString()

  const { data: all30 } = await supabaseAdmin
    .from('companies')
    .select('id, name, city, email, do_not_email')
    .eq('claimed', true)
    .gte('created_at', all30dStart)
    .lte('created_at', all30dEnd)

  for (const company of all30 || []) {
    if (!company.email || company.do_not_email) continue
    const { data: purchase } = await supabaseAdmin.from('lead_purchases').select('id').eq('company_id', company.id).single()
    if (purchase) continue
    const { data: seq } = await supabaseAdmin.from('email_sequences').select('id').eq('company_id', company.id).eq('sequence_name', 'all_30d').single()
    if (seq) continue

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    await sendEmail(
      company.email,
      `Still here when you're ready — ${company.name}`,
      `<div style="font-family:sans-serif;max-width:600px">
        <p>Hi ${company.name.split(' ')[0]},</p>
        <p>Just a quick note — your listing is still live and facility managers in ${company.city} are still searching. Whenever you're ready to connect with your first lead, we're here.</p>
        <a href="${siteUrl}/dashboard/leads" style="display:inline-block;background:#1B3A6B;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">See Available Leads</a>
        ${unsubscribeFooter(company.id)}
      </div>`
    )
    await supabaseAdmin.from('email_sequences').insert({ company_id: company.id, sequence_name: 'all_30d' })
  }

  return NextResponse.json({ success: true })
}
