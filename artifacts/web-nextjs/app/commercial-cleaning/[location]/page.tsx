export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PseoCompanyGrid from '@/components/PseoCompanyGrid'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { US_STATES, FULL_STATE_NAMES, SERVICE_TYPES, serviceLabel } from '@/lib/utils'

interface Props {
  params: { location: string }
  searchParams: { service?: string | string[] }
}

function pickService(raw: string | string[] | undefined): string | undefined {
  if (!raw) return undefined
  return Array.isArray(raw) ? raw[0] : raw
}

function isStatePage(location: string): boolean {
  const normalized = location.replace(/-/g, ' ')
  return US_STATES.some((s) => s.name.toLowerCase() === normalized.toLowerCase())
}

function stateNameToCode(name: string): string | undefined {
  const normalized = name.replace(/-/g, ' ')
  return US_STATES.find((s) => s.name.toLowerCase() === normalized.toLowerCase())?.code
}

function parseCityState(location: string): { city: string; state: string } {
  const parts = location.split('-')
  const state = parts[parts.length - 1].toUpperCase()
  const city = parts.slice(0, -1).join(' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return { city, state }
}

function parseService(slug?: string): { value: string; label: string } | null {
  if (!slug) return null
  const match = SERVICE_TYPES.find((s) => s.value === slug.toLowerCase())
  return match ? { value: match.value, label: match.label } : null
}

export async function generateStaticParams() {
  return US_STATES.map((s) => ({
    location: s.name.toLowerCase().replace(/\s+/g, '-'),
  }))
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { location } = params
  const service = parseService(pickService(searchParams.service))
  const serviceSuffix = service ? `${service.label} ` : ''

  if (isStatePage(location)) {
    const code = stateNameToCode(location)
    const name = code ? FULL_STATE_NAMES[code] : location.replace(/-/g, ' ')
    let count = 0
    if (isSupabaseConfigured() && supabaseAdmin) {
      let q = supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).eq('state', code || location.toUpperCase())
      if (service) q = q.contains('services', [service.value])
      const res = await q
      count = res.count || 0
    }
    return {
      title: `${serviceSuffix}Commercial Cleaning Companies in ${name} | CCNearMe`,
      description: `Find ${count || 'top'} ${service?.label.toLowerCase() || 'commercial cleaning'} companies in ${name}. Compare services, read reviews, and request free quotes.`,
    }
  } else {
    const { city, state } = parseCityState(location)
    const stateName = FULL_STATE_NAMES[state] || state
    let count = 0
    if (isSupabaseConfigured() && supabaseAdmin) {
      let q = supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).ilike('city', city).eq('state', state)
      if (service) q = q.contains('services', [service.value])
      const res = await q
      count = res.count || 0
    }
    return {
      title: `${serviceSuffix}Commercial Cleaning Companies in ${city}, ${stateName} | CCNearMe`,
      description: `Find ${count || 'top'} ${service?.label.toLowerCase() || 'commercial cleaning'} companies in ${city}, ${stateName}. Compare services, read real reviews, and request free quotes.`,
    }
  }
}

function ServiceFilter({ basePath, selected }: { basePath: string; selected: string }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-700 mb-3">Filter by Service:</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={basePath}
          className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
            !selected ? 'bg-navy text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-accent hover:text-accent'
          }`}
        >
          All Services
        </Link>
        {SERVICE_TYPES.map((s) => (
          <Link
            key={s.value}
            href={`${basePath}?service=${s.value}`}
            className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
              selected === s.value
                ? 'bg-navy text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:border-accent hover:text-accent'
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function CommercialCleaningLocationPage({ params, searchParams }: Props) {
  const { location } = params
  const service = parseService(pickService(searchParams.service))

  if (isStatePage(location)) {
    const code = stateNameToCode(location)
    if (!code) notFound()
    const stateName = FULL_STATE_NAMES[code]

    let companies: unknown[] = []
    let count = 0
    let cities: string[] = []

    if (isSupabaseConfigured() && supabaseAdmin) {
      let companiesQ = supabaseAdmin.from('companies').select('*', { count: 'exact' }).eq('state', code).eq('active', true)
      let citiesQ = supabaseAdmin.from('companies').select('city').eq('state', code).eq('active', true)
      if (service) {
        companiesQ = companiesQ.contains('services', [service.value])
        citiesQ = citiesQ.contains('services', [service.value])
      }
      const [companiesRes, citiesRes] = await Promise.all([
        companiesQ.order('rating', { ascending: false }).limit(20),
        citiesQ.limit(200),
      ])
      companies = companiesRes.data || []
      count = companiesRes.count || 0
      cities = [...new Set((citiesRes.data || []).map((c: { city: string }) => c.city).filter(Boolean))].slice(0, 20) as string[]
    }

    const headline = service
      ? `${service.label} Companies in ${stateName}`
      : `Commercial Cleaning Companies in ${stateName}`

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://commercialcleaningnearme.com' },
        { '@type': 'ListItem', position: 2, name: `Commercial Cleaning in ${stateName}`, item: `https://commercialcleaningnearme.com/commercial-cleaning/${location}` },
        ...(service
          ? [{ '@type': 'ListItem', position: 3, name: `${service.label} in ${stateName}`, item: `https://commercialcleaningnearme.com/commercial-cleaning/${location}?service=${service.value}` }]
          : []),
      ],
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <main className="flex-1 bg-gray-50">
          <div className="bg-white border-b border-gray-200 py-10">
            <div className="max-w-5xl mx-auto px-4">
              <nav className="text-xs text-gray-400 mb-3">
                <Link href="/" className="hover:text-accent">Home</Link> /{' '}
                <Link href={`/commercial-cleaning/${location}`} className="hover:text-accent">{stateName}</Link>
                {service && <> / {service.label}</>}
              </nav>
              <h1 className="text-3xl font-bold text-navy mb-3">{headline}</h1>
              <p className="text-gray-500">
                {count > 0
                  ? `${count.toLocaleString()} ${service ? service.label.toLowerCase() + ' ' : 'verified commercial cleaning '}companies. `
                  : `Top ${service ? service.label.toLowerCase() + ' ' : 'commercial cleaning '}companies. `}
                Compare, review, and request free quotes.
              </p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 py-8">
            <ServiceFilter basePath={`/commercial-cleaning/${location}`} selected={service?.value || ''} />
            {cities.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Browse by City:</p>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => {
                    const slug = `${city.toLowerCase().replace(/\s+/g, '-')}-${code.toLowerCase()}`
                    const cityHref = service
                      ? `/commercial-cleaning/${slug}?service=${service.value}`
                      : `/commercial-cleaning/${slug}`
                    return (
                      <Link key={city} href={cityHref} className="text-xs bg-white border border-gray-300 hover:border-accent hover:text-accent text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                        {city}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
            {companies.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
                <p className="text-gray-500">
                  No {service ? service.label.toLowerCase() + ' ' : ''}companies found in {stateName}.
                </p>
                {service && (
                  <Link href={`/commercial-cleaning/${location}`} className="text-accent hover:underline mt-3 inline-block">
                    Clear service filter →
                  </Link>
                )}
              </div>
            ) : (
              <PseoCompanyGrid companies={companies as Parameters<typeof PseoCompanyGrid>[0]['companies']} />
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  } else {
    const { city, state } = parseCityState(location)
    const stateName = FULL_STATE_NAMES[state] || state

    let companies: unknown[] = []
    let count = 0
    let otherCities: string[] = []

    if (isSupabaseConfigured() && supabaseAdmin) {
      let companiesQ = supabaseAdmin.from('companies').select('*', { count: 'exact' }).ilike('city', city).eq('state', state).eq('active', true)
      let relatedQ = supabaseAdmin.from('companies').select('city').eq('state', state).eq('active', true)
      if (service) {
        companiesQ = companiesQ.contains('services', [service.value])
        relatedQ = relatedQ.contains('services', [service.value])
      }
      const [companiesRes, relatedRes] = await Promise.all([
        companiesQ.order('rating', { ascending: false }).limit(20),
        relatedQ.limit(200),
      ])
      companies = companiesRes.data || []
      count = companiesRes.count || 0
      otherCities = [...new Set((relatedRes.data || []).map((c: { city: string }) => c.city).filter((c) => c.toLowerCase() !== city.toLowerCase()))].slice(0, 10) as string[]
    }

    const headline = service
      ? `${service.label} Companies in ${city}, ${stateName}`
      : `Commercial Cleaning Companies in ${city}, ${stateName}`

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://commercialcleaningnearme.com' },
        { '@type': 'ListItem', position: 2, name: stateName, item: `https://commercialcleaningnearme.com/commercial-cleaning/${stateName.toLowerCase().replace(/\s+/g, '-')}` },
        { '@type': 'ListItem', position: 3, name: city, item: `https://commercialcleaningnearme.com/commercial-cleaning/${location}` },
        ...(service
          ? [{ '@type': 'ListItem', position: 4, name: `${service.label} in ${city}`, item: `https://commercialcleaningnearme.com/commercial-cleaning/${location}?service=${service.value}` }]
          : []),
      ],
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <main className="flex-1 bg-gray-50">
          <div className="bg-white border-b border-gray-200 py-10">
            <div className="max-w-5xl mx-auto px-4">
              <nav className="text-xs text-gray-400 mb-3">
                <Link href="/" className="hover:text-accent">Home</Link> /{' '}
                <Link href={`/commercial-cleaning/${stateName.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-accent">{stateName}</Link> /{' '}
                <Link href={`/commercial-cleaning/${location}`} className="hover:text-accent">{city}</Link>
                {service && <> / {service.label}</>}
              </nav>
              <h1 className="text-3xl font-bold text-navy mb-3">{headline}</h1>
              <p className="text-gray-500">
                {count > 0
                  ? `${count.toLocaleString()} ${service ? service.label.toLowerCase() + ' ' : 'cleaning '}companies found. `
                  : `${service ? service.label + ' ' : 'Commercial cleaning '}companies serving this area. `}
                Compare, review, and get free quotes.
              </p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 py-8">
            <ServiceFilter basePath={`/commercial-cleaning/${location}`} selected={service?.value || ''} />
            {companies.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
                <p className="text-gray-500">
                  No {service ? service.label.toLowerCase() + ' ' : ''}companies found in {city}.
                </p>
                {service && (
                  <Link href={`/commercial-cleaning/${location}`} className="text-accent hover:underline mt-3 inline-block">
                    Clear service filter →
                  </Link>
                )}
              </div>
            ) : (
              <PseoCompanyGrid companies={companies as Parameters<typeof PseoCompanyGrid>[0]['companies']} />
            )}
            {otherCities.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-bold text-navy mb-3">Related Cities in {stateName}</h2>
                <div className="flex flex-wrap gap-2">
                  {otherCities.map((c) => {
                    const slug = `${c.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`
                    const cityHref = service
                      ? `/commercial-cleaning/${slug}?service=${service.value}`
                      : `/commercial-cleaning/${slug}`
                    return (
                      <Link key={c} href={cityHref} className="text-xs bg-white border border-gray-300 hover:border-accent hover:text-accent text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                        {c}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }
}
