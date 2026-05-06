export const dynamic = 'force-static'
export const revalidate = 86400

import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PseoCompanyGrid from '@/components/PseoCompanyGrid'
import { supabaseAdmin } from '@/lib/supabase'
import { FULL_STATE_NAMES, SERVICE_TYPES } from '@/lib/utils'

interface Props {
  params: { service_cleaning: string; city_state: string }
}

function parseService(slug: string): string | null {
  const normalized = slug.replace(/-/g, ' ')
  return SERVICE_TYPES.find((s) => s.toLowerCase() === normalized.toLowerCase()) || null
}

function parseCity(cityState: string): { city: string; state: string } {
  const parts = cityState.split('-')
  const state = parts[parts.length - 1].toUpperCase()
  const city = parts.slice(0, -1).join(' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return { city, state }
}

export async function generateStaticParams() {
  const { data } = await supabaseAdmin
    .from('companies')
    .select('city, state, services')
    .eq('active', true)
    .limit(5000)

  const params: { service_cleaning: string; city_state: string }[] = []
  const seen = new Set<string>()

  ;(data || []).forEach((c: { city: string; state: string; services: string[] }) => {
    ;(c.services || []).forEach((service) => {
      const key = `${service}-${c.city}-${c.state}`
      if (!seen.has(key) && seen.size < 1000) {
        seen.add(key)
        params.push({
          service_cleaning: service.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-'),
          city_state: `${c.city.toLowerCase().replace(/\s+/g, '-')}-${c.state.toLowerCase()}`,
        })
      }
    })
  })

  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = parseService(params.service_cleaning)
  const { city, state } = parseCity(params.city_state)
  const stateName = FULL_STATE_NAMES[state] || state
  const { count } = await supabaseAdmin
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .ilike('city', city)
    .eq('state', state)
    .contains('services', [service || params.service_cleaning])
  return {
    title: `${service || params.service_cleaning} in ${city}, ${stateName} — ${count || 0} Companies | CCNearMe`,
    description: `Find ${service || params.service_cleaning} companies in ${city}, ${stateName}. Compare ${count || 0} local providers and request free quotes.`,
  }
}

export default async function ServiceCityPage({ params }: Props) {
  const service = parseService(params.service_cleaning)
  const { city, state } = parseCity(params.city_state)
  const stateName = FULL_STATE_NAMES[state] || state

  const { data: companies, count } = await supabaseAdmin
    .from('companies')
    .select('*')
    .ilike('city', city)
    .eq('state', state)
    .contains('services', [service || params.service_cleaning.replace(/-/g, ' ')])
    .eq('active', true)
    .order('rating', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-navy mb-3">{service || params.service_cleaning} Services in {city}, {stateName}</h1>
            <p className="text-gray-500">{count?.toLocaleString() || 0} {service} companies found in {city}. Compare and request free quotes.</p>
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
