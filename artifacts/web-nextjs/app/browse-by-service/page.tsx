export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { SERVICE_TYPES, US_STATES, FULL_STATE_NAMES, serviceLabel } from '@/lib/utils'

interface Props {
  searchParams: { state?: string | string[] }
}

function pickStr(raw: string | string[] | undefined): string | undefined {
  if (!raw) return undefined
  return Array.isArray(raw) ? raw[0] : raw
}

function stateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

async function fetchAll(stateFilter?: string): Promise<{ services: string[] | null }[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return []
  const pageSize = 1000
  let from = 0
  const out: { services: string[] | null }[] = []
  for (let i = 0; i < 100; i++) {
    let q = supabaseAdmin
      .from('companies')
      .select('services')
      .eq('active', true)
    if (stateFilter) q = q.eq('state', stateFilter.toUpperCase())
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
  const stateObj = rawState ? US_STATES.find((s) => s.name.toLowerCase().replace(/\s+/g, '-') === rawState.toLowerCase()) : null
  if (stateObj) {
    const stateName = FULL_STATE_NAMES[stateObj.code] || stateObj.name
    return {
      title: `Commercial Cleaning Services in ${stateName} | CCNearMe`,
      description: `Browse all commercial cleaning services available in ${stateName} — office cleaning, janitorial, carpet, window, medical and more. Find verified providers and request free quotes.`,
    }
  }
  return {
    title: 'Browse by Service | CommercialCleaningNearMe.com',
    description:
      'Browse commercial cleaning companies by service category — office cleaning, janitorial, carpet, window, medical, industrial and more. Find verified providers and request free quotes.',
  }
}

export default async function BrowseByServicePage({ searchParams }: Props) {
  const rawState = pickStr(searchParams.state)
  // Resolve state slug → state object
  const stateObj = rawState
    ? US_STATES.find((s) => s.name.toLowerCase().replace(/\s+/g, '-') === rawState.toLowerCase())
    : null
  const stateCode = stateObj?.code || null
  const stateName = stateCode ? FULL_STATE_NAMES[stateCode] || stateObj!.name : null

  const rows = await fetchAll(stateCode || undefined)
  const totalCompanies = rows.length

  const counts = new Map<string, number>()
  for (const { services } of rows) {
    for (const svc of services || []) {
      counts.set(svc, (counts.get(svc) || 0) + 1)
    }
  }

  const services = SERVICE_TYPES.map((s) => ({
    value: s.value,
    label: s.label,
    count: counts.get(s.value) || 0,
  })).sort((a, b) => b.count - a.count)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://commercialcleaningnearme.com' },
      { '@type': 'ListItem', position: 2, name: 'Browse by Service', item: 'https://commercialcleaningnearme.com/browse-by-service' },
      ...(stateName ? [{ '@type': 'ListItem', position: 3, name: stateName, item: `https://commercialcleaningnearme.com/browse-by-service?state=${rawState}` }] : []),
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
              <Link href="/" className="hover:text-accent">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/browse-by-service" className="hover:text-accent">Browse by Service</Link>
              {stateName && (
                <>
                  <span className="mx-2">/</span>
                  <span>{stateName}</span>
                </>
              )}
            </nav>
            <h1 className="text-3xl font-bold text-navy mb-3">
              {stateName ? `Commercial Cleaning Services in ${stateName}` : 'Browse by Service'}
            </h1>
            <p className="text-gray-500">
              {totalCompanies > 0
                ? stateName
                  ? `${totalCompanies.toLocaleString()} cleaning companies in ${stateName} across ${services.filter((s) => s.count > 0).length} service categories.`
                  : `${totalCompanies.toLocaleString()} cleaning companies across ${services.filter((s) => s.count > 0).length} service categories. Pick a state below to filter.`
                : stateName
                  ? `No cleaning companies found in ${stateName} yet.`
                  : 'Pick a cleaning service to see availability by state.'}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* State filter bar */}
          <form method="get" className="mb-6 flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
            <label htmlFor="state-select" className="text-sm font-medium text-navy whitespace-nowrap">
              Filter by state:
            </label>
            <select
              id="state-select"
              name="state"
              defaultValue={rawState || ''}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All States</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={stateSlug(s.name)}>{s.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors"
            >
              Apply
            </button>
            {stateCode && (
              <Link href="/browse-by-service" className="text-sm text-accent hover:underline">
                Clear filter
              </Link>
            )}
          </form>

          {/* State chips — top 15 by total company count */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href="/browse-by-service"
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                !stateCode ? 'bg-navy text-white' : 'bg-blue-50 text-accent hover:bg-blue-100'
              }`}
            >
              All States
            </Link>
            {US_STATES.slice(0, 15).map((s) => (
              <Link
                key={s.code}
                href={`/browse-by-service?state=${stateSlug(s.name)}`}
                className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                  stateCode === s.code
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
              const href = stateCode && stateObj
                ? `/service/${s.value}/${stateSlug(stateObj.name)}`
                : `/service/${s.value}`
              const hasCompanies = s.count > 0
              return (
                <Link
                  key={s.value}
                  href={href}
                  className={`bg-white border rounded-xl p-5 transition-all ${
                    stateCode && !hasCompanies
                      ? 'border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-200'
                      : 'border-gray-200 hover:border-accent hover:shadow-sm'
                  }`}
                >
                  <div className="text-lg font-semibold text-navy">{s.label}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {hasCompanies
                      ? stateName
                        ? `${s.count.toLocaleString()} companies in ${stateName}`
                        : `${s.count.toLocaleString()} companies nationwide`
                      : stateName
                        ? `No companies in ${stateName}`
                        : '0 companies'}
                  </div>
                  <div className="text-xs text-accent mt-3">
                    {stateCode
                      ? hasCompanies ? `View ${stateName} results →` : 'No results'
                      : 'Filter by state →'}
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/browse-by-state"
              className="text-accent hover:underline text-sm font-medium"
            >
              Or browse by state →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
