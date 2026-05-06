import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import Header from '@/components/Header'

interface Props {
  searchParams: { company?: string; token?: string }
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { company: companyId, token } = searchParams

  if (!companyId || !token) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Invalid unsubscribe link.</p>
        </main>
      </div>
    )
  }

  const secret = process.env.ADMIN_PASSWORD || ''
  const expected = createHmac('sha256', secret).update(companyId).digest('hex')

  if (token !== expected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-red-500">Invalid or expired unsubscribe link.</p>
        </main>
      </div>
    )
  }

  await supabaseAdmin.from('companies').update({ do_not_email: true }).eq('id', companyId)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 max-w-md text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unsubscribed</h1>
          <p className="text-gray-500 text-sm">You have been unsubscribed from all emails from CommercialCleaningNearMe.com.</p>
        </div>
      </main>
    </div>
  )
}
