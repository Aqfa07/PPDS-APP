export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-0 overflow-hidden rounded-xl border border-slate-100">
      {/* Header skeleton */}
      <div className="bg-slate-50 px-4 py-3 flex gap-4 border-b border-slate-100">
        {[180, 120, 100, 90, 80, 60].map((w, i) => (
          <div key={i} className="skeleton h-3 rounded" style={{ width: w }} />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-4 flex gap-4 items-center border-b border-slate-50 bg-white"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="skeleton h-3 rounded" style={{ width: 180 }} />
          <div className="skeleton h-3 rounded" style={{ width: 120 }} />
          <div className="skeleton h-5 rounded-full" style={{ width: 100 }} />
          <div className="skeleton h-3 rounded" style={{ width: 90 }} />
          <div className="skeleton h-3 rounded" style={{ width: 80 }} />
          <div className="flex gap-2 ml-auto">
            <div className="skeleton h-7 w-16 rounded-lg" />
            <div className="skeleton h-7 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
