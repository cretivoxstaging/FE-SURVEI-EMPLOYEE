import { useQuery } from "@tanstack/react-query";
import type { ConfigQuestion, ApiQuestion } from "@/types/survey";

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

export const useQuestionById = (questionId: string) => {
  return useQuery<ConfigQuestion>({
    queryKey: ["question", questionId],
    queryFn: async () => {
      console.log("🔍 Fetching question by ID:", questionId);

      const res = await fetch(`/api/v1/question/${questionId}`);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Failed to fetch question by ID:", errorData);
        throw new Error("Failed to fetch question");
      }

      const result = await res.json();
      console.log("✅ Fetched question by ID:", result);

      const question: ApiQuestion = result.data || result;

      return {
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
              console.error("Failed to parse option JSON:", question.option, e);
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
      } as ConfigQuestion;
    },
    enabled: !!questionId,
  });
};
