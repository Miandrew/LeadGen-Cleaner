export function CompanyCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-lg shimmer flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-5 w-2/3 shimmer rounded mb-2" />
          <div className="h-4 w-1/3 shimmer rounded mb-3" />
          <div className="h-4 w-1/2 shimmer rounded" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-20 shimmer rounded-full" />
        <div className="h-6 w-20 shimmer rounded-full" />
        <div className="h-6 w-20 shimmer rounded-full" />
      </div>
      <div className="mt-4 h-4 shimmer rounded" />
      <div className="mt-1 h-4 w-3/4 shimmer rounded" />
      <div className="mt-4 h-9 shimmer rounded" />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 shimmer rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <div className="h-8 w-1/2 shimmer rounded mb-3" />
            <div className="h-5 w-1/3 shimmer rounded mb-3" />
            <div className="h-5 w-1/4 shimmer rounded" />
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="h-6 w-1/4 shimmer rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 shimmer rounded" />
          <div className="h-4 shimmer rounded" />
          <div className="h-4 w-3/4 shimmer rounded" />
        </div>
      </div>
    </div>
  )
}
