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
  params: { state: string }
}

function stateNameToCode(name: string): string | undefined {
  const normalized = name.replace(/-/g, ' ')
  return US_STATES.find((s) => s.name.toLowerCase() === normalized.toLowerCase())?.code
}

export async function generateStaticParams() {
  return US_STATES.map((s) => ({
    state: s.name.toLowerCase().replace(/\s+/g, '-'),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = stateNameToCode(params.state)
  const name = code ? FULL_STATE_NAMES[code] : params.state.replace(/-/g, ' ')
  const { count } = await supabaseAdmin
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('state', code || params.state.toUpperCase())
  return {
    title: `Commercial Cleaning Companies in ${name} | CCNearMe`,
    description: `Find ${count || 0} commercial cleaning companies in ${name}. Compare services, read reviews, and request free quotes.`,
  }
}

export default async function StateCleaningPage({ params }: Props) {
  const code = stateNameToCode(params.state)
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
      { '@type': 'ListItem', position: 2, name: `Commercial Cleaning in ${stateName}`, item: `https://commercialcleaningnearme.com/commercial-cleaning/${params.state}` },
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
}
