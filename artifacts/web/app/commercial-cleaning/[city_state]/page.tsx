export const dynamic = 'force-static'
export const revalidate = 86400

import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PseoCompanyGrid from '@/components/PseoCompanyGrid'
import { supabaseAdmin } from '@/lib/supabase'
import { FULL_STATE_NAMES } from '@/lib/utils'

interface Props {
  params: { city_state: string }
}

function parseParam(cityState: string): { city: string; state: string } {
  const parts = cityState.split('-')
  const state = parts[parts.length - 1].toUpperCase()
  const city = parts.slice(0, -1).join(' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return { city, state }
}

export async function generateStaticParams() {
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

  return [...combos.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 500)
    .map(([key]) => {
      const [city, state] = key.split('-')
      return { city_state: `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}` }
    })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, state } = parseParam(params.city_state)
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

export default async function CityCleaningPage({ params }: Props) {
  const { city, state } = parseParam(params.city_state)
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
      { '@type': 'ListItem', position: 2, name: `${stateName}`, item: `https://commercialcleaningnearme.com/commercial-cleaning/${stateName.toLowerCase().replace(/\s+/g, '-')}` },
      { '@type': 'ListItem', position: 3, name: `${city}`, item: `https://commercialcleaningnearme.com/commercial-cleaning/${params.city_state}` },
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
