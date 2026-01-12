import { Map } from "@/shared/ui/map";
import { MapUpdater } from "@/widgets/map-view/ui/map-updater";
import { UserLocationMarker } from "@/widgets/map-view/ui/user-location-marker";
import { MapControls } from "@/widgets/map-view/ui/map-controls";
import { PharmacyMarkers } from "@/widgets/map-view/ui/pharmacy-markers";
import type { Pharmacy, TimeFilter } from "@/entities/pharmacy/model/types";
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
}

export function MapWithControls({
  center,
  zoom = 13,
  minZoom = 10,
  mapProps,
  pharmacies,
  timeFilter,
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
        {pharmacies !== undefined || timeFilter !== undefined ? (
          <PharmacyMarkers pharmacies={pharmacies} timeFilter={timeFilter} />
        ) : (
          <PharmacyMarkers />
        )}
      </Map>
      <MapControls />
    </>
  );
}
