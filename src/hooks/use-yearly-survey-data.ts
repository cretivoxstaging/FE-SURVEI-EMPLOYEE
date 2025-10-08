"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface Employee {
  id: string | number;
  name: string;
  hasSurvey: boolean;
  surveyResult?: {
    id: number;
    createdAt: string;
  } | null;
}

interface YearlySurveyData {
  year: string;
  totalSubmissions: number;
  totalEmployees: number;
  completionRate: number;
  months: {
    month: string;
    submissions: number;
  }[];
}

export function useYearlySurveyData(employees: Employee[]) {
  // Fetch all survey results
  const {
    data: surveyResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["yearly-survey-results"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/survey-result");
      return response.data;
    },
    enabled: employees.length > 0,
  });

  // Process data to get yearly statistics
  const yearlyData = useMemo(() => {
    if (!surveyResults?.data || !Array.isArray(surveyResults.data)) {
      return [];
    }

    const surveyData = surveyResults.data;
    const yearMap = new Map<
      string,
      {
        submissions: Set<string>;
        employees: Set<string>;
        monthlyData: Map<string, number>;
      }
    >();

    // Process each survey result
    surveyData.forEach((survey: any) => {
      if (!survey.createdAt) return;

      try {
        // Parse DD/MM/YYYY - HH:MM format
        const dateMatch = survey.createdAt.match(
          /(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2})/
        );
        if (!dateMatch) return;

        const [, day, month, year] = dateMatch;
        const yearKey = year;
        const monthKey = month;

        // Initialize year data if not exists
        if (!yearMap.has(yearKey)) {
          yearMap.set(yearKey, {
            submissions: new Set(),
            employees: new Set(),
            monthlyData: new Map(),
          });
        }

        const yearData = yearMap.get(yearKey)!;

        // Add submission (use survey ID as unique identifier)
        yearData.submissions.add(String(survey.id));

        // Add employee
        yearData.employees.add(String(survey.employeeID));

        // Count monthly submissions
        const currentMonthCount = yearData.monthlyData.get(monthKey) || 0;
        yearData.monthlyData.set(monthKey, currentMonthCount + 1);
      } catch (error) {
        console.warn("Error processing survey date:", survey.createdAt, error);
      }
    });

    // Convert to array format
    const result: YearlySurveyData[] = Array.from(yearMap.entries())
      .map(([year, data]) => {
        const totalSubmissions = data.submissions.size;
        const totalEmployees = employees.length;
        const completionRate =
          totalEmployees > 0
            ? Math.round((totalSubmissions / totalEmployees) * 100)
            : 0;

        // Convert monthly data to array
        const months = Array.from(data.monthlyData.entries())
          .map(([month, submissions]) => ({
            month,
            submissions,
          }))
          .sort((a, b) => parseInt(a.month) - parseInt(b.month));

        return {
          year,
          totalSubmissions,
          totalEmployees,
          completionRate,
          months,
        };
      })
      .sort((a, b) => b.year.localeCompare(a.year)); // Sort by year descending

    console.log("📊 Yearly Survey Data Processed:", result);
    return result;
  }, [surveyResults, employees]);

  // Get current year data
  const currentYear = new Date().getFullYear().toString();
  const currentYearData = yearlyData.find((d) => d.year === currentYear);

  // Get previous year data
  const previousYear = (new Date().getFullYear() - 1).toString();
  const previousYearData = yearlyData.find((d) => d.year === previousYear);

  // Calculate growth metrics
  const growthMetrics = useMemo(() => {
    if (!currentYearData || !previousYearData) {
      return null;
    }

    const submissionGrowth =
      previousYearData.totalSubmissions > 0
        ? Math.round(
            ((currentYearData.totalSubmissions -
              previousYearData.totalSubmissions) /
              previousYearData.totalSubmissions) *
              100
          )
        : 0;

    const completionRateGrowth =
      previousYearData.completionRate > 0
        ? Math.round(
            ((currentYearData.completionRate -
              previousYearData.completionRate) /
              previousYearData.completionRate) *
              100
          )
        : 0;

    return {
      submissionGrowth,
      completionRateGrowth,
      isPositiveGrowth: submissionGrowth > 0 && completionRateGrowth > 0,
    };
  }, [currentYearData, previousYearData]);

  return {
    yearlyData,
    currentYearData,
    previousYearData,
    growthMetrics,
    isLoading,
    isError,
    totalYears: yearlyData.length,
  };
}
