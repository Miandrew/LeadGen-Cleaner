import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import Header from '@/components/Header'
import { getRelativeTime } from '@/lib/utils'

async function getSession() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

function profileCompletion(company: Record<string, unknown>) {
  const fields = ['logo_url', 'description', 'phone', 'website', 'certifications'] as const
  let score = 0
  if (company.logo_url) score += 20
  if (company.description) score += 20
  if (company.phone) score += 20
  if (company.website) score += 20
  if (Array.isArray(company.services) && company.services.length > 0) score += 10
  if (Array.isArray(company.certifications) && company.certifications.length > 0) score += 10
  const missing: string[] = []
  if (!company.logo_url) missing.push('Add a logo')
  if (!company.description) missing.push('Write a company description')
  if (!company.phone) missing.push('Add your phone number')
  if (!company.website) missing.push('Add your website')
  if (!Array.isArray(company.services) || company.services.length === 0) missing.push('Add your services')
  if (!Array.isArray(company.certifications) || company.certifications.length === 0) missing.push('Add certifications')
  return { score, missing }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*, companies(*)')
    .eq('email', session.user.email!)
    .single()

  if (!user?.company_id) redirect('/claim')

  const company = user.companies as Record<string, unknown>
  const { score, missing } = profileCompletion(company)

  const sevenDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()

  const [{ count: availableLeads }, { count: purchasedLeads }, { data: recentPurchases }] = await Promise.all([
    supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')
      .gte('created_at', sevenDaysAgo),
    supabaseAdmin
      .from('lead_purchases')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', user.company_id),
    supabaseAdmin
      .from('lead_purchases')
      .select('*, leads(*)')
      .eq('company_id', user.company_id)
      .order('purchased_at', { ascending: false })
      .limit(3),
  ])

  const firstName = (company.name as string)?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-52 bg-white border-r border-gray-200 py-6 px-4 gap-1 flex-shrink-0">
          {[
            { href: '/dashboard', label: 'Overview' },
            { href: '/dashboard/listing', label: 'My Listing' },
            { href: '/dashboard/leads', label: 'Available Leads' },
            { href: '/dashboard/subscription', label: 'Subscription' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              {link.label}
            </Link>
          ))}
          <form action="/api/auth/signout" method="POST" className="mt-auto">
            <button type="submit" className="w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors">
              Log Out
            </button>
          </form>
        </aside>

        <main className="flex-1 p-6 max-w-4xl">
          <h1 className="text-2xl font-bold text-navy mb-6">Welcome back, {firstName}</h1>

          {/* Profile completion */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-900">Profile Completion</h2>
              <span className="text-sm font-bold text-navy">{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${score}%` }} />
            </div>
            {missing.length > 0 && (
              <ul className="space-y-1">
                {missing.map((item) => (
                  <li key={item} className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <Link href="/dashboard/listing" className="hover:text-accent transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Leads Available', value: availableLeads ?? 0, sub: 'in your area (72h)' },
              { label: 'Leads Purchased', value: purchasedLeads ?? 0, sub: 'all time' },
              { label: 'Subscription', value: user.subscription_tier ? user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1) : 'No Plan', sub: user.subscription_status || '' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                <div className="text-3xl font-bold text-navy">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent purchases */}
          {recentPurchases && recentPurchases.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">Recent Purchases</h2>
              <div className="space-y-3">
                {recentPurchases.map((p: { id: string; amount_paid: number; purchased_at: string; leads: { service_type: string; city: string } | null }) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-sm font-medium">{p.leads?.service_type} in {p.leads?.city}</div>
                      <div className="text-xs text-gray-400">{getRelativeTime(p.purchased_at)}</div>
                    </div>
                    <span className="text-sm font-bold text-green-600">${p.amount_paid}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-3">
            <Link href="/dashboard/leads" className="bg-navy text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-navy/90 transition-colors">
              View Available Leads
            </Link>
            <Link href="/dashboard/listing" className="border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg text-sm hover:border-accent hover:text-accent transition-colors">
              Complete Your Profile
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
