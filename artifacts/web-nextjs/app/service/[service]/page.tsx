export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
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
    title: `${service.label} Companies by State | CCNearMe`,
    description: `Browse ${service.label.toLowerCase()} companies across the United States. Find verified providers in every state and request free quotes.`,
  }
}

export default async function ServiceHubPage({ params }: Props) {
  const service = parseService(params.service)
  if (!service) notFound()

  let stateCounts = new Map<string, number>()
  let totalCount = 0

  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('companies')
      .select('state')
      .contains('services', [service.value])
      .eq('active', true)
      .limit(10000)
    for (const row of (data || []) as { state: string | null }[]) {
      if (!row.state) continue
      const code = row.state.toUpperCase()
      stateCounts.set(code, (stateCounts.get(code) || 0) + 1)
      totalCount++
    }
  }

  const sortedStates = US_STATES
    .map((s) => ({ ...s, count: stateCounts.get(s.code) || 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <nav className="text-sm text-gray-500 mb-3">
              <Link href="/" className="hover:text-accent">Home</Link>
              <span className="mx-2">/</span>
              <span>{service.label}</span>
            </nav>
            <h1 className="text-3xl font-bold text-navy mb-3">{service.label} Companies by State</h1>
            <p className="text-gray-500">
              {totalCount > 0
                ? `Browse ${totalCount.toLocaleString()} ${service.label.toLowerCase()} companies across ${sortedStates.length} states.`
                : `Browse ${service.label.toLowerCase()} companies across the United States.`}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {sortedStates.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No companies found for this service yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {sortedStates.map((s) => (
                <Link
                  key={s.code}
                  href={`/service/${service.value}/${stateSlug(s.name)}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-accent hover:shadow-sm transition-all"
                >
                  <div className="font-semibold text-navy">{s.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.count.toLocaleString()} companies</div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-navy mb-3">Browse Other Services</h2>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.filter((s) => s.value !== service.value).map((s) => (
                <Link
                  key={s.value}
                  href={`/service/${s.value}`}
                  className="text-sm px-3 py-1.5 bg-blue-50 text-accent rounded-full hover:bg-blue-100 transition-colors"
                >
                  {s.label}
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
