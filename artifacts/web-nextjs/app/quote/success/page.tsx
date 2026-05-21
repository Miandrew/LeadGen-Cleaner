import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function QuoteSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
              Your Quote Request Has Been Sent
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              The cleaning companies you selected have been notified and will reach out to you within 24 hours with quotes.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left mb-8">
              <h2 className="font-semibold text-navy mb-4 text-sm uppercase tracking-wide">What happens next</h2>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-accent text-white rounded-full text-xs font-bold flex items-center justify-center">1</span>
                  <span>Companies receive your request immediately via email and SMS.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-accent text-white rounded-full text-xs font-bold flex items-center justify-center">2</span>
                  <span>They review the details and reach out to you directly — typically within 2–24 hours.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-accent text-white rounded-full text-xs font-bold flex items-center justify-center">3</span>
                  <span>Compare their quotes, ask questions, and choose the best fit for your building.</span>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-8">
              <strong>Check your inbox</strong> — we&apos;ve sent you a confirmation email with a copy of your request.
              If you don&apos;t see it, please check your spam folder.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-block bg-navy text-white font-semibold px-6 py-3 rounded-lg hover:bg-navy/90 transition-colors text-sm"
              >
                Back to Home
              </Link>
              <Link
                href="/search"
                className="inline-block bg-white border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:border-accent hover:text-accent transition-colors text-sm"
              >
                Browse More Companies
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
