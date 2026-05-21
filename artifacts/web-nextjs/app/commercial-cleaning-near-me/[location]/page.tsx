export const revalidate = 86400

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PseoCompanyGrid from '@/components/PseoCompanyGrid'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { US_STATES, FULL_STATE_NAMES } from '@/lib/utils'

interface Props {
  params: { location: string }
}

function parseCityState(location: string): { city: string; state: string } {
  const parts = location.split('-')
  const state = parts[parts.length - 1].toUpperCase()
  const city = parts.slice(0, -1).join(' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return { city, state }
}

export async function generateStaticParams() {
  const stateParams = US_STATES.map((s) => ({
    location: s.name.toLowerCase().replace(/\s+/g, '-'),
  }))

  try {
    const { data } = await supabaseAdmin
      .from('companies')
      .select('city, state')
      .eq('active', true)
      .not('city', 'is', null)
      .not('state', 'is', null)
      .limit(2000)

    const seen = new Set<string>()
    const cityParams: { location: string }[] = []

    for (const c of (data || []) as { city: string | null; state: string | null }[]) {
      if (!c.city || !c.state) continue
      const slug = `${c.city.toLowerCase().replace(/\s+/g, '-')}-${c.state.toLowerCase()}`
      if (!seen.has(slug)) {
        seen.add(slug)
        cityParams.push({ location: slug })
      }
      if (cityParams.length >= 500) break
    }

    return [...stateParams, ...cityParams]
  } catch {
    return stateParams
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, state } = parseCityState(params.location)
  const stateName = FULL_STATE_NAMES[state] || state
  return {
    title: `Commercial Cleaning Near Me in ${city}, ${stateName} | CommercialCleaningNearMe.com`,
    description: `Find commercial cleaning companies near you in ${city}, ${stateName}. Compare verified local cleaners and request free quotes today.`,
  }
}

export default async function NearMePage({ params }: Props) {
  const { city, state } = parseCityState(params.location)
  const stateName = FULL_STATE_NAMES[state] || state
  if (!US_STATES.some((s) => s.code === state)) notFound()

  let companies: unknown[] = []
  let count = 0
  let relatedCities: string[] = []

  if (isSupabaseConfigured() && supabaseAdmin) {
    const [res, chipsRes] = await Promise.all([
      supabaseAdmin
        .from('companies')
        .select('*')
        .ilike('city', city)
        .eq('state', state)
        .eq('active', true)
        .order('rating', { ascending: false })
        .limit(20),
      supabaseAdmin
        .from('companies')
        .select('city')
        .eq('state', state)
        .eq('active', true)
        .limit(200),
    ])
    companies = res.data || []
    count = res.count || companies.length

    const allCities = [
      ...new Set(
        (chipsRes.data || [])
          .map((c: { city: string }) => c.city)
          .filter(Boolean)
      ),
    ] as string[]
    relatedCities = allCities
      .filter((c) => c.toLowerCase() !== city.toLowerCase())
      .slice(0, 8)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://commercialcleaningnearme.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: `Commercial Cleaning Near Me — ${city}, ${stateName}`,
        item: `https://commercialcleaningnearme.com/commercial-cleaning-near-me/${params.location}`,
      },
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
              {' / '}
              <Link
                href={`/commercial-cleaning/${stateName.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-accent"
              >
                {stateName}
              </Link>
              {' / '}
              Commercial Cleaning Near Me
            </nav>
            <h1 className="text-3xl font-bold text-navy mb-3">
              Commercial Cleaning Near Me in {city}, {stateName}
            </h1>
            <p className="text-gray-500">
              {count > 0
                ? `${count.toLocaleString()} local commercial cleaning companies in ${city}.`
                : `Commercial cleaning companies serving ${city}.`}{' '}
              Compare services, read reviews, and request free quotes.
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          {relatedCities.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Also near {city}:</p>
              <div className="flex flex-wrap gap-2">
                {relatedCities.map((c) => (
                  <Link
                    key={c}
                    href={`/commercial-cleaning-near-me/${c.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`}
                    className="text-xs bg-white border border-gray-200 hover:border-accent text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <PseoCompanyGrid
            companies={companies as Parameters<typeof PseoCompanyGrid>[0]['companies']}
            city={city}
            state={state}
          />
          <div className="mt-8 text-center">
            <Link
              href={`/commercial-cleaning/${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`}
              className="text-accent hover:underline text-sm"
            >
              View all cleaning companies in {city}, {stateName} →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
