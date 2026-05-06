import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  try {
    const { plan_id, tier } = await req.json()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    const cookieStore = cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )
    const { data: { session } } = await supabaseAuth.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id, company_id, companies(name, email)')
      .eq('email', session.user.email!)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    let customerId = user.stripe_customer_id
    if (!customerId) {
      const company = Array.isArray(user.companies) ? user.companies[0] : user.companies as { name: string; email: string } | null
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: company?.name,
        metadata: { company_id: user.company_id },
      })
      customerId = customer.id
      await supabaseAdmin.from('users').update({ stripe_customer_id: customerId }).eq('email', session.user.email!)
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: plan_id, quantity: 1 }],
      success_url: `${siteUrl}/dashboard/subscription?success=1`,
      cancel_url: `${siteUrl}/dashboard/subscription`,
      metadata: { company_id: user.company_id, tier },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
