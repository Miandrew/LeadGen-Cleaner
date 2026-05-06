export const dynamic = 'force-static'
export const revalidate = 86400

import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PseoCompanyGrid from '@/components/PseoCompanyGrid'
import { supabaseAdmin } from '@/lib/supabase'
import { US_STATES, FULL_STATE_NAMES, SERVICE_TYPES } from '@/lib/utils'

interface Props {
  params: { service_cleaning: string; state: string }
}

function parseService(slug: string): string | null {
  const normalized = slug.replace(/-/g, ' ')
  return SERVICE_TYPES.find((s) => s.toLowerCase() === normalized.toLowerCase()) || null
}

function stateNameToCode(name: string): string | undefined {
  const normalized = name.replace(/-/g, ' ')
  return US_STATES.find((s) => s.name.toLowerCase() === normalized.toLowerCase())?.code
}

export async function generateStaticParams() {
  const params: { service_cleaning: string; state: string }[] = []
  SERVICE_TYPES.forEach((service) => {
    US_STATES.forEach((state) => {
      params.push({
        service_cleaning: service.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-'),
        state: state.name.toLowerCase().replace(/\s+/g, '-'),
      })
    })
  })
  return params.slice(0, 400)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = parseService(params.service_cleaning)
  const code = stateNameToCode(params.state)
  const stateName = code ? FULL_STATE_NAMES[code] : params.state.replace(/-/g, ' ')
  const { count } = await supabaseAdmin
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('state', code || params.state.toUpperCase())
    .contains('services', [service || params.service_cleaning])
  return {
    title: `${service || params.service_cleaning} Companies in ${stateName} | CCNearMe`,
    description: `Find ${count || 0} ${service || params.service_cleaning} companies in ${stateName}. Compare and request free quotes from verified providers.`,
  }
}

export default async function ServiceStatePage({ params }: Props) {
  const service = parseService(params.service_cleaning)
  const code = stateNameToCode(params.state)
  const stateName = code ? FULL_STATE_NAMES[code] : params.state.replace(/-/g, ' ')

  const { data: companies, count } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('state', code || params.state.toUpperCase())
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
            <h1 className="text-3xl font-bold text-navy mb-3">{service || params.service_cleaning} Companies in {stateName}</h1>
            <p className="text-gray-500">{count?.toLocaleString() || 0} {service} companies across {stateName}.</p>
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
