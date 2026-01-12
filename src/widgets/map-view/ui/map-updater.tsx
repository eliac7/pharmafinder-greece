"use client";

import { useQueryState, parseAsFloat } from "nuqs";
import { useEffect } from "react";
import { useMapStore } from "@/shared/model/use-map-store";
import { useMap } from "@/shared/ui/map";

export function MapUpdater() {
  const { map } = useMap();
  const [lat] = useQueryState("lat", parseAsFloat);
  const [lng] = useQueryState("lng", parseAsFloat);
  const flyToTarget = useMapStore((state) => state.flyToTarget);

  useEffect(() => {
    if (map && lat && lng) {
      map.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 2000,
      });
    }
  }, [map, lat, lng]);

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
