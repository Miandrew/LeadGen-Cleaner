export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PseoCompanyGrid from '@/components/PseoCompanyGrid'
import LocationFilters from '@/components/LocationFilters'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { US_STATES, FULL_STATE_NAMES, SERVICE_TYPES } from '@/lib/utils'

interface Props {
  params: { location: string }
  searchParams: {
    service?: string | string[]
    rating?: string | string[]
    verified?: string | string[]
  }
}

function pickStr(raw: string | string[] | undefined): string | undefined {
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

function parseRating(raw?: string): number {
  if (!raw) return 1
  const n = parseFloat(raw)
  if (Number.isNaN(n)) return 1
  return Math.max(1, Math.min(5, n))
}

export async function generateStaticParams() {
  return US_STATES.map((s) => ({
    location: s.name.toLowerCase().replace(/\s+/g, '-'),
  }))
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { location } = params
  const service = parseService(pickStr(searchParams.service))
  const serviceSuffix = service ? `${service.label} ` : ''

  if (isStatePage(location)) {
    const code = stateNameToCode(location)
    const name = code ? FULL_STATE_NAMES[code] : location.replace(/-/g, ' ')
    return {
      title: `${serviceSuffix}Commercial Cleaning Companies in ${name} | CCNearMe`,
      description: `Find ${service?.label.toLowerCase() || 'commercial cleaning'} companies in ${name}. Compare services, read reviews, and request free quotes.`,
    }
  } else {
    const { city, state } = parseCityState(location)
    const stateName = FULL_STATE_NAMES[state] || state
    return {
      title: `${serviceSuffix}Commercial Cleaning Companies in ${city}, ${stateName} | CCNearMe`,
      description: `Find ${service?.label.toLowerCase() || 'commercial cleaning'} companies in ${city}, ${stateName}. Compare services, read real reviews, and request free quotes.`,
    }
  }
}

export default async function CommercialCleaningLocationPage({ params, searchParams }: Props) {
  const { location } = params
  const service = parseService(pickStr(searchParams.service))
  const rating = parseRating(pickStr(searchParams.rating))
  const verified = pickStr(searchParams.verified) === 'true'

  const isState = isStatePage(location)
  const stateCode = isState ? stateNameToCode(location) : parseCityState(location).state
  if (!stateCode) notFound()
  const stateName = FULL_STATE_NAMES[stateCode] || stateCode
  const city = isState ? '' : parseCityState(location).city

  const activeFilters = !!(service || rating > 1 || verified)

  let companies: unknown[] = []
  let count = 0
  let chips: string[] = []

  if (isSupabaseConfigured() && supabaseAdmin) {
    let q = supabaseAdmin
      .from('companies')
      .select('*', { count: 'exact' })
      .eq('state', stateCode)
      .eq('active', true)
    if (!isState && city) q = q.ilike('city', city)
    if (service) q = q.contains('services', [service.value])
    if (rating > 1) q = q.gte('rating', rating)
    if (verified) q = q.eq('claimed', true)
    const res = await q.order('rating', { ascending: false, nullsFirst: false }).limit(30)
    companies = res.data || []
    count = res.count || 0

    // Chips: cities for state page, related cities for city page
    let chipsQ = supabaseAdmin
      .from('companies')
      .select('city')
      .eq('state', stateCode)
      .eq('active', true)
    if (service) chipsQ = chipsQ.contains('services', [service.value])
    if (rating > 1) chipsQ = chipsQ.gte('rating', rating)
    if (verified) chipsQ = chipsQ.eq('claimed', true)
    const chipsRes = await chipsQ.limit(300)
    const allCities = [
      ...new Set(
        (chipsRes.data || [])
          .map((c: { city: string }) => c.city)
          .filter(Boolean) as string[]
      ),
    ]
    if (isState) {
      chips = allCities.slice(0, 20)
    } else {
      chips = allCities.filter((c) => c.toLowerCase() !== city.toLowerCase()).slice(0, 10)
    }
  }

  const baseLocation = isState ? location : location
  const headline = service
    ? isState
      ? `${service.label} Companies in ${stateName}`
      : `${service.label} Companies in ${city}, ${stateName}`
    : isState
      ? `Commercial Cleaning Companies in ${stateName}`
      : `Commercial Cleaning Companies in ${city}, ${stateName}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://commercialcleaningnearme.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: stateName,
        item: `https://commercialcleaningnearme.com/commercial-cleaning/${stateName.toLowerCase().replace(/\s+/g, '-')}`,
      },
      ...(!isState
        ? [{
            '@type': 'ListItem',
            position: 3,
            name: city,
            item: `https://commercialcleaningnearme.com/commercial-cleaning/${location}`,
          }]
        : []),
      ...(service
        ? [{
            '@type': 'ListItem',
            position: isState ? 3 : 4,
            name: `${service.label} in ${city || stateName}`,
            item: `https://commercialcleaningnearme.com/commercial-cleaning/${location}?service=${service.value}`,
          }]
        : []),
    ],
  }

  // Build "active filter" pill labels
  const activePills: { label: string; clearHref: string }[] = []
  const buildClearHref = (drop: 'service' | 'rating' | 'verified') => {
    const params = new URLSearchParams()
    if (drop !== 'service' && service) params.set('service', service.value)
    if (drop !== 'rating' && rating > 1) params.set('rating', String(rating))
    if (drop !== 'verified' && verified) params.set('verified', 'true')
    const qs = params.toString()
    return `/commercial-cleaning/${location}${qs ? `?${qs}` : ''}`
  }
  if (service) activePills.push({ label: service.label, clearHref: buildClearHref('service') })
  if (rating > 1) activePills.push({ label: `${rating}+ stars`, clearHref: buildClearHref('rating') })
  if (verified) activePills.push({ label: 'Verified only', clearHref: buildClearHref('verified') })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-xs text-gray-400 mb-3">
              <Link href="/" className="hover:text-accent">Home</Link> /{' '}
              <Link
                href={`/commercial-cleaning/${stateName.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-accent"
              >
                {stateName}
              </Link>
              {!isState && (
                <>
                  {' '}/{' '}
                  <Link href={`/commercial-cleaning/${location}`} className="hover:text-accent">
                    {city}
                  </Link>
                </>
              )}
              {service && <> / {service.label}</>}
            </nav>
            <h1 className="text-3xl font-bold text-navy mb-3">{headline}</h1>
            <p className="text-gray-500">
              {count > 0
                ? `${count.toLocaleString()} ${service ? service.label.toLowerCase() + ' ' : 'cleaning '}companies${activeFilters ? ' match your filters' : ''}. `
                : `No matching companies. `}
              Compare, review, and request free quotes.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-60 flex-shrink-0">
              <LocationFilters
                currentLocation={location}
                currentStateCode={stateCode}
                initialService={service?.value || ''}
                initialRating={String(rating)}
                initialVerified={verified}
                currentCity={city || undefined}
              />
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {activePills.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Active filters:</span>
                  {activePills.map((p) => (
                    <Link
                      key={p.label}
                      href={p.clearHref}
                      className="text-xs bg-blue-50 text-accent px-3 py-1 rounded-full hover:bg-blue-100 inline-flex items-center gap-1"
                    >
                      {p.label}
                      <span aria-hidden>×</span>
                    </Link>
                  ))}
                  <Link
                    href={`/commercial-cleaning/${location}`}
                    className="text-xs text-gray-500 hover:underline ml-1"
                  >
                    Clear all
                  </Link>
                </div>
              )}

              {chips.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {isState ? 'Browse by City:' : `Related Cities in ${stateName}:`}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((c) => {
                      const slug = `${c.toLowerCase().replace(/\s+/g, '-')}-${stateCode.toLowerCase()}`
                      const qs = new URLSearchParams()
                      if (service) qs.set('service', service.value)
                      if (rating > 1) qs.set('rating', String(rating))
                      if (verified) qs.set('verified', 'true')
                      const cityHref = `/commercial-cleaning/${slug}${qs.toString() ? `?${qs.toString()}` : ''}`
                      return (
                        <Link
                          key={c}
                          href={cityHref}
                          className="text-xs bg-white border border-gray-300 hover:border-accent hover:text-accent text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {c}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {companies.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
                  <p className="text-gray-500">
                    No companies found{service ? ` for ${service.label}` : ''} in {city || stateName}.
                  </p>
                  {activeFilters && (
                    <Link
                      href={`/commercial-cleaning/${location}`}
                      className="text-accent hover:underline mt-3 inline-block"
                    >
                      Clear all filters →
                    </Link>
                  )}
                </div>
              ) : (
                <PseoCompanyGrid
                  companies={companies as Parameters<typeof PseoCompanyGrid>[0]['companies']}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
