import Link from 'next/link'
import Header from '@/components/Header'

export default function QuoteSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
            Your Request Has Been Sent
          </h1>
          <p className="text-gray-600 mb-2">
            Your quote request has been sent to the selected cleaning companies.
          </p>
          <p className="text-gray-600 mb-2">
            They will review your details and contact you within 24 hours.
          </p>
          <p className="text-gray-600 mb-8">
            Check your email for a confirmation message.
          </p>
          <Link
            href="/search"
            className="inline-block bg-navy text-white font-semibold px-6 py-3 rounded-lg hover:bg-navy/90 transition-colors text-sm"
          >
            Browse More Companies
          </Link>
        </div>
      </main>
    </div>
  )
}
