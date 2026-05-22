import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CompanyLogo from '@/components/CompanyLogo'
import StarRating from '@/components/StarRating'
import ReviewsList from '@/components/ReviewsList'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { formatPhone, FULL_STATE_NAMES, serviceLabel } from '@/lib/utils'

interface Props {
  params: { slug: string }
}

async function getCompany(slug: string) {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null
  const { data } = await supabaseAdmin.from('companies').select('*').eq('slug', slug).single()
  return data
}

async function getReviews(companyId: string) {
  if (!isSupabaseConfigured() || !supabaseAdmin) return []
  const { data } = await supabaseAdmin.from('reviews').select('*').eq('company_id', companyId).order('created_at', { ascending: false })
  return data || []
}

async function fetchAndStorePlacesPhotos(company: { id: string; place_id: string; name: string }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey || !isSupabaseConfigured() || !supabaseAdmin) return []
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${company.place_id}&fields=photos&key=${apiKey}`
    )
    const json = await res.json()
    const photos: string[] = (json.result?.photos || []).slice(0, 5).map(
      (p: { photo_reference: string }) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${apiKey}`
    )
    if (photos.length > 0) {
      await supabaseAdmin.from('companies').update({ image_urls: photos }).eq('id', company.id)
    }
    return photos
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await getCompany(params.slug)
  if (!company) return { title: 'Company Not Found' }
  const services = (company.services || []).map((s: string) => serviceLabel(s)).join(', ')
  return {
    title: `${company.name} — Commercial Cleaning in ${company.city}, ${company.state}`,
    description: `${company.name} offers ${services} in ${company.city}, ${company.state}. Rated ${company.rating} stars from ${company.review_count} reviews. Request a free quote today.`,
  }
}

export default async function CompanyPage({ params }: Props) {
  const company = await getCompany(params.slug)
  if (!company) notFound()

  const reviews = await getReviews(company.id)

  let images: string[] = company.image_urls || []
  if (images.length === 0 && company.place_id) {
    images = await fetchAndStorePlacesPhotos(company)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address,
      addressLocality: company.city,
      addressRegion: company.state,
      postalCode: company.zip,
      addressCountry: 'US',
    },
    telephone: company.phone,
    url: company.website,
    aggregateRating: company.rating
      ? { '@type': 'AggregateRating', ratingValue: company.rating, reviewCount: company.review_count }
      : undefined,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <CompanyLogo company={company} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-navy leading-tight">{company.name}</h1>
                  {company.claimed && (
                    <span className="flex-shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                      Verified
                    </span>
                  )}
                </div>
                {(company.city || company.state) && (
                  <p className="text-gray-500 mt-1">
                    {[company.city, FULL_STATE_NAMES[company.state] || company.state].filter(Boolean).join(', ')}
                  </p>
                )}
                {company.rating != null && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={company.rating} size="md" showNumber />
                    <span className="text-sm text-gray-500">({company.review_count} reviews)</span>
                  </div>
                )}
                {company.services && company.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {company.services.map((s: string) => (
                      <span key={s} className="text-xs bg-blue-50 text-accent font-medium px-2.5 py-1 rounded-full border border-blue-100">
                        {serviceLabel(s)}
                      </span>
                    ))}
                  </div>
                )}
                {company.certifications && company.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {company.certifications.map((c: string) => (
                      <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-3 mt-4">
                  {company.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className="inline-flex items-center gap-2 bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy/90 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {formatPhone(company.phone)}
                    </a>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:border-accent hover:text-accent transition-colors"
                    >
                      Visit Website
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
                {!company.claimed && (
                  <Link href={`/claim/${company.slug}`} className="inline-block mt-3 text-sm text-gray-400 hover:text-accent transition-colors">
                    Claim This Listing →
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="bg-accent rounded-xl p-6 text-white">
            <h2 className="text-lg font-bold mb-1">Request a Free Quote from {company.name}</h2>
            <p className="text-blue-100 text-sm mb-4">Get a response within 24 hours. No obligation.</p>
            <Link
              href={`/quote?companies=${company.id}${company.city ? `&city=${encodeURIComponent(company.city)}` : ''}${company.state ? `&state=${company.state}` : ''}`}
              className="inline-block bg-white text-accent font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-colors"
            >
              Request Free Quote →
            </Link>
          </div>

          {images.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-navy mb-4">Photos</h2>
              <div className="grid grid-cols-3 gap-2">
                {images.slice(0, 5).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt={`${company.name} photo ${i + 1}`} className={`rounded-lg object-cover w-full ${i === 0 ? 'col-span-2 row-span-2 h-48' : 'h-[90px]'}`} />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-navy mb-4">About</h2>
            <div className="space-y-3 text-sm text-gray-600">
              {company.description && <p>{company.description}</p>}
              {company.years_in_business && <div className="flex items-center gap-2"><span className="font-medium text-gray-900">Years in Business:</span> {company.years_in_business}</div>}
              {company.employee_count && <div className="flex items-center gap-2"><span className="font-medium text-gray-900">Team Size:</span> {company.employee_count}</div>}
              {company.address && <div className="flex items-center gap-2"><span className="font-medium text-gray-900">Address:</span> {company.address}</div>}
            </div>
          </div>

          {(company.address || (company.city && company.state)) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-navy mb-4">Location</h2>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent([company.address, company.city, company.state].filter(Boolean).join(', '))}&output=embed`}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="rounded-lg"
              />
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-navy mb-4">
              Reviews {company.review_count > 0 && `(${company.review_count})`}
            </h2>
            <ReviewsList reviews={reviews} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
