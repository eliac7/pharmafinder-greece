"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocationStore } from "./use-location-store";
import { useMapStore } from "@/shared/model/use-map-store";

export function useAutoLocate() {
  const { latitude, longitude, setLocation } = useLocationStore();
  const flyTo = useMapStore((state) => state.flyTo);
  const hasAttemptedRef = useRef(false);
  const [hasHydrated, setHasHydrated] = useState(
    () => useLocationStore.persist?.hasHydrated?.() ?? true
  );

  useEffect(() => {
    const persist = useLocationStore.persist;
    if (!persist?.onFinishHydration) return;

    const unsubFinishHydration = persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return () => {
      unsubFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if ((latitude && longitude) || hasAttemptedRef.current) {
      return;
    }

    if (typeof window !== "undefined") {
      const storedLocation = localStorage.getItem("user-location");
      if (storedLocation) {
        try {
          const parsed = JSON.parse(storedLocation);
          if (parsed.state?.latitude && parsed.state?.longitude) {
            return;
          }
        } catch (e) {
          console.error("Failed to parse stored location", e);
        }
      }
    }

    hasAttemptedRef.current = true;

    if (!navigator.geolocation) {
      fetchIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation(lat, lng);
        // Fly to the user's location
        flyTo([lng, lat], 15);
        toast.success("Η τοποθεσία σας βρέθηκε!");
      },
      () => {
        fetchIpLocation();
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );

    async function fetchIpLocation() {
      try {
        const response = await fetch("/api/ip-location");
        const data = await response.json();

        if (data.latitude && data.longitude) {
          setLocation(data.latitude, data.longitude);
          toast.info("Εντοπισμός μέσω IP - κατά προσέγγιση τοποθεσία");
        }
      } catch {
        console.warn("IP geolocation failed");
      }
    }
  }, [hasHydrated, latitude, longitude, setLocation, flyTo]);
}
