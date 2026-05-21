import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_id, email, full_name, segment, action, booking_time, calendly_url, notes } = body

    if (!action || !['booked', 'declined', 'skipped'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { error: insertErr } = await supabaseAdmin.from('call_routing_responses').insert({
      company_id: company_id || null,
      email: email || null,
      full_name: full_name || null,
      segment: segment || null,
      action,
      booking_time: booking_time || null,
      calendly_url: calendly_url || null,
      notes: notes || null,
    })
    if (insertErr) {
      console.error('routing insert failed:', insertErr)
      return NextResponse.json({ error: 'Could not record response' }, { status: 500 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      const subject = action === 'booked'
        ? `Strategy call booked — ${full_name || email}`
        : `Claim routing — ${action.toUpperCase()} — ${full_name || email}`
      await sendEmail(
        adminEmail,
        subject,
        `<p><strong>Action:</strong> ${action}</p>
         <p><strong>Name:</strong> ${full_name || '—'}</p>
         <p><strong>Email:</strong> ${email || '—'}</p>
         <p><strong>Segment:</strong> ${segment || '—'}</p>
         ${booking_time ? `<p><strong>Booking:</strong> ${booking_time}</p>` : ''}
         ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
         <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>`
      ).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Routing error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
