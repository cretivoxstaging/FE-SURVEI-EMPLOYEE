"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { SurveyApiResponse, SurveyEmployeeData } from "@/types/survey";

export interface SubmissionCheckResult {
  hasSubmittedThisYear: boolean;
  submissionData: {
    createdAt: string;
    year: string;
  } | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

export const useSubmissionCheck = (
  employeeId: string | number
): SubmissionCheckResult => {
  const currentYear = new Date().getFullYear().toString();

  const {
    data: surveyData,
    isLoading,
    isError,
    error,
  } = useQuery<SurveyApiResponse>({
    queryKey: ["submission-check", employeeId],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/survey");
      return response.data;
    },
    enabled: !!employeeId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  // Find employee data
  const employeeData = surveyData?.data?.find(
    (employee: SurveyEmployeeData) =>
      String(employee.employeeID) === String(employeeId)
  );

  console.log("🔍 Submission Check Debug:", {
    employeeId,
    currentYear,
    employeeFound: !!employeeData,
    employeeData: employeeData
      ? {
          id: employeeData.id,
          employeeID: employeeData.employeeID,
          name: employeeData.name,
          surveyResultCount: employeeData.surveyResult?.length || 0,
          surveyResults: employeeData.surveyResult?.map((result: any) => ({
            date: result.date,
            hasDataResult: !!result.dataResult,
            hasConclutionResult: !!result.conclutionResult,
          })),
        }
      : null,
  });

  if (
    !employeeData ||
    !employeeData.surveyResult ||
    employeeData.surveyResult.length === 0
  ) {
    return {
      hasSubmittedThisYear: false,
      submissionData: null,
      isLoading,
      isError,
      error,
    };
  }

  // Check if there's a submission for current year
  const currentYearSubmission = employeeData.surveyResult.find(
    (result: any) => {
      if (!result.date) return false;

      // Extract year from date string (format: DD/MM/YYYY - HH:MM)
      const dateMatch = result.date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (dateMatch) {
        const year = dateMatch[3];
        return year === currentYear;
      }

      return false;
    }
  );

  console.log("🔍 Current Year Submission Check:", {
    currentYear,
    currentYearSubmission,
    found: !!currentYearSubmission,
  });

  if (currentYearSubmission) {
    return {
      hasSubmittedThisYear: true,
      submissionData: {
        createdAt: currentYearSubmission.date,
        year: currentYear,
      },
      isLoading,
      isError,
      error,
    };
  }

  return {
    hasSubmittedThisYear: false,
    submissionData: null,
    isLoading,
    isError,
    error,
  };
};

