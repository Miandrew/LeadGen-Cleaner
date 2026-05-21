import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 3600

const PLANS = [
  {
    name: 'Pay Per Lead',
    price: '$35',
    per: 'per lead',
    desc: 'No commitment. Pay only when you want to contact a facility manager.',
    features: [
      'Unlock full contact details per lead',
      'See service type, building size, frequency',
      'No monthly fee',
    ],
    cta: 'Claim Free Listing',
    href: '/claim',
    highlight: false,
  },
  {
    name: 'Essentials',
    price: '$149',
    per: '/month',
    desc: 'Leads delivered automatically plus the full automation suite running in the background.',
    features: [
      'Free leads included — shared, up to 3 companies',
      'Automated SMS follow-up within 2 minutes of every lead',
      'Missed call text back — no lead falls through',
      'Automated review request sequences',
      'Appointment booking sent automatically when prospects respond',
      'Monthly performance report',
      'Boosted directory ranking',
      'Cancel anytime',
    ],
    cta: 'Start Essentials',
    href: '/claim',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$349',
    per: '/month',
    desc: 'Everything in Essentials plus semi-exclusive leads and active management of your Google presence.',
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
    cta: 'Start Growth',
    href: '/claim',
    highlight: true,
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Claim Your Free Listing',
    desc: 'Search for your company in our directory and claim your listing in under 5 minutes. Add your logo, services, certifications, and contact info.',
  },
  {
    step: '02',
    title: 'Facility Managers Find You',
    desc: 'Commercial property managers search our directory by city and service type, compare companies side-by-side, and submit free quote requests.',
  },
  {
    step: '03',
    title: 'You Unlock Contact Details',
    desc: 'When a facility manager in your area requests a quote and selects your company, you get notified. Pay per lead to unlock their contact info, or subscribe for automatic delivery.',
  },
  {
    step: '04',
    title: 'Win the Contract',
    desc: 'Reach out directly, give your quote, and close the deal. You keep 100% of the contract value — no commissions, no ongoing fees.',
  },
]

async function getStats() {
  try {
    const [{ count }, { data: states }] = await Promise.all([
      supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).eq('active', true),
      supabaseAdmin.from('companies').select('state').eq('active', true).not('state', 'is', null),
    ])
    const uniqueStates = new Set((states || []).map((s: { state: string }) => s.state)).size
    return { companyCount: count || 0, stateCount: uniqueStates }
  } catch {
    return { companyCount: 4700, stateCount: 36 }
  }
}

export default async function ForCleaningCompaniesPage() {
  const { companyCount, stateCount } = await getStats()
  const companyCountLabel = companyCount >= 1000
    ? `${Math.floor(companyCount / 100) / 10}K+`
    : `${companyCount}+`
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-navy text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-accent/20 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            For Commercial Cleaning Companies
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
            Get More Commercial Cleaning Contracts
          </h1>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Facility managers in your city are searching for commercial cleaning companies right now.
            Claim your free listing and start receiving qualified quote requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/claim"
              className="bg-accent hover:bg-accent/90 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
            >
              Claim Your Free Listing →
            </Link>
            <a
              href="#pricing"
              className="border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
            >
              See Pricing
            </a>
          </div>
          <p className="text-blue-300 text-sm mt-4">Free to claim · No credit card required to get started</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: companyCountLabel, label: 'Companies Listed' },
            { value: `${stateCount} States`, label: 'Coverage Today' },
            { value: '$35', label: 'Flat Per Lead' },
            { value: '100%', label: 'Contract Value Yours' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-navy">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="text-4xl font-black text-accent/20 mb-3">{item.step}</div>
                <h3 className="text-lg font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-500">Start for free. Pay only when you find leads worth pursuing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-navy mb-1">{plan.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 mb-1 text-sm">{plan.per}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{plan.desc}</p>
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
                <Link
                  href={plan.href}
                  className={`w-full text-center font-bold py-3 rounded-xl text-sm transition-colors block ${
                    plan.highlight
                      ? 'bg-accent hover:bg-accent/90 text-white'
                      : 'bg-navy hover:bg-navy/90 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-navy text-center mb-3">Why Our Directory Works</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            We&apos;re built specifically for commercial cleaning — not a generic home services marketplace.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'B2B Leads Only',
                desc: 'Every quote request is from a facility manager, property manager, or business owner — never residential. You get qualified commercial prospects only.',
              },
              {
                icon: '🔒',
                title: 'Pay Only For Real Leads',
                desc: 'No setup fees, no monthly commitment on pay-per-lead. You see service type, building size, and frequency before deciding whether to unlock.',
              },
              {
                icon: '⚡',
                title: 'Built For Speed',
                desc: 'Subscriber plans include automated SMS follow-up within 2 minutes — research shows responding in the first 5 minutes increases your close rate by up to 9×.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">Common Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'What types of leads can I expect?',
                a: 'Leads are facility managers and property managers requesting quotes for commercial cleaning — office buildings, medical offices, warehouses, schools, retail spaces, and more. Each lead includes service type, building size, frequency, and their contact info once unlocked.',
              },
              {
                q: 'How does lead pricing work?',
                a: 'A flat $35 per lead — every lead, every time. No tiers, no surprises. Facility managers can request quotes from up to 3 companies per lead. Subscribers receive leads automatically as part of their monthly plan.',
              },
              {
                q: 'Do I compete with other cleaning companies for the same lead?',
                a: 'A facility manager can select up to 3 companies per quote request. Your speed of response makes a huge difference — subscriber plans automate SMS follow-up within 2 minutes so you reach prospects first.',
              },
              {
                q: 'What if I\'m not listed in the directory yet?',
                a: 'Contact us at hello@commercialcleaningnearme.com and we\'ll add your company within 24 hours. Listing is always free.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, anytime. No contracts, no cancellation fees. You can cancel from your dashboard and your plan remains active until the end of the current billing period.',
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-navy text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Win More Contracts?</h2>
          <p className="text-blue-200 mb-8">Claim your free listing in 5 minutes. No credit card required.</p>
          <Link
            href="/claim"
            className="inline-block bg-accent hover:bg-accent/90 text-white font-bold px-10 py-4 rounded-xl text-base transition-colors"
          >
            Claim Your Free Listing →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
