import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { US_STATES } from '@/lib/utils'

export async function GET() {
  const siteUrl = 'https://commercialcleaningnearme.com'

  const [{ data: companies }, { data: cities }] = await Promise.all([
    supabaseAdmin.from('companies').select('slug').eq('active', true).limit(10000),
    supabaseAdmin
      .from('companies')
      .select('city, state')
      .eq('active', true)
      .limit(1000),
  ])

  const uniqueCities = [...new Set((cities || []).map((c: { city: string; state: string }) => `${c.city}-${c.state}`).filter(Boolean))]
    .slice(0, 1000)
    .map((cs) => {
      const [city, state] = cs.split('-')
      return `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`
    })

  const statePages = US_STATES.map((s) =>
    `  <url><loc>${siteUrl}/commercial-cleaning/${s.name.toLowerCase().replace(/\s+/g, '-')}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
  )

  const companyPages = (companies || []).map((c: { slug: string }) =>
    `  <url><loc>${siteUrl}/company/${c.slug}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`
  )

  const cityPages = uniqueCities.map((cs) =>
    `  <url><loc>${siteUrl}/commercial-cleaning/${cs}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
  )

  const nearMePages = uniqueCities.map((cs) =>
    `  <url><loc>${siteUrl}/commercial-cleaning-near-me/${cs}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
  )

  const staticPages = ['', '/search', '/claim', '/login'].map((path) =>
    `  <url><loc>${siteUrl}${path}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...statePages, ...companyPages, ...cityPages, ...nearMePages].join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
