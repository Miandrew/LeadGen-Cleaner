'use client'

import { useEffect, useState, useRef } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

export default function ClaimCallPage() {
  const [booked, setBooked] = useState(false)
  const notified = useRef(false)

  // Best-effort admin notification when someone reaches this page (non-blocking)
  useEffect(() => {
    if (notified.current) return
    notified.current = true
    fetch('/api/claim-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {})
  }, [])

  // Listen for Calendly's booking-complete event
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (
        e.data &&
        typeof e.data === 'object' &&
        e.data.event === 'calendly.event_scheduled'
      ) {
        setBooked(true)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const embedSrc = CALENDLY_URL
    ? `${CALENDLY_URL}${CALENDLY_URL.includes('?') ? '&' : '?'}embed_type=Inline&hide_gdpr_banner=1`
    : ''

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy mb-3">Let&apos;s get your listing set up — together</h1>
            <p className="text-gray-500">
              Facility managers in your city are searching for cleaning companies right now. Getting listed is
              completely free — book a quick call and we&apos;ll walk through it with you and get your profile live.
            </p>
          </div>

          {booked ? (
            <div className="bg-white rounded-xl border border-green-200 shadow-sm p-10 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-navy mb-2">You&apos;re booked!</h2>
              <p className="text-gray-600">We&apos;ll walk you through claiming your listing on the call.</p>
            </div>
          ) : embedSrc ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <iframe
                src={embedSrc}
                title="Book a call"
                className="w-full"
                style={{ height: 700, border: 0 }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
              <p>Booking is not available right now. Please email{' '}
                <a href="mailto:hello@commercialcleaningnearme.com" className="text-accent hover:underline">
                  hello@commercialcleaningnearme.com
                </a>{' '}
                and we&apos;ll set up your listing.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
