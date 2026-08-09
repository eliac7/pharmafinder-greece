export interface NavigationPharmacy {
  name: string;
  address: string;
  phone?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export type NavigationProvider = "google-maps" | "apple-maps" | "waze";

export type NavigationPreference = NavigationProvider | "ask";

export interface PharmacyNavigationLinks {
  hasCoordinates: boolean;
  googleMapsUrl: string | null;
  appleMapsUrl: string | null;
  wazeUrl: string | null;
  telUrl: string | null;
  copyText: string;
}
