"use client";

import DutyStatus from "../filters/DutyStatus";
import RadiusSlider from "../filters/RadiusSlider";
import PharmacyToggleButtons from "../filters/PharmacyToggleButtons";
import CitySearch from "../filters/CitySearch";
import { useEffect } from "react";

interface IFiltersProps {
  searchType: "nearby" | "city";
  onSearchTypeChange: (searchType: "nearby" | "city") => void;
  radiusQuery: number;
  onRadiusChange: (radius: number) => void;
  cityQuery: string;
  cityLabel?: string;
  onCityChange: (city: string | null) => void;
  timeQuery: "now" | "today" | "tomorrow";
  onTimeChange: (time: "now" | "today" | "tomorrow") => void;
}

export default function Filters({
  searchType,
  onSearchTypeChange,
  radiusQuery,
  onRadiusChange,
  cityQuery,
  cityLabel,
  onCityChange,
  timeQuery,
  onTimeChange,
}: IFiltersProps) {
  useEffect(() => {
    if (searchType === "nearby") {
      onCityChange(null);
    }
  }, [searchType, onCityChange]);

  return (
    <div className="z-[500] hidden w-full flex-col items-center justify-center gap-x-2 gap-y-2 border-b border-b-gray-200 py-2 shadow-xl dark:border-gray-600 md:flex md:flex-row md:gap-y-0">
      <PharmacyToggleButtons
        searchType={searchType}
        setSearchType={onSearchTypeChange}
      />
      {searchType === "nearby" ? (
        <RadiusSlider
          radiusQuery={radiusQuery}
          onRadiusChange={onRadiusChange}
        />
      ) : (
        <>
          <CitySearch
            cityQuery={cityQuery}
            cityLabel={cityLabel}
            onCityChange={onCityChange}
          />
        </>
      )}
      <DutyStatus timeQuery={timeQuery} onTimeChange={onTimeChange} />
    </div>
  );
}
