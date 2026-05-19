'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CompanyCard from '@/components/CompanyCard'
import SelectionBar from '@/components/SelectionBar'
import { CompanyCardSkeleton } from '@/components/Skeleton'
import { SERVICE_TYPES, US_STATES } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Company {
  id: string
  name: string
  slug: string
  city?: string | null
  state?: string | null
  rating?: number | null
  review_count?: number | null
  services?: string[] | null
  claimed?: boolean | null
  description?: string | null
  logo_url?: string | null
  website?: string | null
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [toast, setToast] = useState('')

  const city = searchParams.get('city') || ''
  const state = searchParams.get('state') || ''
  const service = searchParams.get('service') || ''
  const ratingParam = searchParams.get('rating') || '1'
  const verified = searchParams.get('verified') === 'true'
  const sort = searchParams.get('sort') || 'rating'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [filterService, setFilterService] = useState(service)
  const [filterRating, setFilterRating] = useState(ratingParam)
  const [filterVerified, setFilterVerified] = useState(verified)

  const [fallbackToState, setFallbackToState] = useState(false)

  const buildQuery = useCallback((withCity: boolean) => {
    let q = supabase.from('companies').select('*', { count: 'exact' }).eq('active', true)
    if (withCity && city) q = q.ilike('city', `%${city}%`)
    if (state) q = q.eq('state', state)
    if (service) q = q.contains('services', [service])
    if (parseFloat(ratingParam) > 1) q = q.gte('rating', parseFloat(ratingParam))
    if (verified) q = q.eq('claimed', true)
    if (sort === 'rating') q = q.order('rating', { ascending: false, nullsFirst: false })
    else if (sort === 'reviews') q = q.order('review_count', { ascending: false, nullsFirst: false })
    else if (sort === 'newest') q = q.order('created_at', { ascending: false })
    return q
  }, [city, state, service, ratingParam, verified, sort])

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    setFallbackToState(false)

    const from = (page - 1) * 20
    let { data, count } = await buildQuery(true).range(from, from + 19)

    // If city returned 0 and we have a state, fall back to state-wide results
    if (city && (count === 0 || !data?.length) && state) {
      const fb = await buildQuery(false).range(from, from + 19)
      data = fb.data
      count = fb.count
      setFallbackToState(true)
    }

    setCompanies(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [city, state, service, ratingParam, verified, sort, page, buildQuery])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (state) params.set('state', state)
    if (filterService) params.set('service', filterService)
    if (parseFloat(filterRating) > 1) params.set('rating', filterRating)
    if (filterVerified) params.set('verified', 'true')
    params.set('sort', sort)
    router.push(`/search?${params.toString()}`)
  }

  const toggleCompany = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) {
        setToast('Maximum 3 companies — deselect one to add another.')
        setTimeout(() => setToast(''), 3000)
        return prev
      }
      return [...prev, id]
    })
  }

  const totalPages = Math.ceil(total / 20)

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/search?${params.toString()}`)
  }

  const setSort = (s: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', s)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-60 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
                <h2 className="font-bold text-gray-900 mb-4">Filters</h2>

                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Service Type</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="service"
                        value=""
                        checked={filterService === ''}
                        onChange={() => setFilterService('')}
                        className="accent-accent"
                      />
                      <span>All Services</span>
                    </label>
                    {SERVICE_TYPES.map((s) => (
                      <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="service"
                          value={s}
                          checked={filterService === s}
                          onChange={() => setFilterService(s)}
                          className="accent-accent"
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Minimum Rating
                  </h3>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="w-full accent-accent"
                  />
                  <div className="text-sm text-gray-500 mt-1">{filterRating}+ stars</div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setFilterVerified(!filterVerified)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        filterVerified ? 'bg-accent' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          filterVerified ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Verified Only</span>
                  </label>
                </div>

                <button
                  onClick={applyFilters}
                  className="w-full bg-[#1B3A6B] hover:bg-[#162F56] text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <div>
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> companies
                    {city && !fallbackToState && (
                      <span>
                        {' '}in <span className="font-semibold text-gray-900">{city}{state ? `, ${state}` : ''}</span>
                      </span>
                    )}
                    {fallbackToState && state && (
                      <span>
                        {' '}in <span className="font-semibold text-gray-900">{state}</span>
                      </span>
                    )}
                  </p>
                  {fallbackToState && city && (
                    <p className="text-xs text-amber-600 mt-0.5">
                      No exact matches for &ldquo;{city}&rdquo; — showing all companies in {state}
                    </p>
                  )}
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
                >
                  <option value="rating">Best Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CompanyCardSkeleton key={i} />
                  ))}
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p className="text-lg font-medium">No companies found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {companies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      isSelected={selectedIds.includes(company.id)}
                      onToggle={toggleCompany}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8 pb-24">
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-navy text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-accent'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <SelectionBar
        selectedCount={selectedIds.length}
        onRequestQuotes={() =>
          router.push(`/quote?companies=${selectedIds.join(',')}`)
        }
      />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-lg text-sm shadow-xl z-50 transition-all">
          {toast}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}
