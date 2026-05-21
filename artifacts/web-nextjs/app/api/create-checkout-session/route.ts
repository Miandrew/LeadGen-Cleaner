import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { lead_id, company_id } = await req.json()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Lead Contact Details — $35' },
            unit_amount: 3500,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/lead-unlocked/${lead_id}/${company_id}`,
      cancel_url: `${siteUrl}/unlock-lead/${lead_id}/${company_id}`,
      metadata: { lead_id, company_id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout session error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
