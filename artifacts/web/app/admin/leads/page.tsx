import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminLeadsClient from './AdminLeadsClient'

export default async function AdminLeadsPage() {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')?.value
  if (auth !== process.env.ADMIN_PASSWORD) redirect('/admin')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1B3A6B] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">Leads</h1>
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
      <AdminLeadsClient />
    </div>
  )
}
