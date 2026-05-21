'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return
    setSending(true)
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSent(true)
    setSending(false)
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <div className="max-w-xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-navy mb-3">Contact Us</h1>
          <p className="text-gray-500 mb-10">Questions, feedback, or need help with your listing?</p>
          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <p className="text-green-700 font-semibold">Message sent — we&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className={inputCls} value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className={inputCls} value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea className={inputCls} rows={5} value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="How can we help?" />
              </div>
              <button
                onClick={submit}
                disabled={sending || !form.name || !form.email || !form.message}
                className="bg-navy text-white font-semibold py-3 rounded-lg text-sm hover:bg-navy/90 transition-colors disabled:bg-gray-300"
              >
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
