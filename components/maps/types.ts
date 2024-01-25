import { IFiltersMobileProps } from "@/app/(routes)/app/page";
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

export interface IPharmacyMapProps extends IFiltersMobileProps {
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

export interface IThumbnailMapProps {
  latitude: number;
  longitude: number;
  url: string;
  hoverText: string;
  zoom?: number;
}
