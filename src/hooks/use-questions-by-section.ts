import { useQuery } from "@tanstack/react-query";
import type { ConfigQuestion, ApiQuestion } from "@/types/survey";
import { apiClient } from "@/lib/api-client";

const mapApiTypeToConfig = (type?: string): ConfigQuestion["type"] => {
  switch (type) {
    case "multiple-choice":
    case "option":
      return "multiple-choice";
    case "rating":
      return "rating";
    case "textarea":
      return "textarea";
    case "text":
      return "textarea"; // Map old "text" to "textarea" for consistency
    default:
      return "multiple-choice"; // Default fallback
  }
};

export const useQuestionsBySection = (sectionId: string) => {
  return useQuery<ConfigQuestion[]>({
    queryKey: ["questions", "section", sectionId],
    queryFn: async () => {
      console.log("🔍 Fetching questions for section ID:", sectionId);

      // Since we removed the section-specific endpoint, we'll get all questions and filter
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

      // Filter questions by section ID
      const questions: ApiQuestion[] = questionsData.filter(
        (q: ApiQuestion) => {
          const matchesId = String(q.sectionId) === String(sectionId);
          console.log(
            `🔍 Filtering question by section ID: "${q.sectionId}" === "${sectionId}" = ${matchesId}`
          );
          return matchesId;
        }
      );

      console.log("✅ Fetched and filtered questions by section:", questions);

      return questions.map(
        (question): ConfigQuestion => ({
          id: String(question.id ?? question.uuid ?? Date.now()),
          text: question.text ?? question.question ?? "",
          type: mapApiTypeToConfig(question.type),
          options: (() => {
            // Handle different option formats from API - check both 'option' and 'options' fields
            if (Array.isArray(question.option)) {
              return question.option;
            }
            if (Array.isArray(question.options)) {
              return question.options;
            }
            if (typeof question.option === "string") {
              try {
                return Object.values(JSON.parse(question.option));
              } catch (e) {
                console.error(
                  "Failed to parse option JSON:",
                  question.option,
                  e
                );
                return undefined;
              }
            }
            if (question.option && typeof question.option === "object") {
              return Object.values(question.option as Record<string, string>);
            }
            if (question.options && typeof question.options === "object") {
              return Object.values(question.options);
            }
            // For rating type, ensure we have the 1-5 scale even if not in options
            if (question.type === "rating") {
              return ["1", "2", "3", "4", "5"];
            }
            return undefined;
          })(),
          required: question.required === true || question.required === 1,
          sectionTitle: question.sectionTitle,
        })
      );
    },
    enabled: !!sectionId,
  });
};
