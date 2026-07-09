import { usePatient } from '../context/PatientContext'
import logo from '../assets/logo.png'

export default function Navbar({ locationLabel = 'Accra' }) {
  const { patient, openIntake, returnToWelcome } = usePatient()

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={returnToWelcome}
          className="flex items-center gap-3 rounded-xl text-left transition hover:opacity-80"
          title="Return to welcome page"
        >
          <img
            src={logo}
            alt="HealthScope logo"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-xl bg-[#EBEBEB] object-contain shadow-sm"
          />
          <div>
            <p className="text-lg font-bold text-brand-navy">HealthScope</p>
            <p className="hidden text-xs text-slate-500 sm:block">AI Triage Assistant</p>
          </div>
        </button>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <svg className="h-4 w-4 shrink-0 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-slate-600">
              Location: <span className="font-semibold text-brand-navy">{locationLabel}</span>
            </span>
          </div>
        </div>

        <div className="text-right">
          {patient ? (
            <>
              <p className="text-sm font-semibold text-brand-navy">
                Welcome back, {patient.name}
              </p>
              <button
                type="button"
                onClick={openIntake}
                className="text-xs text-brand-teal underline-offset-2 transition hover:text-[#009688] hover:underline"
              >
                Age {patient.age} · Edit info
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">Guest</p>
          )}
        </div>
      </div>
    </header>
  )
}
