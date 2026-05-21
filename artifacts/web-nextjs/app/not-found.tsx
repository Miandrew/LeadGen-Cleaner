import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl font-black text-gray-200 mb-4">404</div>
          <h1 className="text-2xl font-bold text-navy mb-3">Page not found</h1>
          <p className="text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search"
              className="bg-navy text-white font-semibold px-6 py-3 rounded-lg hover:bg-navy/90 transition-colors text-sm"
            >
              Browse Directory
            </Link>
            <Link
              href="/claim"
              className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:border-accent hover:text-accent transition-colors text-sm"
            >
              Claim Your Listing
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
