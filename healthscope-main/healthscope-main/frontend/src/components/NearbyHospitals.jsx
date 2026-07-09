import { HospitalSkeleton } from './LoadingSpinner'
import { buildDirectionsUrl } from '../utils/directions'

const CARD_WASHES = [
  'from-emerald-50 to-white',
  'from-violet-50 to-white',
  'from-sky-50 to-white',
]

function StarRating({ rating }) {
  if (rating == null) return <span className="text-xs text-slate-400">No rating</span>

  return (
    <div className="flex items-center gap-1">
      <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-sm font-semibold text-brand-navy">{rating.toFixed(1)}</span>
    </div>
  )
}

function GetDirectionsButton({ hospital }) {
  const handleClick = (e) => {
    e.stopPropagation()
  }

  return (
    <a
      href={buildDirectionsUrl(hospital)}
      target="_blank"
      rel="noopener noreferrer"
      title="Opens directions in Google Maps"
      onClick={handleClick}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-teal/30 bg-white px-4 py-2.5 text-sm font-semibold text-brand-teal shadow-sm transition hover:border-brand-teal hover:bg-brand-teal hover:text-white hover:shadow-md"
    >
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Get Directions
    </a>
  )
}

export default function NearbyHospitals({
  hospitals = [],
  loading = false,
  error = '',
  usedFallback = false,
}) {
  return (
    <section className="mt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Nearby Facilities</h2>
          <p className="mt-2 inline-flex items-center rounded-full bg-white/90 px-4 py-1.5 text-base font-bold text-brand-teal shadow-sm">
            Top hospitals within 5 km
          </p>
          {usedFallback && (
            <p className="mt-1 text-sm font-medium text-brand-navy/80">
              Using Accra, Ghana (location unavailable)
            </p>
          )}
        </div>
      </div>

      {loading && <HospitalSkeleton />}

      {error && !loading && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && hospitals.length === 0 && (
        <p className="text-sm text-slate-500">No hospitals found in this area.</p>
      )}

      {!loading && hospitals.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {hospitals.map((hospital, index) => (
            <article
              key={`${hospital.name}-${index}`}
              className={`glass-card bg-gradient-to-br ${CARD_WASHES[index % CARD_WASHES.length]} p-5 transition hover:shadow-card`}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <svg className="h-6 w-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <h3 className="mb-1 font-bold text-brand-navy">{hospital.name}</h3>
              <p className="mb-3 text-xs text-slate-500">{hospital.vicinity}</p>

              <div className="flex items-center justify-between">
                <StarRating rating={hospital.rating} />
                {hospital.open_now != null && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      hospital.open_now
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {hospital.open_now ? 'Open now' : 'Closed'}
                  </span>
                )}
              </div>

              <GetDirectionsButton hospital={hospital} />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
