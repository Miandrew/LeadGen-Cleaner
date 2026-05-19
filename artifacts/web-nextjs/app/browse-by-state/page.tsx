export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { US_STATES } from '@/lib/utils'

async function fetchAllStates(): Promise<(string | null)[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return []
  const pageSize = 1000
  let from = 0
  const out: (string | null)[] = []
  for (let i = 0; i < 100; i++) {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('state')
      .eq('active', true)
      .range(from, from + pageSize - 1)
    if (error || !data || data.length === 0) break
    for (const row of data as { state: string | null }[]) {
      out.push(row.state)
    }
    if (data.length < pageSize) break
    from += pageSize
  }
  return out
}

export const metadata: Metadata = {
  title: 'Browse by State | CommercialCleaningNearMe.com',
  description:
    'Browse commercial cleaning companies by state. Find office, janitorial, carpet, medical and industrial cleaners in all 50 states and request free quotes.',
}

function stateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export default async function BrowseByStatePage() {
  const counts = new Map<string, number>()
  let totalCompanies = 0
  const rows = await fetchAllStates()
  for (const state of rows) {
    if (!state) continue
    const code = state.toUpperCase()
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
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span>Browse by State</span>
            </nav>
            <h1 className="text-3xl font-bold text-navy mb-3">Browse by State</h1>
            <p className="text-gray-500">
              {totalCompanies > 0
                ? `Browse ${totalCompanies.toLocaleString()} cleaning companies across ${statesWithCompanies} states. Pick a state to filter by service.`
                : 'Pick a state to see cleaning services available.'}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {states.map((s) => (
              <Link
                key={s.code}
                href={`/state/${stateSlug(s.name)}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-accent hover:shadow-sm transition-all"
              >
                <div className="font-semibold text-navy">{s.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {s.count > 0 ? `${s.count.toLocaleString()} companies` : 'Browse services'}
                </div>
              </Link>
            ))}
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
