export interface PharmacyHour {
  open_time: string | null;
  close_time: string | null;
}

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  city: string;
  prefecture: string;
  prefecture_english: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  distance_km?: number | null;
  date?: string | null;
  data_hours: PharmacyHour[];
  open_until_tomorrow?: boolean | null;
  next_day_close_time?: string | null;
}

export interface PharmaciesWithCount {
  count: number;
  data: Pharmacy[];
  success: boolean;
  message: string;
}
