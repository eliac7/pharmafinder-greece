"use client";

import { useEffect, useRef } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useMapStore } from "@/shared/model/use-map-store";
import { useMap } from "@/shared/ui/map";
import { useLocationStore } from "@/features/locate-user";
import { DEFAULT_RADIUS, radiusToZoom } from "@/entities/pharmacy";

export function MapUpdater() {
  const { map } = useMap();
  const { latitude, longitude } = useLocationStore();
  const [radius] = useQueryState("radius", parseAsInteger.withDefault(DEFAULT_RADIUS));
  const flyToTarget = useMapStore((state) => state.flyToTarget);
  const clearFlyToTarget = useMapStore((state) => state.clearFlyToTarget);
  const setPopupTargetId = useMapStore((state) => state.setPopupTargetId);

  const prevLocationRef = useRef<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const prevRadiusRef = useRef<number | null>(null);

  useEffect(() => {
    if (map && flyToTarget) {
      // Clear any previous popup target before flying
      setPopupTargetId(null);

      map.flyTo({
        center: flyToTarget.center,
        zoom: flyToTarget.zoom || 16,
        duration: 2000,
      });

      if (flyToTarget.pharmacyId) {
        map.once("moveend", () => {
          setPopupTargetId(flyToTarget.pharmacyId!);
        });
      }

      clearFlyToTarget();
    }
  }, [map, flyToTarget, clearFlyToTarget, setPopupTargetId]);

  useEffect(() => {
    if (!map || !latitude || !longitude) return;

    const prev = prevLocationRef.current;
    const hasChanged = prev.lat !== latitude || prev.lng !== longitude;

    // Only fly if this is a genuine location change
    if (hasChanged && prev.lat !== null && prev.lng !== null) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: radiusToZoom(radius),
        duration: 2000,
      });
    }

    prevLocationRef.current = { lat: latitude, lng: longitude };
  }, [map, latitude, longitude, radius]);

  useEffect(() => {
    if (!map) return;

    const prevRadius = prevRadiusRef.current;
    const isInitial = prevRadius === null;
    const radiusChanged = prevRadius !== null && prevRadius !== radius;

    if (isInitial || radiusChanged) {
      const center =
        latitude != null && longitude != null
          ? ([longitude, latitude] as [number, number])
          : ([map.getCenter().lng, map.getCenter().lat] as [number, number]);
      map.flyTo({
        center,
        zoom: radiusToZoom(radius),
        duration: isInitial ? 0 : 800,
      });
    }

    prevRadiusRef.current = radius;
  }, [map, radius, latitude, longitude]);

  return null;
}
