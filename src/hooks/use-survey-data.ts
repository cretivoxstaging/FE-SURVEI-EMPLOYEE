import { useQuery } from "@tanstack/react-query";
import type {
  ConfigSurvey,
  ConfigSection,
  ConfigQuestion,
} from "@/types/survey";
import { apiClient } from "@/lib/api-client";

type ApiQuestion = {
  id?: string | number;
  questionId?: string | number;
  uuid?: string;
  text?: string;
  question?: string;
  type?: string;
  option?: string | string[] | Record<string, string> | null;
  options?: string[] | Record<string, string> | null;
  required?: boolean | number | null;
  sectionId?: string;
  section_id?: string;
  sectionTitle?: string;
};

export const useSurveyData = () => {
  // Fetch sections
  const {
    data: sections,
    isLoading: sectionsLoading,
    isError: sectionsError,
    error: sectionsErrorObj,
  } = useQuery({
    queryKey: ["survey-sections"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/section");

      // Handle different response formats from external API
      let sectionsData = [];
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        sectionsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        sectionsData = response.data;
      } else {
        console.warn("⚠️ Unexpected API response format:", response.data);
        console.log(
          "📊 Raw API response:",
          JSON.stringify(response.data, null, 2)
        );

        // Don't use fallback data - throw error to see what's happening
        throw new Error(
          `Unexpected API response format: ${JSON.stringify(response.data)}`
        );
      }

      console.log("📊 Survey sections fetched:", sectionsData);
      return sectionsData;
    },
  });

  // Fetch all questions
  const {
    data: allQuestions,
    isLoading: questionsLoading,
    isError: questionsError,
    error: questionsErrorObj,
  } = useQuery({
    queryKey: ["survey-questions"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/question");

      // Handle different response formats from external API
      let questionsData = [];
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        questionsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        questionsData = response.data;
      } else {
        console.warn("⚠️ Unexpected API response format:", response.data);
        console.log(
          "📊 Raw API response:",
          JSON.stringify(response.data, null, 2)
        );

        // Don't use fallback data - throw error to see what's happening
        throw new Error(
          `Unexpected API response format: ${JSON.stringify(response.data)}`
        );
      }

      const list: ApiQuestion[] = questionsData;

      return list.map(
        (q: ApiQuestion): ConfigQuestion => ({
          id: String(q.id ?? q.questionId ?? q.uuid ?? Date.now()),
          text: q.text ?? q.question ?? "",
          type: (() => {
            // Map API types to our internal types
            if (
              q.type === "multiple-choice" ||
              q.type === "option" ||
              q.type === "option update"
            ) {
              return "multiple-choice";
            }
            if (q.type === "rating") {
              return "rating";
            }
            if (q.type === "textarea") {
              return "textarea";
            }
            if (q.type === "text") {
              return "textarea"; // Map old "text" to "textarea" for consistency
            }
            return "multiple-choice"; // Default fallback
          })(),
          options: (() => {
            // Handle different option formats from API - check both 'option' and 'options' fields
            if (Array.isArray(q.option)) {
              return q.option;
            }
            if (Array.isArray(q.options)) {
              return q.options;
            }
            if (typeof q.option === "string") {
              try {
                return Object.values(JSON.parse(q.option));
              } catch (e) {
                console.error("Failed to parse option JSON:", q.option, e);
                return undefined;
              }
            }
            if (q.option && typeof q.option === "object") {
              return Object.values(q.option as Record<string, string>);
            }
            if (q.options && typeof q.options === "object") {
              return Object.values(q.options as Record<string, string>);
            }
            // For rating type, ensure we have the 1-5 scale even if not in options
            if (q.type === "rating") {
              return ["1", "2", "3", "4", "5"];
            }
            return undefined;
          })(),
          required: Boolean(q.required ?? false),
          sectionTitle: q.sectionTitle,
        })
      );
    },
  });

  // Combine sections with their questions
  const surveyData: ConfigSurvey | null =
    sections && allQuestions
      ? {
          title: "Annual Survey Employee",
          description: "Please answer the following questions honestly",
          sections: sections.map((section: ConfigSection) => ({
            ...section,
            questions: allQuestions.filter(
              (q) => q.sectionTitle === section.title
            ),
          })),
        }
      : null;

  return {
    surveyData,
    isLoading: sectionsLoading || questionsLoading,
    isError: sectionsError || questionsError,
    error: sectionsErrorObj || questionsErrorObj,
  };
};
