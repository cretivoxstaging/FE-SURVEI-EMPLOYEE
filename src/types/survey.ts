export type QuestionType = "multiple-choice" | "textarea" | "rating";

export interface ConfigQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  sectionTitle?: string;
  scaleMin?: number;
  scaleMax?: number;
}

export interface ConfigSection {
  id: string;
  title: string;
  questions: ConfigQuestion[];
}

export interface ConfigSurvey {
  title: string;
  description: string;
  sections: ConfigSection[];
}

export interface ApiQuestion {
  id: number;
  uuid?: string;
  text?: string;
  question?: string;
  type: string;
  option?: string | string[] | Record<string, string>;
  options?: Record<string, string>;
  required?: boolean | number;
  sectionId?: number;
  sectionID?: number; // External API uses sectionID (capital D)
  sectionTitle?: string;
  scaleMin?: number;
  scaleMax?: number;
}
