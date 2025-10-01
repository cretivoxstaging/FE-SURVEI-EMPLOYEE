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
  surveyResult: unknown[];
  conclutionResult: string;
}

interface SurveyResultsResponse {
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
  } = useQuery<SurveyResultsResponse>({
    queryKey: ["employee-yearly-submissions", employeeId],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/survey-result");
      return response.data;
    },
    enabled: !!employeeId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  // Check if employee has submitted this year
  const submissionCheck = useMemo((): YearlySubmissionCheck => {
    console.log("🔍 Raw API Response:", {
      employeeId,
      employeeIdType: typeof employeeId,
      surveyResults,
      hasData: !!surveyResults?.data,
      isArray: Array.isArray(surveyResults?.data),
      dataLength: surveyResults?.data?.length || 0,
      currentYear,
    });

    const surveyData = surveyResults?.data;
    if (!surveyData || !Array.isArray(surveyData)) {
      console.log("❌ No valid data found");
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

    console.log("🔍 Employee Submissions Debug:", {
      employeeId,
      currentYear,
      totalSubmissions: employeeSubmissions.length,
      submissions: employeeSubmissions.map((s: SurveySubmission) => ({
        id: s.id,
        createdAt: s.createdAt,
        employeeID: s.employeeID,
        employeeIDType: typeof s.employeeID,
        name: s.name,
      })),
    });

    // Debug: Show all submissions for debugging
    console.log(
      "🔍 All Survey Submissions:",
      surveyData.map((s: SurveySubmission) => ({
        id: s.id,
        createdAt: s.createdAt,
        employeeID: s.employeeID,
        employeeIDType: typeof s.employeeID,
        name: s.name,
      }))
    );

    // Debug: Check if we found any submissions for this employee
    if (employeeSubmissions.length === 0) {
      console.log("❌ No submissions found for employee:", employeeId);
      console.log(
        "Available employee IDs:",
        surveyData.map((s: SurveySubmission) => ({
          id: s.id,
          employeeID: s.employeeID,
          employeeIDType: typeof s.employeeID,
          name: s.name,
        }))
      );

      // Check for Abdul Rohim specifically
      const abdulSubmissions = surveyData.filter(
        (s: SurveySubmission) =>
          s.name?.toLowerCase().includes("abdul") ||
          s.name?.toLowerCase().includes("rohim") ||
          s.name?.toLowerCase().includes("abdul rohim")
      );
      console.log("🔍 Abdul Rohim submissions:", abdulSubmissions);
    }

    // Check if any submission is from current year
    const currentYearSubmission = employeeSubmissions.find(
      (survey: SurveySubmission) => {
        if (!survey.createdAt) return false;

        try {
          // Parse DD/MM/YYYY - HH:MM format
          const dateMatch = survey.createdAt.match(
            /(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2})/
          );
          if (!dateMatch) return false;

          const [, , , year] = dateMatch;
          const isCurrentYear = year === currentYear;

          console.log("🔍 Year Check Debug:", {
            employeeId,
            createdAt: survey.createdAt,
            parsedYear: year,
            currentYear,
            isCurrentYear,
            surveyId: survey.id,
          });

          return isCurrentYear;
        } catch (error) {
          console.warn("Error parsing survey date:", survey.createdAt, error);
          return false;
        }
      }
    );

    const result = {
      hasSubmittedThisYear: !!currentYearSubmission,
      submissionData: currentYearSubmission
        ? {
            id: currentYearSubmission.id,
            createdAt: currentYearSubmission.createdAt,
            year: currentYear,
          }
        : null,
      isLoading,
      isError,
    };

    console.log("🔍 Final Result Debug:", {
      employeeId,
      currentYear,
      hasSubmittedThisYear: result.hasSubmittedThisYear,
      submissionData: result.submissionData,
      totalEmployeeSubmissions: employeeSubmissions.length,
      foundCurrentYearSubmission: !!currentYearSubmission,
    });

    // Debug: If no submission found, show why
    if (!result.hasSubmittedThisYear && employeeSubmissions.length > 0) {
      console.log("🔍 Why no current year submission found:", {
        employeeId,
        currentYear,
        submissions: employeeSubmissions.map((s: SurveySubmission) => ({
          id: s.id,
          createdAt: s.createdAt,
          parsedYear: s.createdAt
            ? s.createdAt.match(
                /(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2})/
              )?.[3]
            : null,
        })),
      });
    }

    return result;
  }, [surveyResults, employeeId, currentYear, isLoading, isError]);

  return submissionCheck;
}
