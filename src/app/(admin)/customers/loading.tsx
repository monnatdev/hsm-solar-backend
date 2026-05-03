export default function CustomersLoading() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mt-1.5" />
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Search */}
      <div className="h-9 w-full bg-gray-100 rounded-lg animate-pulse" />

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 shrink-0 bg-gray-100 rounded-full animate-pulse" />
        ))}
      </div>

      {/* Mobile: card skeletons */}
      <div className="md:hidden space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3.5">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>

      {/* Desktop: table skeleton */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex gap-8">
          {["ชื่อ", "เบอร์โทร", "สถานะ", "วันที่ติดต่อ", "ในสถานะ", ""].map((label) => (
            <span key={label} className="text-sm font-medium text-gray-400">{label}</span>
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-4 py-3.5 border-b border-gray-50">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
