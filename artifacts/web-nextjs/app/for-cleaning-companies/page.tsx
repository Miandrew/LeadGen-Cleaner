import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const PLANS = [
  {
    name: 'Pay Per Lead',
    price: '$35',
    per: 'per lead',
    desc: 'Perfect for getting started. Only pay when you want to contact a facility manager.',
    features: [
      'Unlock one lead at a time',
      'Full contact info: name, phone, email',
      'See building size, service type, frequency',
      'No monthly commitment',
    ],
    cta: 'Claim Free Listing',
    href: '/claim',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$199',
    per: '/month',
    desc: 'Most popular. Get 8 leads delivered automatically every month without lifting a finger.',
    features: [
      '8 leads per month, auto-delivered',
      'Featured badge on your listing',
      'Priority placement in search results',
      'Cancel anytime',
    ],
    cta: 'Start Growth Plan',
    href: '/claim',
    highlight: true,
  },
  {
    name: 'Unlimited',
    price: '$399',
    per: '/month',
    desc: 'Scale fast. Get every lead in your state the moment it comes in.',
    features: [
      'All leads in your state, unlimited',
      'First priority on every new lead',
      'Dedicated account support',
      'Cancel anytime',
    ],
    cta: 'Start Unlimited',
    href: '/claim',
    highlight: false,
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
    desc: 'When a facility manager in your area requests a quote and selects your company, you get notified. Pay $35 to unlock their contact info, or subscribe for automatic delivery.',
  },
  {
    step: '04',
    title: 'Win the Contract',
    desc: 'Reach out directly, give your quote, and close the deal. You keep 100% of the contract value — no commissions, no ongoing fees.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'We picked up a $3,200/month janitorial contract from our first lead. The ROI on a $35 unlock is incredible.',
    name: 'Marcus T.',
    company: 'Chicago Facility Services',
  },
  {
    quote: 'The Growth plan pays for itself with one contract. We\'ve won 4 long-term clients in 3 months.',
    name: 'Sandra R.',
    company: 'Lone Star Commercial Cleaning, Houston',
  },
  {
    quote: 'Finally a lead gen service that actually understands the commercial cleaning industry.',
    name: 'Kevin P.',
    company: 'Pacific Northwest Facility Services',
  },
]

export default function ForCleaningCompaniesPage() {
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
            { value: '10,000+', label: 'Companies Listed' },
            { value: 'All 50', label: 'States Covered' },
            { value: '$35', label: 'Per Lead Unlock' },
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

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-navy text-center mb-12">What Cleaning Companies Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.company}</p>
                </div>
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
                q: 'How quickly do leads come in?',
                a: 'It depends on your market and service type. Most active markets (major US cities) see new leads daily. Rural markets may see 2-5 per week. You can filter your notifications by city, state, or service type.',
              },
              {
                q: 'Do I compete with other cleaning companies for the same lead?',
                a: 'Yes — facility managers typically select up to 3 companies to receive quotes from. If they selected your company, you have a real shot at the contract. You\'ll know upfront which service they need and the building details.',
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
