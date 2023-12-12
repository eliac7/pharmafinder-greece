"use client";

import { useLocationContext } from "@/context/LocationContext";

const LocationDisplay = () => {
  const { location, getLocation } = useLocationContext();

  return (
    <div>
      {location.error && <p>Error: {location.error}</p>}
      {location.latitude && location.longitude && (
        <p>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </p>
      )}
      <button onClick={getLocation}>Refresh Location</button>
    </div>
  );
};

export default LocationDisplay;
