'use client'

import { useState } from 'react'
import { getInitials } from '@/lib/utils'

interface CompanyLogoProps {
  company: { name: string; logo_url?: string | null; website?: string | null }
  size?: 'sm' | 'md' | 'lg'
}

export default function CompanyLogo({ company, size = 'md' }: CompanyLogoProps) {
  const sizeMap = { sm: 'w-10 h-10 text-sm', md: 'w-14 h-14 text-base', lg: 'w-24 h-24 text-2xl' }
  const cls = sizeMap[size]

  const [step, setStep] = useState<'logo' | 'clearbit' | 'initials'>(
    company.logo_url ? 'logo' : company.website ? 'clearbit' : 'initials'
  )

  const domain = company.website
    ? company.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    : null

  const initials = getInitials(company.name)

  if (step === 'logo' && company.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={company.logo_url}
        alt={company.name}
        className={`${cls} rounded-lg object-contain border border-gray-100`}
        onError={() => setStep(domain ? 'clearbit' : 'initials')}
      />
    )
  }

  if (step === 'clearbit' && domain) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={company.name}
        className={`${cls} rounded-lg object-contain border border-gray-100`}
        onError={() => setStep('initials')}
      />
    )
  }

  return (
    <div
      className={`${cls} rounded-lg bg-[#1B3A6B] flex items-center justify-center font-bold text-white flex-shrink-0`}
    >
      {initials}
    </div>
  )
}
