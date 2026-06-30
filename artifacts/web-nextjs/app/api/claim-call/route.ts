import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'

// Best-effort in-memory IP rate limit to stop the unauthenticated admin-email
// endpoint from being scripted into a mail flood. Max 3 notifications per IP
// per 10 minutes. (Per-instance only — adequate for this low-volume endpoint.)
const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 3
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  return false
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    if (rateLimited(ip)) {
      // Silently succeed — never reveal rate-limit state, never block the UI
      return NextResponse.json({ success: true })
    }

    const body = await req.json().catch(() => ({}))
    const { city, state } = body

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      await sendEmail(
        adminEmail,
        `Someone is booking a setup call`,
        `<div style="font-family:sans-serif;max-width:600px">
          <p>A prospective company opened the "Book a Call" page to set up their listing.</p>
          ${city || state ? `<p><strong>Location:</strong> ${city || ''}${city && state ? ', ' : ''}${state || ''}</p>` : ''}
          <p>Expect a Calendly booking shortly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>`
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Claim-call notify error:', err)
    // Best-effort: never block the user
    return NextResponse.json({ success: true })
  }
}
