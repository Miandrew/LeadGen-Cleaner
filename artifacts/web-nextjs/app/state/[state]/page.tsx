export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { SERVICE_TYPES, US_STATES, serviceLabel } from '@/lib/utils'

interface Props {
  params: { state: string }
}

function parseState(slug: string): { code: string; name: string } | null {
  const normalized = slug.toLowerCase().replace(/-/g, ' ')
  const match = US_STATES.find((s) => s.name.toLowerCase() === normalized)
  return match ? { code: match.code, name: match.name } : null
}

function stateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export async function generateStaticParams() {
  return US_STATES.map((s) => ({ state: stateSlug(s.name) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const state = parseState(params.state)
  if (!state) return { title: 'State Not Found' }
  return {
    title: `Commercial Cleaning Services in ${state.name} | CCNearMe`,
    description: `Browse commercial cleaning services available in ${state.name}. Find office cleaning, janitorial, carpet, window, and more.`,
  }
}

export default async function StateHubPage({ params }: Props) {
  const state = parseState(params.state)
  if (!state) notFound()

  const serviceCounts = new Map<string, number>()
  let totalCompanies = 0

  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('companies')
      .select('services')
      .eq('state', state.code)
      .eq('active', true)
      .limit(10000)
    for (const row of (data || []) as { services: string[] | null }[]) {
      totalCompanies++
      for (const svc of row.services || []) {
        serviceCounts.set(svc, (serviceCounts.get(svc) || 0) + 1)
      }
    }
  }

  const sortedServices = SERVICE_TYPES
    .map((s) => ({ ...s, count: serviceCounts.get(s.value) || 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)

  // Surface any services in the DB not in our canonical list
  for (const [key, count] of serviceCounts.entries()) {
    if (!SERVICE_TYPES.some((s) => s.value === key)) {
      sortedServices.push({ value: key, label: serviceLabel(key), count })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <nav className="text-sm text-gray-500 mb-3">
              <Link href="/" className="hover:text-accent">Home</Link>
              <span className="mx-2">/</span>
              <span>{state.name}</span>
            </nav>
            <h1 className="text-3xl font-bold text-navy mb-3">Commercial Cleaning Services in {state.name}</h1>
            <p className="text-gray-500">
              {totalCompanies > 0
                ? `${totalCompanies.toLocaleString()} cleaning companies across ${sortedServices.length} service categories in ${state.name}.`
                : `Browse cleaning services across ${state.name}.`}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {sortedServices.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No companies found in {state.name} yet.</p>
              <Link href="/search" className="text-accent hover:underline mt-3 inline-block">Browse all companies</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sortedServices.map((s) => (
                <Link
                  key={s.value}
                  href={`/service/${s.value}/${stateSlug(state.name)}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-accent hover:shadow-sm transition-all"
                >
                  <div className="font-semibold text-navy">{s.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.count.toLocaleString()} companies in {state.name}</div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-navy mb-3">Browse Other States</h2>
            <div className="flex flex-wrap gap-2">
              {US_STATES.filter((s) => s.code !== state.code).slice(0, 30).map((s) => (
                <Link
                  key={s.code}
                  href={`/state/${stateSlug(s.name)}`}
                  className="text-sm px-3 py-1.5 bg-blue-50 text-accent rounded-full hover:bg-blue-100 transition-colors"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
