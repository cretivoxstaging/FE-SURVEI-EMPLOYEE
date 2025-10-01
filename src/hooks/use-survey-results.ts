"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface SurveyResult {
  answer: string[];
  section: string;
  question: string[];
}

export interface SurveyResponse {
  id: number;
  createdAt: string;
  employeeID: string;
  name: string;
  surveyResult: SurveyResult[];
  conclutionResult: string;
}

export interface SurveyResultsResponse {
  message: string;
  data: SurveyResponse;
}

export interface AllSurveyResultsResponse {
  message: string;
  data: SurveyResponse[];
}

export const useSurveyResults = () => {
  const getAllSurveyResults = useQuery({
    queryKey: ["survey-results"],
    queryFn: async (): Promise<AllSurveyResultsResponse> => {
      const response = await apiClient.get("/api/v1/survey");
      return response.data;
    },
  });

  return {
    getAllSurveyResults,
  };
};

export const useSurveyResultById = (id: string | number) => {
  const getSurveyResultById = useQuery({
    queryKey: ["survey-result", id],
    queryFn: async (): Promise<SurveyResultsResponse> => {
      const response = await apiClient.get(`/api/v1/survey/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  return {
    getSurveyResultById,
  };
};
