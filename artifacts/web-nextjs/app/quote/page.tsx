'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import CompanyLogo from '@/components/CompanyLogo'
import { SERVICE_TYPES, US_STATES } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Company {
  id: string
  name: string
  slug: string
  city?: string | null
  state?: string | null
  logo_url?: string | null
  website?: string | null
}

function QuoteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const companyIds = (searchParams.get('companies') || '').split(',').filter(Boolean)
  const prefillCity = searchParams.get('city') || ''
  const prefillState = searchParams.get('state') || ''
  const prefillService = searchParams.get('service') || ''

  const [step, setStep] = useState(1)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    service_type: prefillService,
    building_type: '',
    building_size: '',
    frequency: '',
    city: prefillCity,
    state: prefillState,
    contact_name: '',
    business_name: '',
    contact_email: '',
    contact_phone: '',
    message: '',
  })

  useEffect(() => {
    if (companyIds.length > 0) {
      supabase
        .from('companies')
        .select('id, name, slug, city, state, logo_url, website')
        .in('id', companyIds)
        .then(({ data }) => setCompanies(data || []))
    }
  }, [companyIds.join(',')])

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  const validateStep1 = () =>
    form.service_type && form.building_type && form.building_size && form.frequency && form.city && form.state

  const validateStep2 = () => {
    if (!form.contact_name || !form.business_name || !form.contact_email || !form.contact_phone)
      return false
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) return false
    if (!/^\d/.test(form.contact_phone) || form.contact_phone.replace(/\D/g, '').length < 10)
      return false
    return true
  }

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, selected_company_ids: companyIds }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/quote/success')
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    s <= step ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 w-12 ${s < step ? 'bg-navy' : 'bg-gray-200'}`} />}
              </div>
            ))}
            <span className="ml-2 text-sm text-gray-500">Step {step} of 3</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-6">Service Details</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls}>Service Needed</label>
                    <select className={inputCls} value={form.service_type} onChange={(e) => set('service_type', e.target.value)}>
                      <option value="">Select a service</option>
                      {SERVICE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Building Type</label>
                    <select className={inputCls} value={form.building_type} onChange={(e) => set('building_type', e.target.value)}>
                      <option value="">Select building type</option>
                      {['Office Building', 'Medical Facility', 'Industrial/Warehouse', 'Retail Store', 'School/University', 'Restaurant', 'Other'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Building Size</label>
                    <select className={inputCls} value={form.building_size} onChange={(e) => set('building_size', e.target.value)}>
                      <option value="">Select building size</option>
                      {['Under 1,000 sq ft', '1,000–5,000 sq ft', '5,000–20,000 sq ft', 'Over 20,000 sq ft'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Cleaning Frequency</label>
                    <select className={inputCls} value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
                      <option value="">Select frequency</option>
                      {['Daily', '3x per week', 'Weekly', 'Bi-weekly', 'Monthly', 'One-time deep clean'].map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Your city" />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <select className={inputCls} value={form.state} onChange={(e) => set('state', e.target.value)}>
                      <option value="">Select state</option>
                      {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => validateStep1() && setStep(2)}
                    disabled={!validateStep1()}
                    className="w-full bg-navy disabled:bg-gray-300 hover:bg-navy/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-2"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-6">Your Details</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                    <input className={inputCls} value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className={labelCls}>Company or Building Name <span className="text-red-500">*</span></label>
                    <input className={inputCls} value={form.business_name} onChange={(e) => set('business_name', e.target.value)} placeholder="Acme Corp" />
                  </div>
                  <div>
                    <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
                    <input type="email" className={inputCls} value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} placeholder="jane@company.com" />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
                    <input type="tel" className={inputCls} value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} placeholder="(555) 000-0000" />
                  </div>
                  <div>
                    <label className={labelCls}>Additional Notes <span className="text-gray-400">(optional)</span></label>
                    <textarea className={inputCls} rows={3} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Any special requirements…" />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Back</button>
                    <button onClick={() => validateStep2() && setStep(3)} disabled={!validateStep2()} className="flex-1 bg-navy disabled:bg-gray-300 hover:bg-navy/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors">Next →</button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-6">Review and Submit</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-1">
                  <div><span className="font-medium">Service:</span> {form.service_type}</div>
                  <div><span className="font-medium">Building:</span> {form.building_type}, {form.building_size}</div>
                  <div><span className="font-medium">Frequency:</span> {form.frequency}</div>
                  <div><span className="font-medium">Location:</span> {form.city}, {form.state}</div>
                </div>
                {companies.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">Sending quote to:</h3>
                    <div className="flex flex-col gap-2">
                      {companies.map((c) => (
                        <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <CompanyLogo company={c} size="sm" />
                          <div>
                            <div className="font-medium text-sm">{c.name}</div>
                            <div className="text-xs text-gray-500">{[c.city, c.state].filter(Boolean).join(', ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 mb-4">
                  Your contact details will only be shared with the {companies.length} {companies.length === 1 ? 'company' : 'companies'} shown above. You will not be contacted by any other company.
                </div>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Back</button>
                  <button onClick={submit} disabled={loading} className="flex-1 bg-navy disabled:bg-gray-300 hover:bg-navy/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors">
                    {loading ? 'Sending…' : 'Send Quote Request — Free'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function QuotePage() {
  return (
    <Suspense>
      <QuoteContent />
    </Suspense>
  )
}
