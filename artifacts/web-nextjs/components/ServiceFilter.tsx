'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CityEntry {
  city: string
  slug: string
  count: number
}

interface StateEntry {
  code: string
  name: string
  slug: string
  count: number
  cities: CityEntry[]
}

interface Props {
  serviceValue: string
  states: StateEntry[]
}

export default function ServiceFilter({ serviceValue, states }: Props) {
  const router = useRouter()
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  const stateEntry = states.find((s) => s.code === selectedState)
  const cities = stateEntry?.cities || []

  const go = () => {
    if (selectedCity) {
      router.push(`/service/${serviceValue}/${selectedCity}`)
    } else if (selectedState && stateEntry) {
      router.push(`/service/${serviceValue}/${stateEntry.slug}`)
    }
  }

  const canGo = !!selectedState

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
      <h2 className="font-bold text-gray-900 mb-4">Filter by Location</h2>

      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">State</label>
        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value)
            setSelectedCity('')
          }}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name} ({s.count})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="text-sm font-semibold text-gray-700 block mb-1.5">
          City {selectedState ? '' : <span className="font-normal text-gray-400">— select state first</span>}
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={!selectedState}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="">All cities in state</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.city} ({c.count})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={go}
        disabled={!canGo}
        className="w-full bg-[#1B3A6B] hover:bg-[#162F56] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg text-sm transition-colors"
      >
        {selectedCity ? 'View City Results' : selectedState ? 'View State Results' : 'Select a State'}
      </button>

      {selectedState && stateEntry && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          {stateEntry.count} companies · {stateEntry.cities.length} cities
        </p>
      )}
    </div>
  )
}
