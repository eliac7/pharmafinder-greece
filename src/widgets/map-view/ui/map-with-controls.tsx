"use client";

import { Map } from "@/shared/ui/map";
import { MapControls } from "./map-controls";
import { UserLocationMarker } from "./user-location-marker";
import { PharmacyMarkers } from "./pharmacy-markers";
import { MapUpdater } from "./map-updater";
import { ManualLocationAdjuster } from "./manual-location-adjuster";
import { MapLoadingPill } from "./map-loading-pill";
import { type Pharmacy, type TimeFilter } from "@/entities/pharmacy";
import { useNearbyPharmacies } from "@/features/find-pharmacies";
import { useMapStore } from "@/shared/model/use-map-store";
import type MapLibreGL from "maplibre-gl";

interface MapWithControlsProps {
  center?: [number, number];
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
  const { isFetching } = useNearbyPharmacies();
  const isAdjusting = useMapStore((state) => state.isManualLocationAdjusting);
  const setIsAdjusting = useMapStore(
    (state) => state.setManualLocationAdjusting
  );

  return (
    <div className="relative w-full h-full">
      <MapLoadingPill isLoading={isFetching} />
      <Map
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        attributionControl={false}
        {...mapProps}
      >
        <MapUpdater />
        <ManualLocationAdjuster
          isAdjusting={isAdjusting}
          onAdjustChange={setIsAdjusting}
        />
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
        <MapControls
          isAdjusting={isAdjusting}
          onAdjustChange={setIsAdjusting}
        />
      </Map>
    </div>
  );
}
