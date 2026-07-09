import { useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { triageAndExplain } from '../api/client'

export default function SymptomCheck({ onResult, onLoadingChange }) {
  const { patient } = usePatient()
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const days = parseInt(duration, 10)
    if (Number.isNaN(days) || days < 0) {
      setError('Please enter how many days you have experienced symptoms.')
      return
    }

    if (!description.trim()) {
      setError('Please describe your symptoms.')
      return
    }

    onLoadingChange(true)
    try {
      const result = await triageAndExplain({
        patient_name: patient.name,
        patient_age: patient.age,
        symptom_duration_days: days,
        symptom_description: description.trim(),
      })
      onResult(result, { mode: 'symptoms', symptomDurationDays: days })
    } catch (err) {
      setError(err.message)
    } finally {
      onLoadingChange(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="symptom-duration" className="mb-2 block text-sm font-semibold text-brand-navy">
          Days experiencing symptoms
        </label>
        <input
          id="symptom-duration"
          type="number"
          min="0"
          className="pill-input max-w-xs"
          placeholder="e.g. 3"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="symptom-description" className="mb-2 block text-sm font-semibold text-brand-navy">
          Symptom description
        </label>
        <textarea
          id="symptom-description"
          rows={6}
          className="w-full resize-none rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-brand-navy outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
          placeholder="Describe what you're feeling — pain, fever, location, severity, triggers…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <button type="submit" className="btn-primary">
        Analyze Symptoms
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </button>
    </form>
  )
}
