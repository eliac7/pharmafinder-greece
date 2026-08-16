import { fetchAPI } from "@/shared/api/base";
import type {
  Pharmacy,
  PharmaciesWithCount,
  PharmacySitemapItem,
  TimeFilter,
  ViewportBounds,
} from "../model/types";

export const pharmacyApi = {
  /**
   * For the Map & "Find Near Me" (Client-Side)
   */
  /**
   * For the Map & "Find Near Me" (Client-Side)
   */
  getNearbyOnDuty: async (
    lat: number,
    lng: number,
    radius = 5,
    time: "now" | "today" | "tomorrow" = "now"
  ): Promise<PharmaciesWithCount> => {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      radius: radius.toString(),
      time,
    });
    const res = await fetchAPI<PharmaciesWithCount | []>(
      `/nearby_pharmacies/on_duty?${params}`
    );

    if (Array.isArray(res)) {
      return {
        count: 0,
        data: [],
        success: true,
        message: "No pharmacies found within this radius",
      };
    }
    return res;
  },

  getViewportOnDuty: async (
    bounds: ViewportBounds,
    time: TimeFilter = "now",
    signal?: AbortSignal
  ): Promise<PharmaciesWithCount> => {
    const params = new URLSearchParams({
      west: bounds.west.toString(),
      south: bounds.south.toString(),
      east: bounds.east.toString(),
      north: bounds.north.toString(),
      time,
    });
    return fetchAPI<PharmaciesWithCount>(
      `/pharmacies/viewport/on_duty?${params}`,
      { signal }
    );
  },

  /**
   * For SSR City Pages (with optional user location for distance)
   */
  getCityPharmacies: async (
    citySlug: string,
    time: "now" | "today" | "tomorrow" = "now",
    lat?: number,
    lng?: number
  ) => {
    let url = `/city?city_slug=${encodeURIComponent(citySlug)}&time=${time}`;
    if (lat !== undefined && lng !== undefined) {
      url += `&latitude=${lat}&longitude=${lng}`;
    }
    const res = await fetchAPI<{ data: Pharmacy[] }>(url, {
      next: {
        revalidate: 3600, // 1 hour
        tags: [`city-pharmacies-${citySlug}`]
      }
    });
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
  getPharmacyDetails: async (id: number | string) => {
    return fetchAPI<Pharmacy>(`/pharmacies/${encodeURIComponent(String(id))}`, {
      next: {
        revalidate: 0,
        tags: [`pharmacy-${id}`]
      },
    });
  },

  /**
   * Report a pharmacy issue
   */
  reportPharmacy: async (
    pharmacyId: string,
    data: {
      report_type: "closed" | "wrong_coords" | "wrong_info" | "other";
      description: string;
      turnstile_token: string;
    }
  ) => {
    return fetchAPI<{ success: boolean }>(`/pharmacies/${encodeURIComponent(pharmacyId)}/report`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Sitemap data. Server-side only; this route is not exposed by the browser proxy. */
  getSitemapData: async () => {
    const res = await fetchAPI<{ data: PharmacySitemapItem[] }>(
      "/pharmacies/sitemap",
      {
        next: {
          revalidate: 86400, // 24 hours
          tags: ["sitemap-pharmacies"]
        }
      }
    );
    return res.data;
  },
};
