import { cookies } from 'next/headers'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { getRelativeTime } from '@/lib/utils'
import AdminPasswordForm from '../AdminPasswordForm'

const ADMIN_COOKIE = 'admin_auth'

export const dynamic = 'force-dynamic'

interface RoutingRow {
  id: string
  company_id: string | null
  email: string | null
  full_name: string | null
  segment: string | null
  action: string
  booking_time: string | null
  notes: string | null
  created_at: string
  companies?: { name: string; city: string; state: string } | null
}

export default async function AdminBookedPage() {
  const auth = cookies().get(ADMIN_COOKIE)?.value
  if (auth !== process.env.ADMIN_PASSWORD) return <AdminPasswordForm />

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: routing } = await supabaseAdmin
    .from('call_routing_responses')
    .select('*, companies(name, city, state)')
    .order('created_at', { ascending: false })
    .limit(200)

  const rows = (routing || []) as RoutingRow[]
  const recent = rows.filter((r) => r.created_at >= since30)

  const counts = {
    booked: recent.filter((r) => r.action === 'booked').length,
    declined: recent.filter((r) => r.action === 'declined').length,
    skipped: recent.filter((r) => r.action === 'skipped').length,
    hot: recent.filter((r) => r.segment === 'HOT').length,
    warm: recent.filter((r) => r.segment === 'WARM').length,
  }
  const offered = counts.booked + counts.declined + counts.skipped
  const bookRate = offered > 0 ? Math.round((counts.booked / offered) * 100) : 0

  const badge = (action: string) => {
    const cls =
      action === 'booked'
        ? 'bg-green-100 text-green-700 border-green-200'
        : action === 'declined'
          ? 'bg-red-100 text-red-700 border-red-200'
          : 'bg-gray-100 text-gray-700 border-gray-200'
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${cls}`}>{action}</span>
  }

  const segBadge = (seg: string | null) => {
    if (!seg) return null
    const cls =
      seg === 'HOT' ? 'bg-red-50 text-red-700' :
      seg === 'WARM' ? 'bg-orange-50 text-orange-700' :
      'bg-gray-50 text-gray-600'
    return <span className={`text-xs font-medium px-2 py-0.5 rounded ${cls}`}>{seg}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B3A6B] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">Admin Dashboard</h1>
        <nav className="flex gap-4 text-sm">
          {[
            { href: '/admin', label: 'Overview' },
            { href: '/admin/intelligence', label: 'Intelligence' },
            { href: '/admin/companies', label: 'Companies' },
            { href: '/admin/leads', label: 'Leads' },
            { href: '/admin/revenue', label: 'Revenue' },
            { href: '/admin/booked', label: 'Booked Calls' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-blue-200 hover:text-white transition-colors">{l.label}</Link>
          ))}
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-navy mb-4">Strategy Calls — Last 30 Days</h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Booked', value: counts.booked },
            { label: 'Declined', value: counts.declined },
            { label: 'Skipped', value: counts.skipped },
            { label: 'Book Rate', value: `${bookRate}%` },
            { label: 'HOT / WARM Offered', value: `${counts.hot} / ${counts.warm}` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-navy">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Booking</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No routing responses yet.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{getRelativeTime(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.companies?.name || '—'}</div>
                    {r.companies && (
                      <div className="text-xs text-gray-400">{r.companies.city}, {r.companies.state}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-medium text-gray-800">{r.full_name || '—'}</div>
                    <div className="text-gray-500">{r.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3">{segBadge(r.segment)}</td>
                  <td className="px-4 py-3">{badge(r.action)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.booking_time ? new Date(r.booking_time).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
