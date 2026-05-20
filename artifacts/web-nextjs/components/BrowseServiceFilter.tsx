'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CityEntry {
  city: string
  slug: string
}

interface StateEntry {
  code: string
  name: string
  slug: string
  cities: CityEntry[]
}

interface Props {
  states: StateEntry[]
  currentState?: string
  currentCity?: string
}

export default function BrowseServiceFilter({ states, currentState, currentCity }: Props) {
  const router = useRouter()
  const [selState, setSelState] = useState(currentState || '')
  const [selCity, setSelCity] = useState(currentCity || '')

  const stateEntry = states.find((s) => s.slug === selState)
  const cities = stateEntry?.cities || []

  const go = () => {
    if (!selState) return
    const params = new URLSearchParams()
    params.set('state', selState)
    if (selCity) params.set('city', selCity)
    router.push(`/browse-by-service?${params.toString()}`)
  }

  const clear = () => {
    setSelState('')
    setSelCity('')
    router.push('/browse-by-service')
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); go() }}
      className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-end gap-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">State</label>
        <select
          value={selState}
          onChange={(e) => { setSelState(e.target.value); setSelCity('') }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white"
        >
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s.code} value={s.slug}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          City {!selState && <span className="font-normal text-gray-400 normal-case">(select state first)</span>}
        </label>
        <select
          value={selCity}
          onChange={(e) => setSelCity(e.target.value)}
          disabled={!selState}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="">All cities in state</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>{c.city}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 pb-0.5">
        <button
          type="submit"
          disabled={!selState}
          className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply
        </button>
        {(currentState || currentCity) && (
          <button
            type="button"
            onClick={clear}
            className="text-sm text-accent hover:underline"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  )
}
