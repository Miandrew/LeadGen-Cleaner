'use client'

import Link from 'next/link'
import CompanyLogo from './CompanyLogo'
import StarRating from './StarRating'
import { serviceLabel } from '@/lib/utils'

interface Company {
  id: string
  name: string
  slug: string
  city?: string | null
  state?: string | null
  rating?: number | null
  review_count?: number | null
  services?: string[] | null
  claimed?: boolean | null
  description?: string | null
  logo_url?: string | null
  website?: string | null
}

interface CompanyCardProps {
  company: Company
  isSelected: boolean
  onToggle: (id: string) => void
}

export default function CompanyCard({ company, isSelected, onToggle }: CompanyCardProps) {
  return (
    <div
      className={`bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-all ${
        isSelected ? 'border-accent ring-2 ring-accent/20' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <CompanyLogo company={company} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/company/${company.slug}`}
              className="font-semibold text-navy hover:underline text-base leading-tight line-clamp-2"
            >
              {company.name}
            </Link>
            {company.claimed && (
              <span className="flex-shrink-0 text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full border border-green-200">
                Verified
              </span>
            )}
          </div>
          {(company.city || company.state) && (
            <p className="text-sm text-gray-500 mt-0.5">
              {[company.city, company.state].filter(Boolean).join(', ')}
            </p>
          )}
          {company.rating != null && (
            <div className="flex items-center gap-1.5 mt-1">
              <StarRating rating={company.rating} size="sm" />
              <span className="text-xs text-gray-500">
                {company.rating.toFixed(1)} ({company.review_count ?? 0} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      {company.services && company.services.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {company.services.slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {serviceLabel(s)}
            </span>
          ))}
        </div>
      )}

      {company.description && (
        <p className="text-xs text-gray-500 mt-3 line-clamp-2">
          {company.description.slice(0, 100)}
          {company.description.length > 100 ? '…' : ''}
        </p>
      )}

      <button
        onClick={() => onToggle(company.id)}
        className={`mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
          isSelected
            ? 'bg-accent text-white border-accent hover:bg-accent/90'
            : 'bg-white text-gray-700 border-gray-300 hover:border-accent hover:text-accent'
        }`}
      >
        <span
          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
            isSelected ? 'bg-white border-white' : 'border-gray-400'
          }`}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        {isSelected ? 'Selected for Quote' : 'Select for Quote'}
      </button>
    </div>
  )
}
