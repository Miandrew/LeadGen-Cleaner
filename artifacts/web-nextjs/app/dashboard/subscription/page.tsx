'use client'

import { useEffect, useState } from 'react'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

const PLANS = [
  {
    name: 'Growth',
    tier: 'growth',
    price: '$199',
    per: '/month',
    headline: 'Win More Commercial Cleaning Contracts',
    desc: 'Designed for growing commercial cleaning companies that want consistent opportunities and automated follow-up.',
    features: [
      'Priority access to qualified commercial cleaning opportunities',
      'Monthly lead allocation based on your market',
      'Instant SMS follow-up for every new lead',
      'Missed-call text back — never lose a prospect',
      'Automated review request campaigns',
      'Sales pipeline for every opportunity',
      'Higher placement in directory search results',
      'Email support',
    ],
    highlight: false,
  },
  {
    name: 'Unlimited',
    tier: 'unlimited',
    price: '$399',
    per: '/month',
    headline: 'Become the Highest Visibility Cleaning Company in Your Market',
    desc: 'For established companies focused on growth, efficiency, and market leadership.',
    features: [
      'Everything in Growth',
      'Highest priority for marketplace lead distribution',
      'Semi-exclusive leads — maximum allocation per market',
      'Google Business Profile management workflow',
      'Review monitoring and response workflow',
      'Advanced pipeline reporting',
      'Monthly strategy session scheduling',
      'Priority support',
    ],
    highlight: true,
  },
]

interface SubscriptionStatus {
  subscribed: boolean
  subscription_id?: string
  subscription_status?: string
  subscription_tier?: string
  leads_remaining?: number
  current_period_end?: string
  cancel_at_period_end?: boolean
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function PlanBadge({ tier }: { tier: string }) {
  const label = tier === 'unlimited' ? 'Unlimited' : 'Growth'
  const color = tier === 'unlimited' ? 'bg-accent text-white' : 'bg-navy text-white'
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${color}`}>
      {label}
    </span>
  )
}

export default function SubscriptionPage() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/subscription/status')
      .then(r => r.json())
      .then(data => {
        setStatus(data)
        setLoading(false)
      })
      .catch(() => {
        setStatus({ subscribed: false })
        setLoading(false)
      })
  }, [])

  async function handleCancel() {
    if (!status?.subscription_id) return
    if (!confirm('Are you sure you want to cancel? Your plan stays active until the end of the billing period.')) return
    setCancelling(true)
    setError(null)
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_id: status.subscription_id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel')
      setCancelDone(true)
      setStatus(prev => prev ? { ...prev, cancel_at_period_end: true } : prev)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center">
        <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-3 text-sm">Loading subscription details…</p>
      </div>
    )
  }

  // ── Active subscriber view ──────────────────────────────────────────────────
  if (status?.subscribed) {
    const tier = status.subscription_tier ?? 'growth'
    const currentPlan = PLANS.find(p => p.tier === tier) ?? PLANS[0]
    const otherPlan = PLANS.find(p => p.tier !== tier)
    const isCancelling = cancelDone || status.cancel_at_period_end

    return (
      <div className="max-w-3xl mx-auto py-2 space-y-6">
        {/* Current plan card */}
        <div className="rounded-2xl border-2 border-accent p-6 bg-white shadow-sm shadow-accent/10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Current Plan</p>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-gray-900">{currentPlan.name}</h2>
                <PlanBadge tier={tier} />
              </div>
              <p className="text-sm text-gray-500">{currentPlan.desc}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-black text-gray-900">{currentPlan.price}<span className="text-base font-normal text-gray-400">/mo</span></p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-accent">
                {tier === 'unlimited' ? '∞' : (status.leads_remaining ?? 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Leads Remaining</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-gray-700">
                {status.current_period_end ? formatDate(status.current_period_end) : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {isCancelling ? 'Access Until' : 'Next Billing Date'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className={`text-sm font-bold ${isCancelling ? 'text-orange-500' : 'text-green-600'}`}>
                {isCancelling ? 'Cancels at period end' : 'Active'}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Status</p>
            </div>
          </div>

          {/* Features list */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Included in your plan</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentPlan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cancel / status messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {isCancelling ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
            <p className="font-semibold">Cancellation scheduled</p>
            <p className="mt-1">Your plan remains active until <strong>{status.current_period_end ? formatDate(status.current_period_end) : 'end of billing period'}</strong>. You won't be charged again.</p>
            <p className="mt-2 text-xs text-orange-600">To reactivate, contact us at <a href="mailto:hello@commercialcleaningnearme.com" className="underline">hello@commercialcleaningnearme.com</a></p>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling…' : 'Cancel subscription'}
            </button>
          </div>
        )}

        {/* Upgrade / downgrade section */}
        {otherPlan && !isCancelling && (
          <div className={`rounded-2xl border-2 p-5 ${otherPlan.highlight ? 'border-accent/60 bg-accent/5' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
                  {otherPlan.highlight ? '⬆ Upgrade' : '⬇ Downgrade'}
                </p>
                <h3 className="text-lg font-bold text-gray-900">{otherPlan.name} — {otherPlan.price}/mo</h3>
                <p className="text-sm text-gray-500 mt-1">{otherPlan.desc}</p>
              </div>
              {CALENDLY_URL ? (
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shrink-0 inline-block font-bold py-2.5 px-5 rounded-xl text-sm transition-colors ${
                    otherPlan.highlight
                      ? 'bg-accent hover:bg-accent/90 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Switch to {otherPlan.name}
                </a>
              ) : (
                <a
                  href="mailto:hello@commercialcleaningnearme.com?subject=Plan change request"
                  className="shrink-0 inline-block font-bold py-2.5 px-5 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  Contact us to switch
                </a>
              )}
            </div>
          </div>
        )}

        {/* Pay-per-lead note */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-sm font-semibold text-gray-700 mb-1">Need extra leads beyond your allocation?</p>
          <p className="text-sm text-gray-500">
            Purchase additional individual leads for $35 each — no extra commitment required.
          </p>
        </div>
      </div>
    )
  }

  // ── Non-subscriber view (existing plan comparison) ──────────────────────────
  return (
    <div className="max-w-4xl mx-auto py-2">
      {/* Show expired/cancelled notice if they had a subscription before */}
      {status?.subscription_status === 'cancelled' && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700">
          Your previous subscription has ended. Choose a plan below to reactivate.
        </div>
      )}
      {status?.subscription_status === 'past_due' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Your subscription payment failed. Please select a plan to update your payment method.
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-navy mb-3">Choose Your Growth Plan</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Every plan includes qualified commercial cleaning opportunities delivered to your business.
          No commissions. No long-term contracts. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border-2 p-6 flex flex-col relative ${
              plan.highlight ? 'border-accent shadow-lg shadow-accent/10' : 'border-gray-200'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
              </div>
            )}
            <div className="mb-4">
              <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">{plan.name}</p>
              <h2 className="text-lg font-bold text-navy mb-2 leading-snug">{plan.headline}</h2>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                <span className="text-gray-400 mb-1 text-sm">{plan.per}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{plan.desc}</p>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <div className="text-center">
              {CALENDLY_URL ? (
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-block text-center font-bold py-3 rounded-xl text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-accent hover:bg-accent/90 text-white'
                      : 'bg-navy hover:bg-navy/90 text-white'
                  }`}
                >
                  Get Started — {plan.name}
                </a>
              ) : (
                <p className="text-sm text-gray-400">Contact us at hello@commercialcleaningnearme.com to get started.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center">
        <p className="text-sm font-semibold text-gray-700 mb-1">Not ready to subscribe?</p>
        <p className="text-sm text-gray-500">
          Purchase individual leads for $35 each — no subscription required.
          You see the opportunity details before you decide.
        </p>
      </div>
    </div>
  )
}
