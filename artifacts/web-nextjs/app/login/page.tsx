'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) return
    setForgotLoading(true)
    await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setForgotSent(true)
    setForgotLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-sm w-full">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-navy">Sign In</h1>
              <p className="text-sm text-gray-500 mt-1">Access your company dashboard</p>
            </div>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="••••••••"
                />
              </div>
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-gray-400 hover:text-accent transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy disabled:bg-gray-300 hover:bg-navy/90 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            {showForgot && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {forgotSent ? (
                  <p className="text-sm text-green-600 text-center">Reset link sent — check your email.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-600">Enter your email and we&apos;ll send a reset link.</p>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowForgot(false)}
                        className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={forgotLoading || !forgotEmail}
                        className="flex-1 bg-navy text-white text-sm font-medium py-2 rounded-lg hover:bg-navy/90 disabled:bg-gray-300"
                      >
                        {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <p className="text-center text-sm text-gray-500 mt-5">
              Don&apos;t have an account?{' '}
              <Link href="/claim" className="text-accent font-medium hover:underline">
                Claim your listing →
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
