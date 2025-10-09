import { useQuery } from "@tanstack/react-query";
import { employees as mockEmployees } from "@/lib/employee.data";

export const useEmployee = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = process.env.NEXT_PUBLIC_TOKEN;


  const {
    data: employees,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employee"],
    queryFn: async () => {

      // If no API base URL, use mock data
      if (!baseUrl) {
        return mockEmployees;
      }

      try {
        const res = await fetch(`${baseUrl}/api/v1/employee`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });


        if (!res.ok) {
          return mockEmployees;
        }

        const result = await res.json();
        return result.data || result; // pastikan ini array
      } catch (error) {
        return mockEmployees;
      }
    },
  });


  return { employees, isLoading, isError, error, refetch };
};
