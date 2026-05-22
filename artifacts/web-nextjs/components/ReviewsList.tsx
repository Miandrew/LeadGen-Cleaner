'use client'

import { useState } from 'react'
import StarRating from './StarRating'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  author: string
  rating: number
  review_text: string
  review_date: string
}

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? reviews : reviews.slice(0, 5)

  if (reviews.length === 0) {
    return <p className="text-gray-500 text-sm">No reviews yet for this company.</p>
  }

  return (
    <div>
      <div className="space-y-4">
        {visible.map((r) => (
          <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{r.author}</span>
              <span className="text-xs text-gray-400">{formatDate(r.review_date)}</span>
            </div>
            <StarRating rating={r.rating} size="sm" />
            {r.review_text && <p className="text-sm text-gray-600 mt-2">{r.review_text}</p>}
          </div>
        ))}
      </div>
      {!showAll && reviews.length > 5 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-4 py-2.5 text-sm text-accent font-medium border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors"
        >
          Show {reviews.length - 5} more review{reviews.length - 5 === 1 ? '' : 's'}
        </button>
      )}
    </div>
  )
}
