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
import type MapLibreGL from "maplibre-gl";
import { useState } from "react";

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
  const [isAdjusting, setIsAdjusting] = useState(false);
  const { isFetching } = useNearbyPharmacies();

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
