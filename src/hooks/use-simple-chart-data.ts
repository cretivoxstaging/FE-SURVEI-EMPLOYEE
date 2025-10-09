import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface ChartData {
  category: string;
  count: number;
  percentage: number;
}

interface SurveyResult {
  id: number;
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
}

interface AllSurveyResultsResponse {
  data: SurveyResult[];
}

export function useSimpleChartData(selectedYear?: string) {
  // Get survey results
  const getAllSurveyResults = useQuery({
    queryKey: ["all-survey-results"],
    queryFn: async (): Promise<AllSurveyResultsResponse> => {
      try {
        const response = await apiClient.get("/api/v1/survey");

        // Debug: Show sample survey data structure
        if (response.data?.data && response.data.data.length > 0) {
        }

        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });

  // Helper function to filter data by year
  const filterDataByYear = (data: SurveyResult[]) => {
    if (!selectedYear) return data;

    return data
      .map((result) => ({
        ...result,
        surveyResult: result.surveyResult.filter((submission) => {
          const submissionYear = new Date(submission.date.split(" - ")[0])
            .getFullYear()
            .toString();
          return submissionYear === selectedYear;
        }),
      }))
      .filter((result) => result.surveyResult.length > 0);
  };

  // Process data for Salary chart
  const getSalaryData = (): ChartData[] => {
    if (!getAllSurveyResults.data?.data) {
      return [];
    }

    const allSurveyResults = getAllSurveyResults.data.data;
    const filteredResults = filterDataByYear(allSurveyResults);
    const responses: string[] = [];


    // Extract salary responses from survey results
    filteredResults.forEach((result) => {

      if (
        result.surveyResult &&
        Array.isArray(result.surveyResult) &&
        result.surveyResult.length > 0
      ) {
        // Get only the LATEST submission for this employee
        const latestSubmission =
          result.surveyResult[result.surveyResult.length - 1];

        if (
          latestSubmission.dataResult &&
          Array.isArray(latestSubmission.dataResult)
        ) {
          latestSubmission.dataResult.forEach((section) => {

            // Match salary section specifically
            if (
              section.section === "Salary" &&
              section.answer &&
              section.answer.length > 0
            ) {
              const answer = section.answer[0]; // First answer

              // Map answer to standard format
              const answerMapping: { [key: string]: string } = {
                "Very Disappointed": "Very Bad",
                Disappointed: "Bad",
                Neutral: "Average",
                Satisfied: "Good",
                "Very Satisfied": "Very Good",
                "Very Bad": "Very Bad",
                Bad: "Bad",
                Average: "Average",
                Good: "Good",
                "Very Good": "Very Good",
              };

              const mappedAnswer = answerMapping[answer] || answer;
              responses.push(mappedAnswer);

            }
          });
        }
      }
    });

    // Convert responses to chart data
    const orderedOptions = ["Very Bad", "Bad", "Average", "Good", "Very Good"];
    const data = orderedOptions.map((option) => {
      const count = responses.filter((response) => response === option).length;
      const percentage =
        responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
      return { category: option, count, percentage };
    });


    return data;
  };

  // Process data for Physical Work Environment chart
  const getPhysicalWorkEnvironmentData = (): ChartData[] => {
    if (!getAllSurveyResults.data?.data) {
      return [];
    }

    const allSurveyResults = getAllSurveyResults.data.data;
    const filteredResults = filterDataByYear(allSurveyResults);
    const responses: string[] = [];


    // Extract physical work environment responses from survey results
    filteredResults.forEach((result) => {

      if (
        result.surveyResult &&
        Array.isArray(result.surveyResult) &&
        result.surveyResult.length > 0
      ) {
        // Get only the LATEST submission for this employee
        const latestSubmission =
          result.surveyResult[result.surveyResult.length - 1];

        if (
          latestSubmission.dataResult &&
          Array.isArray(latestSubmission.dataResult)
        ) {
          latestSubmission.dataResult.forEach((section) => {

            // Match physical work environment section specifically
            if (
              section.section === "Physical work environment" &&
              section.answer &&
              section.answer.length > 0
            ) {
              const answer = section.answer[0]; // First answer

              // Map answer to standard format
              const answerMapping: { [key: string]: string } = {
                "Very Disappointed": "Very Bad",
                Disappointed: "Bad",
                Neutral: "Average",
                Satisfied: "Good",
                "Very Satisfied": "Very Good",
                "Very Bad": "Very Bad",
                Bad: "Bad",
                Average: "Average",
                Good: "Good",
                "Very Good": "Very Good",
              };

              const mappedAnswer = answerMapping[answer] || answer;
              responses.push(mappedAnswer);

            }
          });
        }
      }
    });

    // Convert responses to chart data
    const orderedOptions = ["Very Bad", "Bad", "Average", "Good", "Very Good"];
    const data = orderedOptions.map((option) => {
      const count = responses.filter((response) => response === option).length;
      const percentage =
        responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
      return { category: option, count, percentage };
    });


    return data;
  };

  // Process data for Appreciation chart
  const getAppreciationData = (): ChartData[] => {
    if (!getAllSurveyResults.data?.data) {
      return [];
    }

    const allSurveyResults = getAllSurveyResults.data.data;
    const filteredResults = filterDataByYear(allSurveyResults);
    const responses: string[] = [];


    // Extract appreciation responses from survey results
    filteredResults.forEach((result) => {

      if (
        result.surveyResult &&
        Array.isArray(result.surveyResult) &&
        result.surveyResult.length > 0
      ) {
        // Get only the LATEST submission for this employee
        const latestSubmission =
          result.surveyResult[result.surveyResult.length - 1];

        if (
          latestSubmission.dataResult &&
          Array.isArray(latestSubmission.dataResult)
        ) {
          latestSubmission.dataResult.forEach((section) => {

            // Match appreciation section specifically
            if (
              section.section === "Appreciated at Work" &&
              section.answer &&
              section.answer.length > 0
            ) {
              const answer = section.answer[0]; // First answer

              // Map answer to standard format
              const answerMapping: { [key: string]: string } = {
                Yes: "Yes",
                No: "No",
                true: "Yes",
                false: "No",
                "1": "Yes",
                "0": "No",
              };

              const mappedAnswer = answerMapping[answer] || answer;
              responses.push(mappedAnswer);

            }
          });
        }
      }
    });

    // Convert responses to chart data
    const orderedOptions = ["Yes", "No"];
    const data = orderedOptions.map((option) => {
      const count = responses.filter((response) => response === option).length;
      const percentage =
        responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
      return { category: option, count, percentage };
    });


    return data;
  };

  // Get available years from survey data
  const getAvailableYears = (): string[] => {
    if (!getAllSurveyResults.data?.data) return [];

    const years = new Set<string>();
    getAllSurveyResults.data.data.forEach((result) => {
      result.surveyResult.forEach((submission) => {
        const year = new Date(submission.date.split(" - ")[0])
          .getFullYear()
          .toString();
        years.add(year);
      });
    });

    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)
  };

  return {
    isLoading: getAllSurveyResults.isLoading,
    isError: getAllSurveyResults.isError,
    getSalaryData,
    getPhysicalWorkEnvironmentData,
    getAppreciationData,
    getAvailableYears,
  };
}
