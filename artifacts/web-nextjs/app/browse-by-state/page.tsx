export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { US_STATES, SERVICE_TYPES, serviceLabel } from '@/lib/utils'

interface Props {
  searchParams: { service?: string }
}

type Row = { state: string | null; services: string[] | null }

async function fetchAll(): Promise<Row[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return []
  const pageSize = 1000
  let from = 0
  const out: Row[] = []
  for (let i = 0; i < 100; i++) {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('state, services')
      .eq('active', true)
      .range(from, from + pageSize - 1)
    if (error || !data || data.length === 0) break
    for (const row of data as Row[]) out.push(row)
    if (data.length < pageSize) break
    from += pageSize
  }
  return out
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const svc = searchParams.service ? SERVICE_TYPES.find((s) => s.value === searchParams.service) : null
  if (svc) {
    return {
      title: `${svc.label} by State | CommercialCleaningNearMe.com`,
      description: `Find ${svc.label.toLowerCase()} companies in every state. Compare verified providers and request free quotes.`,
    }
  }
  return {
    title: 'Browse by State | CommercialCleaningNearMe.com',
    description:
      'Browse commercial cleaning companies by state. Find office, janitorial, carpet, medical and industrial cleaners in all 50 states and request free quotes.',
  }
}

function stateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export default async function BrowseByStatePage({ searchParams }: Props) {
  const selected = searchParams.service && SERVICE_TYPES.some((s) => s.value === searchParams.service)
    ? searchParams.service
    : ''
  const selectedLabel = selected ? serviceLabel(selected) : ''

  const counts = new Map<string, number>()
  let totalCompanies = 0
  const rows = await fetchAll()

  for (const row of rows) {
    if (!row.state) continue
    if (selected && !(row.services || []).includes(selected)) continue
    const code = row.state.toUpperCase()
    counts.set(code, (counts.get(code) || 0) + 1)
    totalCompanies++
  }

  const states = US_STATES.map((s) => ({ ...s, count: counts.get(s.code) || 0 })).sort(
    (a, b) => b.count - a.count
  )
  const statesWithCompanies = states.filter((s) => s.count > 0).length

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <nav className="text-sm text-gray-500 mb-3">
              <Link href="/" className="hover:text-accent">Home</Link>
              <span className="mx-2">/</span>
              <span>Browse by State</span>
              {selected && (
                <>
                  <span className="mx-2">/</span>
                  <span>{selectedLabel}</span>
                </>
              )}
            </nav>
            <h1 className="text-3xl font-bold text-navy mb-3">
              {selected ? `${selectedLabel} by State` : 'Browse by State'}
            </h1>
            <p className="text-gray-500">
              {totalCompanies > 0
                ? selected
                  ? `${totalCompanies.toLocaleString()} ${selectedLabel.toLowerCase()} companies across ${statesWithCompanies} states.`
                  : `Browse ${totalCompanies.toLocaleString()} cleaning companies across ${statesWithCompanies} states. Pick a state to filter by service.`
                : selected
                  ? `No ${selectedLabel.toLowerCase()} companies found yet.`
                  : 'Pick a state to see cleaning services available.'}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Service filter */}
          <form method="get" className="mb-6 flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
            <label htmlFor="service" className="text-sm font-medium text-navy">
              Filter by service:
            </label>
            <select
              id="service"
              name="service"
              defaultValue={selected}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Services</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors"
            >
              Apply
            </button>
            {selected && (
              <Link href="/browse-by-state" className="text-sm text-accent hover:underline">
                Clear filter
              </Link>
            )}
          </form>

          {/* Quick service chips */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href="/browse-by-state"
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                !selected ? 'bg-navy text-white' : 'bg-blue-50 text-accent hover:bg-blue-100'
              }`}
            >
              All
            </Link>
            {SERVICE_TYPES.map((s) => (
              <Link
                key={s.value}
                href={`/browse-by-state?service=${s.value}`}
                className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                  selected === s.value
                    ? 'bg-navy text-white'
                    : 'bg-blue-50 text-accent hover:bg-blue-100'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {states.map((s) => {
              const href = selected
                ? `/service/${selected}/${stateSlug(s.name)}`
                : `/state/${stateSlug(s.name)}`
              const subText = selected
                ? s.count > 0
                  ? `${s.count.toLocaleString()} ${selectedLabel.toLowerCase()} companies`
                  : `No ${selectedLabel.toLowerCase()} companies`
                : s.count > 0
                  ? `${s.count.toLocaleString()} companies`
                  : 'Browse services'
              return (
                <Link
                  key={s.code}
                  href={href}
                  className={`bg-white border rounded-lg p-4 transition-all ${
                    selected && s.count === 0
                      ? 'border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-200'
                      : 'border-gray-200 hover:border-accent hover:shadow-sm'
                  }`}
                >
                  <div className="font-semibold text-navy">{s.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{subText}</div>
                </Link>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/browse-by-service"
              className="text-accent hover:underline text-sm font-medium"
            >
              Or browse by service →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
