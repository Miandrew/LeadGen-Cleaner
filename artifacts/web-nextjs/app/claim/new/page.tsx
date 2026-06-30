'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { US_STATES, SERVICE_TYPES } from '@/lib/utils'

export default function ClaimNewPage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    company_name: '',
    city: '',
    state: '',
    company_phone: '',
    website: '',
    services: [] as string[],
    full_name: '',
    role: '',
    email: '',
    phone: '',
    confirmed: false,
    password: '',
    confirm_password: '',
    lead_source: [] as string[],
    biggest_challenge: '',
    active_accounts: '',
    growth_capacity: '',
  })

  const set = (k: string, v: unknown) => setForm((prev) => ({ ...prev, [k]: v }))

  const passwordStrength = (p: string) => {
    let score = 0
    if (p.length >= 8) score++
    if (p.length >= 12) score++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^a-zA-Z0-9]/.test(p)) score++
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '33%' }
    if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' }
    return { label: 'Strong', color: 'bg-green-500', width: '100%' }
  }

  const toggleMulti = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]

  const submitClaim = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/claim-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: form.company_name,
          city: form.city,
          state: form.state,
          phone: form.company_phone || form.phone,
          website: form.website,
          services: form.services,
          full_name: form.full_name,
          role: form.role,
          email: form.email,
          password: form.password,
          lead_source: form.lead_source,
          biggest_challenge: form.biggest_challenge,
          active_accounts: form.active_accounts,
          growth_capacity: form.growth_capacity,
        }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.session && supabase) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          })
        }
        const verifyParams = new URLSearchParams({ name: form.full_name })
        router.push(`/claim/verify?${verifyParams.toString()}`)
      } else {
        setError(data.error || 'Something went wrong.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  const OptionCard = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 text-left text-sm font-medium transition-all ${
        selected
          ? 'border-navy bg-navy/5 text-navy'
          : 'border-gray-200 hover:border-gray-300 text-gray-700'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-navy">Add Your Company</h1>
            <p className="text-gray-500 text-sm mt-1">Get listed in the directory and start receiving leads.</p>
          </div>

          <div className="flex items-center gap-2 mb-8 justify-center">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s <= step ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {s}
                </div>
                {s < 4 && <div className={`w-10 h-0.5 ${s < step ? 'bg-navy' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-6">Company Details</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls}>Company Name</label>
                    <input className={inputCls} value={form.company_name} onChange={(e) => set('company_name', e.target.value)} placeholder="Acme Commercial Cleaning" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>City</label>
                      <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Austin" />
                    </div>
                    <div>
                      <label className={labelCls}>State</label>
                      <select className={inputCls} value={form.state} onChange={(e) => set('state', e.target.value)}>
                        <option value="">Select state</option>
                        {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input type="tel" className={inputCls} value={form.company_phone} onChange={(e) => set('company_phone', e.target.value)} placeholder="(555) 000-0000" />
                  </div>
                  <div>
                    <label className={labelCls}>Website <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input className={inputCls} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://yourcompany.com" />
                  </div>
                  <div>
                    <label className={labelCls}>
                      Services Offered
                      {form.services.length > 0 && (
                        <span className="ml-2 text-xs bg-navy text-white rounded-full px-2 py-0.5 font-normal">{form.services.length} selected</span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {SERVICE_TYPES.map((svc) => (
                        <button
                          key={svc.value}
                          type="button"
                          onClick={() => set('services', toggleMulti(form.services, svc.value))}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium text-left transition-all ${
                            form.services.includes(svc.value)
                              ? 'border-navy bg-navy/5 text-navy'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {svc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!form.company_name || !form.city || !form.state || !form.services.length) {
                        setError('Please enter your company name, city, state, and at least one service.')
                        return
                      }
                      setError('')
                      setStep(2)
                    }}
                    className="w-full bg-navy hover:bg-navy/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-2"
                  >
                    Next →
                  </button>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-6">Your Information</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input className={inputCls} value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className={labelCls}>Your Role</label>
                    <select className={inputCls} value={form.role} onChange={(e) => set('role', e.target.value)}>
                      <option value="">Select role</option>
                      {['Owner', 'Manager', 'Marketing', 'Other'].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@company.com" />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input type="tel" className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(555) 000-0000" />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.confirmed}
                      onChange={(e) => set('confirmed', e.target.checked)}
                      className="mt-0.5 accent-accent"
                    />
                    <span className="text-sm text-gray-600">
                      I confirm I am authorized to manage this listing for{' '}
                      <span className="font-medium">{form.company_name || 'this company'}</span>
                    </span>
                  </label>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => { setError(''); setStep(1) }} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Back</button>
                    <button
                      onClick={() => {
                        if (!form.full_name || !form.role || !form.email || !form.phone || !form.confirmed) {
                          setError('Please complete all fields.')
                          return
                        }
                        setError('')
                        setStep(3)
                      }}
                      className="flex-1 bg-navy hover:bg-navy/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-6">Create a Password</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls}>Password (min 8 characters)</label>
                    <input type="password" className={inputCls} value={form.password} onChange={(e) => set('password', e.target.value)} />
                    {form.password && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${passwordStrength(form.password).color}`}
                            style={{ width: passwordStrength(form.password).width }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{passwordStrength(form.password).label}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <input type="password" className={inputCls} value={form.confirm_password} onChange={(e) => set('confirm_password', e.target.value)} />
                    {form.confirm_password.length > 0 && form.password.length > 0 && (
                      <p className={`text-xs mt-1 ${form.confirm_password === form.password ? 'text-green-600' : 'text-red-500'}`}>
                        {form.confirm_password === form.password ? '✓ Passwords match' : 'Passwords do not match'}
                      </p>
                    )}
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => { setError(''); setStep(2) }} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Back</button>
                    <button
                      onClick={() => {
                        if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
                        if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return }
                        setError('')
                        setStep(4)
                      }}
                      className="flex-1 bg-navy hover:bg-navy/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold text-navy mb-2">4 Quick Questions</h2>
                <p className="text-gray-500 text-sm mb-6">Help us match the right leads to your business — takes about 60 seconds.</p>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      How are you currently getting most of your new commercial clients?{' '}
                      <span className="text-gray-400 font-normal text-sm">(select all that apply)</span>
                      {form.lead_source.length > 0 && (
                        <span className="ml-2 text-xs bg-navy text-white rounded-full px-2 py-0.5 font-normal">
                          {form.lead_source.length} selected
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {['Referrals / word of mouth', 'Google or SEO', 'Paid ads', 'Cold outreach', "Not consistently — that's the problem"].map((opt) => (
                        <OptionCard
                          key={opt}
                          label={opt}
                          selected={form.lead_source.includes(opt)}
                          onClick={() => set('lead_source', toggleMulti(form.lead_source, opt))}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">What&apos;s the biggest challenge in your business right now?</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {['Not enough leads / inconsistent work', 'Missed calls or slow follow-up', 'Cash flow — getting paid on time', 'Hiring and keeping good staff', 'Managing scheduling and operations', 'Already busy — thinking about growth or eventually selling the business'].map((opt) => (
                        <OptionCard
                          key={opt}
                          label={opt}
                          selected={form.biggest_challenge === opt}
                          onClick={() => set('biggest_challenge', opt)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">How many active commercial accounts are you currently servicing?</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['1-5', '6-20', '21-50', '50+'].map((opt) => (
                        <OptionCard
                          key={opt}
                          label={opt}
                          selected={form.active_accounts === opt}
                          onClick={() => set('active_accounts', opt)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">If quality leads came in today, how many new accounts could you realistically take on this month?</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {["0-1, we're at capacity", '2-4', '5-9', '10+'].map((opt) => (
                        <OptionCard
                          key={opt}
                          label={opt}
                          selected={form.growth_capacity === opt}
                          onClick={() => set('growth_capacity', opt)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setError(''); setStep(3) }} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Back</button>
                  <button
                    onClick={() => {
                      if (!form.lead_source.length || !form.biggest_challenge || !form.active_accounts || !form.growth_capacity) {
                        setError('Please answer all 4 questions.')
                        return
                      }
                      setError('')
                      submitClaim()
                    }}
                    disabled={loading || !form.lead_source.length || !form.biggest_challenge || !form.active_accounts || !form.growth_capacity}
                    className="flex-1 bg-navy disabled:bg-gray-300 hover:bg-navy/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
                  >
                    {loading ? 'Setting up…' : 'Complete Setup and Add My Company →'}
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
