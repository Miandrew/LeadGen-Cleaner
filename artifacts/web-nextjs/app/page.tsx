import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SearchForm from '@/components/SearchForm'
import BrowseSection from '@/components/BrowseSection'
import { SERVICE_TYPES } from '@/lib/utils'

export const revalidate = 3600

async function getStats() {
  try {
    const [servicRes, stateRes, countRes] = await Promise.all([
      supabaseAdmin.from('companies').select('services').eq('active', true),
      supabaseAdmin.from('companies').select('state').eq('active', true).not('state', 'is', null),
      supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).eq('active', true),
    ])

    const serviceMap: Record<string, number> = {}
    SERVICE_TYPES.forEach((s) => (serviceMap[s.value] = 0))
    servicRes.data?.forEach((c) => {
      c.services?.forEach((s: string) => {
        if (serviceMap[s] !== undefined) serviceMap[s]++
      })
    })

    const stateMap: Record<string, number> = {}
    stateRes.data?.forEach((c) => {
      if (c.state) stateMap[c.state] = (stateMap[c.state] || 0) + 1
    })

    const topStates = Object.entries(stateMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) as [string, number][]

    const uniqueStateCount = Object.keys(stateMap).length
    const totalCompanies = countRes.count || 0

    return { serviceMap, topStates, totalCompanies, uniqueStateCount }
  } catch {
    return {
      serviceMap: {} as Record<string, number>,
      topStates: [] as [string, number][],
      totalCompanies: 0,
      uniqueStateCount: 0,
    }
  }
}

export default async function HomePage() {
  const { serviceMap, topStates, totalCompanies, uniqueStateCount } = await getStats()

  const trustItems = [
    `${totalCompanies.toLocaleString()}+ Companies Listed`,
    `${uniqueStateCount || 50} States Covered`,
    'Real Google Reviews',
    'Free to Search',
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-white py-16 sm:py-24 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold text-[#1B3A6B] leading-tight mb-4">
              Find Trusted Commercial Cleaning Companies Near You
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Browse verified commercial cleaning companies across the US.
              Compare services, read real reviews, and request free quotes.
            </p>
            <SearchForm />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-400">
              {trustItems.map((item, i, arr) => (
                <span key={item} className="flex items-center gap-4">
                  {item}
                  {i < arr.length - 1 && (
                    <span className="hidden sm:inline text-gray-300">|</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Tabbed Browse — Service + State combined */}
        <BrowseSection serviceMap={serviceMap} topStates={topStates} />

        {/* CTA for cleaning companies */}
        <section className="py-16 bg-[#1B3A6B] text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Own a Commercial Cleaning Company?
            </h2>
            <p className="text-blue-200 mb-8">
              Facility managers in your city are actively searching for
              commercial cleaners right now. Claim your free listing and
              start receiving quote requests — no monthly fee to get started.
            </p>
            <Link
              href="/claim"
              className="inline-block bg-white text-navy font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Claim Your Free Listing →
            </Link>
          </div>
        </section>

        {/* How It Works — moved to bottom */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B3A6B] text-center mb-10">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                  title: 'Search Your City',
                  desc: 'Enter your city and service type to find local commercial cleaners',
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ),
                  title: 'Compare & Review',
                  desc: 'Read real Google reviews and compare companies side by side',
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: 'Request Free Quotes',
                  desc: 'Select up to 3 companies and receive quotes within 24 hours',
                },
              ].map((step, i) => (
                <div key={step.title} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-[#1B3A6B]/10 rounded-full flex items-center justify-center text-[#1B3A6B] mb-4">
                    {step.icon}
                  </div>
                  <div className="text-sm font-bold text-accent mb-1">Step {i + 1}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
