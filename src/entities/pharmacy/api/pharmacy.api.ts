import { fetchAPI } from "@/shared/api/base";
import type { Pharmacy } from "../model/types";

export const pharmacyApi = {
  /**
   * For the Map & "Find Near Me" (Client-Side)
   */
  getNearbyOnDuty: async (
    lat: number,
    lng: number,
    radius = 5,
    time: "now" | "today" | "tomorrow" = "now"
  ) => {
    const res = await fetchAPI<{ data: Pharmacy[] }>(
      `/nearby_pharmacies/on_duty?latitude=${lat}&longitude=${lng}&radius=${radius}&time=${time}`
    );
    return res.data;
  },

  /**
   * For SSR City Pages
   */
  getCityPharmacies: async (
    citySlug: string,
    time: "now" | "today" | "tomorrow" = "now"
  ) => {
    const res = await fetchAPI<{ data: Pharmacy[] }>(
      `/city?city_slug=${citySlug}&city_name=${citySlug}&time=${time}`
    );
    return res.data;
  },

  /**
   * Global Search
   */
  search: async (query: string, lat?: number, lng?: number) => {
    if (query.length < 3) return [];

    let url = `/pharmacies/search?q=${encodeURIComponent(query)}`;
    if (lat && lng) url += `&latitude=${lat}&longitude=${lng}`;

    const res = await fetchAPI<{ data: Pharmacy[] }>(url);
    return res.data;
  },

  /**
   * Details
   */
  getPharmacyDetails: async (id: number) => {
    return fetchAPI<Pharmacy>(`/pharmacies/${id}`, {
      next: { revalidate: 86400 }, //24 hour
    });
  },
};
