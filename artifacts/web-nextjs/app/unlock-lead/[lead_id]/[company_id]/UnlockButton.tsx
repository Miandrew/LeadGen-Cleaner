'use client'

import { useState } from 'react'

interface Props {
  leadId: string
  companyId: string
  leadType: string
  priceDisplay: string
}

export default function UnlockButton({ leadId, companyId, leadType, priceDisplay }: Props) {
  const [loading, setLoading] = useState(false)

  const handleUnlock = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, company_id: companyId, lead_type: leadType }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUnlock}
      disabled={loading}
      className="w-full bg-navy disabled:bg-gray-300 hover:bg-navy/90 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
    >
      {loading ? 'Redirecting to payment…' : `Unlock Contact Details — ${priceDisplay}`}
    </button>
  )
}
