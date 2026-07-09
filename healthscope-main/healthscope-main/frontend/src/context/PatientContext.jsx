import { createContext, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'healthscope_patient'

const PatientContext = createContext(null)

export function readStoredPatient() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.name && parsed?.age != null) return parsed
    return null
  } catch {
    return null
  }
}

export function PatientProvider({ children }) {
  const [patient, setPatientState] = useState(null)
  const [intakeComplete, setIntakeComplete] = useState(false)
  const [intakeOpen, setIntakeOpen] = useState(false)

  const setPatient = (name, age) => {
    const next = { name: name.trim(), age: Number(age) }
    setPatientState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setIntakeComplete(true)
    setIntakeOpen(false)
  }

  const clearPatient = () => {
    localStorage.removeItem(STORAGE_KEY)
    setPatientState(null)
    setIntakeComplete(false)
    setIntakeOpen(false)
  }

  const returnToWelcome = () => {
    setPatientState(null)
    setIntakeComplete(false)
    setIntakeOpen(false)
  }

  const openIntake = () => setIntakeOpen(true)
  const closeIntake = () => setIntakeOpen(false)

  const value = useMemo(
    () => ({
      patient,
      intakeComplete,
      intakeOpen,
      setPatient,
      clearPatient,
      returnToWelcome,
      openIntake,
      closeIntake,
    }),
    [patient, intakeComplete, intakeOpen],
  )

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
}

export function usePatient() {
  const ctx = useContext(PatientContext)
  if (!ctx) throw new Error('usePatient must be used within PatientProvider')
  return ctx
}
