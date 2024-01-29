import { useQuery } from "@tanstack/react-query";

export const usePharmaciesStats = (endpoint: string) => {
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await fetch(`/api/statistics/${endpoint}`);
      return await response.json();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
