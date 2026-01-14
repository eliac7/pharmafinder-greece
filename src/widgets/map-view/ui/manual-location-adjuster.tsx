"use client";

import { useEffect } from "react";
import { useMap } from "@/shared/ui/map";
import { useLocationStore } from "@/features/locate-user";
import { toast } from "sonner";

export function ManualLocationAdjuster() {
  const { map } = useMap();
  const { isAdjusting, setLocation, setIsAdjusting } = useLocationStore();

  useEffect(() => {
    if (!map) return;

    const canvas = map.getCanvas();

    if (isAdjusting) {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = "";
    }

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (!isAdjusting) return;

      const { lng, lat } = e.lngLat;
      setLocation(lat, lng);
      setIsAdjusting(false);

      toast.success("Η τοποθεσία ενημερώθηκε!");

      map.flyTo({
        center: [lng, lat],
        essential: true,
        zoom: 15,
      });
    };

    if (isAdjusting) {
      map.on("click", handleClick);
    }

    return () => {
      map.off("click", handleClick);
      canvas.style.cursor = "";
    };
  }, [map, isAdjusting, setLocation, setIsAdjusting]);

  return null;
}
