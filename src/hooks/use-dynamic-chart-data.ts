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
      const response = await apiClient.get("/api/v1/survey");
      return response.data;
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
    const salaryQuestion = findQuestionByKeyword("salary");
    if (!salaryQuestion || !getAllSurveyResults.data?.data) return [];

    const surveyResults = getAllSurveyResults.data.data;
    const responses: string[] = [];

    // Extract salary responses from survey results
    surveyResults.forEach((result) => {
      if (result.surveyResult && Array.isArray(result.surveyResult)) {
        // Process each survey submission
        result.surveyResult.forEach((submission) => {
          if (submission.dataResult && Array.isArray(submission.dataResult)) {
            submission.dataResult.forEach((section) => {
              if (section.question && section.answer) {
                section.question.forEach((question, index) => {
                  // Match by question text or section title
                  if (
                    question &&
                    (question.includes(salaryQuestion.question) ||
                      question.toLowerCase().includes("salary") ||
                      section.section?.toLowerCase().includes("salary"))
                  ) {
                    // Map the answer to the correct option text
                    const answer = section.answer[index];
                    const optionMapping = {
                      "0": "Very Bad",
                      "1": "Bad",
                      "2": "Average",
                      "3": "Good",
                      "4": "Very Good",
                    };

                    // If answer is a number (0-4), map it to text
                    if (optionMapping[answer as keyof typeof optionMapping]) {
                      const mappedAnswer =
                        optionMapping[answer as keyof typeof optionMapping];
                      console.log(
                        `🔍 Salary: Mapping answer "${answer}" to "${mappedAnswer}"`
                      );
                      responses.push(mappedAnswer);
                    } else {
                      // If answer is already text, use it directly
                      console.log(
                        `🔍 Salary: Using answer directly: "${answer}"`
                      );
                      responses.push(answer);
                    }

                    console.log(
                      `🔍 Salary: Question: "${question}", Answer: "${answer}", Section: "${section.section}"`
                    );
                  }
                });
              }
            });
          }
        });
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

    console.log("🔍 Salary Chart Data:", data);
    console.log("🔍 Salary Responses:", responses);
    console.log("🔍 Salary Question Found:", salaryQuestion);
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

    // Extract environment responses from survey results
    surveyResults.forEach((result) => {
      if (result.surveyResult && Array.isArray(result.surveyResult)) {
        // Process each survey submission
        result.surveyResult.forEach((submission) => {
          if (submission.dataResult && Array.isArray(submission.dataResult)) {
            submission.dataResult.forEach((section) => {
              if (section.question && section.answer) {
                section.question.forEach((question, index) => {
                  // Match by question text or section title
                  if (
                    question &&
                    (question.includes(environmentQuestion.question) ||
                      question.toLowerCase().includes("physical") ||
                      question.toLowerCase().includes("environment") ||
                      section.section?.toLowerCase().includes("physical") ||
                      section.section?.toLowerCase().includes("environment"))
                  ) {
                    // Map the answer to the correct option text
                    const answer = section.answer[index];
                    const optionMapping = {
                      "0": "Very Bad",
                      "1": "Bad",
                      "2": "Average",
                      "3": "Good",
                      "4": "Very Good",
                    };

                    // If answer is a number (0-4), map it to text
                    if (optionMapping[answer as keyof typeof optionMapping]) {
                      responses.push(
                        optionMapping[answer as keyof typeof optionMapping]
                      );
                    } else {
                      // If answer is already text, use it directly
                      responses.push(answer);
                    }
                  }
                });
              }
            });
          }
        });
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

    return data;
  };

  // Process data for Appreciation chart
  const getAppreciationData = (): ChartData[] => {
    const appreciationQuestion = findQuestionByKeyword("appreciated");
    if (!appreciationQuestion || !getAllSurveyResults.data?.data) return [];

    const surveyResults = getAllSurveyResults.data.data;
    const responses: string[] = [];

    // Extract appreciation responses from survey results
    surveyResults.forEach((result) => {
      if (result.surveyResult && Array.isArray(result.surveyResult)) {
        // Process each survey submission
        result.surveyResult.forEach((submission) => {
          if (submission.dataResult && Array.isArray(submission.dataResult)) {
            submission.dataResult.forEach((section) => {
              if (section.question && section.answer) {
                section.question.forEach((question, index) => {
                  // Match by question text or section title
                  if (
                    question &&
                    (question.includes(appreciationQuestion.question) ||
                      question.toLowerCase().includes("appreciated") ||
                      section.section?.toLowerCase().includes("appreciated"))
                  ) {
                    responses.push(section.answer[index]);
                  }
                });
              }
            });
          }
        });
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
