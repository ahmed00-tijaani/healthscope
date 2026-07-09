export default function LoadingSpinner({ label = 'Analyzing…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-brand-teal/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-teal" />
      </div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  )
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-40 rounded-full" />
      <div className="skeleton h-4 w-full rounded-lg" />
      <div className="skeleton h-4 w-5/6 rounded-lg" />
      <div className="skeleton h-24 w-full rounded-2xl" />
      <div className="skeleton h-20 w-full rounded-2xl" />
    </div>
  )
}

export function HospitalSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-5">
          <div className="skeleton mb-3 h-5 w-3/4 rounded-lg" />
          <div className="skeleton mb-2 h-4 w-1/2 rounded-lg" />
          <div className="skeleton h-4 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}
