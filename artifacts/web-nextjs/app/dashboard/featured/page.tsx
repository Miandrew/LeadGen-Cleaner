'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Company {
  id: string
  city: string
  state: string
}

interface FeaturedListing {
  placement_type: string
  active: boolean
}

interface HomepageSlotData {
  count: number
}

export default function FeaturedPage() {
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [activeListings, setActiveListings] = useState<FeaturedListing[]>([])
  const [homepageSlots, setHomepageSlots] = useState<number>(0)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) { router.push('/login'); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: user } = await supabase!
        .from('users')
        .select('company_id, companies(id, city, state)')
        .eq('email', session.user.email!)
        .single()
      if (!user?.company_id) return

      const c = Array.isArray(user.companies) ? user.companies[0] : user.companies as Company
      setCompany(c)

      const [{ data: featured }, { count: homepageCount }] = await Promise.all([
        supabase!
          .from('featured_listings')
          .select('placement_type, active')
          .eq('company_id', user.company_id)
          .eq('active', true),
        supabase!
          .from('featured_listings')
          .select('*', { count: 'exact', head: true })
          .eq('placement_type', 'homepage')
          .eq('active', true),
      ])

      setActiveListings(featured || [])
      setHomepageSlots(homepageCount || 0)
    })
  }, [router])

  const isActive = (type: string) => activeListings.some((l) => l.placement_type === type)

  const subscribe = async (planId: string, tier: string, placementType: string) => {
    setLoading(tier)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, tier, placement_type: placementType }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  const FEATURED_OPTIONS = [
    {
      tier: 'city_featured',
      placementType: 'city',
      priceId: process.env.NEXT_PUBLIC_STRIPE_CITY_FEATURED_PRICE_ID || '',
      name: 'City Featured',
      price: '$49/month',
      desc: company
        ? `Appear at the top of search results in ${company.city}.`
        : 'Appear at the top of search results in your city.',
      cta: 'Get City Featured',
      badge: 'Local Boost',
    },
    {
      tier: 'state_featured',
      placementType: 'state',
      priceId: process.env.NEXT_PUBLIC_STRIPE_STATE_FEATURED_PRICE_ID || '',
      name: 'State Featured',
      price: '$99/month',
      desc: company
        ? `Appear at the top of all results across ${company.state}.`
        : 'Appear at the top of all results across your state.',
      cta: 'Get State Featured',
      badge: 'State-Wide',
    },
    {
      tier: 'homepage_featured',
      placementType: 'homepage',
      priceId: process.env.NEXT_PUBLIC_STRIPE_HOMEPAGE_FEATURED_PRICE_ID || '',
      name: 'Homepage Featured',
      price: '$199/month',
      desc: `Appear in the Featured Companies section on the homepage. Limited to 6 spots nationally. ${homepageSlots}/6 slots filled.`,
      cta: 'Get Homepage Featured',
      badge: 'National',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy mb-2">Featured Listings</h1>
        <p className="text-gray-500 text-sm">Boost your visibility to get more leads. Featured companies appear above standard listings in search results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED_OPTIONS.map((opt) => {
          const active = isActive(opt.placementType)
          const isFull = opt.placementType === 'homepage' && homepageSlots >= 6 && !active
          return (
            <div
              key={opt.tier}
              className={`bg-white rounded-2xl border-2 p-6 flex flex-col relative ${
                active ? 'border-green-400' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold bg-navy/10 text-navy px-2 py-1 rounded-full">{opt.badge}</span>
                {active && (
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200">
                    ✓ Active
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-navy mb-1">{opt.name}</h2>
              <div className="text-2xl font-black text-gray-900 mb-2">{opt.price}</div>
              <p className="text-sm text-gray-500 mb-6 flex-1">{opt.desc}</p>
              {active ? (
                <div className="w-full text-center py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold border border-green-200">
                  Currently Active
                </div>
              ) : isFull ? (
                <div className="w-full text-center py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold">
                  No slots available
                </div>
              ) : (
                <button
                  onClick={() => subscribe(opt.priceId, opt.tier, opt.placementType)}
                  disabled={loading === opt.tier}
                  className="w-full bg-navy hover:bg-navy/90 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {loading === opt.tier ? 'Redirecting…' : opt.cta}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">How featured listings work</p>
        <p>Featured companies appear above all standard listings in matching search results. Subscriptions are monthly and can be cancelled anytime from your billing portal.</p>
      </div>
    </div>
  )
}
