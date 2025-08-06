import { useQuery } from "@tanstack/react-query";

export const useEmployee = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = "$2a$12$JSyMjCxUTNmGBlAQOQQeaOFrOdtdUmn.U/17DlvOK1t.Ot0BTRGli";

  const {
    data: employees,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employee"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}api/v1/employee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch employees");
      const result = await res.json();
      return result.data; // pastikan ini array
    },
  });

  return { employees, isLoading, isError, error, refetch };
};
