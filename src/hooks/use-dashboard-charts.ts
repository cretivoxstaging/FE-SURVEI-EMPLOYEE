"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AllSurveyResultsResponse } from "./use-survey-results";

export interface ChartData {
  category: string;
  count: number;
  percentage: number;
}

export const useDashboardCharts = () => {
  const getAllSurveyResults = useQuery({
    queryKey: ["dashboard-survey-results"],
    queryFn: async (): Promise<AllSurveyResultsResponse> => {
      const response = await apiClient.get("/api/v1/survey");
      return response.data;
    },
  });

  // Process data for Physical Work Environment chart
  const getPhysicalWorkEnvironmentData = (): ChartData[] => {
    if (!getAllSurveyResults.data?.data) return [];

    const surveyResults = getAllSurveyResults.data.data;
    const responses: string[] = [];

    // Extract physical environment ratings from survey results
    surveyResults.forEach((result) => {
      if (result.surveyResult && Array.isArray(result.surveyResult)) {
        result.surveyResult.forEach((section) => {
          if (
            section.section === "job_satisfaction" &&
            section.question &&
            section.answer
          ) {
            section.question.forEach((question, index) => {
              if (
                question.includes("Physical work environment") &&
                section.answer[index]
              ) {
                responses.push(section.answer[index]);
              }
            });
          }
        });
      }
    });

    const categories = ["Very Good", "Good", "Average", "Bad", "Very Bad"];
    const data = categories.map((category) => {
      const count = responses.filter(
        (response) => response === category
      ).length;
      const percentage =
        responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
      return { category, count, percentage };
    });

    return data;
  };

  // Process data for Salary Satisfaction chart
  const getSalarySatisfactionData = (): ChartData[] => {
    if (!getAllSurveyResults.data?.data) return [];

    const surveyResults = getAllSurveyResults.data.data;
    const responses: string[] = [];

    // Extract salary ratings from survey results
    surveyResults.forEach((result) => {
      if (result.surveyResult && Array.isArray(result.surveyResult)) {
        result.surveyResult.forEach((section) => {
          if (
            section.section === "job_satisfaction" &&
            section.question &&
            section.answer
          ) {
            section.question.forEach((question, index) => {
              if (question.includes("Salary") && section.answer[index]) {
                responses.push(section.answer[index]);
              }
            });
          }
        });
      }
    });

    const categories = ["Very Good", "Good", "Average", "Bad", "Very Bad"];
    const data = categories.map((category) => {
      const count = responses.filter(
        (response) => response === category
      ).length;
      const percentage =
        responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
      return { category, count, percentage };
    });

    return data;
  };

  // Process data for Appreciation chart (Do You Feel Appreciated At Work)
  const getAppreciationData = (): ChartData[] => {
    if (!getAllSurveyResults.data?.data) return [];

    const surveyResults = getAllSurveyResults.data.data;
    const responses: string[] = [];

    // Extract appreciation feedback from survey results
    surveyResults.forEach((result) => {
      if (result.surveyResult && Array.isArray(result.surveyResult)) {
        result.surveyResult.forEach((section) => {
          if (
            section.section === "growth" &&
            section.question &&
            section.answer
          ) {
            section.question.forEach((question, index) => {
              if (
                question.includes(
                  "Is enough effort made to solicit coworkers' opinions and feedback"
                ) &&
                section.answer[index]
              ) {
                responses.push(section.answer[index]);
              }
            });
          }
        });
      }
    });

    const categories = ["Always", "Often", "Sometimes", "Rarely", "Never"];
    const data = categories.map((category) => {
      const count = responses.filter(
        (response) => response === category
      ).length;
      const percentage =
        responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
      return { category, count, percentage };
    });

    return data;
  };

  // Get overall statistics
  const getOverallStats = () => {
    if (!getAllSurveyResults.data?.data)
      return { totalResponses: 0, completionRate: 0 };

    const totalResponses = getAllSurveyResults.data.data.length;
    // Assuming we have 20 employees total (from employee.data.ts)
    const totalEmployees = 20;
    const completionRate = Math.round((totalResponses / totalEmployees) * 100);

    return { totalResponses, completionRate };
  };

  // Get department-wise statistics
  const getDepartmentStats = () => {
    if (!getAllSurveyResults.data?.data) return {};

    const surveyResults = getAllSurveyResults.data.data;
    const departmentStats = surveyResults.reduce((acc) => {
      // Extract department from employee data (you might need to adjust this based on your API structure)
      const dept = "Unknown"; // This should be extracted from the actual employee data
      if (!acc[dept]) {
        acc[dept] = { total: 0, completed: 0 };
      }
      acc[dept].completed += 1;
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    return departmentStats;
  };

  return {
    surveyResults: getAllSurveyResults.data?.data,
    isLoading: getAllSurveyResults.isLoading,
    isError: getAllSurveyResults.isError,
    error: getAllSurveyResults.error,
    refetch: getAllSurveyResults.refetch,
    getPhysicalWorkEnvironmentData,
    getSalarySatisfactionData,
    getAppreciationData,
    getOverallStats,
    getDepartmentStats,
  };
};
