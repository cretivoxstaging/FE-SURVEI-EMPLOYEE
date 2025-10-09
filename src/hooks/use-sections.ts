import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export const useSection = () => {
  const queryClient = useQueryClient();

  // Function to sort sections by saved order
  const sortSectionsByOrder = (sections: any[]) => {
    if (!sections || sections.length === 0) return sections;

    try {
      const savedOrder = localStorage.getItem("sectionOrder");
      if (savedOrder) {
        const orderMap = JSON.parse(savedOrder);
        const orderedSections = [...sections].sort((a, b) => {
          const orderA =
            orderMap.find((item: any) => item.id === a.id)?.order ?? 999;
          const orderB =
            orderMap.find((item: any) => item.id === b.id)?.order ?? 999;
          return orderA - orderB;
        });
        return orderedSections;
      }
    } catch (error) {
      console.warn("⚠️ Failed to parse saved section order:", error);
    }

    return sections;
  };

  // GET Sections
  const {
    data: rawSections,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sections"],
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

        // Don't use fallback data - throw error to see what's happening
        throw new Error(
          `Unexpected API response format: ${JSON.stringify(response.data)}`
        );
      }

      return sectionsData;
    },
  });

  // Sort sections by saved order
  const sections = sortSectionsByOrder(rawSections);

  // Debug logging for hook state

  // POST Section
  const addSection = useMutation({
    mutationFn: async (title: string) => {

      const response = await apiClient.post("/api/v1/section", { title });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (error) => {
      console.error("❌ Add section mutation failed:", error);
    },
  });

  // PUT Section
  const updateSection = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {

      const response = await apiClient.put(`/api/v1/section/${id}`, { title });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (error) => {
      console.error("❌ Update section mutation failed:", error);
    },
  });

  // DELETE Section
  const deleteSection = useMutation({
    mutationFn: async (id: string) => {

      const response = await apiClient.delete(`/api/v1/section/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      // Also invalidate questions to refresh UI
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (error) => {
      console.error("❌ Delete section mutation failed:", error);
    },
  });

  // REORDER Sections (Local only - no API call)
  const reorderSections = useMutation({
    mutationFn: async (newOrder: any[]) => {

      // Save order to localStorage
      const sectionOrder = newOrder.map((section, index) => ({
        id: section.id,
        order: index,
      }));
      localStorage.setItem("sectionOrder", JSON.stringify(sectionOrder));

      // Update the local cache with the new order
      queryClient.setQueryData(["sections"], newOrder);

      return { success: true, sections: newOrder };
    },
    onSuccess: () => {
    },
    onError: (error) => {
      console.error("❌ Local reorder failed:", error);
    },
  });

  return {
    sections,
    isLoading,
    isError,
    error,
    refetch,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
  };
};
