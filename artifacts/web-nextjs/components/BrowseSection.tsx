'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SERVICE_TYPES, FULL_STATE_NAMES } from '@/lib/utils'

const SERVICE_ICONS: Record<string, string> = {
  office: '🏢',
  janitorial: '🧹',
  medical: '🏥',
  industrial: '🏭',
  carpet: '🪣',
  window: '🪟',
  floor: '✨',
  'post-construction': '🔨',
  'pressure-washing': '💧',
}

interface Props {
  serviceMap: Record<string, number>
  topStates: [string, number][]
}

export default function BrowseSection({ serviceMap, topStates }: Props) {
  const [tab, setTab] = useState<'service' | 'state'>('service')

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-6 border-b border-gray-200 mb-8">
          {(['service', 'state'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'service' ? 'Browse by Service' : 'Browse by State'}
            </button>
          ))}
        </div>

        {tab === 'service' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICE_TYPES.map((service) => (
              <Link
                key={service.value}
                href={`/service/${service.value}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-accent hover:shadow-md transition-all flex flex-col items-center text-center group"
              >
                <span className="text-3xl mb-2">{SERVICE_ICONS[service.value] || '🧽'}</span>
                <span className="font-semibold text-gray-900 text-sm group-hover:text-navy">
                  {service.label}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {(serviceMap[service.value] || 0).toLocaleString()} companies
                </span>
              </Link>
            ))}
          </div>
        )}

        {tab === 'state' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {topStates.map(([code, count]) => {
              const name = FULL_STATE_NAMES[code] || code
              return (
                <Link
                  key={code}
                  href={`/commercial-cleaning/${name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-accent hover:shadow-md transition-all text-center group"
                >
                  <div className="font-bold text-navy text-base group-hover:text-accent">{name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {count.toLocaleString()} companies
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
