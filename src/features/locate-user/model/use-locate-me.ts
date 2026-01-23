"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLocationStore } from "./use-location-store";
import { useMapStore } from "@/shared/model/use-map-store";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface UseLocateMeReturn {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  locate: (onSuccess?: (coords: Coordinates) => void) => void;
}

export function useLocateMe(): UseLocateMeReturn {
  const { latitude, longitude, setLocation } = useLocationStore();
  const flyTo = useMapStore((state) => state.flyTo);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = (onSuccess?: (coords: Coordinates) => void) => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      const msg = "Η γεωτοποθεσία δεν υποστηρίζεται από τον browser σας.";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(coords.latitude, coords.longitude);
        // Fly to the user's location
        flyTo([coords.longitude, coords.latitude], 15);
        setIsLoading(false);
        toast.success("Η τοποθεσία σας βρέθηκε!");
        onSuccess?.(coords);
      },
      (err) => {
        let msg = "Σφάλμα κατά τον εντοπισμό τοποθεσίας.";
        if (err.code === 1) msg = "Δεν δόθηκε άδεια πρόσβασης στην τοποθεσία.";
        else if (err.code === 2) msg = "Η τοποθεσία δεν είναι διαθέσιμη.";
        else if (err.code === 3) msg = "Time out κατά τον εντοπισμό.";

        setError(msg);
        toast.error(msg);
        setIsLoading(false);
      }
    );
  };

  const coordinates = latitude && longitude ? { latitude, longitude } : null;

  return { coordinates, isLoading, error, locate };
}
