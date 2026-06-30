'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function ClaimSearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ id: string; name: string; city: string; state: string; slug: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function runSearch(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/company-by-slug?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(Array.isArray(data) ? data : data ? [data] : [])
      } else {
        setResults([])
      }
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      runSearch(q)
    }
  }, [searchParams])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    await runSearch(query)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-navy mb-3">Claim Your Free Listing</h1>
            <p className="text-gray-500">
              Already listed in our directory? Claim your listing to manage your profile, view leads,
              and unlock contact details from facility managers looking for your services.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search for your company</h2>
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your company name or city"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-navy text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-navy-600 transition-colors disabled:opacity-60"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searched && !loading && results.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">No companies found matching &ldquo;{query}&rdquo;</p>
                <p className="text-sm">
                  Not listed yet?{' '}
                  <a href="mailto:hello@commercialcleaningnearme.com" className="text-accent hover:underline">
                    Contact us to get added.
                  </a>
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-accent transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-500">{company.city}, {company.state}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/claim/${company.slug}`)}
                      className="bg-accent text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-accent-600 transition-colors"
                    >
                      Claim This Listing
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-1">Don&apos;t see your company?</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">Add your business to the directory in 2 minutes</p>
              <button
                onClick={() => router.push('/claim/new')}
                className="bg-navy text-white font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-navy/90 transition-colors"
              >
                Add My Company →
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-1">Prefer to talk it through?</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">Book a free 15-minute call — we&apos;ll set up your listing together</p>
              <button
                onClick={() => router.push('/claim/call')}
                className="bg-white border border-navy text-navy font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-navy/5 transition-colors"
              >
                Book a Call →
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '📋', title: 'Manage Your Profile', desc: 'Update your services, photos, and business info' },
              { icon: '📬', title: 'Receive Quote Requests', desc: 'Get notified when facility managers request quotes' },
              { icon: '💼', title: 'Unlock Contact Details', desc: 'Flexible options to access leads and grow your business' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ClaimSearchPage() {
  return (
    <Suspense>
      <ClaimSearchContent />
    </Suspense>
  )
}
