import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createSupabaseServerClient, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { getRelativeTime } from '@/lib/utils'

async function getSession() {
  if (!isSupabaseConfigured()) return null
  const cookieStore = cookies()
  const supabase = createSupabaseServerClient((name) => cookieStore.get(name)?.value)
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

function profileCompletion(company: Record<string, unknown>) {
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

  if (company.verification_status === 'pending') {
    redirect('/claim/verify')
  }

  const { score, missing } = profileCompletion(company)

  const cutoff72h = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  const cityName = (company.city as string) || ''

  const availableLeadsQuery = cityName
    ? supabaseAdmin
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .ilike('city', `%${cityName}%`)
        .gte('created_at', cutoff72h)
    : Promise.resolve({ count: 0 })

  const [{ count: availableLeads }, { count: purchasedLeads }, { data: recentPurchases }] = await Promise.all([
    availableLeadsQuery,
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

  const hasLeads = (availableLeads || 0) > 0
  const hasPurchases = (purchasedLeads || 0) > 0
  const hasSubscription = user.subscription_status === 'active'

  const nextAction = hasSubscription
    ? null
    : !hasPurchases && score < 80
    ? {
        message: `Your profile is ${score}% complete. Complete profiles get 3x more views from facility managers.`,
        cta: 'Complete Profile →',
        href: '/dashboard/listing',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-900',
      }
    : !hasPurchases && hasLeads && cityName
    ? {
        message: `${availableLeads} lead${availableLeads === 1 ? '' : 's'} available in ${cityName} right now. Facility managers looking for cleaners in your area.`,
        cta: 'View Leads →',
        href: '/dashboard/leads',
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-900',
      }
    : hasPurchases && !hasSubscription
    ? {
        message: `Want leads delivered automatically and your follow-up handled for you? Book a quick call and we'll build the right plan.`,
        cta: 'Book a Call →',
        href: '/dashboard/subscription',
        color: 'bg-amber-50 border-amber-200',
        textColor: 'text-amber-900',
      }
    : null

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-navy mb-6">Welcome back, {firstName}</h1>

      {nextAction && (
        <div className={`${nextAction.color} border rounded-xl p-5 mb-6 flex items-center justify-between gap-4 flex-wrap`}>
          <p className={`text-sm font-medium flex-1 ${nextAction.textColor}`}>
            {nextAction.message}
          </p>
          <Link
            href={nextAction.href}
            className="flex-shrink-0 bg-navy text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-navy/90 transition-colors whitespace-nowrap"
          >
            {nextAction.cta}
          </Link>
        </div>
      )}

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link href="/dashboard/leads" className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 mb-1">Leads Available Near You</div>
          <div className="text-3xl font-bold text-navy">{availableLeads ?? 0}</div>
          <div className="text-xs text-accent mt-2 font-medium">View leads →</div>
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="text-sm text-gray-500 mb-1">Leads Purchased</div>
          <div className="text-3xl font-bold text-navy">{purchasedLeads ?? 0}</div>
          <div className="text-xs text-gray-400 mt-0.5">all time</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="text-sm text-gray-500 mb-1">Subscription</div>
          <div className="text-3xl font-bold text-navy">
            {user.subscription_tier ? user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1) : 'No Plan'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{user.subscription_status || ''}</div>
        </div>
      </div>

      {recentPurchases && recentPurchases.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Purchases</h2>
          <div className="space-y-3">
            {recentPurchases.map((p: { id: string; purchased_at: string; leads: { service_type: string; city: string } | null }) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-sm font-medium">{p.leads?.service_type} in {p.leads?.city}</div>
                  <div className="text-xs text-gray-400">{getRelativeTime(p.purchased_at)}</div>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Unlocked</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/dashboard/leads" className="bg-navy text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-navy/90 transition-colors">
          View Available Leads
        </Link>
        <Link href="/dashboard/listing" className="border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-lg text-sm hover:border-accent hover:text-accent transition-colors">
          Complete Your Profile
        </Link>
      </div>
    </div>
  )
}
