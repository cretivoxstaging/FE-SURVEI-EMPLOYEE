"use client";

import { useMutation } from "@tanstack/react-query";

export interface SurveySubmission {
  employeeID: string;
  name: string;
  surveyResult: Array<{
    date: string;
    dataResult: Array<{
      section: string;
      question: string[];
      answer: string[];
    }>;
    conclutionResult: string;
  }>;
  conclutionResult: string;
}

export const useSurveySubmission = () => {
  const submitSurvey = useMutation({
    mutationFn: async (data: SurveySubmission) => {
      const res = await fetch("/api/v1/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit survey");
      }

      return res.json();
    },
  });

  return { submitSurvey };
};
