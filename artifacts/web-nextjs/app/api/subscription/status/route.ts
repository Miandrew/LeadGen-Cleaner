import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin, createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 })
    }

    const cookieStore = cookies()
    const supabaseAuth = createSupabaseServerClient((name) => cookieStore.get(name)?.value)
    if (!supabaseAuth) return NextResponse.json({ error: 'Service not configured' }, { status: 503 })

    const { data: { session } } = await supabaseAuth.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id, subscription_status, subscription_tier, leads_remaining')
      .eq('email', session.user.email!)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const isSubscribed = user.subscription_status === 'active' || user.subscription_status === 'past_due'

    if (!isSubscribed || !user.stripe_customer_id) {
      return NextResponse.json({
        subscribed: false,
        subscription_status: user.subscription_status ?? null,
        subscription_tier: user.subscription_tier ?? null,
        leads_remaining: user.leads_remaining ?? 0,
      })
    }

    // Fetch active subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
      limit: 1,
      expand: ['data.items.data.price'],
    })

    // Also check for subscriptions pending cancellation
    let activeSub: Stripe.Subscription | null = subscriptions.data[0] ?? null

    if (!activeSub) {
      const allSubs = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        limit: 5,
        expand: ['data.items.data.price'],
      })
      activeSub = allSubs.data.find(s => s.status === 'active' || s.status === 'past_due') ?? null
    }

    if (!activeSub) {
      return NextResponse.json({
        subscribed: false,
        subscription_status: user.subscription_status ?? null,
        subscription_tier: user.subscription_tier ?? null,
        leads_remaining: user.leads_remaining ?? 0,
      })
    }

    const currentPeriodEnd = new Date((activeSub as any).current_period_end * 1000).toISOString()
    const cancelAtPeriodEnd = (activeSub as any).cancel_at_period_end as boolean

    return NextResponse.json({
      subscribed: true,
      subscription_id: activeSub.id,
      subscription_status: activeSub.status,
      subscription_tier: user.subscription_tier,
      leads_remaining: user.leads_remaining ?? 0,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
    })
  } catch (err) {
    console.error('Subscription status error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
