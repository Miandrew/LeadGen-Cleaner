import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy | CommercialCleaningNearMe.com',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-navy mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mb-10">Last updated: {new Date().getFullYear()}</p>
          <div className="space-y-8 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-navy mb-3">Information We Collect</h2>
              <p>When you submit a quote request, we collect your name, company name, email address, and phone number. This information is used solely to connect you with the cleaning companies you selected.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-navy mb-3">How We Use Your Information</h2>
              <p>Your contact details are shared only with the specific cleaning companies you select when submitting a quote request. We do not sell your information to third parties. We do not add you to marketing lists. We do not share your information with companies you did not select.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-navy mb-3">For Cleaning Companies</h2>
              <p>When you claim a listing, we collect your name, email, phone number, and business information. This is used to maintain your directory listing and deliver leads. You may opt out of email communications at any time using the unsubscribe link in any email we send.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-navy mb-3">Cookies</h2>
              <p>We use cookies for authentication and session management only. We do not use tracking cookies or advertising cookies.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-navy mb-3">Contact</h2>
              <p>Questions about this policy? Email us at{' '}
                <a href="mailto:hello@commercialcleaningnearme.com" className="text-accent hover:underline">hello@commercialcleaningnearme.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
