export interface IPharmacy {
  id: number;
  name: string;
  address: string;
  city: string;
  prefecture: string;
  prefecture_english: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance_km: number;
}

export interface IPharmacyResponse {
  count: number;
  data: IPharmacy[] | null;
  message: string | null;
  success: boolean;
}

export interface ILocation {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}
