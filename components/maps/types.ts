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
  setSelectedPharmacy: React.Dispatch<React.SetStateAction<IPharmacy | null>>;
  selectedPharmacy: IPharmacy | null;
  toggleListVisibility: () => void;
  radius?: string;
  setRadiusQuery?: (radius: string) => void;
}

export interface ISelectedPharmacy {
  latitude: number;
  longitude: number;
}
