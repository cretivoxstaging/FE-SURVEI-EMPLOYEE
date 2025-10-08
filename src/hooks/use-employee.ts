import { useQuery } from "@tanstack/react-query";
import { employees as mockEmployees } from "@/lib/employee.data";

export const useEmployee = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = process.env.NEXT_PUBLIC_TOKEN;

  console.log("🔍 useEmployee - Environment variables:", {
    baseUrl,
    token: token ? "***" : "undefined",
  });

  const {
    data: employees,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employee"],
    queryFn: async () => {
      console.log("🔍 Fetching employees...");

      // If no API base URL, use mock data
      if (!baseUrl) {
        console.log("🔍 No API base URL, using mock data");
        return mockEmployees;
      }

      try {
        const res = await fetch(`${baseUrl}/api/v1/employee`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("🔍 Employee API response status:", res.status);

        if (!res.ok) {
          console.log("🔍 Employee API failed, using mock data");
          return mockEmployees;
        }

        const result = await res.json();
        console.log("🔍 Employee API result:", result);
        return result.data || result; // pastikan ini array
      } catch (error) {
        console.log("🔍 Employee API error, using mock data:", error);
        return mockEmployees;
      }
    },
  });

  console.log("🔍 useEmployee result:", {
    employees: employees?.length || 0,
    isLoading,
    isError,
    error: error?.message,
  });

  return { employees, isLoading, isError, error, refetch };
};
