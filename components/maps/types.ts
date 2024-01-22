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
  isListVisible: boolean;
  radius?: string;
  setRadiusQuery?: (radius: string) => void;
  searchType?: string;
}

export interface ISelectedPharmacy {
  latitude: number;
  longitude: number;
}

export interface IPharmacyListProps {
  pharmacies: IPharmacy[];
  count: number;
  selectedPharmacy?: IPharmacy | null;
  setSelectedPharmacy: (pharmacy: IPharmacy | null) => void;
  cityLabel?: string;
  isListExpandedMobile: boolean;
  setIsListExpandedMobile: (isListExpandedMobile: boolean) => void;
  searchType: "city" | "nearby";
}
