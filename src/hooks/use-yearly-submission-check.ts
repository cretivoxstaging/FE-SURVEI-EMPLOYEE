"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface YearlySubmissionCheck {
  hasSubmittedThisYear: boolean;
  submissionData: {
    id: number;
    createdAt: string;
    year: string;
  } | null;
  isLoading: boolean;
  isError: boolean;
}

interface SurveySubmission {
  id: number;
  createdAt: string;
  employeeID: string;
  name: string;
  surveyResult: {
    date: string;
    dataResult: {
      answer: string[];
      section: string;
      question: string[];
    }[];
    conclutionResult: string;
  }[];
  conclutionResult: string;
}

interface SurveyApiResponse {
  message: string;
  data: SurveySubmission[];
}

export function useYearlySubmissionCheck(employeeId: string | number) {
  const currentYear = new Date().getFullYear().toString();

  // Fetch all survey results for this employee
  const {
    data: surveyResults,
    isLoading,
    isError,
  } = useQuery<SurveyApiResponse>({
    queryKey: ["employee-yearly-submissions", employeeId],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/survey");
      return response.data;
    },
    enabled: !!employeeId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  // Check if employee has submitted this year
  const submissionCheck = useMemo((): YearlySubmissionCheck => {

    const surveyData = surveyResults?.data;
    if (!surveyData || !Array.isArray(surveyData)) {
      return {
        hasSubmittedThisYear: false,
        submissionData: null,
        isLoading,
        isError,
      };
    }

    // Find survey submissions for this employee
    const employeeSubmissions = surveyData.filter(
      (survey: SurveySubmission) =>
        String(survey.employeeID) === String(employeeId)
    );


    // Debug: Show all submissions for debugging

    // Debug: Check if we found any submissions for this employee
    if (employeeSubmissions.length === 0) {

      // Check for Abdul Rohim specifically
      const abdulSubmissions = surveyData.filter(
        (s: SurveySubmission) =>
          s.name?.toLowerCase().includes("abdul") ||
          s.name?.toLowerCase().includes("rohim") ||
          s.name?.toLowerCase().includes("abdul rohim")
      );
    }

    // Check if any submission is from current year
    const currentYearSubmission = employeeSubmissions.find(
      (survey: SurveySubmission) => {
        // Check both old and new date formats
        let dateToCheck = survey.createdAt;

        // If we have surveyResult with date field, use the latest submission date
        if (
          survey.surveyResult &&
          Array.isArray(survey.surveyResult) &&
          survey.surveyResult.length > 0
        ) {
          const latestSubmission =
            survey.surveyResult[survey.surveyResult.length - 1];
          if (latestSubmission?.date) {
            dateToCheck = latestSubmission.date;
          }
        }

        if (!dateToCheck) return false;

        try {
          // Parse DD/MM/YYYY - HH:MM format
          const dateMatch = dateToCheck.match(
            /(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2})/
          );
          if (!dateMatch) return false;

          const [, , , year] = dateMatch;
          const isCurrentYear = year === currentYear;


          return isCurrentYear;
        } catch (error) {
          console.warn("Error parsing survey date:", dateToCheck, error);
          return false;
        }
      }
    );

    const result = {
      hasSubmittedThisYear: !!currentYearSubmission,
      submissionData: currentYearSubmission
        ? {
            id: currentYearSubmission.id,
            createdAt:
              currentYearSubmission.surveyResult &&
              Array.isArray(currentYearSubmission.surveyResult) &&
              currentYearSubmission.surveyResult.length > 0
                ? currentYearSubmission.surveyResult[
                    currentYearSubmission.surveyResult.length - 1
                  ]?.date || currentYearSubmission.createdAt
                : currentYearSubmission.createdAt,
            year: currentYear,
          }
        : null,
      isLoading,
      isError,
    };


    // Debug: If no submission found, show why
    if (!result.hasSubmittedThisYear && employeeSubmissions.length > 0) {
    }

    return result;
  }, [surveyResults, employeeId, currentYear, isLoading, isError]);

  return submissionCheck;
}
