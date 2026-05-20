export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BrowseServiceFilter from '@/components/BrowseServiceFilter'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { SERVICE_TYPES, US_STATES, FULL_STATE_NAMES } from '@/lib/utils'

interface Props {
  searchParams: { state?: string | string[]; city?: string | string[] }
}

function pickStr(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined
  return Array.isArray(v) ? v[0] : v
}

function stateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function parseCitySlug(slug: string): { stateCode: string; citySlug: string } | null {
  const parts = slug.split('-')
  if (parts.length < 2) return null
  const stateCode = parts[parts.length - 1].toUpperCase()
  const citySlug = parts.slice(0, -1).join('-')
  return { stateCode, citySlug }
}

// Fetch all state+city pairs to build the location map for the filter
async function fetchLocations(): Promise<{ state: string | null; city: string | null }[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return []
  const pageSize = 1000
  let from = 0
  const out: { state: string | null; city: string | null }[] = []
  for (let i = 0; i < 100; i++) {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('state, city')
      .eq('active', true)
      .range(from, from + pageSize - 1)
    if (error || !data || data.length === 0) break
    for (const row of data as { state: string | null; city: string | null }[]) out.push(row)
    if (data.length < pageSize) break
    from += pageSize
  }
  return out
}

// Fetch service counts, optionally filtered by state and/or city
async function fetchCounts(stateCode?: string, cityName?: string): Promise<{ services: string[] | null }[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return []
  const pageSize = 1000
  let from = 0
  const out: { services: string[] | null }[] = []
  for (let i = 0; i < 100; i++) {
    let q = supabaseAdmin.from('companies').select('services').eq('active', true)
    if (stateCode) q = q.eq('state', stateCode)
    if (cityName) q = q.ilike('city', cityName)
    const { data, error } = await q.range(from, from + pageSize - 1)
    if (error || !data || data.length === 0) break
    for (const row of data as { services: string[] | null }[]) out.push(row)
    if (data.length < pageSize) break
    from += pageSize
  }
  return out
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const rawState = pickStr(searchParams.state)
  const rawCity = pickStr(searchParams.city)
  const stateObj = rawState ? US_STATES.find((s) => stateSlug(s.name) === rawState) : null
  const stateName = stateObj ? FULL_STATE_NAMES[stateObj.code] || stateObj.name : null

  if (rawCity && stateName) {
    const parsed = parseCitySlug(rawCity)
    const cityName = parsed ? parsed.citySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : rawCity
    return {
      title: `Commercial Cleaning Services in ${cityName}, ${stateName} | CCNearMe`,
      description: `Browse all commercial cleaning services in ${cityName}, ${stateName} — office cleaning, janitorial, carpet, window, medical and more. Find verified providers near you.`,
    }
  }
  if (stateName) {
    return {
      title: `Commercial Cleaning Services in ${stateName} | CCNearMe`,
      description: `Browse all commercial cleaning services in ${stateName} — office cleaning, janitorial, carpet, window, medical and more. Find verified providers and request free quotes.`,
    }
  }
  return {
    title: 'Browse by Service | CommercialCleaningNearMe.com',
    description:
      'Browse commercial cleaning companies by service category — office cleaning, janitorial, carpet, window, medical, industrial and more. Filter by state and city to find verified providers near you.',
  }
}

export default async function BrowseByServicePage({ searchParams }: Props) {
  const rawState = pickStr(searchParams.state)
  const rawCity = pickStr(searchParams.city)

  const stateObj = rawState ? US_STATES.find((s) => stateSlug(s.name) === rawState) : null
  const stateCode = stateObj?.code || null
  const stateName = stateCode ? FULL_STATE_NAMES[stateCode] || stateObj!.name : null

  // Resolve city from slug
  let cityDisplayName: string | null = null
  let cityNameForQuery: string | null = null
  if (rawCity && stateCode) {
    const parsed = parseCitySlug(rawCity)
    if (parsed) {
      cityNameForQuery = parsed.citySlug.replace(/-/g, ' ')
      cityDisplayName = cityNameForQuery.replace(/\b\w/g, (c) => c.toUpperCase())
    }
  }

  // Run both fetches in parallel
  const [locationRows, countRows] = await Promise.all([
    fetchLocations(),
    fetchCounts(stateCode || undefined, cityNameForQuery || undefined),
  ])

  // Build state→cities map from location data
  const locationMap = new Map<string, { name: string; slug: string; cities: Map<string, string> }>()
  for (const row of locationRows) {
    if (!row.state) continue
    const code = row.state.toUpperCase()
    const s = US_STATES.find((u) => u.code === code)
    if (!s) continue
    if (!locationMap.has(code)) locationMap.set(code, { name: s.name, slug: stateSlug(s.name), cities: new Map() })
    if (row.city) {
      const cityKey = row.city.toLowerCase()
      const entry = locationMap.get(code)!
      if (!entry.cities.has(cityKey)) {
        entry.cities.set(cityKey, row.city)
      }
    }
  }

  // Build filter states array (sorted alphabetically)
  const filterStates = US_STATES
    .filter((s) => locationMap.has(s.code))
    .map((s) => {
      const entry = locationMap.get(s.code)!
      const cities = [...entry.cities.entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([, cityName]) => ({
          city: cityName,
          slug: `${cityName.toLowerCase().replace(/\s+/g, '-')}-${s.code.toLowerCase()}`,
        }))
      return { code: s.code, name: s.name, slug: entry.slug, cities }
    })

  // Tally service counts
  const counts = new Map<string, number>()
  for (const { services } of countRows) {
    for (const svc of services || []) {
      counts.set(svc, (counts.get(svc) || 0) + 1)
    }
  }

  const totalCompanies = countRows.length
  const services = SERVICE_TYPES.map((s) => ({
    value: s.value,
    label: s.label,
    count: counts.get(s.value) || 0,
  })).sort((a, b) => b.count - a.count)

  const activeServicesCount = services.filter((s) => s.count > 0).length

  // Location label for display
  const locationLabel = cityDisplayName && stateName
    ? `${cityDisplayName}, ${stateName}`
    : stateName || null

  // Build JSON-LD breadcrumb
  const crumbs: { '@type': string; position: number; name: string; item: string }[] = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://commercialcleaningnearme.com' },
    { '@type': 'ListItem', position: 2, name: 'Browse by Service', item: 'https://commercialcleaningnearme.com/browse-by-service' },
  ]
  if (stateName && rawState) {
    crumbs.push({ '@type': 'ListItem', position: 3, name: stateName, item: `https://commercialcleaningnearme.com/browse-by-service?state=${rawState}` })
  }
  if (cityDisplayName && rawState && rawCity) {
    crumbs.push({ '@type': 'ListItem', position: 4, name: cityDisplayName, item: `https://commercialcleaningnearme.com/browse-by-service?state=${rawState}&city=${rawCity}` })
  }
  const jsonLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-10">
          <div className="max-w-5xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-xs text-gray-400 mb-3 flex flex-wrap items-center gap-x-2">
              <Link href="/" className="hover:text-accent">Home</Link>
              <span>/</span>
              <Link href="/browse-by-service" className="hover:text-accent">Browse by Service</Link>
              {stateName && rawState && (
                <>
                  <span>/</span>
                  <Link href={`/browse-by-service?state=${rawState}`} className="hover:text-accent">{stateName}</Link>
                </>
              )}
              {cityDisplayName && (
                <>
                  <span>/</span>
                  <span>{cityDisplayName}</span>
                </>
              )}
            </nav>

            <h1 className="text-3xl font-bold text-navy mb-3">
              {locationLabel
                ? `Commercial Cleaning Services in ${locationLabel}`
                : 'Browse by Service'}
            </h1>
            <p className="text-gray-500">
              {totalCompanies > 0
                ? locationLabel
                  ? `${totalCompanies.toLocaleString()} cleaning companies in ${locationLabel} across ${activeServicesCount} service categories.`
                  : `${totalCompanies.toLocaleString()} cleaning companies across ${activeServicesCount} service categories. Filter by state and city below.`
                : locationLabel
                  ? `No cleaning companies found in ${locationLabel} yet.`
                  : 'Browse cleaning services and filter by location.'}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Cascading State + City filter */}
          <BrowseServiceFilter
            states={filterStates}
            currentState={rawState}
            currentCity={rawCity}
          />

          {/* Quick state chips — top states alphabetically, first 16 */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href="/browse-by-service"
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                !stateCode ? 'bg-navy text-white' : 'bg-blue-50 text-accent hover:bg-blue-100'
              }`}
            >
              All States
            </Link>
            {US_STATES.filter((s) => locationMap.has(s.code)).slice(0, 16).map((s) => (
              <Link
                key={s.code}
                href={`/browse-by-service?state=${stateSlug(s.name)}`}
                className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                  stateCode === s.code && !rawCity
                    ? 'bg-navy text-white'
                    : 'bg-blue-50 text-accent hover:bg-blue-100'
                }`}
              >
                {s.name}
              </Link>
            ))}
          </div>

          {/* Service cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((s) => {
              // Determine destination URL
              let href: string
              if (rawCity && stateObj) {
                // City selected → go directly to city pSEO page for this service
                href = `/service/${s.value}/${rawCity}`
              } else if (stateCode && stateObj) {
                // State only → go to state page for this service
                href = `/service/${s.value}/${stateSlug(stateObj.name)}`
              } else {
                // No location → go to service hub
                href = `/service/${s.value}`
              }

              const hasCompanies = s.count > 0
              const subLabel = locationLabel
                ? hasCompanies
                  ? `${s.count.toLocaleString()} companies in ${locationLabel}`
                  : `No companies in ${locationLabel}`
                : `${s.count.toLocaleString()} companies nationwide`
              const cta = locationLabel
                ? hasCompanies
                  ? `View ${cityDisplayName || stateName} results →`
                  : 'No results'
                : 'Filter by state →'

              return (
                <Link
                  key={s.value}
                  href={href}
                  className={`bg-white border rounded-xl p-5 transition-all ${
                    locationLabel && !hasCompanies
                      ? 'border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-200'
                      : 'border-gray-200 hover:border-accent hover:shadow-sm'
                  }`}
                >
                  <div className="text-lg font-semibold text-navy">{s.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{subLabel}</div>
                  <div className="text-xs text-accent mt-3">{cta}</div>
                </Link>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/browse-by-state" className="text-accent hover:underline text-sm font-medium">
              Or browse by state →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
