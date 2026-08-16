"use client";

import { Map } from "@/shared/ui/map";
import { MapControls } from "./map-controls";
import { UserLocationMarker } from "./user-location-marker";
import { PharmacyMarkers } from "./pharmacy-markers";
import { MapUpdater } from "./map-updater";
import { ManualLocationAdjuster } from "./manual-location-adjuster";
import { type Pharmacy, type TimeFilter } from "@/entities/pharmacy";
import type MapLibreGL from "maplibre-gl";
import { useState } from "react";
import { ProductActionViewport } from "./product-action-viewport";

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
  const isHomeMap =
    citySlug === undefined &&
    pharmacies === undefined &&
    timeFilter === undefined;

  return (
    <div className="relative w-full h-full">
      <Map
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        attributionControl={false}
        {...mapProps}
      >
        <MapUpdater
          viewportMode={citySlug ? "city" : "nearby"}
          cityCenter={center}
          cityZoom={zoom}
          cameraKey={citySlug}
        />
        <ManualLocationAdjuster
          isAdjusting={isAdjusting}
          onAdjustChange={setIsAdjusting}
        />
        <UserLocationMarker />
        {!isHomeMap ? (
          <PharmacyMarkers
            timeFilter={timeFilter}
            citySlug={citySlug}
          />
        ) : (
          <ProductActionViewport />
        )}
        <MapControls
          isAdjusting={isAdjusting}
          onAdjustChange={setIsAdjusting}
        />
      </Map>
    </div>
  );
}
