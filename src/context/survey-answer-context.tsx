"use client"

import React, { createContext, useContext, useState } from "react"

type AnswerMap = Record<string, Record<string, string | string[]>>

type SurveyAnswerCtx = {
  answers: AnswerMap
  updateAnswers: (sectionId: string, answers: Record<string, string | string[]>) => void
  resetAnswers: () => void
}

const SurveyAnswerContext = createContext<SurveyAnswerCtx | null>(null)

export function SurveyAnswerProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<AnswerMap>({})

  const updateAnswers = (sectionId: string, sectionAnswers: Record<string, string | string[]>) => {
    setAnswers((prev) => ({
      ...prev,
      [sectionId]: sectionAnswers,
    }))
  }

  const resetAnswers = () => setAnswers({})

  return (
    <SurveyAnswerContext.Provider value={{ answers, updateAnswers, resetAnswers }}>
      {children}
    </SurveyAnswerContext.Provider>
  )
}

export function useSurveyAnswers() {
  const ctx = useContext(SurveyAnswerContext)
  if (!ctx) throw new Error("useSurveyAnswers must be used within SurveyAnswerProvider")
  return ctx
}
