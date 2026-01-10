"use client";

import { useQueryState, parseAsFloat } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface UseLocateMeReturn {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  locate: () => void;
}

export function useLocateMe(): UseLocateMeReturn {
  const [lat, setLat] = useQueryState("lat", parseAsFloat);
  const [lng, setLng] = useQueryState("lng", parseAsFloat);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = () => {
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
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setIsLoading(false);
        toast.success("Η τοποθεσία σας βρέθηκε!");
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

  const coordinates = lat && lng ? { latitude: lat, longitude: lng } : null;

  return { coordinates, isLoading, error, locate };
}
