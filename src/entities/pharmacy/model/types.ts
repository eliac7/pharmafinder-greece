export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  city: string;
  prefecture: string;
  prefecture_english: string;
  distance_km: number;
  date?: string;
  data_hours?: PharmacyHour[];
  open_until_tomorrow?: boolean;
  next_day_close_time?: string | null;
  location_url?: string;
}

export interface PharmacyHour {
  open_time: string;
  close_time: string;
  date?: string;
}

export interface PharmacySearchResponse {
  count: number;
  data: Pharmacy[];
  message?: string;
}
