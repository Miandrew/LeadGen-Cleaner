export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { SERVICE_TYPES, serviceLabel } from '@/lib/utils'

async function fetchAllServices(): Promise<string[][]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return []
  const pageSize = 1000
  let from = 0
  const out: string[][] = []
  // Cap iterations defensively at 100k rows
  for (let i = 0; i < 100; i++) {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('services')
      .eq('active', true)
      .range(from, from + pageSize - 1)
    if (error || !data || data.length === 0) break
    for (const row of data as { services: string[] | null }[]) {
      out.push(row.services || [])
    }
    if (data.length < pageSize) break
    from += pageSize
  }
  return out
}

export const metadata: Metadata = {
  title: 'Browse by Service | CommercialCleaningNearMe.com',
  description:
    'Browse commercial cleaning companies by service category — office cleaning, janitorial, carpet, window, medical, industrial and more. Find verified providers and request free quotes.',
}

export default async function BrowseByServicePage() {
  const counts = new Map<string, number>()
  const rows = await fetchAllServices()
  const totalCompanies = rows.length
  for (const services of rows) {
    for (const svc of services) {
      counts.set(svc, (counts.get(svc) || 0) + 1)
    }
  }

  const merged: { value: string; label: string; count: number }[] = SERVICE_TYPES.map((s) => ({
    value: s.value,
    label: s.label,
    count: counts.get(s.value) || 0,
  }))
  for (const [key, count] of counts.entries()) {
    if (!SERVICE_TYPES.some((s) => s.value === key)) {
      merged.push({ value: key, label: serviceLabel(key), count })
    }
  }
  const services = merged.sort((a, b) => b.count - a.count)

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
              <span>Browse by Service</span>
            </nav>
            <h1 className="text-3xl font-bold text-navy mb-3">Browse by Service</h1>
            <p className="text-gray-500">
              {totalCompanies > 0
                ? `Browse ${totalCompanies.toLocaleString()} cleaning companies across ${services.filter((s) => s.count > 0).length} service categories. Pick a service to see availability by state.`
                : 'Pick a cleaning service to see availability by state.'}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((s) => (
              <Link
                key={s.value}
                href={`/service/${s.value}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-accent hover:shadow-sm transition-all"
              >
                <div className="text-lg font-semibold text-navy">{s.label}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {s.count.toLocaleString()} companies nationwide
                </div>
                <div className="text-xs text-accent mt-3">Filter by state →</div>
              </Link>
            ))}
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
