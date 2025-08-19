"use client"

import { useCallback, useState } from "react"

const ACTIVE_FLAG = "surveyActive"

export const useActiveSurvey = (initial = false) => {
  const [isActiveSurvey, setIsActiveSurvey] = useState<boolean>(() => {
    if (typeof window === "undefined") return initial
    const raw = localStorage.getItem(ACTIVE_FLAG)
    return raw ? raw === "1" : initial
  })

  const toggleSurvey = useCallback(() => {
    setIsActiveSurvey((prev) => {
      const next = !prev
      try {
        localStorage.setItem(ACTIVE_FLAG, next ? "1" : "0")
      } catch {}
      return next
    })
  }, [])

  return { isActiveSurvey, toggleSurvey }
}
