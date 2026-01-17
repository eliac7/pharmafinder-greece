"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMap } from "@/shared/ui/map";
import { useLocationStore } from "@/features/locate-user";
import { toast } from "sonner";

type ManualLocationAdjusterProps = {
  isAdjusting?: boolean;
  onAdjustChange?: (next: boolean) => void;
};

export function ManualLocationAdjuster({
  isAdjusting: controlledAdjusting,
  onAdjustChange,
}: ManualLocationAdjusterProps) {
  const { map } = useMap();
  const { setLocation } = useLocationStore();
  const isAdjusting = controlledAdjusting ?? false;
  const setIsAdjusting = useCallback(
    (next: boolean) => {
      onAdjustChange?.(next);
    },
    [onAdjustChange]
  );
  const previousInteractions = useRef({
    dragPan: true,
    dragRotate: true,
    scrollZoom: true,
    boxZoom: true,
    keyboard: true,
    doubleClickZoom: true,
  });

  useEffect(() => {
    if (!map) return;

    const canvas = map.getCanvas();
    const container = map.getContainer();

    if (isAdjusting) {
      previousInteractions.current = {
        dragPan: map.dragPan.isEnabled(),
        dragRotate: map.dragRotate.isEnabled(),
        scrollZoom: map.scrollZoom.isEnabled(),
        boxZoom: map.boxZoom.isEnabled(),
        keyboard: map.keyboard.isEnabled(),
        doubleClickZoom: map.doubleClickZoom.isEnabled(),
      };

      map.dragRotate.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();

      container.classList.add("manual-location-adjusting");
      canvas.style.cursor = "crosshair";
      container.style.cursor = "crosshair";
    } else {
      if (previousInteractions.current.dragPan) map.dragPan.enable();
      if (previousInteractions.current.dragRotate) map.dragRotate.enable();
      if (previousInteractions.current.scrollZoom) map.scrollZoom.enable();
      if (previousInteractions.current.boxZoom) map.boxZoom.enable();
      if (previousInteractions.current.keyboard) map.keyboard.enable();
      if (previousInteractions.current.doubleClickZoom)
        map.doubleClickZoom.enable();

      container.classList.remove("manual-location-adjusting");
      canvas.style.cursor = "";
      container.style.cursor = "";
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
      if (previousInteractions.current.dragPan) map.dragPan.enable();
      if (previousInteractions.current.dragRotate) map.dragRotate.enable();
      if (previousInteractions.current.scrollZoom) map.scrollZoom.enable();
      if (previousInteractions.current.boxZoom) map.boxZoom.enable();
      if (previousInteractions.current.keyboard) map.keyboard.enable();
      if (previousInteractions.current.doubleClickZoom)
        map.doubleClickZoom.enable();
      container.classList.remove("manual-location-adjusting");
      canvas.style.cursor = "";
      container.style.cursor = "";
    };
  }, [map, isAdjusting, setLocation, setIsAdjusting]);

  return null;
}
