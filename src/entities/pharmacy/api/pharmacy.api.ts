import { fetchAPI } from "@/shared/api/base";
import type { Pharmacy } from "../model/types";

/**
 * Server-rendering compatibility lane only. Browser interactive flows use
 * the bounded v1 product-action client instead.
 */
export const pharmacyApi = {
  getCityPharmacies: async (
    citySlug: string,
    time: "now" | "today" | "tomorrow" = "now",
    lat?: number,
    lng?: number,
  ): Promise<Pharmacy[]> => {
    let url = `/city?city_slug=${encodeURIComponent(citySlug)}&time=${time}`;
    if (lat !== undefined && lng !== undefined) {
      url += `&latitude=${lat}&longitude=${lng}`;
    }
    const response = await fetchAPI<{ data: Pharmacy[] }>(url, {
      next: {
        revalidate: 3600,
        tags: [`city-pharmacies-${citySlug}`],
      },
    });
    return response.data;
  },

  getPharmacyDetails: async (id: string) =>
    fetchAPI<Pharmacy>(`/pharmacies/${encodeURIComponent(id)}`, {
      next: { revalidate: 0, tags: [`pharmacy-${id}`] },
    }),
};
