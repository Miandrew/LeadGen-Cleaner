'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'

type Status = 'loading' | 'ready' | 'booked' | 'verified' | 'timeout'

export default function ClaimVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get('name') || ''
  const firstName = name.split(' ')[0] || 'there'

  const [status, setStatus] = useState<Status>('loading')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const startPolling = useCallback(() => {
    const deadline = Date.now() + 60_000
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/claim/verify')
        if (res.ok) {
          const data = await res.json()
          if (data.verified) {
            stopPolling()
            setStatus('verified')
            setTimeout(() => router.push('/dashboard'), 2500)
            return
          }
        }
      } catch {
        // ignore transient fetch errors during polling
      }
      if (Date.now() > deadline) {
        stopPolling()
        setStatus('timeout')
      }
    }, 3000)
  }, [router, stopPolling])

  useEffect(() => {
    if (!supabase) {
      router.replace('/login')
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }
      setStatus('ready')
    })
  }, [router])

  useEffect(() => {
    if (status !== 'ready') return

    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.head.appendChild(script)

    const CALENDLY_ORIGINS = ['https://calendly.com', 'https://assets.calendly.com']

    const handleMessage = (e: MessageEvent) => {
      if (!CALENDLY_ORIGINS.includes(e.origin)) return
      if (e.data?.event === 'calendly.event_scheduled') {
        setStatus('booked')
        startPolling()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
      document.head.removeChild(script)
      stopPolling()
    }
  }, [status, startPolling, stopPolling])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-navy">One last step, {firstName}</h1>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              Book a quick 15-minute onboarding call so we can verify your listing and set up your lead preferences. You&apos;ll have dashboard access immediately after.
            </p>
          </div>

          {status === 'loading' && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {status === 'ready' && calendlyUrl && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className="calendly-inline-widget"
                data-url={calendlyUrl}
                style={{ minWidth: '320px', height: '700px' }}
              />
            </div>
          )}

          {status === 'ready' && !calendlyUrl && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <p className="text-amber-800 text-sm font-medium">Booking widget not configured.</p>
              <p className="text-amber-600 text-xs mt-1">Add <code>NEXT_PUBLIC_CALENDLY_URL</code> to your environment variables.</p>
            </div>
          )}

          {status === 'booked' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Booking confirmed!</h2>
              <p className="text-gray-500 text-sm">Activating your account — just a moment…</p>
            </div>
          )}

          {status === 'verified' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-green-900 mb-2">You&apos;re verified!</h2>
              <p className="text-green-700 text-sm">Taking you to your dashboard…</p>
            </div>
          )}

          {status === 'timeout' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">You&apos;re booked!</h2>
              <p className="text-gray-500 text-sm mb-5">
                Your account is being activated — it usually takes less than a minute. Check back shortly and your dashboard will be ready.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-navy text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-navy/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
