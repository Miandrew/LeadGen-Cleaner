import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { lead_id, company_id, lead_type } = await req.json()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    const priceMap: Record<string, number> = {
      exclusive: 4500,
      'semi-exclusive': 3500,
      shared: 2500,
    }
    const unit_amount = priceMap[lead_type as string] ?? 3500
    const typeLabel = lead_type
      ? (lead_type as string).charAt(0).toUpperCase() + (lead_type as string).slice(1)
      : 'Standard'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Lead Contact Details — ${typeLabel}` },
            unit_amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/lead-unlocked/${lead_id}/${company_id}`,
      cancel_url: `${siteUrl}/unlock-lead/${lead_id}/${company_id}`,
      metadata: { lead_id, company_id, lead_type: lead_type || 'shared' },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout session error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
