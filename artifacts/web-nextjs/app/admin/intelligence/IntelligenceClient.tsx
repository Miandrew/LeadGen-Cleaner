'use client'

import { useState, Fragment } from 'react'
import { formatDate } from '@/lib/utils'

interface Company {
  id: string
  name: string
  city: string
  state: string
  email: string
  created_at: string
  cashflow_flag?: boolean
  acquisition_flag?: boolean
}

interface Row {
  id: string
  company_id: string
  lead_source: string[]
  biggest_challenge: string
  active_accounts: string
  growth_capacity: string
  segment: string
  contacted: boolean
  created_at: string
  companies: Company | null
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
  const [flagFilter, setFlagFilter] = useState<'all' | 'cashflow' | 'acquisition'>('all')

  const baseRows = tab === 'HOT' ? hot : tab === 'WARM' ? warm : nurture
  const rows = baseRows.filter((r) => {
    if (flagFilter === 'cashflow') return r.companies?.cashflow_flag
    if (flagFilter === 'acquisition') return r.companies?.acquisition_flag
    return true
  })

  const toggleContacted = async (id: string, company_id: string, current: boolean) => {
    await fetch('/api/admin/toggle-contacted', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, contacted: !current }),
    })
    setContactedMap((prev) => ({ ...prev, [id]: !current }))
  }

  const exportCSV = () => {
    const headers = ['Company', 'City', 'State', 'Email', 'Biggest Challenge', 'Active Accounts', 'Growth Capacity', 'Cashflow Flag', 'Acquisition Flag', 'Date Claimed', 'Contacted']
    const csvRows = rows.map((r) => [
      r.companies?.name || '',
      r.companies?.city || '',
      r.companies?.state || '',
      r.companies?.email || '',
      r.biggest_challenge,
      r.active_accounts,
      r.growth_capacity,
      r.companies?.cashflow_flag ? 'YES' : '',
      r.companies?.acquisition_flag ? 'YES' : '',
      r.companies?.created_at ? formatDate(r.companies.created_at) : '',
      contactedMap[r.id] !== undefined ? contactedMap[r.id] : r.contacted,
    ])
    const csv = [headers, ...csvRows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `intelligence-${tab.toLowerCase()}${flagFilter !== 'all' ? `-${flagFilter}` : ''}.csv`
    a.click()
  }

  const thCls = 'text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4'
  const tdCls = 'py-3 px-4 text-sm'

  const cashflowCount = baseRows.filter((r) => r.companies?.cashflow_flag).length
  const acquisitionCount = baseRows.filter((r) => r.companies?.acquisition_flag).length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
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

      {/* Flag filters — independent of HOT/WARM/NURTURE */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Filter:</span>
        {([
          { key: 'all', label: 'All' },
          { key: 'cashflow', label: `Cash-flow flagged (${cashflowCount})` },
          { key: 'acquisition', label: `Acquisition flagged (${acquisitionCount})` },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFlagFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              flagFilter === f.key
                ? f.key === 'cashflow'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : f.key === 'acquisition'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-navy text-white border-navy'
                : 'bg-white text-gray-600 border-gray-300 hover:border-accent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className={thCls}>Company</th>
              <th className={thCls}>City</th>
              <th className={thCls}>Email</th>
              <th className={thCls}>Challenge</th>
              <th className={thCls}>Flags</th>
              <th className={thCls}>Claimed</th>
              <th className={thCls}>Contacted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const isContacted = contactedMap[row.id] !== undefined ? contactedMap[row.id] : row.contacted
              return (
                <Fragment key={row.id}>
                  <tr
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
                    <td className={tdCls}>
                      <div className="flex flex-wrap gap-1">
                        {row.companies?.cashflow_flag && (
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">⚑ Cash-flow</span>
                        )}
                        {row.companies?.acquisition_flag && (
                          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded-full border border-purple-200 whitespace-nowrap">⚑ Acquisition</span>
                        )}
                        {!row.companies?.cashflow_flag && !row.companies?.acquisition_flag && (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </div>
                    </td>
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
                    <tr>
                      <td colSpan={7} className="bg-blue-50 px-4 py-4 text-sm">
                        <div className="grid grid-cols-2 gap-3">
                          <div><span className="font-semibold">Lead source:</span> {row.lead_source?.join(', ')}</div>
                          <div><span className="font-semibold">Active accounts:</span> {row.active_accounts}</div>
                          <div><span className="font-semibold">Biggest challenge:</span> {row.biggest_challenge}</div>
                          <div><span className="font-semibold">Growth capacity:</span> {row.growth_capacity}</div>
                          <div><span className="font-semibold">Segment:</span> {row.segment}</div>
                          <div>
                            <span className="font-semibold">Flags:</span>{' '}
                            {row.companies?.cashflow_flag ? 'Cash-flow ' : ''}
                            {row.companies?.acquisition_flag ? 'Acquisition' : ''}
                            {!row.companies?.cashflow_flag && !row.companies?.acquisition_flag ? 'None' : ''}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No companies match this view.</div>
        )}
      </div>
    </div>
  )
}
