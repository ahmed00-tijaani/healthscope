import { useState } from 'react'
import TriageBadge from './TriageBadge'
import LoadingSpinner, { ResultsSkeleton } from './LoadingSpinner'
import { exportReportToPDF } from '../utils/pdfExport'

function UrgencyBar({ score }) {
  const color =
    score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-400' : 'bg-brand-teal'

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-brand-navy">Urgency Score</span>
        <span className="font-bold text-brand-teal">{score}/100</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function StepChecklist({ steps }) {
  const [checked, setChecked] = useState({})

  const toggle = (index) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <ul className="space-y-3">
      {steps.map((step, index) => (
        <li key={index}>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 transition hover:border-brand-teal/30">
            <input
              type="checkbox"
              checked={Boolean(checked[index])}
              onChange={() => toggle(index)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal"
            />
            <span className={`text-sm ${checked[index] ? 'text-slate-400 line-through' : 'text-brand-navy'}`}>
              {step}
            </span>
          </label>
        </li>
      ))}
    </ul>
  )
}

export default function ResultsPanel({
  result,
  loading,
  meta,
  patient,
  hospitals,
  printRefId = 'healthscope-print-area',
}) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportReportToPDF(printRefId)
    } catch (err) {
      alert(`Export failed: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-6 sm:p-8">
        <LoadingSpinner label="AI is analyzing your health data…" />
        <ResultsSkeleton />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="glass-card flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-sky">
          <svg className="h-8 w-8 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-brand-navy">Your results will appear here</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Submit symptoms or a lab report to receive an AI-powered triage assessment and plain-English explanation.
        </p>
      </div>
    )
  }

  const executionDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <h2 className="text-xl font-bold text-brand-navy">Triage Results</h2>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="btn-secondary"
        >
          {exporting ? 'Generating PDF…' : 'Export Report to PDF'}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>

      <div id={printRefId} className="glass-card space-y-6 p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal">
            HealthScope Patient Triage Summary
          </p>
          <div className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
            <p><strong>Name:</strong> {patient?.name}</p>
            <p><strong>Age:</strong> {patient?.age}</p>
            {meta?.symptomDurationDays != null && (
              <p><strong>Symptom Duration:</strong> {meta.symptomDurationDays} day(s)</p>
            )}
            <p><strong>Date:</strong> {executionDate}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <TriageBadge level={result.triage_level} />
          <UrgencyBar score={result.urgency_score} />
        </div>

        <section>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-navy">
            Plain-English Explanation
          </h3>
          <p className="leading-relaxed text-slate-700">{result.simplified_explanation}</p>
        </section>

        {result.possible_conditions?.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-navy">
              Possible Conditions
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.possible_conditions.map((condition) => (
                <span
                  key={condition}
                  className="rounded-full bg-brand-sky px-4 py-1.5 text-xs font-medium text-brand-navy"
                >
                  {condition}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-navy">
            Recommended Next Steps
          </h3>
          <StepChecklist steps={result.recommended_next_steps || []} />
        </section>

        {hospitals?.length > 0 && (
          <section className="border-t border-slate-100 pt-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-navy">
              Nearby Hospitals
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {hospitals.map((h) => (
                <li key={h.name} className="rounded-xl bg-slate-50 px-4 py-2">
                  <strong>{h.name}</strong> — {h.vicinity}
                  {h.rating != null && ` · ★ ${h.rating}`}
                  {h.open_now != null && ` · ${h.open_now ? 'Open now' : 'Closed'}`}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
          {result.disclaimer}
        </footer>
      </div>
    </div>
  )
}
