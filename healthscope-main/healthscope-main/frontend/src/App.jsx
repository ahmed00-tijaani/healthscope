import { useCallback, useEffect, useState } from 'react'
import { usePatient } from './context/PatientContext'
import QuickStartModal from './components/QuickStartModal'
import Navbar from './components/Navbar'
import SymptomCheck from './components/SymptomCheck'
import ReportAnalyzer from './components/ReportAnalyzer'
import ResultsPanel from './components/ResultsPanel'
import NearbyHospitals from './components/NearbyHospitals'
import { ACCRA_COORDS, fetchNearbyHospitals } from './api/client'
import dashboardBg from './assets/dashboard-bg.jpg'

function resolveLocationLabel(data) {
  if (data.location_label) return data.location_label

  const vicinity = data.hospitals?.[0]?.vicinity
  if (vicinity) {
    const parts = vicinity.split(',').map((part) => part.trim()).filter(Boolean)
    if (parts.length >= 2) return parts[parts.length - 2]
  }

  return 'Accra'
}
const MODES = [
  { id: 'symptoms', label: 'Check Symptoms', icon: '🩺' },
  { id: 'report', label: 'Analyze Report', icon: '📋' },
]

export default function App() {
  const { patient, intakeComplete, intakeOpen } = usePatient()
  const [mode, setMode] = useState('symptoms')
  const [result, setResult] = useState(null)
  const [resultMeta, setResultMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [locationLabel, setLocationLabel] = useState('Accra')
  const [hospitalsLoading, setHospitalsLoading] = useState(true)
  const [hospitalsError, setHospitalsError] = useState('')
  const [usedLocationFallback, setUsedLocationFallback] = useState(false)

  const handleResult = useCallback((data, meta) => {
    setResult(data)
    setResultMeta(meta)
  }, [])

  useEffect(() => {
    if (!intakeComplete) return undefined

    let cancelled = false

    const loadHospitals = async (coords, fallback = false) => {
      setHospitalsLoading(true)
      setHospitalsError('')
      try {
        const data = await fetchNearbyHospitals(coords.latitude, coords.longitude)
        if (cancelled) return
        setHospitals(data.hospitals || [])
        setLocationLabel(resolveLocationLabel(data))
        setUsedLocationFallback(fallback)
      } catch (err) {
        if (!cancelled) setHospitalsError(err.message)
      } finally {
        if (!cancelled) setHospitalsLoading(false)
      }
    }

    if (!navigator.geolocation) {
      loadHospitals(ACCRA_COORDS, true)
      return () => { cancelled = true }
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadHospitals(
          { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          false,
        )
      },
      () => loadHospitals(ACCRA_COORDS, true),
      { timeout: 10000, maximumAge: 300000 },
    )

    return () => { cancelled = true }
  }, [intakeComplete])

  if (!intakeComplete) {
    return <QuickStartModal />
  }

  return (
    <>
      <div
        className="doctor-bg doctor-bg-solid relative min-h-screen pb-16"
        style={{ '--doctor-bg-image': `url(${dashboardBg})` }}
      >
        <div className="relative z-10">
          <Navbar locationLabel={locationLabel} />

          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <section className="mb-10 rounded-[2rem] bg-gradient-to-br from-brand-sky/80 via-white to-white p-8 shadow-glass sm:p-10">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-teal">
              Personalized Care
            </p>
            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-brand-navy sm:text-4xl">
              Your AI-powered{' '}
              <span className="text-brand-teal">health companion</span>
            </h1>
            <p className="mt-3 max-w-xl text-slate-600">
              Describe symptoms or paste a lab report for instant triage guidance, plain-English explanations, and nearby care options.
            </p>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="glass-card p-6 sm:p-8">
              <div className="mb-6 flex rounded-full bg-slate-100 p-1">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      mode === m.id
                        ? 'bg-white text-brand-teal shadow-sm'
                        : 'text-slate-500 hover:text-brand-navy'
                    }`}
                  >
                    <span>{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>

              {mode === 'symptoms' ? (
                <SymptomCheck onResult={handleResult} onLoadingChange={setLoading} />
              ) : (
                <ReportAnalyzer onResult={handleResult} onLoadingChange={setLoading} />
              )}
            </div>

            <ResultsPanel
              result={result}
              loading={loading}
              meta={resultMeta}
              patient={patient}
              hospitals={hospitals}
            />
          </div>

          <NearbyHospitals
            hospitals={hospitals}
            loading={hospitalsLoading}
            error={hospitalsError}
            usedFallback={usedLocationFallback}
          />
          </main>
        </div>
      </div>

      {intakeOpen && <QuickStartModal mode="edit" />}
    </>
  )
}
