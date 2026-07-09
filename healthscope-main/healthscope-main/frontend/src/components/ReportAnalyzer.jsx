import { useCallback, useRef, useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { triageAndExplain } from '../api/client'
import {
  ACCEPTED_FILE_LABEL,
  ACCEPTED_FILE_TYPES,
  extractTextFromFile,
} from '../utils/fileTextExtractor'

export default function ReportAnalyzer({ onResult, onLoadingChange }) {
  const { patient } = usePatient()
  const fileInputRef = useRef(null)
  const dragDepthRef = useRef(0)
  const [reportText, setReportText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')

  const processFile = useCallback(async (file) => {
    setError('')
    setExtracting(true)
    try {
      const text = await extractTextFromFile(file)
      setReportText(text)
      setFileName(file.name)
    } catch (err) {
      setError(err.message || 'Could not read this file.')
    } finally {
      setExtracting(false)
    }
  }, [])

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current += 1
    setDragOver(true)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current -= 1
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0
      setDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = 0
    setDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!reportText.trim()) {
      setError('Upload a report or paste your lab text to continue.')
      return
    }

    onLoadingChange(true)
    try {
      const result = await triageAndExplain({
        patient_name: patient.name,
        patient_age: patient.age,
        raw_lab_report_text: reportText.trim(),
      })
      onResult(result, { mode: 'report' })
    } catch (err) {
      setError(err.message)
    } finally {
      onLoadingChange(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={handleFileInput}
      />

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openFilePicker()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload a medical report file"
        className={`cursor-pointer rounded-3xl border-2 border-dashed p-6 transition ${
          dragOver
            ? 'border-brand-teal bg-brand-teal/5'
            : 'border-slate-200 bg-white/50 hover:border-brand-teal/40 hover:bg-white/70'
        }`}
      >
        <div className="mb-4 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-sky">
            <svg className="h-7 w-7 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-brand-navy">
            {extracting ? 'Reading document…' : 'Drag & drop a report here'}
          </p>
          <p className="text-xs text-slate-500">
            or click to browse · {ACCEPTED_FILE_LABEL}
          </p>
          {fileName && !extracting && (
            <p className="mt-2 rounded-full bg-brand-sky px-3 py-1 text-xs font-medium text-brand-navy">
              Loaded: {fileName}
            </p>
          )}
        </div>

        <textarea
          rows={8}
          onClick={(e) => e.stopPropagation()}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 font-mono text-xs text-brand-navy outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
          placeholder="Paste CBC, metabolic panel, imaging notes, or any medical report text…"
          value={reportText}
          onChange={(e) => {
            setReportText(e.target.value)
            if (e.target.value.trim()) setFileName('')
          }}
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <button type="submit" className="btn-primary" disabled={extracting}>
        Analyze Report
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
    </form>
  )
}
