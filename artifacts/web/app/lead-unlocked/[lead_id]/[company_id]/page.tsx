import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import Header from '@/components/Header'
import { formatPhone } from '@/lib/utils'

interface Props {
  params: { lead_id: string; company_id: string }
}

export default async function LeadUnlockedPage({ params }: Props) {
  const { lead_id, company_id } = params

  const { data: purchase } = await supabaseAdmin
    .from('lead_purchases')
    .select('*')
    .eq('lead_id', lead_id)
    .eq('company_id', company_id)
    .single()

  if (!purchase) {
    redirect(`/unlock-lead/${lead_id}/${company_id}`)
  }

  const { data: lead } = await supabaseAdmin.from('leads').select('*').eq('id', lead_id).single()
  if (!lead) redirect('/dashboard/leads')

  const totalCompanies = lead.selected_company_ids?.length || 1

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-700">Contact Details Unlocked</h1>
          </div>

          <div className="bg-white rounded-xl border border-green-200 shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Full Name</span>
                <div className="font-semibold text-gray-900 mt-0.5">{lead.contact_name}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Company / Building</span>
                <div className="font-semibold text-gray-900 mt-0.5">{lead.business_name}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Email</span>
                <div className="mt-0.5">
                  <a href={`mailto:${lead.contact_email}`} className="font-semibold text-accent hover:underline">
                    {lead.contact_email}
                  </a>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Phone</span>
                <div className="mt-0.5">
                  <a href={`tel:${lead.contact_phone}`} className="font-semibold text-accent hover:underline">
                    {formatPhone(lead.contact_phone)}
                  </a>
                </div>
              </div>
              {lead.message && (
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Their Message</span>
                  <div className="text-gray-700 text-sm mt-0.5 bg-gray-50 rounded-lg p-3">{lead.message}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700">
            {totalCompanies === 1
              ? 'You are the only company with this contact — reach out immediately.'
              : `This contact was also shared with ${totalCompanies - 1} other ${totalCompanies - 1 === 1 ? 'company' : 'companies'} — be the first to reach out.`}
          </div>

          <Link
            href="/dashboard/leads"
            className="block w-full text-center bg-navy hover:bg-navy/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            View All Your Leads
          </Link>
        </div>
      </main>
    </div>
  )
}
