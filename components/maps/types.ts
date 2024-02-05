import { IPharmacy } from "@/lib/interfaces";

export interface IPoint {
  lat: number;
  lng: number;
}

export interface IMapProps {
  points: IPoint[];
  selectedPharmacy: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface IPharmacyMapProps {
  pharmacies: IPharmacy[] | null;
}

export interface ISelectedPharmacy {
  latitude: number;
  longitude: number;
}

export interface IPharmacyListProps {
  pharmacies: IPharmacy[];
  count: number;
}

export interface IThumbnailMapProps {
  latitude: number;
  longitude: number;
  url: string;
  hoverText: string;
  zoom?: number;
}
