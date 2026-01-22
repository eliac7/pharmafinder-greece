"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocationStore } from "./use-location-store";

export function useAutoLocate() {
  const { latitude, longitude, setLocation } = useLocationStore();
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
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
  }, [latitude, longitude, setLocation]);
}
