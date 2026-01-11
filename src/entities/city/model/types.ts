export interface City {
  id: number;
  name: string;
  slug: string;
  prefecture_id: number;
  latitude: number;
  longitude: number;
}

export interface CitySummary {
  city: string;
  slug: string;
  prefecture: string;
}
