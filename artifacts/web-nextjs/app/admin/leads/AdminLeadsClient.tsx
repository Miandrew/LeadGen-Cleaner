'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getRelativeTime } from '@/lib/utils'

interface Purchase {
  id: string
  amount_paid: number
  purchased_at: string
  companies: { name: string } | null
}

interface Lead {
  id: string
  service_type: string
  city: string
  state: string
  contact_name: string
  contact_email: string
  contact_phone: string
  business_name: string
  message: string
  building_type: string
  building_size: string
  frequency: string
  status: string
  created_at: string
  selected_company_ids: string[]
  lead_purchases?: Purchase[]
}

export default function AdminLeadsClient() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('leads')
      .select('*, lead_purchases(id, amount_paid, purchased_at, companies(name))')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setLeads(data || [])
        setLoading(false)
      })
  }, [])

  const thCls = 'text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4'
  const tdCls = 'py-3 px-4 text-sm text-gray-700'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className={thCls}>Date</th>
                <th className={thCls}>Location</th>
                <th className={thCls}>Service</th>
                <th className={thCls}>Companies Notified</th>
                <th className={thCls}>Purchases</th>
                <th className={thCls}>Revenue</th>
                <th className={thCls}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => {
                const purchases = lead.lead_purchases || []
                const revenue = purchases.reduce((s, p) => s + p.amount_paid, 0)
                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(lead)}
                  >
                    <td className={tdCls}>{getRelativeTime(lead.created_at)}</td>
                    <td className={tdCls}>{lead.city}, {lead.state}</td>
                    <td className={tdCls}>{lead.service_type}</td>
                    <td className={tdCls}>{lead.selected_company_ids?.length || 0}</td>
                    <td className={tdCls}>{purchases.length}</td>
                    <td className={`${tdCls} font-bold text-green-600`}>${revenue.toFixed(0)}</td>
                    <td className={tdCls}>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lead.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {leads.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No leads yet.</div>}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-bold text-navy text-lg">Lead Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              {[
                ['Contact Name', selected.contact_name],
                ['Company', selected.business_name],
                ['Email', selected.contact_email],
                ['Phone', selected.contact_phone],
                ['Service', selected.service_type],
                ['Building', `${selected.building_type}, ${selected.building_size}`],
                ['Frequency', selected.frequency],
                ['Location', `${selected.city}, ${selected.state}`],
                ['Message', selected.message],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="font-medium text-gray-500 min-w-28">{k}:</span>
                  <span className="text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            {selected.lead_purchases && selected.lead_purchases.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Purchases</h3>
                {selected.lead_purchases.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                    <span>{p.companies?.name}</span>
                    <span className="text-gray-400 text-xs">{getRelativeTime(p.purchased_at)}</span>
                    <span className="font-bold text-green-600">${p.amount_paid}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
