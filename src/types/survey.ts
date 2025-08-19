export type QuestionType = "multiple-choice" | "text" | "rating"

export interface ConfigQuestion {
  id: string
  text: string
  type: QuestionType
  options?: string[]
  required?: boolean
}

export interface ConfigSection {
  id: string
  title: string
  questions: ConfigQuestion[]
}

export interface ConfigSurvey {
  title: string
  description: string
  sections: ConfigSection[]
}

export type RuntimeQuestionType = "text" | "radio" | "textarea"

export interface RuntimeQuestion {
  id: string
  question: string
  type: RuntimeQuestionType
  options?: string[]
  required?: boolean
}

export interface RuntimeSection {
  id: string
  title: string
  questions: RuntimeQuestion[]
}

export interface RuntimeSurvey {
  title: string
  description: string
  sections: RuntimeSection[]
}
