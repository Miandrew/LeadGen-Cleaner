import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Header from '@/components/Header'
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '⊞' },
  { href: '/dashboard/listing', label: 'My Listing', icon: '✎' },
  { href: '/dashboard/leads', label: 'Leads', icon: '✉' },
  { href: '/dashboard/subscription', label: 'Subscription', icon: '★' },
  { href: '/dashboard/featured', label: 'Featured', icon: '◈' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect('/login')

  const cookieStore = cookies()
  const supabase = createSupabaseServerClient((name) => cookieStore.get(name)?.value)
  if (!supabase) redirect('/login')

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex w-52 flex-col bg-white border-r border-gray-200 py-6 px-3 shrink-0">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <form action="/api/logout" method="POST">
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-600 w-full transition-colors">
                <span>⇥</span> Log Out
              </button>
            </form>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
