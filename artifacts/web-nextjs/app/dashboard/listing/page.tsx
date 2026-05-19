'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import CompanyCard from '@/components/CompanyCard'
import { SERVICE_TYPES } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Company {
  id: string
  name: string
  slug: string
  description?: string | null
  services?: string[] | null
  certifications?: string[] | null
  phone?: string | null
  email?: string | null
  website?: string | null
  years_in_business?: number | null
  employee_count?: string | null
  logo_url?: string | null
  city?: string | null
  state?: string | null
  rating?: number | null
  review_count?: number | null
  claimed?: boolean | null
}

export default function DashboardListingPage() {
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [form, setForm] = useState<Partial<Company>>({})
  const [certInput, setCertInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!supabase) { router.push('/login'); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: user } = await supabase!.from('users').select('company_id').eq('email', session.user.email!).single()
      if (!user?.company_id) return
      const { data } = await supabase.from('companies').select('*').eq('id', user.company_id).single()
      if (data) { setCompany(data); setForm(data) }
    })
  }, [router])

  const set = (k: keyof Company, v: unknown) => setForm((prev) => ({ ...prev, [k]: v }))

  const toggleService = (s: string) => {
    const current = form.services || []
    set('services', current.includes(s) ? current.filter((x) => x !== s) : [...current, s])
  }

  const addCert = () => {
    if (!certInput.trim()) return
    set('certifications', [...(form.certifications || []), certInput.trim()])
    setCertInput('')
  }

  const removeCert = (c: string) => set('certifications', (form.certifications || []).filter((x) => x !== c))

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !company) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${company.id}.${ext}`
    const { error } = await supabase.storage.from('company-logos').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('company-logos').getPublicUrl(path)
      set('logo_url', publicUrl)
    }
    setUploading(false)
  }

  const save = async () => {
    if (!company) return
    setSaving(true)
    await supabase.from('companies').update({
      description: form.description,
      services: form.services,
      certifications: form.certifications,
      phone: form.phone,
      email: form.email,
      website: form.website,
      years_in_business: form.years_in_business,
      employee_count: form.employee_count,
      logo_url: form.logo_url,
    }).eq('id', company.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  if (!company) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-navy mb-6">Edit My Listing</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Company Logo</h2>
              <div className="flex items-center gap-4">
                {form.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-contain border border-gray-200" />
                )}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 px-4 py-2 rounded-lg transition-colors">
                  {uploading ? 'Uploading…' : 'Upload Logo (PNG/JPG)'}
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Company Details</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea className={inputCls} rows={4} value={form.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Tell facility managers about your services…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input className={inputCls} value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" className={inputCls} value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Website</label>
                  <input className={inputCls} value={form.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="https://yourcompany.com" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Years in Business</label>
                    <input type="number" className={inputCls} value={form.years_in_business || ''} onChange={(e) => set('years_in_business', parseInt(e.target.value) || null)} />
                  </div>
                  <div>
                    <label className={labelCls}>Team Size</label>
                    <select className={inputCls} value={form.employee_count || ''} onChange={(e) => set('employee_count', e.target.value)}>
                      <option value="">Select</option>
                      {['1-5', '6-15', '16-30', '31-50', '50+'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Services Offered</h2>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_TYPES.map((s) => (
                  <label key={s.value} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={(form.services || []).includes(s.value)}
                      onChange={() => toggleService(s.value)}
                      className="accent-accent"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Certifications</h2>
              <div className="flex gap-2 mb-3">
                <input
                  className={inputCls}
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCert()}
                  placeholder="Type and press Enter"
                />
                <button onClick={addCert} className="bg-navy text-white px-4 rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.certifications || []).map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                    {c}
                    <button onClick={() => removeCert(c)} className="text-gray-400 hover:text-red-500 ml-1 leading-none">×</button>
                  </span>
                ))}
              </div>
            </div>

            <button onClick={save} disabled={saving} className="w-full bg-navy disabled:bg-gray-300 hover:bg-navy/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors">
              {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Preview */}
          <div className="lg:w-80">
            <div className="sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm">Live Preview</h2>
              <CompanyCard
                company={{ ...company, ...form } as Company}
                isSelected={false}
                onToggle={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
