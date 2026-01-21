import { fetchAPI } from "@/shared/api/base";
import type { Statistics } from "../model/types";

export const statisticsApi = {
  /**
   * Get aggregated statistics (cached 1 hour)
   */
  getStatistics: async () => {
    return fetchAPI<Statistics>("/statistics", {
      next: { 
        revalidate: 3600,
        tags: ["statistics"]
      },
    });
  },
};
