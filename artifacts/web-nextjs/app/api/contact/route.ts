import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json()
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    return NextResponse.json({ error: 'Contact not configured' }, { status: 500 })
  }
  await sendEmail(
    adminEmail,
    `Contact form — ${name}`,
    `<p><strong>From:</strong> ${name} (${email})</p>
     <p><strong>Message:</strong></p>
     <p>${message}</p>`
  )
  return NextResponse.json({ success: true })
}
