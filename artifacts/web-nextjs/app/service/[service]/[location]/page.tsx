export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PseoCompanyGrid from '@/components/PseoCompanyGrid'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { US_STATES, FULL_STATE_NAMES, SERVICE_TYPES } from '@/lib/utils'

function stateNameSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function InternalLinks({
  serviceValue,
  serviceLabel,
  stateCode,
  stateName,
}: {
  serviceValue: string
  serviceLabel: string
  stateCode: string
  stateName: string
}) {
  const stateSlug = stateNameSlug(stateName)
  const otherServices = SERVICE_TYPES.filter((s) => s.value !== serviceValue)
  const otherStates = US_STATES.filter((s) => s.code !== stateCode).slice(0, 12)

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-navy mb-1">Other Services in {stateName}</h2>
        <p className="text-sm text-gray-500 mb-3">
          <Link href={`/state/${stateSlug}`} className="text-accent hover:underline">
            Browse all services in {stateName} →
          </Link>
        </p>
        <div className="flex flex-wrap gap-2">
          {otherServices.map((s) => (
            <Link
              key={s.value}
              href={`/service/${s.value}/${stateSlug}`}
              className="text-sm px-3 py-1.5 bg-blue-50 text-accent rounded-full hover:bg-blue-100 transition-colors"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-navy mb-1">{serviceLabel} in Other States</h2>
        <p className="text-sm text-gray-500 mb-3">
          <Link href={`/service/${serviceValue}`} className="text-accent hover:underline">
            Browse all states for {serviceLabel} →
          </Link>
        </p>
        <div className="flex flex-wrap gap-2">
          {otherStates.map((s) => (
            <Link
              key={s.code}
              href={`/service/${serviceValue}/${stateNameSlug(s.name)}`}
              className="text-sm px-3 py-1.5 bg-blue-50 text-accent rounded-full hover:bg-blue-100 transition-colors"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

interface Props {
  params: { service: string; location: string }
}

function parseService(slug: string): { value: string; label: string } | null {
  const normalized = slug.toLowerCase()
  const match = SERVICE_TYPES.find(
    (s) => s.value === normalized || s.label.toLowerCase().replace(/\s+/g, '-') === normalized
  )
  return match ? { value: match.value, label: match.label } : null
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = parseService(params.service)
  const displayService = service?.label || params.service.replace(/-/g, ' ')
  const serviceKey = service?.value

  if (isStatePage(params.location)) {
    const code = stateNameToCode(params.location)
    const stateName = code ? FULL_STATE_NAMES[code] : params.location.replace(/-/g, ' ')
    let count = 0
    if (isSupabaseConfigured() && supabaseAdmin && serviceKey) {
      const res = await supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).eq('state', code || params.location.toUpperCase()).contains('services', [serviceKey]).eq('active', true)
      count = res.count || 0
    }
    return {
      title: `${displayService} Companies in ${stateName} | CCNearMe`,
      description: `Find ${count || 'top'} ${displayService} companies in ${stateName}. Compare and request free quotes from verified providers.`,
    }
  } else {
    const { city, state } = parseCityState(params.location)
    const stateName = FULL_STATE_NAMES[state] || state
    let count = 0
    if (isSupabaseConfigured() && supabaseAdmin && serviceKey) {
      const res = await supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).ilike('city', city).eq('state', state).contains('services', [serviceKey]).eq('active', true)
      count = res.count || 0
    }
    return {
      title: `${displayService} in ${city}, ${stateName} — ${count || 'Top'} Companies | CCNearMe`,
      description: `Find ${displayService} companies in ${city}, ${stateName}. Compare local providers and request free quotes.`,
    }
  }
}

export default async function ServiceLocationPage({ params }: Props) {
  const service = parseService(params.service)
  if (!service) notFound()
  const displayService = service.label
  const serviceKey = service.value

  if (isStatePage(params.location)) {
    const code = stateNameToCode(params.location)
    const stateName = code ? FULL_STATE_NAMES[code] : params.location.replace(/-/g, ' ')

    let companies: unknown[] = []
    let count = 0
    let cityRows: { city: string; count: number }[] = []

    if (isSupabaseConfigured() && supabaseAdmin && serviceKey) {
      const stateCode = code || params.location.toUpperCase()
      const res = await supabaseAdmin.from('companies').select('*', { count: 'exact' }).eq('state', stateCode).contains('services', [serviceKey]).eq('active', true).order('rating', { ascending: false }).limit(20)
      companies = res.data || []
      count = res.count || 0

      const counts = new Map<string, { city: string; count: number }>()
      const pageSize = 1000
      let from = 0
      for (let i = 0; i < 50; i++) {
        const { data, error } = await supabaseAdmin
          .from('companies')
          .select('city')
          .eq('state', stateCode)
          .contains('services', [serviceKey])
          .eq('active', true)
          .range(from, from + pageSize - 1)
        if (error || !data || data.length === 0) break
        for (const r of data as { city: string | null }[]) {
          if (!r.city) continue
          const key = r.city.toLowerCase()
          const existing = counts.get(key)
          if (existing) existing.count++
          else counts.set(key, { city: r.city, count: 1 })
        }
        if (data.length < pageSize) break
        from += pageSize
      }
      cityRows = [...counts.values()].sort((a, b) => b.count - a.count)
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="bg-white border-b border-gray-200 py-10">
            <div className="max-w-5xl mx-auto px-4">
              <nav className="text-sm text-gray-500 mb-3">
                <Link href="/" className="hover:text-accent">Home</Link>
                <span className="mx-2">/</span>
                {serviceKey && <><Link href={`/service/${serviceKey}`} className="hover:text-accent">{displayService}</Link><span className="mx-2">/</span></>}
                <span>{stateName}</span>
              </nav>
              <h1 className="text-3xl font-bold text-navy mb-3 capitalize">{displayService} Companies in {stateName}</h1>
              <p className="text-gray-500">{count > 0 ? `${count.toLocaleString()} ${displayService} companies across ${stateName} in ${cityRows.length} cities.` : `${displayService} companies serving ${stateName}.`}</p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 py-8">
            {cityRows.length > 0 && code && (
              <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-bold text-navy mb-1">
                  {displayService} by City in {stateName}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Pick a city to see {displayService.toLowerCase()} companies serving that area.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {cityRows.map((c) => {
                    const slug = `${c.city.toLowerCase().replace(/\s+/g, '-')}-${code.toLowerCase()}`
                    return (
                      <Link
                        key={c.city}
                        href={`/service/${serviceKey}/${slug}`}
                        className="bg-gray-50 hover:bg-blue-50 hover:text-accent border border-gray-200 rounded-lg px-3 py-2 transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="text-sm text-gray-700 truncate">{c.city}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{c.count}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
            <PseoCompanyGrid companies={companies as Parameters<typeof PseoCompanyGrid>[0]['companies']} />
            {serviceKey && code && (
              <InternalLinks
                serviceValue={serviceKey}
                serviceLabel={displayService}
                stateCode={code}
                stateName={stateName}
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  } else {
    const { city, state } = parseCityState(params.location)
    const stateName = FULL_STATE_NAMES[state] || state

    let companies: unknown[] = []
    let count = 0

    if (isSupabaseConfigured() && supabaseAdmin && serviceKey) {
      const res = await supabaseAdmin.from('companies').select('*', { count: 'exact' }).ilike('city', city).eq('state', state).contains('services', [serviceKey]).eq('active', true).order('rating', { ascending: false }).limit(20)
      companies = res.data || []
      count = res.count || 0
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="bg-white border-b border-gray-200 py-10">
            <div className="max-w-5xl mx-auto px-4">
              <nav className="text-sm text-gray-500 mb-3">
                <Link href="/" className="hover:text-accent">Home</Link>
                <span className="mx-2">/</span>
                {serviceKey && <><Link href={`/service/${serviceKey}`} className="hover:text-accent">{displayService}</Link><span className="mx-2">/</span></>}
                <Link href={`/service/${serviceKey || ''}/${stateNameSlug(stateName)}`} className="hover:text-accent">{stateName}</Link>
                <span className="mx-2">/</span>
                <span>{city}</span>
              </nav>
              <h1 className="text-3xl font-bold text-navy mb-3 capitalize">{displayService} Services in {city}, {stateName}</h1>
              <p className="text-gray-500">{count > 0 ? `${count.toLocaleString()} ${displayService} companies found in ${city}.` : `${displayService} companies serving ${city}.`} Compare and request free quotes.</p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 py-8">
            <PseoCompanyGrid companies={companies as Parameters<typeof PseoCompanyGrid>[0]['companies']} />
            {serviceKey && (
              <InternalLinks
                serviceValue={serviceKey}
                serviceLabel={displayService}
                stateCode={state}
                stateName={stateName}
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }
}
