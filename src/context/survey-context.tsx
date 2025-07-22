"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface EmployeeData {
  id: string
  name: string
  department: string
  position: string
}

interface SurveyContextType {
  selectedEmployee: EmployeeData | null
  setSelectedEmployee: (employee: EmployeeData | null) => void
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined)

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null)

  return (
    <SurveyContext.Provider value={{ selectedEmployee, setSelectedEmployee }}>
      {children}
    </SurveyContext.Provider>
  )
}

export function useSurvey() {
  const context = useContext(SurveyContext)
  if (!context) {
    throw new Error("useSurvey must be used within a SurveyProvider")
  }
  return context
}
