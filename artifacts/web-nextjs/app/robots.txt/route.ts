import { NextResponse } from 'next/server'

export async function GET() {
  const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Sitemap: https://commercialcleaningnearme.com/sitemap.xml`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
