"use client";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ILocation, ILocationFromMap } from "@/lib/interfaces";
import { createContext, useContext, useCallback, useEffect } from "react";

interface LocationContextType {
  location: ILocation;
  getLocation: () => void;
  updateLocation: (newLocation: ILocationFromMap) => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

export const useLocationContext = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error(
      "useLocationContext must be used within a LocationProvider",
    );
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useLocalStorage<ILocation>(
    "PHARMAFINDER_LOCATION",
    {
      latitude: null,
      longitude: null,
      error: null,
      timestamp: null,
    },
  );

  const getLocation = useCallback(async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
            timestamp: new Date().getTime(),
          };
          setLocation(newLocation);
        },
        async (error) => {
          // GPS failed, try getting location from IP
          const ipLocation = await getLocationFromIP();
          setLocation(ipLocation);
        },
      );
    } else {
      // Geolocation not supported, try getting location from IP
      const ipLocation = await getLocationFromIP();
      setLocation(ipLocation);
    }
  }, [setLocation]);

  const getLocationFromIP = async (): Promise<ILocation> => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const { latitude, longitude } = await response.json();
      return {
        latitude,
        longitude,
        error: null,
        timestamp: new Date().getTime(),
      };
    } catch (error) {
      return {
        latitude: null,
        longitude: null,
        error:
          "Error getting location from IP: " +
          ((error as Error).message || "Unknown error"),
      };
    }
  };

  const updateLocation = useCallback(
    (location: ILocationFromMap) => {
      const newLocation = {
        latitude: location.lat,
        longitude: location.lng,
        error: null,
        timestamp: new Date().getTime(),
      };
      setLocation(newLocation);
    },
    [setLocation],
  );

  useEffect(() => {
    // Check if location is null or has null latitude or longitude, and if so, get location
    if (
      !location ||
      location.latitude === null ||
      location.longitude === null
    ) {
      getLocation();
    }
  }, [getLocation, location]);

  return (
    <LocationContext.Provider value={{ location, getLocation, updateLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
