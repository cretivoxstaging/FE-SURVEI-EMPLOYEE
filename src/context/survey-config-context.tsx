"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import type {
  ConfigSurvey,
  RuntimeSurvey,
  RuntimeSection,
  RuntimeQuestion,
} from "@/types/survey"

type Ctx = {
  draft: ConfigSurvey
  setDraft: (updater: (prev: ConfigSurvey) => ConfigSurvey) => void
  active: RuntimeSurvey | null
  publish: () => void
  loadActive: () => void
}

const SurveyConfigContext = createContext<Ctx | null>(null)

const ACTIVE_KEY = "activeSurvey"
const DRAFT_KEY = "draftSurvey"
const ACTIVE_FLAG = "surveyActive"

export function SurveyConfigProvider({
  children,
  initialDraft,
}: {
  children: React.ReactNode
  initialDraft?: ConfigSurvey
}) {
  const [draft, setDraftState] = useState<ConfigSurvey>(() => {
    if (typeof window === "undefined") {
      return (
        initialDraft ?? {
          title: "",
          description: "",
          sections: [],
        }
      )
    }
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return (
      initialDraft ?? {
        title: "",
        description: "",
        sections: [],
      }
    )
  })

  const [active, setActive] = useState<RuntimeSurvey | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {}
  }, [draft])

  useEffect(() => {
    const raw = localStorage.getItem(ACTIVE_KEY)
    if (raw) {
      try {
        setActive(JSON.parse(raw))
      } catch {}
    }
  }, [])

  const setDraft = useCallback((updater: (prev: ConfigSurvey) => ConfigSurvey) => {
    setDraftState((prev) => updater(prev))
  }, [])

  const toRuntime = useCallback((cfg: ConfigSurvey): RuntimeSurvey => {
    const runtimeSections: RuntimeSection[] = cfg.sections.map((sec) => {
      const questions: RuntimeQuestion[] = sec.questions.map((q) => {
        const base = {
          id: q.id,
          question: q.text,
          required: q.required ?? false,
        }
        if (q.type === "multiple-choice") {
          return { ...base, type: "radio", options: q.options ?? [] }
        }
        if (q.type === "text") {
          return { ...base, type: "text" }
        }
        // rating → radio (1..5) default kalau options kosong
        const opts = (q.options && q.options.length > 0 ? q.options : ["1", "2", "3", "4", "5"])
        return { ...base, type: "radio", options: opts }
      })
      return { id: sec.id, title: sec.title, questions }
    })

    return {
      title: cfg.title,
      description: cfg.description,
      sections: runtimeSections,
    }
  }, [])

  const publish = useCallback(() => {
    const runtime = toRuntime(draft)
    setActive(runtime)
    try {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(runtime))
      localStorage.setItem(ACTIVE_FLAG, "1")
    } catch {}
  }, [draft, toRuntime])

  const loadActive = useCallback(() => {
    const raw = localStorage.getItem(ACTIVE_KEY)
    if (raw) {
      try {
        setActive(JSON.parse(raw))
      } catch {}
    }
  }, [])

  return (
    <SurveyConfigContext.Provider value={{ draft, setDraft, active, publish, loadActive }}>
      {children}
    </SurveyConfigContext.Provider>
  )
}

export function useSurveyConfig() {
  const ctx = useContext(SurveyConfigContext)
  if (!ctx) throw new Error("useSurveyConfig must be used within SurveyConfigProvider")
  return ctx
}
