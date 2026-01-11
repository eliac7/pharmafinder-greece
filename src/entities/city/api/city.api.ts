import { fetchAPI } from "@/shared/api/base";
import type { City, CitySummary } from "../model/types";

export const cityApi = {
  /**
   * Get All Cities (Cached 24h)
   */
  getCities: async () => {
    return fetchAPI<CitySummary[]>("/locations/cities", {
      next: { revalidate: 86400 },
    });
  },

  /**
   * Get City by Slug
   */
  getCityBySlug: async (slug: string) => {
    return fetchAPI<{ data: City }>(`/locations/cities/${slug}`, {
      next: { revalidate: 3600 },
    });
  },
};
