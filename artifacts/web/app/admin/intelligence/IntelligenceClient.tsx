'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'

interface Row {
  id: string
  company_id: string
  how_getting_clients: string[]
  biggest_challenge: string
  new_clients_per_month: string
  marketing_budget: string
  segment: string
  contacted: boolean
  created_at: string
  companies: { id: string; name: string; city: string; state: string; email: string; created_at: string } | null
}

interface Props {
  hot: Row[]
  warm: Row[]
  nurture: Row[]
}

export default function IntelligenceClient({ hot, warm, nurture }: Props) {
  const [tab, setTab] = useState<'HOT' | 'WARM' | 'NURTURE'>('HOT')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [contactedMap, setContactedMap] = useState<Record<string, boolean>>({})

  const rows = tab === 'HOT' ? hot : tab === 'WARM' ? warm : nurture

  const toggleContacted = async (id: string, company_id: string, current: boolean) => {
    await fetch('/api/admin/toggle-contacted', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, contacted: !current }),
    })
    setContactedMap((prev) => ({ ...prev, [id]: !current }))
  }

  const exportCSV = () => {
    const headers = ['Company', 'City', 'State', 'Email', 'Biggest Challenge', 'Marketing Budget', 'Clients Wanted', 'Date Claimed', 'Contacted']
    const csvRows = rows.map((r) => [
      r.companies?.name || '',
      r.companies?.city || '',
      r.companies?.state || '',
      r.companies?.email || '',
      r.biggest_challenge,
      r.marketing_budget,
      r.new_clients_per_month,
      r.companies?.created_at ? formatDate(r.companies.created_at) : '',
      contactedMap[r.id] !== undefined ? contactedMap[r.id] : r.contacted,
    ])
    const csv = [headers, ...csvRows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `intelligence-${tab.toLowerCase()}.csv`
    a.click()
  }

  const thCls = 'text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4'
  const tdCls = 'py-3 px-4 text-sm'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(['HOT', 'WARM', 'NURTURE'] as const).map((t) => {
            const count = t === 'HOT' ? hot.length : t === 'WARM' ? warm.length : nurture.length
            const color = t === 'HOT' ? 'bg-red-500' : t === 'WARM' ? 'bg-orange-400' : 'bg-gray-400'
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t ? 'bg-navy text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-accent'
                }`}
              >
                {t}
                <span className={`${color} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>{count}</span>
              </button>
            )
          })}
        </div>
        <button onClick={exportCSV} className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-accent transition-colors font-medium">
          Export as CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className={thCls}>Company</th>
              <th className={thCls}>City</th>
              <th className={thCls}>Email</th>
              <th className={thCls}>Challenge</th>
              <th className={thCls}>Budget</th>
              <th className={thCls}>Claimed</th>
              <th className={thCls}>Contacted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const isContacted = contactedMap[row.id] !== undefined ? contactedMap[row.id] : row.contacted
              return (
                <>
                  <tr
                    key={row.id}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${isContacted ? 'opacity-60' : ''}`}
                    onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                  >
                    <td className={`${tdCls} font-medium text-navy`}>{row.companies?.name}</td>
                    <td className={tdCls}>{row.companies?.city}, {row.companies?.state}</td>
                    <td className={tdCls}>
                      {row.companies?.email && (
                        <a href={`mailto:${row.companies.email}`} className="text-accent hover:underline" onClick={(e) => e.stopPropagation()}>
                          {row.companies.email}
                        </a>
                      )}
                    </td>
                    <td className={tdCls}>{row.biggest_challenge}</td>
                    <td className={tdCls}>{row.marketing_budget}</td>
                    <td className={tdCls}>{row.companies?.created_at ? formatDate(row.companies.created_at) : ''}</td>
                    <td className={tdCls} onClick={(e) => { e.stopPropagation(); toggleContacted(row.id, row.company_id, isContacted) }}>
                      <button
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isContacted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                        } transition-colors`}
                      >
                        {isContacted ? '✓ Contacted' : 'Mark Contacted'}
                      </button>
                    </td>
                  </tr>
                  {expanded === row.id && (
                    <tr key={`${row.id}-expanded`}>
                      <td colSpan={7} className="bg-blue-50 px-4 py-4 text-sm">
                        <div className="grid grid-cols-2 gap-3">
                          <div><span className="font-semibold">How getting clients:</span> {row.how_getting_clients?.join(', ')}</div>
                          <div><span className="font-semibold">New clients/month:</span> {row.new_clients_per_month}</div>
                          <div><span className="font-semibold">Biggest challenge:</span> {row.biggest_challenge}</div>
                          <div><span className="font-semibold">Marketing budget:</span> {row.marketing_budget}</div>
                          <div><span className="font-semibold">Segment:</span> {row.segment}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No companies in this segment.</div>
        )}
      </div>
    </div>
  )
}
