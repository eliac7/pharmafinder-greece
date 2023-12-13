"use client";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ILocation } from "@/lib/interfaces";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

interface LocationContextType {
  location: ILocation;
  getLocation: () => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

export const useLocationContext = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error(
      "useLocationContext must be used within a LocationProvider"
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
    }
  );

  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
          };
          setLocation(newLocation);
        },
        (error) => {
          setLocation({
            latitude: null,
            longitude: null,
            error: `Error getting location: ${error.message}`,
          });
        }
      );
    } else {
      setLocation({
        latitude: null,
        longitude: null,
        error: "Geolocation is not supported by your browser.",
      });
    }
  }, [setLocation]);

  useEffect(() => {
    if (
      !location ||
      location.latitude === null ||
      location.longitude === null
    ) {
      getLocation();
    }
  }, [getLocation, location]);

  return (
    <LocationContext.Provider value={{ location, getLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
