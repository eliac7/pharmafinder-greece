"use client";

import { useLocationContext } from "@/context/LocationContext";
import { useEffect, useState } from "react";

const LocationDisplay = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { location, getLocation } = useLocationContext();
  const { latitude, longitude, error } = location;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <button
        onClick={getLocation}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 dark:bg-red-500"
      >
        Get Location
      </button>
      <p>Latitude: {latitude}</p>
      <p>Longitude: {longitude}</p>
      <p>Error: {error}</p>
    </div>
  );
};

export default LocationDisplay;
