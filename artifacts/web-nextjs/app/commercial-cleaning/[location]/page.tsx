export const dynamic = 'force-static'
export const revalidate = 86400

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PseoCompanyGrid from '@/components/PseoCompanyGrid'
import { supabaseAdmin } from '@/lib/supabase'
import { US_STATES, FULL_STATE_NAMES } from '@/lib/utils'

interface Props {
  params: { location: string }
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

export async function generateStaticParams() {
  const stateParams = US_STATES.map((s) => ({
    location: s.name.toLowerCase().replace(/\s+/g, '-'),
  }))

  const { data } = await supabaseAdmin
    .from('companies')
    .select('city, state')
    .eq('active', true)
    .limit(5000)

  const combos = new Map<string, number>()
  ;(data || []).forEach((c: { city: string; state: string }) => {
    if (c.city && c.state) {
      const key = `${c.city}-${c.state}`
      combos.set(key, (combos.get(key) || 0) + 1)
    }
  })

  const cityParams = [...combos.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 500)
    .map(([key]) => {
      const [city, state] = key.split('-')
      return { location: `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}` }
    })

  return [...stateParams, ...cityParams]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = params
  if (isStatePage(location)) {
    const code = stateNameToCode(location)
    const name = code ? FULL_STATE_NAMES[code] : location.replace(/-/g, ' ')
    const { count } = await supabaseAdmin
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('state', code || location.toUpperCase())
    return {
      title: `Commercial Cleaning Companies in ${name} | CCNearMe`,
      description: `Find ${count || 0} commercial cleaning companies in ${name}. Compare services, read reviews, and request free quotes.`,
    }
  } else {
    const { city, state } = parseCityState(location)
    const stateName = FULL_STATE_NAMES[state] || state
    const { count } = await supabaseAdmin
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .ilike('city', city)
      .eq('state', state)
    return {
      title: `Commercial Cleaning Companies in ${city}, ${stateName} | CCNearMe`,
      description: `Find ${count || 0} commercial cleaning companies in ${city}, ${stateName}. Compare services, read real reviews, and request free quotes.`,
    }
  }
}

export default async function CommercialCleaningLocationPage({ params }: Props) {
  const { location } = params

  if (isStatePage(location)) {
    const code = stateNameToCode(location)
    if (!code) notFound()
    const stateName = FULL_STATE_NAMES[code]

    const [{ data: companies, count }, { data: citiesRaw }] = await Promise.all([
      supabaseAdmin.from('companies').select('*').eq('state', code).eq('active', true).order('rating', { ascending: false }).limit(20),
      supabaseAdmin.from('companies').select('city').eq('state', code).eq('active', true).limit(200),
    ])

    const cities = [...new Set((citiesRaw || []).map((c: { city: string }) => c.city).filter(Boolean))].slice(0, 20)

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://commercialcleaningnearme.com' },
        { '@type': 'ListItem', position: 2, name: `Commercial Cleaning in ${stateName}`, item: `https://commercialcleaningnearme.com/commercial-cleaning/${location}` },
      ],
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <main className="flex-1 bg-gray-50">
          <div className="bg-white border-b border-gray-200 py-10">
            <div className="max-w-5xl mx-auto px-4">
              <h1 className="text-3xl font-bold text-navy mb-3">Commercial Cleaning Companies in {stateName}</h1>
              <p className="text-gray-500">{count?.toLocaleString() || 0} verified commercial cleaning companies. Compare, review, and request free quotes.</p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 py-8">
            {cities.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Browse by City:</p>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => {
                    const slug = `${city.toLowerCase().replace(/\s+/g, '-')}-${code.toLowerCase()}`
                    return (
                      <a key={city} href={`/commercial-cleaning/${slug}`} className="text-xs bg-white border border-gray-300 hover:border-accent hover:text-accent text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                        {city}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
            <PseoCompanyGrid companies={companies || []} />
          </div>
        </main>
        <Footer />
      </div>
    )
  } else {
    const { city, state } = parseCityState(location)
    const stateName = FULL_STATE_NAMES[state] || state

    const [{ data: companies, count }, { data: relatedCities }] = await Promise.all([
      supabaseAdmin.from('companies').select('*').ilike('city', city).eq('state', state).eq('active', true).order('rating', { ascending: false }).limit(20),
      supabaseAdmin.from('companies').select('city').eq('state', state).eq('active', true).limit(200),
    ])

    const otherCities = [...new Set((relatedCities || []).map((c: { city: string }) => c.city).filter((c) => c.toLowerCase() !== city.toLowerCase()))].slice(0, 10)

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://commercialcleaningnearme.com' },
        { '@type': 'ListItem', position: 2, name: stateName, item: `https://commercialcleaningnearme.com/commercial-cleaning/${stateName.toLowerCase().replace(/\s+/g, '-')}` },
        { '@type': 'ListItem', position: 3, name: city, item: `https://commercialcleaningnearme.com/commercial-cleaning/${location}` },
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
                <a href="/" className="hover:text-accent">Home</a> / <a href={`/commercial-cleaning/${stateName.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-accent">{stateName}</a> / {city}
              </nav>
              <h1 className="text-3xl font-bold text-navy mb-3">Commercial Cleaning Companies in {city}, {stateName}</h1>
              <p className="text-gray-500">{count?.toLocaleString() || 0} cleaning companies found. Compare, review, and get free quotes.</p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 py-8">
            <PseoCompanyGrid companies={companies || []} />
            {otherCities.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-bold text-navy mb-3">Related Cities in {stateName}</h2>
                <div className="flex flex-wrap gap-2">
                  {otherCities.map((c) => {
                    const slug = `${c.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`
                    return (
                      <a key={c} href={`/commercial-cleaning/${slug}`} className="text-xs bg-white border border-gray-300 hover:border-accent hover:text-accent text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                        {c}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }
}
