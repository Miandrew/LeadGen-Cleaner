'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'

interface Company {
  id: string
  name: string
  city: string
  state: string
}

export default function ClaimPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [company, setCompany] = useState<Company | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    role: '',
    email: '',
    phone: '',
    confirmed: false,
    password: '',
    confirm_password: '',
    how_getting_clients: [] as string[],
    biggest_challenge: '',
    new_clients_per_month: '',
    marketing_budget: '',
  })

  useEffect(() => {
    fetch(`/api/company-by-slug?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => d.company && setCompany(d.company))
  }, [slug])

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
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company_id: company?.id, slug }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.session && supabase) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          })
        }
        router.push('/dashboard')
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

  const OptionCard = ({ value, label, selected, onClick }: { value: string; label: string; selected: boolean; onClick: () => void }) => (
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
          {company && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-navy">{company.name}</h1>
              <p className="text-gray-500 text-sm mt-1">{company.city}, {company.state}</p>
            </div>
          )}

          <div className="flex items-center gap-2 mb-8 justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s <= step ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-navy' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {step === 1 && (
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
                      <span className="font-medium">{company?.name}</span>
                    </span>
                  </label>
                  <button
                    onClick={() => {
                      if (!form.full_name || !form.role || !form.email || !form.phone || !form.confirmed) {
                        setError('Please complete all fields.')
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
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Back</button>
                    <button
                      onClick={() => {
                        if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
                        if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return }
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
                <h2 className="text-xl font-bold text-navy mb-2">Quick Questions</h2>
                <p className="text-gray-500 text-sm mb-6">Help us understand your business better.</p>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">How are you currently getting new clients? <span className="text-gray-400 font-normal">(select all that apply)</span></h3>
                    <div className="grid grid-cols-1 gap-2">
                      {['Word of mouth and referrals', 'Google Ads', 'Social media marketing', 'Other directories or platforms', 'We struggle to find new clients consistently'].map((opt) => (
                        <OptionCard
                          key={opt}
                          value={opt}
                          label={opt}
                          selected={form.how_getting_clients.includes(opt)}
                          onClick={() => set('how_getting_clients', toggleMulti(form.how_getting_clients, opt))}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">What is your biggest challenge right now?</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {['Not getting enough leads', 'Leads cost too much', 'Hard to compete on price', 'Getting more reviews', 'Managing existing clients'].map((opt) => (
                        <OptionCard
                          key={opt}
                          value={opt}
                          label={opt}
                          selected={form.biggest_challenge === opt}
                          onClick={() => set('biggest_challenge', opt)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">How many new clients are you looking to add per month?</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['1–2 new clients', '3–5 new clients', '5–10 new clients', '10 or more'].map((opt) => (
                        <OptionCard
                          key={opt}
                          value={opt}
                          label={opt}
                          selected={form.new_clients_per_month === opt}
                          onClick={() => set('new_clients_per_month', opt)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">What is your monthly marketing budget?</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['Under $200/month', '$200–$500/month', '$500–$1,000/month', 'Over $1,000/month'].map((opt) => (
                        <OptionCard
                          key={opt}
                          value={opt}
                          label={opt}
                          selected={form.marketing_budget === opt}
                          onClick={() => set('marketing_budget', opt)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Back</button>
                  <button
                    onClick={submitClaim}
                    disabled={loading || !form.biggest_challenge || !form.new_clients_per_month || !form.marketing_budget}
                    className="flex-1 bg-navy disabled:bg-gray-300 hover:bg-navy/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
                  >
                    {loading ? 'Setting up…' : 'Complete Setup and Claim My Listing →'}
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
