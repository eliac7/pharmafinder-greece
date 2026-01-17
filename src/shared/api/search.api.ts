import { fetchAPI } from "./base";
import type { PharmacyBasic } from "@/entities/pharmacy/model/types";
import type { CityDetail } from "@/entities/city/model/types";

/**
 * Response from /search endpoint
 */
export interface UnifiedSearchResponse {
  pharmacies: PharmacyBasic[];
  cities: CityDetail[];
  addresses: PharmacyBasic[];
  message?: string;
  success: boolean;
}

export interface UnifiedSearchParams {
  q: string;
  latitude?: number;
  longitude?: number;
}

export const searchApi = {
  /**
   * Unified search across pharmacies, cities, and addresses
   */
  unifiedSearch: async ({
    q,
    latitude,
    longitude,
  }: UnifiedSearchParams): Promise<UnifiedSearchResponse> => {
    const params = new URLSearchParams({ q });

    if (latitude !== undefined && longitude !== undefined) {
      params.set("latitude", latitude.toString());
      params.set("longitude", longitude.toString());
    }

    return fetchAPI<UnifiedSearchResponse>(`/search?${params.toString()}`);
  },
};
