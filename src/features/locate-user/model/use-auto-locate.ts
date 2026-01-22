"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocationStore } from "./use-location-store";

export function useAutoLocate() {
  const { latitude, longitude, setLocation } = useLocationStore();
  const hasAttemptedRef = useRef(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useLocationStore.persist.onFinishHydration(
      () => {
        setHasHydrated(true);
      },
    );

    if (useLocationStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

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

    hasAttemptedRef.current = true;

    if (!navigator.geolocation) {
      fetchIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords.latitude, position.coords.longitude);
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
  }, [hasHydrated, latitude, longitude, setLocation]);
}
