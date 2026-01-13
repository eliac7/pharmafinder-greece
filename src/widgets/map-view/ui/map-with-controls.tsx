import { Map } from "@/shared/ui/map";
import {
  MapControls,
  UserLocationMarker,
  PharmacyMarkers,
  MapUpdater,
} from "@/widgets/map-view";
import { type Pharmacy, type TimeFilter } from "@/entities/pharmacy";
import type MapLibreGL from "maplibre-gl";

interface MapWithControlsProps {
  center: [number, number];
  zoom?: number;
  minZoom?: number;
  mapProps?: Omit<
    MapLibreGL.MapOptions,
    "container" | "style" | "center" | "zoom" | "minZoom"
  >;
  pharmacies?: Pharmacy[];
  timeFilter?: TimeFilter;
  citySlug?: string;
}

export function MapWithControls({
  center,
  zoom = 13,
  minZoom = 10,
  mapProps,
  pharmacies,
  timeFilter,
  citySlug,
}: MapWithControlsProps) {
  return (
    <>
      <Map
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        attributionControl={false}
        {...mapProps}
      >
        <MapUpdater />
        <UserLocationMarker />
        {pharmacies !== undefined ||
        timeFilter !== undefined ||
        citySlug !== undefined ? (
          <PharmacyMarkers
            pharmacies={pharmacies}
            timeFilter={timeFilter}
            citySlug={citySlug}
          />
        ) : (
          <PharmacyMarkers />
        )}
        <MapControls />
      </Map>
    </>
  );
}
