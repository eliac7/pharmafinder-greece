"use client";

import { useEffect } from "react";
import { useMapStore } from "@/shared/model/use-map-store";
import { useMap } from "@/shared/ui/map";
import { useLocationStore } from "@/features/locate-user";

export function MapUpdater() {
  const { map } = useMap();
  const { latitude, longitude } = useLocationStore();
  const flyToTarget = useMapStore((state) => state.flyToTarget);

  useEffect(() => {
    if (map && latitude && longitude) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        duration: 2000,
      });
    }
  }, [map, latitude, longitude]);

  useEffect(() => {
    if (map && flyToTarget) {
      map.flyTo({
        center: flyToTarget.center,
        zoom: flyToTarget.zoom || 16,
        duration: 2000,
      });
    }
  }, [map, flyToTarget]);

  return null;
}
