import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

export default async function AdminRevenuePage() {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')?.value
  if (auth !== process.env.ADMIN_PASSWORD) redirect('/admin')

  const today = new Date()
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)

  const [
    { data: allPurchases },
    { data: thisMonth },
    { data: lastMonth },
    { data: subUsers },
    { data: topCompanies },
  ] = await Promise.all([
    supabaseAdmin.from('lead_purchases').select('amount_paid'),
    supabaseAdmin.from('lead_purchases').select('amount_paid').gte('purchased_at', thisMonthStart.toISOString()),
    supabaseAdmin.from('lead_purchases').select('amount_paid').gte('purchased_at', lastMonthStart.toISOString()).lt('purchased_at', thisMonthStart.toISOString()),
    supabaseAdmin.from('users').select('subscription_status, subscription_tier').eq('subscription_status', 'active'),
    supabaseAdmin
      .from('lead_purchases')
      .select('company_id, amount_paid, companies(name)')
      .order('purchased_at', { ascending: false }),
  ])

  const totalRevenue = (allPurchases || []).reduce((s: number, p: { amount_paid: number }) => s + p.amount_paid, 0)
  const thisMonthRevenue = (thisMonth || []).reduce((s: number, p: { amount_paid: number }) => s + p.amount_paid, 0)
  const lastMonthRevenue = (lastMonth || []).reduce((s: number, p: { amount_paid: number }) => s + p.amount_paid, 0)
  const avgLead = allPurchases && allPurchases.length > 0 ? totalRevenue / allPurchases.length : 0

  const companySpend: Record<string, { name: string; total: number }> = {}
  ;(topCompanies || []).forEach((p: { company_id: string; amount_paid: number; companies: { name: string } | { name: string }[] | null }) => {
    const companyName = Array.isArray(p.companies) ? p.companies[0]?.name : p.companies?.name
    if (!companySpend[p.company_id]) companySpend[p.company_id] = { name: companyName || 'Unknown', total: 0 }
    companySpend[p.company_id].total += p.amount_paid
  })
  const topTen = Object.values(companySpend).sort((a, b) => b.total - a.total).slice(0, 10)

  const subRevenue = (subUsers || []).reduce((s: number, u: { subscription_tier: string }) => {
    if (u.subscription_tier === 'starter') return s + 99
    if (u.subscription_tier === 'growth') return s + 199
    if (u.subscription_tier === 'unlimited') return s + 399
    return s
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B3A6B] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">Revenue</h1>
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Revenue All Time', value: `$${totalRevenue.toFixed(0)}` },
            { label: 'This Month', value: `$${thisMonthRevenue.toFixed(0)}` },
            { label: 'Last Month', value: `$${lastMonthRevenue.toFixed(0)}` },
            { label: 'Avg Lead Value', value: `$${avgLead.toFixed(0)}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-navy">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Revenue by Type</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pay-per-lead purchases</span>
                <span className="font-bold text-navy">${totalRevenue.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly subscriptions (MRR)</span>
                <span className="font-bold text-navy">${subRevenue}/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active subscribers</span>
                <span className="font-bold text-navy">{subUsers?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Top 10 Companies by Spend</h2>
            <div className="space-y-2">
              {topTen.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate flex-1">{c.name}</span>
                  <span className="font-bold text-green-600 ml-2">${c.total.toFixed(0)}</span>
                </div>
              ))}
              {topTen.length === 0 && <p className="text-gray-400 text-sm">No purchases yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
