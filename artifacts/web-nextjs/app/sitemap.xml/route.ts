import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { US_STATES, SERVICE_TYPES } from '@/lib/utils'

export const revalidate = 86400

export async function GET() {
  const site = 'https://commercialcleaningnearme.com'

  const [{ data: companies }, { data: locationData }] = await Promise.all([
    supabaseAdmin.from('companies').select('slug').eq('active', true).limit(10000),
    supabaseAdmin.from('companies').select('city, state').eq('active', true).limit(2000),
  ])

  const citySet = new Set<string>()
  for (const c of (locationData || []) as { city: string | null; state: string | null }[]) {
    if (c.city && c.state) {
      citySet.add(`${c.city.toLowerCase().replace(/\s+/g, '-')}-${c.state.toLowerCase()}`)
    }
  }
  const citySlugs = Array.from(citySet).slice(0, 1000)

  const urls: string[] = []
  const url = (loc: string, freq: string, pri: string) =>
    `  <url><loc>${site}${loc}</loc><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`

  urls.push(url('/', 'daily', '1.0'))
  urls.push(url('/search', 'weekly', '0.9'))
  urls.push(url('/claim', 'weekly', '0.8'))
  urls.push(url('/browse-by-service', 'weekly', '0.8'))
  urls.push(url('/browse-by-state', 'weekly', '0.8'))
  urls.push(url('/for-cleaning-companies', 'weekly', '0.7'))

  for (const c of (companies || []) as { slug: string | null }[]) {
    if (c.slug) urls.push(url(`/company/${c.slug}`, 'monthly', '0.6'))
  }

  for (const s of US_STATES) {
    const slug = s.name.toLowerCase().replace(/\s+/g, '-')
    urls.push(url(`/commercial-cleaning/${slug}`, 'weekly', '0.8'))
    urls.push(url(`/state/${slug}`, 'weekly', '0.7'))
  }

  for (const slug of citySlugs) {
    urls.push(url(`/commercial-cleaning/${slug}`, 'weekly', '0.7'))
    urls.push(url(`/commercial-cleaning-near-me/${slug}`, 'weekly', '0.7'))
  }

  for (const svc of SERVICE_TYPES) {
    urls.push(url(`/service/${svc.value}`, 'weekly', '0.8'))
    for (const s of US_STATES) {
      const stateSlug = s.name.toLowerCase().replace(/\s+/g, '-')
      urls.push(url(`/service/${svc.value}/${stateSlug}`, 'weekly', '0.7'))
    }
    for (const slug of citySlugs.slice(0, 300)) {
      urls.push(url(`/service/${svc.value}/${slug}`, 'weekly', '0.6'))
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
