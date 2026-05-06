import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { getRelativeTime } from '@/lib/utils'
import AdminPasswordForm from './AdminPasswordForm'
import RevenueChart from './RevenueChart'

const ADMIN_COOKIE = 'admin_auth'

export default async function AdminPage() {
  const cookieStore = cookies()
  const auth = cookieStore.get(ADMIN_COOKIE)?.value

  if (auth !== process.env.ADMIN_PASSWORD) {
    return <AdminPasswordForm />
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    { count: totalCompanies },
    { count: totalClaimed },
    { data: leadsToday },
    { data: revenueToday },
    { data: revenueMonth },
    { data: recentLeads },
    { data: recentPurchases },
    { data: recentClaims },
    { data: thirtyDayRevenue },
  ] = await Promise.all([
    supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).eq('claimed', true),
    supabaseAdmin.from('leads').select('id').gte('created_at', today.toISOString()),
    supabaseAdmin.from('lead_purchases').select('amount_paid').gte('purchased_at', today.toISOString()),
    supabaseAdmin.from('lead_purchases').select('amount_paid').gte('purchased_at', monthStart.toISOString()),
    supabaseAdmin.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('lead_purchases').select('*, companies(name)').order('purchased_at', { ascending: false }).limit(5),
    supabaseAdmin.from('companies').select('name, city, state, created_at').eq('claimed', true).order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('lead_purchases').select('amount_paid, purchased_at').gte('purchased_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const todayRevenue = (revenueToday || []).reduce((s: number, p: { amount_paid: number }) => s + p.amount_paid, 0)
  const monthRevenue = (revenueMonth || []).reduce((s: number, p: { amount_paid: number }) => s + p.amount_paid, 0)

  const chartData = buildChartData(thirtyDayRevenue || [])

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
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-blue-200 hover:text-white transition-colors">{l.label}</Link>
          ))}
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Companies', value: totalCompanies?.toLocaleString() ?? '0' },
            { label: 'Claimed', value: totalClaimed?.toLocaleString() ?? '0' },
            { label: 'Leads Today', value: leadsToday?.length ?? 0 },
            { label: 'Revenue Today', value: `$${todayRevenue.toFixed(0)}` },
            { label: 'Revenue This Month', value: `$${monthRevenue.toFixed(0)}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-navy">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">30-Day Revenue</h2>
          <RevenueChart data={chartData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Recent Leads</h2>
            <div className="space-y-2">
              {(recentLeads || []).map((l: { id: string; service_type: string; city: string; state: string; created_at: string }) => (
                <div key={l.id} className="text-xs py-1.5 border-b border-gray-100 last:border-0">
                  <div className="font-medium">{l.service_type} in {l.city}, {l.state}</div>
                  <div className="text-gray-400">{getRelativeTime(l.created_at)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Recent Purchases</h2>
            <div className="space-y-2">
              {(recentPurchases || []).map((p: { id: string; companies: { name: string } | null; amount_paid: number; purchased_at: string }) => (
                <div key={p.id} className="text-xs py-1.5 border-b border-gray-100 last:border-0 flex justify-between">
                  <div>
                    <div className="font-medium">{p.companies?.name}</div>
                    <div className="text-gray-400">{getRelativeTime(p.purchased_at)}</div>
                  </div>
                  <span className="text-green-600 font-bold">${p.amount_paid}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Recent Claims</h2>
            <div className="space-y-2">
              {(recentClaims || []).map((c: { name: string; city: string; state: string; created_at: string }, i: number) => (
                <div key={i} className="text-xs py-1.5 border-b border-gray-100 last:border-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-gray-400">{c.city}, {c.state} — {getRelativeTime(c.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildChartData(purchases: { amount_paid: number; purchased_at: string }[]) {
  const map: Record<string, number> = {}
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    map[key] = 0
  }
  purchases.forEach((p) => {
    const key = p.purchased_at.split('T')[0]
    if (map[key] !== undefined) map[key] += p.amount_paid
  })
  return Object.entries(map).map(([date, revenue]) => ({ date: date.slice(5), revenue }))
}
