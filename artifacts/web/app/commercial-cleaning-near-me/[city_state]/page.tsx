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
  return {
    title: `Commercial Cleaning Near ${city}, ${stateName} | CCNearMe`,
    description: `Find commercial cleaning companies near ${city}, ${stateName}. Compare local services, read reviews, and request free quotes from verified cleaners near you.`,
  }
}

export default async function NearMePage({ params }: Props) {
  const { city, state } = parseParam(params.city_state)
  const stateName = FULL_STATE_NAMES[state] || state

  const { data: companies, count } = await supabaseAdmin
    .from('companies')
    .select('*')
    .ilike('city', city)
    .eq('state', state)
    .eq('active', true)
    .order('rating', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-navy mb-3">Commercial Cleaning Near {city}, {stateName}</h1>
            <p className="text-gray-500">{count?.toLocaleString() || 0} local commercial cleaning companies. Find the best cleaner near you.</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <PseoCompanyGrid companies={companies || []} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
