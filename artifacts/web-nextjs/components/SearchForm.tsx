'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERVICE_TYPES, US_STATES } from '@/lib/utils'

export default function SearchForm() {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [service, setService] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()

    // Parse "City, ST" format typed into city box
    const cityTrimmed = city.trim()
    const commaMatch = cityTrimmed.match(/^(.+),\s*([A-Za-z]{2})$/)
    if (commaMatch) {
      params.set('city', commaMatch[1].trim())
      params.set('state', commaMatch[2].toUpperCase())
    } else {
      if (cityTrimmed) params.set('city', cityTrimmed)
      if (state) params.set('state', state)
    }

    if (service) params.set('service', service)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
    >
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        type="text"
        placeholder="City or &quot;City, ST&quot;"
        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      />
      <select
        value={state}
        onChange={(e) => setState(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="">All States</option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="">All Services</option>
        {SERVICE_TYPES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-[#1B3A6B] hover:bg-[#162F56] text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
      >
        Search
      </button>
    </form>
  )
}
