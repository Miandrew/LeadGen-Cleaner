'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CompanyCard from './CompanyCard'
import SelectionBar from './SelectionBar'

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

interface Props {
  companies: Company[]
  city?: string
  state?: string
  service?: string
}

export default function PseoCompanyGrid({ companies, city, state, service }: Props) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [toast, setToast] = useState('')

  const toggleCompany = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) {
        setToast('Maximum 3 companies — deselect one to add another.')
        setTimeout(() => setToast(''), 3000)
        return prev
      }
      return [...prev, id]
    })
  }

  const handleRequestQuotes = () => {
    const qs = new URLSearchParams()
    qs.set('companies', selectedIds.join(','))
    if (city) qs.set('city', city)
    if (state) qs.set('state', state)
    if (service) qs.set('service', service)
    router.push(`/quote?${qs.toString()}`)
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No companies found in this area yet.</p>
        <p className="text-sm mt-1">Try searching a nearby city or browsing by state.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            isSelected={selectedIds.includes(company.id)}
            onToggle={toggleCompany}
          />
        ))}
      </div>

      <SelectionBar
        selectedCount={selectedIds.length}
        onRequestQuotes={handleRequestQuotes}
      />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-lg text-sm shadow-xl z-50">
          {toast}
        </div>
      )}
    </>
  )
}
