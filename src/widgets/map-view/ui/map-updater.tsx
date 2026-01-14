"use client";

import { useEffect, useRef } from "react";
import { useMapStore } from "@/shared/model/use-map-store";
import { useMap } from "@/shared/ui/map";
import { useLocationStore } from "@/features/locate-user";

export function MapUpdater() {
  const { map } = useMap();
  const { latitude, longitude } = useLocationStore();
  const flyToTarget = useMapStore((state) => state.flyToTarget);
  const clearFlyToTarget = useMapStore((state) => state.clearFlyToTarget);

  const prevLocationRef = useRef<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });

  useEffect(() => {
    if (map && flyToTarget) {
      map.flyTo({
        center: flyToTarget.center,
        zoom: flyToTarget.zoom || 16,
        duration: 2000,
      });
      clearFlyToTarget();
    }
  }, [map, flyToTarget, clearFlyToTarget]);

  useEffect(() => {
    if (!map || !latitude || !longitude) return;

    const prev = prevLocationRef.current;
    const hasChanged = prev.lat !== latitude || prev.lng !== longitude;

    // Only fly if this is a genuine location change
    if (hasChanged && prev.lat !== null && prev.lng !== null) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        duration: 2000,
      });
    }

    prevLocationRef.current = { lat: latitude, lng: longitude };
  }, [map, latitude, longitude]);

  return null;
}
