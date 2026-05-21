'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface UserData {
  subscription_status: string | null
  subscription_tier: string | null
  company_id: string
}

const PLANS = [
  {
    id: 'essentials',
    priceId: process.env.NEXT_PUBLIC_STRIPE_ESSENTIALS_PRICE_ID || '',
    name: 'Essentials',
    price: '$149',
    period: '/month',
    features: [
      'Free leads included — shared, up to 3 companies',
      'Automated SMS follow-up within 2 minutes of every lead',
      'Missed call text back — no lead falls through',
      'Automated review request sequences',
      'Appointment booking sent automatically',
      'Monthly performance report',
      'Boosted directory ranking',
      'Cancel anytime',
    ],
    popular: false,
  },
  {
    id: 'growth',
    priceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID || '',
    name: 'Growth',
    price: '$349',
    period: '/month',
    features: [
      'Free leads included — semi-exclusive, max 2 companies',
      'Everything in Essentials',
      'Google Business Profile management — 4 posts/month',
      'Review response management within 48 hours',
      'Full pipeline dashboard — track every lead',
      '90-day nurture sequences for cold prospects',
      'Reactivation campaigns to past clients twice yearly',
      'Two-way SMS from your business number',
      'Optional monthly strategy call',
      'Cancel anytime',
    ],
    popular: true,
  },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) { router.push('/login'); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data } = await supabase!.from('users').select('subscription_status, subscription_tier, company_id').eq('email', session.user.email!).single()
      if (data) setUserData(data)
    })
  }, [router])

  const subscribe = async (plan: typeof PLANS[0]) => {
    setLoading(plan.id)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: plan.priceId, tier: plan.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-2">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-navy mb-3">Choose Your Plan</h1>
        <p className="text-gray-500">Get leads delivered automatically — no per-lead payments needed.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {PLANS.map((plan) => {
          const isActive = userData?.subscription_tier === plan.id && userData?.subscription_status === 'active'
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 shadow-sm p-6 flex flex-col relative ${
                plan.popular ? 'border-accent' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-navy">{plan.name}</h2>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 mb-1">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              {isActive ? (
                <div className="text-center">
                  <span className="inline-block bg-green-100 text-green-700 font-semibold text-sm px-4 py-2 rounded-lg border border-green-200">
                    ✓ Active Plan
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => subscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full font-semibold py-3 rounded-xl text-sm transition-colors ${
                    plan.popular
                      ? 'bg-accent hover:bg-accent/90 text-white'
                      : 'bg-navy hover:bg-navy/90 text-white'
                  } disabled:bg-gray-300`}
                >
                  {loading === plan.id ? 'Redirecting…' : `Start ${plan.name} Plan`}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
