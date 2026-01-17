/**
 * Full city details (from /locations/cities/{slug} and /search)
 */
export interface CityDetail {
  id: number;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  prefecture_id: number;
}

export interface CitySummary {
  city: string;
  slug: string;
  prefecture: string;
}
