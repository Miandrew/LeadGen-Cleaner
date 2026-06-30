import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin, createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 })
    }

    const cookieStore = cookies()
    const supabaseAuth = createSupabaseServerClient((name) => cookieStore.get(name)?.value)
    if (!supabaseAuth) return NextResponse.json({ error: 'Service not configured' }, { status: 503 })

    const { data: { session } } = await supabaseAuth.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { subscription_id } = await req.json()
    if (!subscription_id) return NextResponse.json({ error: 'Missing subscription_id' }, { status: 400 })

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('email', session.user.email!)
      .single()

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Verify the subscription belongs to this customer
    const sub = await stripe.subscriptions.retrieve(subscription_id)
    if (sub.customer !== user.stripe_customer_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Cancel at period end (not immediately)
    await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
