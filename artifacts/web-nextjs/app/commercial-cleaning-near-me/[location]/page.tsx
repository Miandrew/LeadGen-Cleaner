export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
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
  return US_STATES.slice(0, 20).map((s) => ({
    location: `${s.name.toLowerCase().replace(/\s+/g, '-')}-${s.code.toLowerCase()}`,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, state } = parseCityState(params.location)
  const stateName = FULL_STATE_NAMES[state] || state
  let count = 0
  if (isSupabaseConfigured() && supabaseAdmin) {
    const res = await supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).ilike('city', city).eq('state', state)
    count = res.count || 0
  }
  return {
    title: `Commercial Cleaning Near Me in ${city}, ${stateName} | CCNearMe`,
    description: `Find ${count || 'top'} commercial cleaning companies near you in ${city}, ${stateName}. Get free quotes from local, verified cleaning services.`,
  }
}

export default async function NearMeCityPage({ params }: Props) {
  const { city, state } = parseCityState(params.location)
  const stateName = FULL_STATE_NAMES[state] || state

  let companies: unknown[] = []
  let count = 0

  if (isSupabaseConfigured() && supabaseAdmin) {
    const res = await supabaseAdmin.from('companies').select('*').ilike('city', city).eq('state', state).eq('active', true).order('rating', { ascending: false }).limit(20)
    companies = res.data || []
    count = res.count || 0
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <nav className="text-xs text-gray-400 mb-3">
              <a href="/" className="hover:text-accent">Home</a> / Commercial Cleaning Near Me / {city}, {stateName}
            </nav>
            <h1 className="text-3xl font-bold text-navy mb-3">Commercial Cleaning Near Me in {city}, {stateName}</h1>
            <p className="text-gray-500">{count > 0 ? `${count.toLocaleString()} local commercial cleaning companies.` : 'Commercial cleaning companies serving this area.'} Compare services and request free quotes.</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <PseoCompanyGrid companies={companies as Parameters<typeof PseoCompanyGrid>[0]['companies']} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
