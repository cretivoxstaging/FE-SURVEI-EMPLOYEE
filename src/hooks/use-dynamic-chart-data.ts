"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AllSurveyResultsResponse } from "./use-survey-results";

export interface ChartData {
  category: string;
  count: number;
  percentage: number;
}

export interface QuestionMapping {
  id: number;
  sectionTitle: string;
  question: string;
  type: string;
  option: Record<string, string>;
}

export const useDynamicChartData = () => {
  // Get all questions to understand the structure
  const getAllQuestions = useQuery({
    queryKey: ["all-questions"],
    queryFn: async (): Promise<{
      message: string;
      data: QuestionMapping[];
    }> => {
      const response = await apiClient.get("/api/v1/question");
      return response.data;
    },
  });

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

  // Find questions by sectionTitle keywords
  const findQuestionByKeyword = (keyword: string): QuestionMapping | null => {
    if (!getAllQuestions.data?.data) return null;

    return (
      getAllQuestions.data.data.find((question) =>
        question.sectionTitle?.toLowerCase().includes(keyword.toLowerCase())
      ) || null
    );
  };

  // Process data for Salary chart
  const getSalaryData = (): ChartData[] => {
    if (!getAllSurveyResults.data?.data) {
      return [];
    }

    const surveyResults = getAllSurveyResults.data.data;
    const responses: string[] = [];


    // Extract salary responses from survey results - ONLY 1 response per employee
    surveyResults.forEach((result) => {

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

            if (section.question && section.answer) {
              section.question.forEach((question, index) => {

                // Match salary question - be more flexible
                if (
                  question &&
                  (question.toLowerCase().includes("salary") ||
                    question.toLowerCase().includes("compensation") ||
                    question.toLowerCase().includes("pay") ||
                    question.toLowerCase().includes("wage"))
                ) {
                  const answer = section.answer[index];

                  // Map numeric answer to text if needed
                  const optionMapping = {
                    "0": "Very Bad",
                    "1": "Bad",
                    "2": "Average",
                    "3": "Good",
                    "4": "Very Good",
                  };

                  if (optionMapping[answer as keyof typeof optionMapping]) {
                    responses.push(
                      optionMapping[answer as keyof typeof optionMapping]
                    );
                  } else if (answer) {
                    responses.push(answer);
                  }

                }
              });
            }
          });
        }
      }
    });

    // Convert responses to chart data using the question's options
    // Map the options to the correct order: Very Bad, Bad, Average, Good, Very Good
    const orderedOptions = ["Very Bad", "Bad", "Average", "Good", "Very Good"];
    const data = orderedOptions.map((option) => {
      const count = responses.filter((response) => response === option).length;
      const percentage =
        responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
      return { category: option, count, percentage };
    });


    // Debug: Show how many unique employees responded
    const uniqueEmployees = new Set();
    surveyResults.forEach((result) => {
      if (
        result.surveyResult &&
        Array.isArray(result.surveyResult) &&
        result.surveyResult.length > 0
      ) {
        uniqueEmployees.add(result.employeeID);
      }
    });

    return data;
  };

  // Process data for Physical Work Environment chart
  const getPhysicalWorkEnvironmentData = (): ChartData[] => {
    const environmentQuestion = findQuestionByKeyword(
      "physical work environment"
    );
    if (!environmentQuestion || !getAllSurveyResults.data?.data) return [];

    const surveyResults = getAllSurveyResults.data.data;
    const responses: string[] = [];

    // Extract environment responses from survey results - ONLY 1 response per employee
    surveyResults.forEach((result) => {
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
            // Only process job_satisfaction section for physical environment
            if (
              section.section === "job_satisfaction" &&
              section.question &&
              section.answer
            ) {
              section.question.forEach((question, index) => {
                // Match physical work environment question specifically
                if (
                  question &&
                  (question
                    .toLowerCase()
                    .includes("physical work environment") ||
                    question.toLowerCase().includes("physical environment"))
                ) {
                  const answer = section.answer[index];

                  // Map numeric answer to text if needed
                  const optionMapping = {
                    "0": "Very Bad",
                    "1": "Bad",
                    "2": "Average",
                    "3": "Good",
                    "4": "Very Good",
                  };

                  if (optionMapping[answer as keyof typeof optionMapping]) {
                    responses.push(
                      optionMapping[answer as keyof typeof optionMapping]
                    );
                  } else if (answer) {
                    responses.push(answer);
                  }

                }
              });
            }
          });
        }
      }
    });

    // Convert responses to chart data using the question's options
    // Map the options to the correct order: Very Bad, Bad, Average, Good, Very Good
    const orderedOptions = ["Very Bad", "Bad", "Average", "Good", "Very Good"];
    const data = orderedOptions.map((option) => {
      const count = responses.filter((response) => response === option).length;
      const percentage =
        responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
      return { category: option, count, percentage };
    });


    // Debug: Show how many unique employees responded
    const uniqueEmployees = new Set();
    surveyResults.forEach((result) => {
      if (
        result.surveyResult &&
        Array.isArray(result.surveyResult) &&
        result.surveyResult.length > 0
      ) {
        uniqueEmployees.add(result.employeeID);
      }
    });

    return data;
  };

  // Process data for Appreciation chart
  const getAppreciationData = (): ChartData[] => {
    const appreciationQuestion = findQuestionByKeyword("appreciated");
    if (!appreciationQuestion || !getAllSurveyResults.data?.data) return [];

    const surveyResults = getAllSurveyResults.data.data;
    const responses: string[] = [];

    // Extract appreciation responses from survey results - ONLY 1 response per employee
    surveyResults.forEach((result) => {
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
            // Only process growth section for appreciation
            if (
              section.section === "growth" &&
              section.question &&
              section.answer
            ) {
              section.question.forEach((question, index) => {
                // Match appreciation question specifically: "Do you feel appreciated at work?"
                if (
                  question &&
                  (question
                    .toLowerCase()
                    .includes("do you feel appreciated at work") ||
                    question
                      .toLowerCase()
                      .includes("feel appreciated at work") ||
                    question.toLowerCase().includes("appreciated at work"))
                ) {
                  const answer = section.answer[index];

                  // Map numeric answer to text if needed
                  const optionMapping = {
                    "0": "Yes",
                    "1": "No",
                  };

                  if (optionMapping[answer as keyof typeof optionMapping]) {
                    responses.push(
                      optionMapping[answer as keyof typeof optionMapping]
                    );
                  } else if (answer) {
                    responses.push(answer);
                  }

                }
              });
            }
          });
        }
      }
    });

    // Convert responses to chart data using the question's options
    // For appreciation, we only have Yes/No options
    const orderedOptions = ["Yes", "No"];
    const data = orderedOptions.map((option) => {
      const count = responses.filter((response) => response === option).length;
      const percentage =
        responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
      return { category: option, count, percentage };
    });


    // Debug: Show how many unique employees responded
    const uniqueEmployees = new Set();
    surveyResults.forEach((result) => {
      if (
        result.surveyResult &&
        Array.isArray(result.surveyResult) &&
        result.surveyResult.length > 0
      ) {
        uniqueEmployees.add(result.employeeID);
      }
    });

    return data;
  };

  // Get overall statistics
  const getOverallStats = () => {
    if (!getAllSurveyResults.data?.data)
      return { totalResponses: 0, completionRate: 0 };

    // Count unique employees who submitted surveys
    const uniqueEmployees = new Set();
    getAllSurveyResults.data.data.forEach((result) => {
      if (result.employeeID) {
        uniqueEmployees.add(result.employeeID);
      }
    });

    const totalResponses = uniqueEmployees.size;
    const totalEmployees = 20; // Assuming 20 employees total
    const completionRate = Math.round((totalResponses / totalEmployees) * 100);

    return { totalResponses, completionRate };
  };

  // Debug info about found questions
  const getDebugInfo = () => {
    if (!getAllQuestions.data?.data) return null;

    const salaryQuestion = findQuestionByKeyword("salary");
    const environmentQuestion = findQuestionByKeyword(
      "physical work environment"
    );
    const appreciationQuestion = findQuestionByKeyword("appreciated");

    return {
      salaryQuestion: salaryQuestion
        ? {
            id: salaryQuestion.id,
            sectionTitle: salaryQuestion.sectionTitle,
            question: salaryQuestion.question,
            options: Object.values(salaryQuestion.option),
          }
        : null,
      environmentQuestion: environmentQuestion
        ? {
            id: environmentQuestion.id,
            sectionTitle: environmentQuestion.sectionTitle,
            question: environmentQuestion.question,
            options: Object.values(environmentQuestion.option),
          }
        : null,
      appreciationQuestion: appreciationQuestion
        ? {
            id: appreciationQuestion.id,
            sectionTitle: appreciationQuestion.sectionTitle,
            question: appreciationQuestion.question,
            options: Object.values(appreciationQuestion.option),
          }
        : null,
    };
  };

  return {
    // Data
    surveyResults: getAllSurveyResults.data?.data,
    questions: getAllQuestions.data?.data,

    // Loading states
    isLoading: getAllQuestions.isLoading || getAllSurveyResults.isLoading,
    isError: getAllQuestions.isError || getAllSurveyResults.isError,
    error: getAllQuestions.error || getAllSurveyResults.error,

    // Chart data functions
    getSalaryData,
    getPhysicalWorkEnvironmentData,
    getAppreciationData,
    getOverallStats,

    // Debug info
    getDebugInfo,

    // Refetch functions
    refetch: () => {
      getAllQuestions.refetch();
      getAllSurveyResults.refetch();
    },
  };
};
