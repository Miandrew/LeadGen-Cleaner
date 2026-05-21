export const revalidate = 86400

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ServiceFilter from '@/components/ServiceFilter'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { SERVICE_TYPES, US_STATES, FULL_STATE_NAMES } from '@/lib/utils'

interface Props {
  params: { service: string }
}

function parseService(slug: string): { value: string; label: string } | null {
  const normalized = slug.toLowerCase()
  const match = SERVICE_TYPES.find(
    (s) => s.value === normalized || s.label.toLowerCase().replace(/\s+/g, '-') === normalized
  )
  return match ? { value: match.value, label: match.label } : null
}

function stateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export async function generateStaticParams() {
  return SERVICE_TYPES.map((s) => ({ service: s.value }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = parseService(params.service)
  if (!service) return { title: 'Service Not Found' }
  return {
    title: `${service.label} Companies by State & City | CCNearMe`,
    description: `Browse ${service.label.toLowerCase()} companies across the United States. Filter by state and city to find verified providers near you and request free quotes.`,
  }
}

export default async function ServiceHubPage({ params }: Props) {
  const service = parseService(params.service)
  if (!service) notFound()

  // Map: stateCode → { count, cities: Map<cityKey, {city,count}> }
  const stateMap = new Map<string, { count: number; cities: Map<string, { city: string; count: number }> }>()
  let totalCount = 0

  if (isSupabaseConfigured() && supabaseAdmin) {
    const pageSize = 1000
    let from = 0
    for (let i = 0; i < 200; i++) {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .select('state,city')
        .contains('services', [service.value])
        .eq('active', true)
        .range(from, from + pageSize - 1)
      if (error || !data || data.length === 0) break
      for (const row of data as { state: string | null; city: string | null }[]) {
        if (!row.state) continue
        const code = row.state.toUpperCase()
        totalCount++
        if (!stateMap.has(code)) stateMap.set(code, { count: 0, cities: new Map() })
        const stateEntry = stateMap.get(code)!
        stateEntry.count++
        if (row.city) {
          const cityKey = row.city.toLowerCase()
          const existing = stateEntry.cities.get(cityKey)
          if (existing) existing.count++
          else stateEntry.cities.set(cityKey, { city: row.city, count: 1 })
        }
      }
      if (data.length < pageSize) break
      from += pageSize
    }
  }

  // Build sorted states for the grid and filter
  const sortedStates = US_STATES
    .map((s) => {
      const entry = stateMap.get(s.code)
      return { code: s.code, name: s.name, slug: stateSlug(s.name), count: entry?.count || 0, cities: entry?.cities }
    })
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)

  // Serialize cities per state for the client filter component
  const filterStates = sortedStates.map((s) => ({
    code: s.code,
    name: s.name,
    slug: s.slug,
    count: s.count,
    cities: [...(s.cities?.values() || [])]
      .sort((a, b) => b.count - a.count)
      .map((c) => ({
        city: c.city,
        slug: `${c.city.toLowerCase().replace(/\s+/g, '-')}-${s.code.toLowerCase()}`,
        count: c.count,
      })),
  }))

  // Top cities nationwide (across all states), for the grid below
  const allCities = sortedStates.flatMap((s) =>
    [...(s.cities?.values() || [])].map((c) => ({
      city: c.city,
      state: s.code,
      stateName: s.name,
      count: c.count,
      slug: `${c.city.toLowerCase().replace(/\s+/g, '-')}-${s.code.toLowerCase()}`,
    }))
  )
  const topCities = allCities.sort((a, b) => b.count - a.count).slice(0, 32)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://commercialcleaningnearme.com' },
      { '@type': 'ListItem', position: 2, name: `${service.label} Companies`, item: `https://commercialcleaningnearme.com/service/${service.value}` },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-xs text-gray-400 mb-3">
              <Link href="/" className="hover:text-accent">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/browse-by-service" className="hover:text-accent">Browse by Service</Link>
              <span className="mx-2">/</span>
              <span>{service.label}</span>
            </nav>
            <h1 className="text-3xl font-bold text-navy mb-3">{service.label} Companies</h1>
            <p className="text-gray-500">
              {totalCount > 0
                ? `${totalCount.toLocaleString()} ${service.label.toLowerCase()} companies across ${sortedStates.length} states and ${allCities.length} cities. Filter by location below.`
                : `Browse ${service.label.toLowerCase()} companies across the United States.`}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar filter */}
            <aside className="lg:w-64 flex-shrink-0">
              <ServiceFilter serviceValue={service.value} states={filterStates} />

              {/* Other services */}
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Other Services</h3>
                <div className="flex flex-col gap-1.5">
                  {SERVICE_TYPES.filter((s) => s.value !== service.value).map((s) => (
                    <Link
                      key={s.value}
                      href={`/service/${s.value}`}
                      className="text-sm text-gray-600 hover:text-accent hover:underline"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">

              {/* States grid */}
              <div className="mb-10">
                <h2 className="text-lg font-bold text-navy mb-1">Browse by State</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Select a state to see all {service.label.toLowerCase()} companies and cities.
                </p>
                {sortedStates.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No companies found for this service yet.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                    {sortedStates.map((s) => (
                      <Link
                        key={s.code}
                        href={`/service/${service.value}/${s.slug}`}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-accent hover:shadow-sm transition-all"
                      >
                        <div className="font-semibold text-navy text-sm">{s.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {s.count.toLocaleString()} co · {s.cities?.size || 0} cities
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Top cities grid */}
              {topCities.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-navy mb-1">Top Cities for {service.label}</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    The most active markets for {service.label.toLowerCase()} services nationwide.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                    {topCities.map((c) => (
                      <Link
                        key={`${c.city}-${c.state}`}
                        href={`/service/${service.value}/${c.slug}`}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 hover:border-accent hover:text-accent transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-sm text-gray-800 font-medium truncate">{c.city}</div>
                          <div className="text-xs text-gray-400">{c.stateName}</div>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 bg-gray-50 rounded px-1.5 py-0.5">{c.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
