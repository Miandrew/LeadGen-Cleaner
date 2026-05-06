export const dynamic = 'force-static'
export const revalidate = 86400

import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PseoCompanyGrid from '@/components/PseoCompanyGrid'
import { supabaseAdmin } from '@/lib/supabase'
import { US_STATES, FULL_STATE_NAMES, SERVICE_TYPES } from '@/lib/utils'

interface Props {
  params: { service_cleaning: string; location: string }
}

function parseService(slug: string): string | null {
  const normalized = slug.replace(/-/g, ' ')
  return SERVICE_TYPES.find((s) => s.toLowerCase() === normalized.toLowerCase()) || null
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
  const stateParams: { service_cleaning: string; location: string }[] = []
  SERVICE_TYPES.forEach((service) => {
    US_STATES.forEach((state) => {
      stateParams.push({
        service_cleaning: service.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-'),
        location: state.name.toLowerCase().replace(/\s+/g, '-'),
      })
    })
  })

  const { data } = await supabaseAdmin
    .from('companies')
    .select('city, state, services')
    .eq('active', true)
    .limit(5000)

  const cityParams: { service_cleaning: string; location: string }[] = []
  const seen = new Set<string>()

  ;(data || []).forEach((c: { city: string; state: string; services: string[] }) => {
    ;(c.services || []).forEach((service) => {
      const key = `${service}-${c.city}-${c.state}`
      if (!seen.has(key) && seen.size < 500) {
        seen.add(key)
        cityParams.push({
          service_cleaning: service.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-'),
          location: `${c.city.toLowerCase().replace(/\s+/g, '-')}-${c.state.toLowerCase()}`,
        })
      }
    })
  })

  return [...stateParams.slice(0, 400), ...cityParams]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = parseService(params.service_cleaning)
  const displayService = service || params.service_cleaning.replace(/-/g, ' ')

  if (isStatePage(params.location)) {
    const code = stateNameToCode(params.location)
    const stateName = code ? FULL_STATE_NAMES[code] : params.location.replace(/-/g, ' ')
    const { count } = await supabaseAdmin
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('state', code || params.location.toUpperCase())
      .contains('services', [displayService])
    return {
      title: `${displayService} Companies in ${stateName} | CCNearMe`,
      description: `Find ${count || 0} ${displayService} companies in ${stateName}. Compare and request free quotes from verified providers.`,
    }
  } else {
    const { city, state } = parseCityState(params.location)
    const stateName = FULL_STATE_NAMES[state] || state
    const { count } = await supabaseAdmin
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .ilike('city', city)
      .eq('state', state)
      .contains('services', [displayService])
    return {
      title: `${displayService} in ${city}, ${stateName} — ${count || 0} Companies | CCNearMe`,
      description: `Find ${displayService} companies in ${city}, ${stateName}. Compare ${count || 0} local providers and request free quotes.`,
    }
  }
}

export default async function ServiceLocationPage({ params }: Props) {
  const service = parseService(params.service_cleaning)
  const displayService = service || params.service_cleaning.replace(/-/g, ' ')

  if (isStatePage(params.location)) {
    const code = stateNameToCode(params.location)
    const stateName = code ? FULL_STATE_NAMES[code] : params.location.replace(/-/g, ' ')

    const { data: companies, count } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('state', code || params.location.toUpperCase())
      .contains('services', [displayService])
      .eq('active', true)
      .order('rating', { ascending: false })
      .limit(20)

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="bg-white border-b border-gray-200 py-10">
            <div className="max-w-5xl mx-auto px-4">
              <h1 className="text-3xl font-bold text-navy mb-3 capitalize">{displayService} Companies in {stateName}</h1>
              <p className="text-gray-500">{count?.toLocaleString() || 0} {displayService} companies across {stateName}.</p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 py-8">
            <PseoCompanyGrid companies={companies || []} />
          </div>
        </main>
        <Footer />
      </div>
    )
  } else {
    const { city, state } = parseCityState(params.location)
    const stateName = FULL_STATE_NAMES[state] || state

    const { data: companies, count } = await supabaseAdmin
      .from('companies')
      .select('*')
      .ilike('city', city)
      .eq('state', state)
      .contains('services', [displayService])
      .eq('active', true)
      .order('rating', { ascending: false })
      .limit(20)

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="bg-white border-b border-gray-200 py-10">
            <div className="max-w-5xl mx-auto px-4">
              <h1 className="text-3xl font-bold text-navy mb-3 capitalize">{displayService} Services in {city}, {stateName}</h1>
              <p className="text-gray-500">{count?.toLocaleString() || 0} {displayService} companies found in {city}. Compare and request free quotes.</p>
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
}
