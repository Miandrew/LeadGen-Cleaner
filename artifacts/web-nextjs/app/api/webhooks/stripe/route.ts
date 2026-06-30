import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { lead_id, company_id } = session.metadata || {}

      if (lead_id && company_id && session.mode === 'payment') {
        await supabaseAdmin.from('lead_purchases').upsert(
          {
            lead_id,
            company_id,
            amount_paid: (session.amount_total || 3500) / 100,
            stripe_payment_id: session.payment_intent as string,
          },
          { onConflict: 'stripe_payment_id', ignoreDuplicates: true }
        )

        const { data: lead } = await supabaseAdmin.from('leads').select('*').eq('id', lead_id).single()
        const { data: company } = await supabaseAdmin.from('companies').select('name, email').eq('id', company_id).single()

        if (lead && company?.email) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
          const amountDisplay = `$${((session.amount_total || 3500) / 100).toFixed(2)}`
          await sendEmail(
            company.email,
            `Receipt — Lead Contact Details Unlocked`,
            `<p>You've successfully unlocked a lead contact for ${amountDisplay}.</p>
             <a href="${siteUrl}/lead-unlocked/${lead_id}/${company_id}">View Contact Details</a>`
          )
        }

        await sendEmail(
          process.env.ADMIN_EMAIL!,
          `Lead purchased — $${((session.amount_total || 3500) / 100).toFixed(2)}`,
          `<p>Company ${company?.name} purchased lead ${lead_id} for $${((session.amount_total || 3500) / 100).toFixed(2)}.</p>`
        )
      }

      if (session.mode === 'subscription' && session.metadata?.company_id) {
        const { company_id, tier, placement_type } = session.metadata

        // Handle featured listing subscriptions
        if (placement_type) {
          const { data: company } = await supabaseAdmin
            .from('companies')
            .select('city, state')
            .eq('id', company_id)
            .single()

          await supabaseAdmin.from('featured_listings').insert({
            company_id,
            placement_type,
            city: company?.city,
            state: company?.state,
            stripe_subscription_id: session.subscription as string,
            active: true,
            starts_at: new Date().toISOString(),
          })
        } else {
          // Standard subscription tier
          const leadsMap: Record<string, number> = { growth: 10, unlimited: 999 }
          await supabaseAdmin.from('users').update({
            subscription_status: 'active',
            subscription_tier: tier,
            leads_remaining: leadsMap[tier] || 0,
          }).eq('company_id', company_id)
        }
      }
    }

    if (event.type === 'customer.subscription.created') {
      const sub = event.data.object as Stripe.Subscription
      const company_id = sub.metadata?.company_id
      if (company_id) {
        const priceId = sub.items.data[0]?.price?.id
        const tier = getPlanTier(priceId)
        const leadsMap: Record<string, number> = { growth: 10, unlimited: 999 }
        await supabaseAdmin.from('users').update({
          subscription_status: 'active',
          subscription_tier: tier,
          leads_remaining: leadsMap[tier] || 0,
        }).eq('company_id', company_id)
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const updatedSub = event.data.object as Stripe.Subscription
      const company_id = updatedSub.metadata?.company_id
      if (company_id) {
        const priceId = updatedSub.items.data[0]?.price?.id
        const tier = getPlanTier(priceId)
        const leadsMap: Record<string, number> = { growth: 10, unlimited: 999 }
        // If subscription is being reactivated (cancel_at_period_end toggled off)
        const newStatus = updatedSub.status === 'active' ? 'active' : updatedSub.status
        await supabaseAdmin.from('users').update({
          subscription_status: newStatus,
          subscription_tier: tier,
          leads_remaining: leadsMap[tier] || 0,
        }).eq('company_id', company_id)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const deletedSub = event.data.object as Stripe.Subscription
      const company_id = deletedSub.metadata?.company_id
      if (company_id) {
        await supabaseAdmin.from('users').update({
          subscription_status: 'cancelled',
          leads_remaining: 0,
        }).eq('company_id', company_id)
      }

      // Deactivate featured listings when subscription cancelled
      await supabaseAdmin
        .from('featured_listings')
        .update({ active: false })
        .eq('stripe_subscription_id', deletedSub.id)
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('email, companies(name)')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        await supabaseAdmin.from('users').update({ subscription_status: 'past_due' }).eq('stripe_customer_id', customerId)
        if (user.email) {
          await sendEmail(
            user.email,
            'Action required — payment failed for your subscription',
            `<p>Your subscription payment failed. Please update your payment method to continue receiving leads.</p>
             <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription">Update Payment Method</a>`
          )
        }
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
  }

  return NextResponse.json({ received: true })
}

function getPlanTier(priceId: string | undefined): string {
  if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) return 'growth'
  if (priceId === process.env.STRIPE_UNLIMITED_PRICE_ID) return 'unlimited'
  return 'growth'
}
