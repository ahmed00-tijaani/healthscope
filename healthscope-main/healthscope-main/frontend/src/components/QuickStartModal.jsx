import { useEffect, useState } from 'react'
import { readStoredPatient, usePatient } from '../context/PatientContext'
import logo from '../assets/logo.png'
import dashboardBg from '../assets/dashboard-bg.jpg'

const WELCOME_FEATURES = [
  { icon: '🩺', label: 'Symptom triage' },
  { icon: '📋', label: 'Lab report analysis' },
  { icon: '🏥', label: 'Nearby hospitals' },
]

export default function QuickStartModal({ mode = 'initial' }) {
  const { patient, setPatient, closeIntake } = usePatient()
  const isEdit = mode === 'edit'
  const isWelcome = !isEdit
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit && patient) {
      setName(patient.name)
      setAge(String(patient.age))
      return
    }

    if (isWelcome) {
      const saved = readStoredPatient()
      if (saved) {
        setName(saved.name)
        setAge(String(saved.age))
      }
    }
  }, [isEdit, isWelcome, patient])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }

    const ageNum = parseInt(age, 10)
    if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      setError('Please enter a valid age (0–150).')
      return
    }

    setPatient(name, ageNum)
  }

  const handleCancel = () => {
    closeIntake()
  }

  return (
    <div
      className="doctor-bg doctor-bg-solid intake-backdrop"
      style={{ '--doctor-bg-image': `url(${dashboardBg})` }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-title"
    >
      <div
        className={`relative z-10 w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-card backdrop-blur-md ${
          isWelcome ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <div className="bg-gradient-to-br from-brand-sky/90 via-white to-white px-8 pb-8 pt-10 sm:px-10">
          <div className="mb-6 flex items-center gap-3">
            <img
              src={logo}
              alt="HealthScope logo"
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-xl bg-[#EBEBEB] object-contain shadow-sm"
            />
            <div>
              <p className="text-2xl font-bold text-brand-navy">HealthScope</p>
              <p className="text-sm text-slate-500">AI Triage Assistant</p>
            </div>
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-teal">
            {isWelcome ? 'Welcome' : 'Profile'}
          </p>
          <h1 id="intake-title" className="text-3xl font-extrabold leading-tight text-brand-navy sm:text-4xl">
            {isEdit ? (
              <>Update <span className="text-brand-teal">your info</span></>
            ) : (
              <>
                Welcome to{' '}
                <span className="text-brand-teal">HealthScope</span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-600">
            {isEdit
              ? 'Update your name or age. Your dashboard and results will stay open.'
              : 'Tell us who you are to begin a personalized health session — instant access, no account required.'}
          </p>

          {isWelcome && (
            <div className="mt-6 flex flex-wrap gap-2">
              {WELCOME_FEATURES.map((feature) => (
                <span
                  key={feature.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-brand-navy shadow-sm"
                >
                  <span>{feature.icon}</span>
                  {feature.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5 bg-white/95 px-8 py-8 sm:px-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2 sm:max-w-md">
              <label htmlFor="patient-name" className="mb-2 block text-sm font-semibold text-brand-navy">
                Your name
              </label>
              <input
                id="patient-name"
                type="text"
                className="pill-input bg-white"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="sm:max-w-xs">
              <label htmlFor="patient-age" className="mb-2 block text-sm font-semibold text-brand-navy">
                Your age
              </label>
              <input
                id="patient-age"
                type="number"
                min="0"
                max="150"
                className="pill-input bg-white"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            {isEdit && (
              <button type="button" onClick={handleCancel} className="btn-secondary flex-1">
                Cancel
              </button>
            )}
            <button type="submit" className={`btn-primary ${isEdit ? 'flex-1' : 'w-full sm:w-auto sm:min-w-[220px]'}`}>
              {isEdit ? 'Save Changes' : 'Enter Dashboard'}
              {!isEdit && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
