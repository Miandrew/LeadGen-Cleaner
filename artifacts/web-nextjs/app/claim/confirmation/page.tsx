'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status') || 'booked'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
            {status === 'booked' ? "You're booked — see you soon!" : 'All set'}
          </h1>
          <p className="text-gray-600 mb-2">
            {status === 'booked'
              ? "We've sent a calendar invite to your email."
              : 'Your listing is live in our directory.'}
          </p>
          <p className="text-gray-600 mb-8">
            In the meantime, head to your dashboard to complete your profile and view any available leads in your area.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900 text-left mb-8">
            <p className="font-semibold mb-2">Before our call, please:</p>
            <ul className="space-y-1.5 list-disc list-inside text-blue-800">
              <li>Add your logo and a short description to your profile</li>
              <li>Confirm the cities and service types you cover</li>
              <li>Think about the type of contracts you want most</li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="inline-block bg-navy text-white font-semibold px-6 py-3 rounded-lg hover:bg-navy/90 transition-colors text-sm"
          >
            Go to My Dashboard →
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function ClaimConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
