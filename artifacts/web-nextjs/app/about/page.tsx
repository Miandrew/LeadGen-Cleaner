import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'About | CommercialCleaningNearMe.com',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-navy mb-6">About CommercialCleaningNearMe.com</h1>
          <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
            <p className="text-lg">
              CommercialCleaningNearMe.com is a directory connecting facility managers and property owners with verified commercial cleaning companies across the United States.
            </p>
            <p>
              We built this because finding a reliable commercial cleaner is harder than it should be. Facility managers waste hours calling companies who don&apos;t serve their area, comparing quotes with no common standard, and relying on outdated listings. Cleaning companies waste money on ads that reach the wrong people.
            </p>
            <p>
              Our directory gives facility managers a single, organized place to search by city and service type, read real Google reviews, and request quotes from multiple companies at once. It gives cleaning companies a reliable channel to reach facility managers who are actively looking — without the overhead of paid ads.
            </p>
            <h2 className="text-2xl font-bold text-navy mt-10 mb-4">How It Works</h2>
            <p>
              Facility managers search free. They can browse companies, read reviews, compare services, and submit quote requests at no cost. Their contact information is only shared with the specific companies they select — never distributed broadly or sold.
            </p>
            <p>
              Cleaning companies claim their free listing and pay only when they want to access a lead&apos;s contact details. There is no monthly fee to be listed.
            </p>
            <h2 className="text-2xl font-bold text-navy mt-10 mb-4">Contact</h2>
            <p>
              Questions or feedback?{' '}
              <Link href="/contact" className="text-accent hover:underline">Reach out here</Link>{' '}
              or email us at{' '}
              <a href="mailto:hello@commercialcleaningnearme.com" className="text-accent hover:underline">hello@commercialcleaningnearme.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
