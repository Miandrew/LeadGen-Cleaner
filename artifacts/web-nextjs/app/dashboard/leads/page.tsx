'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getRelativeTime } from '@/lib/utils'

interface Lead {
  id: string
  service_type: string
  building_type: string
  city: string
  state: string
  created_at: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  business_name?: string
  message?: string
}

interface Purchase {
  id: string
  purchased_at: string
  amount_paid: number
  leads: Lead | null
}

export default function DashboardLeadsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'available' | 'purchased'>('available')
  const [company, setCompany] = useState<{ id: string; city: string; state: string } | null>(null)
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([])
  const [purchasedLeads, setPurchasedLeads] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { router.push('/login'); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: user } = await supabase.from('users').select('company_id, companies(id, city, state)').eq('email', session.user.email!).single()
      if (!user?.company_id) return
      const c = Array.isArray(user.companies) ? user.companies[0] : user.companies as { id: string; city: string; state: string }
      setCompany(c)

      const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()

      const [{ data: avail }, { data: purchased }] = await Promise.all([
        supabase
          .from('leads')
          .select('id, service_type, building_type, city, state, created_at')
          .eq('status', 'open')
          .gte('created_at', cutoff)
          .or(`city.ilike.%${c?.city || ''}%,state.eq.${c?.state || ''}`),
        supabase
          .from('lead_purchases')
          .select('id, purchased_at, amount_paid, leads(id, service_type, building_type, city, state, contact_name, contact_email, contact_phone, business_name, message, created_at)')
          .eq('company_id', user.company_id)
          .order('purchased_at', { ascending: false }),
      ])

      setAvailableLeads(avail || [])
      setPurchasedLeads(purchased || [])
      setLoading(false)
    })
  }, [router])

  const thCls = 'text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4'
  const tdCls = 'py-3 px-4 text-sm text-gray-700'

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-navy mb-6">Leads</h1>

      <div className="flex gap-2 mb-6">
        {(['available', 'purchased'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-navy text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-accent'
            }`}
          >
            {t === 'available' ? 'Available Leads' : 'Purchased Leads'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : tab === 'available' ? (
        availableLeads.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
            No new leads in your area in the last 72 hours.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={thCls}>Service</th>
                  <th className={thCls}>Building</th>
                  <th className={thCls}>City</th>
                  <th className={thCls}>Contact</th>
                  <th className={thCls}>Submitted</th>
                  <th className={thCls}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {availableLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className={tdCls}>{lead.service_type}</td>
                    <td className={tdCls}>{lead.building_type}</td>
                    <td className={tdCls}>{lead.city}, {lead.state}</td>
                    <td className={`${tdCls} font-mono text-gray-400`}>••••••••</td>
                    <td className={tdCls}>{getRelativeTime(lead.created_at)}</td>
                    <td className={tdCls}>
                      {company && (
                        <Link
                          href={`/unlock-lead/${lead.id}/${company.id}`}
                          className="bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors whitespace-nowrap"
                        >
                          Unlock Lead
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        purchasedLeads.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
            You have not purchased any leads yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Company</th>
                  <th className={thCls}>Email</th>
                  <th className={thCls}>Phone</th>
                  <th className={thCls}>Service</th>
                  <th className={thCls}>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchasedLeads.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className={`${tdCls} font-medium`}>{p.leads?.contact_name}</td>
                    <td className={tdCls}>{p.leads?.business_name}</td>
                    <td className={tdCls}>
                      {p.leads?.contact_email && (
                        <a href={`mailto:${p.leads.contact_email}`} className="text-accent hover:underline">
                          {p.leads.contact_email}
                        </a>
                      )}
                    </td>
                    <td className={tdCls}>
                      {p.leads?.contact_phone && (
                        <a href={`tel:${p.leads.contact_phone}`} className="text-accent hover:underline">
                          {p.leads.contact_phone}
                        </a>
                      )}
                    </td>
                    <td className={tdCls}>{p.leads?.service_type} in {p.leads?.city}</td>
                    <td className={tdCls}>{getRelativeTime(p.purchased_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
