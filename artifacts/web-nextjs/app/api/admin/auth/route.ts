import { NextRequest, NextResponse } from 'next/server'

const attempts = new Map<string, { count: number; first: number }>()

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()

  const entry = attempts.get(ip)
  if (entry) {
    if (now - entry.first < 15 * 60 * 1000 && entry.count >= 5) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
    }
    if (now - entry.first >= 15 * 60 * 1000) {
      attempts.delete(ip)
    }
  }

  const { password } = await req.json()
  if (password === process.env.ADMIN_PASSWORD) {
    attempts.delete(ip)
    const res = NextResponse.json({ success: true })
    res.cookies.set('admin_auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  }

  const current = attempts.get(ip) || { count: 0, first: now }
  attempts.set(ip, { count: current.count + 1, first: current.first })
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}
