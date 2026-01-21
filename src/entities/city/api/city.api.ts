import { fetchAPI } from "@/shared/api/base";
import type { CityDetail, CitySummary } from "../model/types";

export const cityApi = {
  /**
   * Get All Cities (Cached 24h)
   */
  getCities: async () => {
    return fetchAPI<CitySummary[]>("/locations/cities", {
      next: { 
        revalidate: 86400, // 24 hours
        tags: ["cities"]
      }, 
    });
  },

  /**
   * Get City by Slug
   */
  getCityBySlug: async (slug: string) => {
    return fetchAPI<{ data: CityDetail }>(`/locations/cities/${slug}`, {
      next: { 
        revalidate: 604800, // 7 days
        tags: [`city-${slug}`] 
      }, 
    });
  },
};
