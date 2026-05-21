import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      service_type, city, state, contact_name, contact_email,
      contact_phone, business_name, building_type, building_size,
      frequency, message, selected_company_ids,
    } = body

    if (!service_type || !city || !state || !contact_name || !contact_email ||
      !contact_phone || !business_name || !Array.isArray(selected_company_ids) ||
      selected_company_ids.length < 1 || selected_company_ids.length > 3) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('contact_email', contact_email)
      .gte('created_at', sevenDaysAgo)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, duplicate: true })
    }

    const lead_type =
      selected_company_ids.length === 1 ? 'exclusive' :
      selected_company_ids.length === 2 ? 'semi-exclusive' : 'shared'

    const priceDisplay =
      selected_company_ids.length === 1 ? '$45' :
      selected_company_ids.length === 2 ? '$35' : '$25'

    const leadTypeLabel = lead_type.charAt(0).toUpperCase() + lead_type.slice(1)

    const { data: lead, error: insertError } = await supabaseAdmin
      .from('leads')
      .insert({
        service_type, city, state, contact_name, contact_email,
        contact_phone, business_name, building_type, building_size,
        frequency, message, selected_company_ids, status: 'open', lead_type,
      })
      .select()
      .single()

    if (insertError) throw insertError

    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id, name, email, city, state, do_not_email')
      .in('id', selected_company_ids)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    await Promise.allSettled([
      ...( companies || []).map(async (company: { id: string; name: string; email: string | null; city: string; state: string; do_not_email: boolean }) => {
        if (!company.email || company.do_not_email) return

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('subscription_status, leads_remaining')
          .eq('company_id', company.id)
          .single()

        if (user?.subscription_status === 'active' && (user.leads_remaining ?? 0) > 0) {
          const { data: remaining } = await supabaseAdmin.rpc('decrement_leads', { p_company_id: company.id })
          if (remaining === -1) {
            await sendEmail(
              company.email,
              'Your monthly lead allowance is used up',
              `<p>Hi ${company.name},</p><p>Your monthly lead allowance has been used. <a href="${siteUrl}/dashboard/subscription">Upgrade your plan</a> to receive more leads automatically.</p>`
            )
          } else {
            await sendEmail(
              company.email,
              `New ${leadTypeLabel} Lead Delivered — ${service_type} in ${city}`,
              `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                <h2>New Lead — Contact Details Included</h2>
                <p><strong>Service:</strong> ${service_type}</p>
                <p><strong>Location:</strong> ${city}, ${state}</p>
                <p><strong>Building:</strong> ${building_type}, ${building_size}</p>
                <p><strong>Frequency:</strong> ${frequency}</p>
                <hr/>
                <h3>Contact Information</h3>
                <p><strong>Name:</strong> ${contact_name}</p>
                <p><strong>Company:</strong> ${business_name}</p>
                <p><strong>Email:</strong> <a href="mailto:${contact_email}">${contact_email}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${contact_phone}">${contact_phone}</a></p>
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
                <p style="color:#666;font-size:12px">Delivered via your subscription. ${remaining} leads remaining this month.</p>
              </div>`
            )
          }
        } else {
          const unlockUrl = `${siteUrl}/unlock-lead/${lead.id}/${company.id}`
          await sendEmail(
            company.email,
            `New ${leadTypeLabel} Lead — ${service_type} in ${city}, ${state}`,
            `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
              <h2 style="color:#1B3A6B">You have a new lead on CommercialCleaningNearMe.com</h2>
              <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin:16px 0">
                <p><strong>Lead Type:</strong> ${leadTypeLabel} (sent to ${selected_company_ids.length} ${selected_company_ids.length === 1 ? 'company' : 'companies'})</p>
                <p><strong>Location:</strong> ${city}, ${state}</p>
                <p><strong>Service:</strong> ${service_type}</p>
                <p><strong>Building Type:</strong> ${building_type}</p>
                <p><strong>Building Size:</strong> ${building_size}</p>
                <p><strong>Frequency:</strong> ${frequency}</p>
              </div>
              <a href="${unlockUrl}" style="display:inline-block;background:#1B3A6B;color:white;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
                Unlock Full Contact Details — ${priceDisplay}
              </a>
              <p style="color:#999;font-size:12px">Lead expires in 72 hours.</p>
            </div>`
          )
        }
      }),

      sendEmail(
        process.env.ADMIN_EMAIL!,
        `New ${leadTypeLabel} Lead — ${service_type} in ${city} ${state}`,
        `<p><strong>Lead Type:</strong> ${leadTypeLabel}</p>
         <p><strong>Service:</strong> ${service_type}</p>
         <p><strong>Location:</strong> ${city}, ${state}</p>
         <p><strong>Contact:</strong> ${contact_name} | ${contact_email} | ${contact_phone}</p>
         <p><strong>Business:</strong> ${business_name}</p>
         <p><strong>Building:</strong> ${building_type}, ${building_size}</p>
         <p><strong>Frequency:</strong> ${frequency}</p>
         <p><strong>Companies notified:</strong> ${(companies || []).map((c: { name: string }) => c.name).join(', ')}</p>
         <p><strong>Time:</strong> ${new Date().toISOString()}</p>`
      ),

      sendEmail(
        contact_email,
        'Your quote request has been sent',
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#1B3A6B">Quote Request Sent</h2>
          <p>Hi ${contact_name.split(' ')[0]},</p>
          <p>Your request for <strong>${service_type}</strong> in <strong>${city}</strong> has been sent to <strong>${selected_company_ids.length}</strong> cleaning ${selected_company_ids.length === 1 ? 'company' : 'companies'}.</p>
          <p>They will contact you within 24 hours.</p>
          <p style="color:#666;font-size:13px">CommercialCleaningNearMe.com</p>
        </div>`
      ),
    ])

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (err) {
    console.error('Lead create error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
