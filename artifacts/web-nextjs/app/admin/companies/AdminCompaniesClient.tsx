'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { US_STATES, formatDate } from '@/lib/utils'

interface Company {
  id: string
  name: string
  city: string
  state: string
  claimed: boolean
  active: boolean
  rating: number | null
  created_at: string
  email: string | null
  phone: string | null
  website: string | null
  description: string | null
}

export default function AdminCompaniesClient() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterClaimed, setFilterClaimed] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [editing, setEditing] = useState<Company | null>(null)

  const fetchCompanies = useCallback(async () => {
    let q = supabase.from('companies').select('id, name, city, state, claimed, active, rating, created_at, email, phone, website, description').order('created_at', { ascending: false }).limit(100)
    if (search) q = q.or(`name.ilike.%${search}%,city.ilike.%${search}%`)
    if (filterState) q = q.eq('state', filterState)
    if (filterClaimed === 'yes') q = q.eq('claimed', true)
    else if (filterClaimed === 'no') q = q.eq('claimed', false)
    if (filterActive === 'yes') q = q.eq('active', true)
    else if (filterActive === 'no') q = q.eq('active', false)
    const { data } = await q
    setCompanies(data || [])
  }, [search, filterState, filterClaimed, filterActive])

  useEffect(() => {
    const t = setTimeout(fetchCompanies, 300)
    return () => clearTimeout(t)
  }, [fetchCompanies])

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('companies').update({ active: !current }).eq('id', id)
    setCompanies((prev) => prev.map((c) => c.id === id ? { ...c, active: !current } : c))
  }

  const saveEdit = async () => {
    if (!editing) return
    await supabase.from('companies').update({
      name: editing.name,
      city: editing.city,
      state: editing.state,
      email: editing.email,
      phone: editing.phone,
      website: editing.website,
      description: editing.description,
    }).eq('id', editing.id)
    setEditing(null)
    fetchCompanies()
  }

  const thCls = 'text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4'
  const tdCls = 'py-3 px-4 text-sm text-gray-700'
  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or city…"
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All States</option>
          {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
        <select value={filterClaimed} onChange={(e) => setFilterClaimed(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All (Claimed)</option>
          <option value="yes">Claimed</option>
          <option value="no">Unclaimed</option>
        </select>
        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All (Active)</option>
          <option value="yes">Active</option>
          <option value="no">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className={thCls}>Name</th>
              <th className={thCls}>City</th>
              <th className={thCls}>State</th>
              <th className={thCls}>Claimed</th>
              <th className={thCls}>Active</th>
              <th className={thCls}>Rating</th>
              <th className={thCls}>Added</th>
              <th className={thCls}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className={`${tdCls} font-medium text-navy`}>{c.name}</td>
                <td className={tdCls}>{c.city}</td>
                <td className={tdCls}>{c.state}</td>
                <td className={tdCls}>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.claimed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.claimed ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className={tdCls}>
                  <button onClick={() => toggleActive(c.id, c.active)} className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${c.active ? 'bg-blue-100 text-blue-700 hover:bg-red-100 hover:text-red-700' : 'bg-red-100 text-red-700 hover:bg-blue-100 hover:text-blue-700'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className={tdCls}>{c.rating?.toFixed(1) || '—'}</td>
                <td className={tdCls}>{formatDate(c.created_at)}</td>
                <td className={tdCls}>
                  <button onClick={() => setEditing(c)} className="text-xs text-accent hover:underline font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {companies.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No companies found.</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-navy text-lg mb-4">Edit Company</h2>
            <div className="flex flex-col gap-3">
              {([['name', 'Name'], ['city', 'City'], ['state', 'State'], ['email', 'Email'], ['phone', 'Phone'], ['website', 'Website']] as const).map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input className={inputCls} value={(editing as unknown as Record<string, string>)[k] || ''} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea className={inputCls} rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditing(null)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={saveEdit} className="flex-1 bg-navy text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-navy/90 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
