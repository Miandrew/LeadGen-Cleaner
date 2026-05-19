'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERVICE_TYPES, US_STATES } from '@/lib/utils'

interface Props {
  currentLocation: string
  currentStateCode: string
  initialService: string
  initialRating: string
  initialVerified: boolean
  currentCity?: string
}

function stateNameSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export default function LocationFilters({
  currentLocation,
  currentStateCode,
  initialService,
  initialRating,
  initialVerified,
  currentCity,
}: Props) {
  const router = useRouter()

  const [filterService, setFilterService] = useState(initialService)
  const [filterState, setFilterState] = useState(currentStateCode)
  const [filterRating, setFilterRating] = useState(initialRating || '1')
  const [filterVerified, setFilterVerified] = useState(initialVerified)

  const apply = () => {
    const params = new URLSearchParams()
    if (filterService) params.set('service', filterService)
    if (parseFloat(filterRating) > 1) params.set('rating', filterRating)
    if (filterVerified) params.set('verified', 'true')

    let targetLocation = currentLocation
    if (filterState !== currentStateCode) {
      // State changed — drop city context, navigate to that state's page
      const stateObj = US_STATES.find((s) => s.code === filterState)
      if (stateObj) targetLocation = stateNameSlug(stateObj.name)
    } else if (currentCity) {
      // Keep city context if state unchanged
      targetLocation = currentLocation
    }

    const qs = params.toString()
    router.push(`/commercial-cleaning/${targetLocation}${qs ? `?${qs}` : ''}`)
  }

  const reset = () => {
    setFilterService('')
    setFilterRating('1')
    setFilterVerified(false)
    router.push(`/commercial-cleaning/${currentLocation}`)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
      <h2 className="font-bold text-gray-900 mb-4">Filters</h2>

      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Service Type</h3>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="service"
              value=""
              checked={filterService === ''}
              onChange={() => setFilterService('')}
              className="accent-accent"
            />
            <span>All Services</span>
          </label>
          {SERVICE_TYPES.map((s) => (
            <label key={s.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="service"
                value={s.value}
                checked={filterService === s.value}
                onChange={() => setFilterService(s.value)}
                className="accent-accent"
              />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">State</h3>
        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
        >
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        {currentCity && filterState !== currentStateCode && (
          <p className="text-xs text-amber-600 mt-1">
            Changing the state will leave {currentCity}.
          </p>
        )}
      </div>

      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Minimum Rating</h3>
        <input
          type="range"
          min="1"
          max="5"
          step="0.5"
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="w-full accent-accent"
        />
        <div className="text-sm text-gray-500 mt-1">{filterRating}+ stars</div>
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setFilterVerified(!filterVerified)}
            className={`w-10 h-6 rounded-full transition-colors relative ${
              filterVerified ? 'bg-accent' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                filterVerified ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">Verified Only</span>
        </label>
      </div>

      <button
        onClick={apply}
        className="w-full bg-[#1B3A6B] hover:bg-[#162F56] text-white font-semibold py-2 rounded-lg text-sm transition-colors"
      >
        Apply Filters
      </button>

      {(initialService || initialVerified || parseFloat(initialRating || '1') > 1) && (
        <button
          onClick={reset}
          className="w-full mt-2 text-accent hover:underline text-sm font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
