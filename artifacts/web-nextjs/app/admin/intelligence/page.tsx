import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import IntelligenceClient from './IntelligenceClient'

export default async function AdminIntelligencePage() {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')?.value
  if (auth !== process.env.ADMIN_PASSWORD) redirect('/admin')

  const { data: rows } = await supabaseAdmin
    .from('company_onboarding')
    .select('*, companies(id, name, city, state, email, created_at)')
    .order('created_at', { ascending: false })

  const hot = (rows || []).filter((r: { segment: string }) => r.segment === 'HOT')
  const warm = (rows || []).filter((r: { segment: string }) => r.segment === 'WARM')
  const nurture = (rows || []).filter((r: { segment: string }) => r.segment === 'NURTURE')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B3A6B] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">Intelligence</h1>
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
      <IntelligenceClient hot={hot} warm={warm} nurture={nurture} />
    </div>
  )
}
