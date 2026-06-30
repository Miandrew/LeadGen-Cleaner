import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 })
    }

    const { lead_id } = await req.json()
    if (!lead_id) {
      return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 })
    }

    // Authenticate and resolve the company server-side — never trust a client company_id
    const cookieStore = cookies()
    const supabaseAuth = createSupabaseServerClient((name) => cookieStore.get(name)?.value)
    if (!supabaseAuth) return NextResponse.json({ error: 'Service not configured' }, { status: 503 })

    const { data: { session } } = await supabaseAuth.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('company_id, companies(name, city, state, email)')
      .eq('email', session.user.email!)
      .single()

    if (!user?.company_id) {
      return NextResponse.json({ error: 'No company associated with this account' }, { status: 403 })
    }

    const company_id = user.company_id

    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('id, service_type, building_type, city, state, contact_name, business_name, message, created_at')
      .eq('id', lead_id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const { error: insertError } = await supabaseAdmin
      .from('lead_requests')
      .insert({ lead_id, company_id, status: 'requested' })

    // Ignore duplicate request (unique constraint) — treat as success
    if (insertError && !insertError.message?.toLowerCase().includes('duplicate')) {
      console.error('Lead request insert error:', insertError)
      return NextResponse.json({ error: 'Could not record your request.' }, { status: 500 })
    }

    const company = Array.isArray(user.companies)
      ? user.companies[0]
      : (user.companies as { name: string; city: string; state: string; email: string } | null)

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      await sendEmail(
        adminEmail,
        `Lead requested by ${company?.name || 'a company'}`,
        `<div style="font-family:sans-serif;max-width:600px">
          <p>A company has requested a lead.</p>
          <h3>Company</h3>
          <p><strong>Name:</strong> ${company?.name || ''}<br/>
             <strong>Location:</strong> ${company?.city || ''}, ${company?.state || ''}<br/>
             <strong>Email:</strong> ${company?.email || ''}</p>
          <h3>Requested Lead</h3>
          <p><strong>Service:</strong> ${lead.service_type || ''}<br/>
             <strong>Building type:</strong> ${lead.building_type || ''}<br/>
             <strong>Location:</strong> ${lead.city || ''}, ${lead.state || ''}<br/>
             <strong>Contact name:</strong> ${lead.contact_name || ''}<br/>
             <strong>Business:</strong> ${lead.business_name || ''}</p>
          ${lead.message ? `<p><strong>Message:</strong> ${lead.message}</p>` : ''}
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>`
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Request lead error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
