'use client'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

const BENEFITS = [
  'Free leads delivered automatically — no per-lead payments',
  'Automated SMS follow-up within 2 minutes of every lead',
  'Missed call text back — no lead falls through',
  'Automated review request sequences',
  'Google Business Profile management',
  'Full pipeline dashboard — track every lead',
  '90-day nurture sequences for cold prospects',
  'Boosted directory ranking',
]

export default function SubscriptionPage() {
  return (
    <div className="max-w-3xl mx-auto py-2">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-navy mb-3">Grow With Us</h1>
        <p className="text-gray-500">
          Want leads delivered automatically and your follow-up handled for you? Book a quick call and
          we&apos;ll build the right plan for your business.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <ul className="space-y-3 mb-8">
          {BENEFITS.map((f) => (
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
              className="inline-block bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-8 rounded-xl text-sm transition-colors"
            >
              Book a Call
            </a>
          ) : (
            <p className="text-sm text-gray-400">Booking link coming soon — please check back shortly.</p>
          )}
        </div>
      </div>
    </div>
  )
}
