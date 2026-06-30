'use client'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

const PLANS = [
  {
    name: 'Growth',
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

export default function SubscriptionPage() {
  return (
    <div className="max-w-4xl mx-auto py-2">
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
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
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
