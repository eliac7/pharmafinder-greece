"use client";

import { useQuery } from "@tanstack/react-query";
import useLocalStorage from "./useLocalStorage";
import { fetchStatistics } from "@/actions/fetch-statistics";

interface IPharmacyStatsData {
  data: {
    title?: string;
    total: number;
  };
  timestamp: number;
}

export const usePharmaciesStats = (
  endpoint: string,
  freshnessDuration = 86400000,
) => {
  const localStorageKey = `pharmaciesStats-${endpoint}`;
  const [localData, setLocalData] = useLocalStorage<IPharmacyStatsData | null>(
    localStorageKey,
    null,
  );

  const isPastMidnight = () => {
    if (!localData || !localData.timestamp) return false;
    const lastFetchDate = new Date(localData.timestamp);
    const currentDate = new Date();
    lastFetchDate.setHours(24, 0, 0, 0);
    return currentDate >= lastFetchDate;
  };

  const isDataFresh = () => {
    if (!localData || !localData.timestamp) return false;
    const currentTime = Date.now();
    return (
      currentTime - localData.timestamp < freshnessDuration && !isPastMidnight()
    );
  };
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      if (isDataFresh() && localData) {
        return localData.data;
      } else {
        const data = await fetchStatistics(endpoint);
        setLocalData({ data, timestamp: Date.now() });
        return data;
      }
    },
    staleTime: Infinity,
  });
};
