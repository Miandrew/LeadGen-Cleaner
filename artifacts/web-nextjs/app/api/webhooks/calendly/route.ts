import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

function verifyCalendlySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const parts = signatureHeader.split(',')
  const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2)
  const v1 = parts.find((p) => p.startsWith('v1='))?.slice(3)
  if (!timestamp || !v1) return false

  const signed = `${timestamp}.${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(signed, 'utf8').digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.CALENDLY_WEBHOOK_SIGNING_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const rawBody = await req.text()
  const signatureHeader = req.headers.get('Calendly-Webhook-Signature') || ''

  if (!verifyCalendlySignature(rawBody, signatureHeader, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.event !== 'invitee.created') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const inviteeEmail = (payload.payload as Record<string, unknown> | undefined)?.email as string | undefined
  if (!inviteeEmail) {
    return NextResponse.json({ error: 'No invitee email' }, { status: 400 })
  }

  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('company_id')
    .eq('email', inviteeEmail)
    .single()

  if (!userRow?.company_id) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'user not in directory' })
  }

  const { error } = await supabaseAdmin
    .from('companies')
    .update({ verification_status: 'verified' })
    .eq('id', userRow.company_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
