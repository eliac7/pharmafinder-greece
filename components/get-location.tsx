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
      <button onClick={getLocation}>Get Location</button>
      <p>Latitude: {latitude}</p>
      <p>Longitude: {longitude}</p>
      <p>Error: {error}</p>
    </div>
  );
};

export default LocationDisplay;
