import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import Header from '@/components/Header'
import { getRelativeTime } from '@/lib/utils'
import UnlockButton from './UnlockButton'

interface Props {
  params: { lead_id: string; company_id: string }
}

export default async function UnlockLeadPage({ params }: Props) {
  const { lead_id, company_id } = params

  const { data: lead } = await supabaseAdmin.from('leads').select('*').eq('id', lead_id).single()

  if (!lead) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
            <p className="text-red-600 font-semibold">Lead not found.</p>
          </div>
        </main>
      </div>
    )
  }

  if (!lead.selected_company_ids?.includes(company_id)) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
            <p className="text-red-600 font-semibold">This lead is not available to your account.</p>
          </div>
        </main>
      </div>
    )
  }

  const { data: existing } = await supabaseAdmin
    .from('lead_purchases')
    .select('id')
    .eq('lead_id', lead_id)
    .eq('company_id', company_id)
    .single()

  if (existing) {
    redirect(`/lead-unlocked/${lead_id}/${company_id}`)
  }

  const createdAt = new Date(lead.created_at)
  const now = new Date()
  const hoursOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

  if (hoursOld > 72) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
            <div className="text-4xl mb-4">⏰</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">This lead has expired.</h1>
            <p className="text-gray-500 text-sm mb-4">Leads are available for 72 hours after submission.</p>
            <Link href="/dashboard/leads" className="text-accent text-sm font-medium hover:underline">View Available Leads →</Link>
          </div>
        </main>
      </div>
    )
  }

  const totalCompanies = lead.selected_company_ids?.length || 1

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-navy mb-6">
            New Lead in {lead.city}, {lead.state}
          </h1>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">Lead Preview</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-medium">{lead.service_type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Building Type</span><span className="font-medium">{lead.building_type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Building Size</span><span className="font-medium">{lead.building_size}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Frequency</span><span className="font-medium">{lead.frequency}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Submitted</span><span className="font-medium">{getRelativeTime(lead.created_at)}</span></div>
            </div>
          </div>

          {/* Blurred contact info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4 relative overflow-hidden">
            <div className="blur-sm select-none pointer-events-none">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">John Anderson</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Company</span><span className="font-medium">Acme Office Park LLC</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">john@acmeoffice.com</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">(555) 867-5309</span></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
              <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">Unlock to reveal contact info</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">Why unlock this lead?</p>
            <p>Gain access to full name, company, email, and phone number. They are actively looking for {lead.service_type} in {lead.city} right now.</p>
            <p className="mt-2 text-blue-500 text-xs">This lead was shared with {totalCompanies} {totalCompanies === 1 ? 'company' : 'companies'} total.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-navy mb-1">$35</div>
            <p className="text-gray-500 text-sm mb-4">One-time payment to unlock full contact details</p>
            <UnlockButton leadId={lead_id} companyId={company_id} />
          </div>
        </div>
      </main>
    </div>
  )
}
