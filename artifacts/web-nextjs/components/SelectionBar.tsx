'use client'

interface SelectionBarProps {
  selectedCount: number
  onRequestQuotes: () => void
}

export default function SelectionBar({ selectedCount, onRequestQuotes }: SelectionBarProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        selectedCount > 0 ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white border-t border-gray-200 shadow-2xl px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-navy text-sm sm:text-base">
              {selectedCount} {selectedCount === 1 ? 'company' : 'companies'} selected
            </span>
          </div>
          <button
            onClick={onRequestQuotes}
            className="bg-navy hover:bg-navy/90 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            Request Quotes →
          </button>
        </div>
      </div>
    </div>
  )
}
