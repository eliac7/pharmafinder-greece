export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  location_url?: string;
  city_id?: number;
  hours?: PharmacyHour[];
  distance?: number;
  is_open?: boolean;
}

export interface PharmacyHour {
  date: string;
  open_time: string;
  close_time: string;
}

export interface PharmacySearchResponse {
  count: number;
  data: Pharmacy[];
  message?: string;
}
