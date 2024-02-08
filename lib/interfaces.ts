export interface IPharmacy {
  name: string;
  address: string;
  city: string;
  prefecture: string;
  prefecture_english: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance_km: number | null;
  data_hours?: [
    {
      open_time: string;
      close_time: string;
    },
  ];
  date: string;
  open_until_tomorrow?: boolean;
  next_day_close_time?: string;
}

export interface IPharmacyResponse {
  count: number;
  data: IPharmacy[] | null;
  message: string | null;
  success: boolean;
}
export interface ILocationFromMap {
  lat: number | null;
  lng: number | null;
  error: string | null;
  timestamp?: number | null;
}
export interface ILocation {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  timestamp?: number | null;
}

export interface IOption {
  label: string;
  value: string;
}

export interface ICountryByIP {
  countryCode: string;
  countryName: string;
}
