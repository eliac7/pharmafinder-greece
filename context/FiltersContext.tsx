"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import {
  useQueryState,
  parseAsString,
  parseAsStringEnum,
  parseAsFloat,
} from "nuqs";
import { CitiesData } from "@/data/CitiesData";
import { IPharmacy } from "@/lib/interfaces";
import { useLocationContext } from "./LocationContext";

interface FiltersContextType {
  searchType: "nearby" | "city";
  setSearchType: (value: "nearby" | "city") => void;
  radiusQuery: number;
  setRadiusQuery: (value: number | null) => void;
  cityQuery: string;
  setCityQuery: (value: string | null) => void;
  cityLabel: string;
  timeQuery: "now" | "today" | "tomorrow" | "all";
  setTimeQuery: (value: "now" | "today" | "tomorrow" | "all") => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  selectedPharmacy: IPharmacy | null;
  setSelectedPharmacy: React.Dispatch<React.SetStateAction<IPharmacy | null>>;
  isListVisible: boolean;
  setIsListVisible: (isVisible: boolean) => void;
  isListExpandedMobile: boolean;
  setIsListExpandedMobile: (isExpanded: boolean) => void;
}

// Default values
const defaultContextValue: FiltersContextType = {
  searchType: "nearby",
  setSearchType: () => {},
  radiusQuery: 3,
  setRadiusQuery: () => {},
  cityQuery: "",
  setCityQuery: () => {},
  cityLabel: "",
  timeQuery: "now",
  setTimeQuery: () => {},
  isFilterOpen: false,
  setIsFilterOpen: () => {},
  selectedPharmacy: null,
  setSelectedPharmacy: () => {},
  isListVisible: true,
  setIsListVisible: () => {},
  isListExpandedMobile: false,
  setIsListExpandedMobile: () => {},
};

const FiltersContext = createContext<FiltersContextType>(defaultContextValue);

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { location } = useLocationContext();
  const { latitude, longitude } = location;

  const [searchType, setSearchType] = useQueryState(
    "searchType",
    parseAsStringEnum<"nearby" | "city">(["nearby", "city"]).withDefault(
      latitude && longitude ? "nearby" : "city",
    ),
  );
  const [radiusQuery, setRadiusQuery] = useQueryState<number>(
    "radius",
    parseAsFloat.withDefault(3),
  );
  const [cityQuery, setCityQuery] = useQueryState<string>(
    "city",
    parseAsString.withDefault(""),
  );

  const [timeQuery, setTimeQuery] = useQueryState(
    "time",
    parseAsStringEnum<"now" | "today" | "tomorrow" | "all">([
      "now",
      "today",
      "tomorrow",
      "all",
    ]).withDefault("now"),
  );

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<IPharmacy | null>(
    null,
  );
  const [isListVisible, setIsListVisible] = useState<boolean>(true);
  const [isListExpandedMobile, setIsListExpandedMobile] =
    useState<boolean>(false);

  const cityLabel = useMemo(() => {
    const city = CitiesData.find((city) => city.value === cityQuery);
    return city?.label || "";
  }, [cityQuery]);

  const value = useMemo(
    () => ({
      searchType,
      setSearchType,
      radiusQuery,
      setRadiusQuery,
      cityQuery,
      setCityQuery,
      cityLabel,
      timeQuery,
      setTimeQuery,
      isFilterOpen,
      setIsFilterOpen,
      selectedPharmacy,
      setSelectedPharmacy,
      isListVisible,
      setIsListVisible,
      isListExpandedMobile,
      setIsListExpandedMobile,
    }),
    [
      searchType,
      radiusQuery,
      cityQuery,
      cityLabel,
      timeQuery,
      isFilterOpen,
      setCityQuery,
      setRadiusQuery,
      setSearchType,
      setTimeQuery,
      selectedPharmacy,
      setSelectedPharmacy,
      isListVisible,
      setIsListVisible,
      isListExpandedMobile,
      setIsListExpandedMobile,
    ],
  );

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
};

export const useFilters = (): FiltersContextType => useContext(FiltersContext);
