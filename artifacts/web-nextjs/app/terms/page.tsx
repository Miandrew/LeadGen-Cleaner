import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service | CommercialCleaningNearMe.com',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-navy mb-3">Terms of Service</h1>
          <p className="text-gray-400 text-sm mb-10">Last updated: {new Date().getFullYear()}</p>
          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-navy mb-3">Use of the Directory</h2>
              <p>CommercialCleaningNearMe.com is a directory service. By using this site, you agree not to submit false information, misuse contact details obtained through the platform, or attempt to circumvent our systems.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-navy mb-3">For Facility Managers</h2>
              <p>Submitting a quote request is free. By submitting, you consent to being contacted by the cleaning companies you selected. You are not obligated to engage with any company that contacts you.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-navy mb-3">For Cleaning Companies</h2>
              <p>Lead contact details are provided for the purpose of responding to quote requests only. Resale of contact information obtained through this platform is prohibited. Subscription fees are billed monthly and may be cancelled at any time. Refunds are not provided for partial months.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-navy mb-3">Disclaimer</h2>
              <p>We do not guarantee the quality of any cleaning company listed in our directory. Reviews displayed are sourced from Google and reflect the opinions of third parties. We are not responsible for the outcome of any engagement between a facility manager and a cleaning company.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-navy mb-3">Contact</h2>
              <p>Questions?{' '}
                <a href="mailto:hello@commercialcleaningnearme.com" className="text-accent hover:underline">hello@commercialcleaningnearme.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
