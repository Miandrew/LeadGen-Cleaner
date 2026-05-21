'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

function BookCallContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyId = searchParams.get('company_id') || ''
  const email = searchParams.get('email') || ''
  const fullName = searchParams.get('name') || ''
  const segment = (searchParams.get('segment') || 'HOT').toUpperCase()
  const city = searchParams.get('city') || 'your city'

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || ''
  const [submitting, setSubmitting] = useState(false)
  const [decided, setDecided] = useState(false)

  useEffect(() => {
    if (!calendlyUrl) return
    const existing = document.getElementById('calendly-widget-js')
    if (existing) return
    const script = document.createElement('script')
    script.id = 'calendly-widget-js'
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    const link = document.createElement('link')
    link.id = 'calendly-widget-css'
    link.href = 'https://assets.calendly.com/assets/external/widget.css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [calendlyUrl])

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (
        typeof e.data === 'object' &&
        e.data &&
        'event' in e.data &&
        e.data.event === 'calendly.event_scheduled'
      ) {
        recordAction('booked', e.data)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  async function recordAction(action: 'booked' | 'declined' | 'skipped', payload?: unknown) {
    if (submitting || decided) return
    setSubmitting(true)
    try {
      await fetch('/api/claim/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          email,
          full_name: fullName,
          segment,
          action,
          calendly_url: calendlyUrl,
          notes: payload ? JSON.stringify(payload).slice(0, 500) : null,
        }),
      })
    } catch {}
    setDecided(true)
    setSubmitting(false)

    if (action === 'booked') {
      router.push(`/claim/confirmation?status=booked`)
    } else {
      router.push(`/dashboard`)
    }
  }

  const firstName = fullName ? fullName.split(' ')[0] : ''
  const heading =
    segment === 'HOT'
      ? `${firstName ? firstName + ', you' : 'You'}\u2019re a great fit \u2014 let\u2019s talk`
      : `Welcome${firstName ? ', ' + firstName : ''} \u2014 book a quick intro call`

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Your listing is claimed ✓
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-3">{heading}</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              {segment === 'HOT'
                ? `Based on your answers, we have specific leads in ${city} that match your business. Pick a 15-minute slot and we'll walk you through what's available — no commitment.`
                : `A 15-minute call to show you exactly what leads are available in ${city} and how to set up SMS follow-up so you reach prospects first.`}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            {calendlyUrl ? (
              <div
                className="calendly-inline-widget"
                data-url={`${calendlyUrl}?hide_event_type_details=0&hide_gdpr_banner=1${email ? `&email=${encodeURIComponent(email)}` : ''}${fullName ? `&name=${encodeURIComponent(fullName)}` : ''}`}
                style={{ minWidth: '320px', height: '650px' }}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  Booking calendar is being set up. Please email us to schedule:
                </p>
                <a
                  href="mailto:hello@commercialcleaningnearme.com"
                  className="inline-block bg-navy text-white font-semibold px-6 py-3 rounded-lg"
                >
                  hello@commercialcleaningnearme.com
                </a>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center text-sm">
            <button
              onClick={() => recordAction('declined')}
              disabled={submitting || decided}
              className="text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
            >
              Not now — go to my dashboard
            </button>
            <span className="hidden sm:inline text-gray-300">|</span>
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              Skip this step
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function BookCallPage() {
  return (
    <Suspense>
      <BookCallContent />
    </Suspense>
  )
}
