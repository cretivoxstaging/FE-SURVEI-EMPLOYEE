import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConfigQuestion, ApiQuestion } from "@/types/survey";
import { apiClient } from "@/lib/api-client";

// ✅ Helper untuk memastikan selalu ada value di field `option`
const serializeOption = (q: ConfigQuestion) => {
  // Jika sudah ada options
  if (q.options) {
    if (typeof q.options === "string") {
      try {
        JSON.parse(q.options);
        return q.options; // sudah valid JSON string
      } catch {
        return JSON.stringify(q.options);
      }
    }

    if (Array.isArray(q.options)) {
      const obj = Object.fromEntries(
        q.options.map((o, i) => [String(i), String(o)])
      );
      return JSON.stringify(obj);
    }

    if (typeof q.options === "object") {
      return JSON.stringify(q.options);
    }
  }

  // Jika tipe rating → buat range
  if (q.type === "rating") {
    const min = typeof q.scaleMin === "number" ? q.scaleMin : 1;
    const max = typeof q.scaleMax === "number" ? q.scaleMax : 5;
    const obj: Record<string, string> = {};
    for (let i = min; i <= max; i++) obj[String(i)] = String(i);
    return JSON.stringify(obj);
  }

  // Default → object kosong
  return JSON.stringify({});
};

// Hook to get all questions without filtering
export const useQuestions = (
  sectionId: string = "",
  sectionTitle?: string,
  options?: { enabled?: boolean }
) => {
  const queryClient = useQueryClient();

  // ✅ GET All Questions (or filtered by sectionId if provided)
  const {
    data: questions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ConfigQuestion[]>({
    queryKey: ["questions", sectionId || "all", sectionTitle],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/question");

      let questionsData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        questionsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        questionsData = response.data;
      } else {
        throw new Error(
          `Unexpected API response: ${JSON.stringify(response.data)}`
        );
      }

      const list: ApiQuestion[] = questionsData;

      console.log("🔍 Questions API Response:", {
        sectionId,
        sectionTitle,
        allQuestions: list,
        questionsCount: list.length,
      });

      // If sectionId is empty, return all questions
      let filteredQuestions = list;
      if (sectionId) {
        filteredQuestions = list.filter((q: ApiQuestion) => {
          const matchesTitle = sectionTitle && q.sectionTitle === sectionTitle;
          const matchesId = String(q.sectionId) === String(sectionId);
          console.log("🔍 Question filter check:", {
            questionId: q.id,
            questionText: q.text || q.question,
            questionSectionId: q.sectionId,
            questionSectionTitle: q.sectionTitle,
            targetSectionId: sectionId,
            targetSectionTitle: sectionTitle,
            matchesTitle,
            matchesId,
            willInclude: matchesTitle || matchesId,
          });
          return matchesTitle || matchesId;
        });
      }

      console.log("🔍 Filtered Questions:", {
        sectionId,
        filteredCount: filteredQuestions.length,
        filteredQuestions,
      });

      return filteredQuestions.map((q): ConfigQuestion => {
        // Map API types to frontend types
        let mappedType: ConfigQuestion["type"] = "textarea"; // default
        if (q.type === "multiple-choice") {
          mappedType = "multiple-choice";
        } else if (q.type === "textarea") {
          mappedType = "textarea";
        } else if (q.type === "rating") {
          mappedType = "rating";
        }

        // Handle options mapping
        let options: string[] | undefined;
        if (q.option && typeof q.option === "object") {
          // Handle object format: {"A": "satu", "B": "dua"}
          options = Object.values(q.option);
        } else if (Array.isArray(q.option)) {
          options = q.option;
        } else if (typeof q.option === "string") {
          try {
            const parsed = JSON.parse(q.option);
            if (typeof parsed === "object") {
              options = Object.values(parsed);
            } else {
              options = [q.option];
            }
          } catch {
            options = [q.option];
          }
        } else if (q.options && typeof q.options === "object") {
          options = Object.values(q.options);
        } else if (q.type === "rating") {
          options = ["1", "2", "3", "4", "5"];
        }

        console.log("🔍 Question mapping:", {
          originalType: q.type,
          mappedType,
          originalOption: q.option,
          mappedOptions: options,
        });

        return {
          id: String(q.id ?? q.uuid ?? Date.now()),
          text: q.text ?? q.question ?? "",
          type: mappedType,
          options,
          required: q.required === true || q.required === 1,
          scaleMin: q.scaleMin,
          scaleMax: q.scaleMax,
        };
      });
    },
    enabled: options?.enabled !== false,
  });

  // ✅ POST Question
  const addQuestion = useMutation({
    mutationFn: async (question: ConfigQuestion) => {
      const payload = {
        sectionID: sectionId,
        type: question.type,
        question: question.text,
        option: serializeOption(question),
        required: question.required,
        scaleMin: question.scaleMin,
        scaleMax: question.scaleMax,
      };

      const response = await apiClient.post("/api/v1/question", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions", sectionId || "all", sectionTitle],
      });
    },
  });

  // ✅ PUT Question
  const updateQuestion = useMutation({
    mutationFn: async (question: ConfigQuestion & { sectionId: string }) => {
      const payload = {
        sectionID: question.sectionId,
        type: question.type,
        question: question.text,
        option: serializeOption(question),
        required: question.required,
        scaleMin: question.scaleMin,
        scaleMax: question.scaleMax,
      };

      const response = await apiClient.put(
        `/api/v1/question/${question.id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions", sectionId || "all", sectionTitle],
      });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  // ✅ DELETE Question
  const deleteQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await apiClient.delete(`/api/v1/question/${questionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({
        queryKey: ["questions", sectionId || "all", sectionTitle],
      });
    },
  });

  return {
    questions,
    isLoading,
    isError,
    error,
    refetch,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  };
};

// Hook to get questions for a specific section (legacy support)
export const useQuestion = (
  sectionId: string,
  sectionTitle?: string,
  options?: { enabled?: boolean }
) => {
  // Use the useQuestions hook with the sectionId parameter
  return useQuestions(sectionId, sectionTitle, options);
};
