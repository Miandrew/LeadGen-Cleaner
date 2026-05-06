import Link from 'next/link'
import { US_STATES } from '@/lib/utils'

export default function Footer() {
  const topStates = US_STATES.slice(0, 25)
  const bottomStates = US_STATES.slice(25)

  return (
    <footer className="bg-[#1B3A6B] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <h3 className="font-bold text-base mb-4">Browse by State</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[...topStates, ...bottomStates].map((s) => (
                <Link
                  key={s.code}
                  href={`/commercial-cleaning/${s.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm text-blue-200 hover:text-white transition-colors truncate"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-base mb-4">For Companies</h3>
            <div className="flex flex-col gap-2">
              <Link href="/claim" className="text-sm text-blue-200 hover:text-white transition-colors">
                Claim Your Listing
              </Link>
              <Link href="/dashboard" className="text-sm text-blue-200 hover:text-white transition-colors">
                Company Dashboard
              </Link>
              <Link href="/dashboard/subscription" className="text-sm text-blue-200 hover:text-white transition-colors">
                Pricing & Plans
              </Link>
              <Link href="/login" className="text-sm text-blue-200 hover:text-white transition-colors">
                Login
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-base mb-4">Legal</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-blue-200 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm text-blue-200 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-blue-200 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-blue-200 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-900 pt-6 text-center">
          <p className="text-sm text-blue-300">
            © {new Date().getFullYear()} CommercialCleaningNearMe.com — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
