import DutyStatus from "../filters/DutyStatus";
import RadiusSlider from "../filters/RadiusSlider";
import CitySearch from "../filters/CitySearch";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { IFiltersMobileProps } from "@/app/(routes)/app/page";
import clsx from "clsx";

const PharmacyToggleButtons = dynamic(
  () => import("../filters/PharmacyToggleButtons"),
  {
    ssr: false,
  },
);

interface IFiltersProps extends IFiltersMobileProps {
  searchType: "nearby" | "city";
  onSearchTypeChange: (searchType: "nearby" | "city") => void;
  radiusQuery: number;
  onRadiusChange: (radius: number | null) => void;
  cityQuery: string;
  cityLabel?: string;
  onCityChange: (city: string | null) => void;
  timeQuery: "now" | "today" | "tomorrow" | "all";
  onTimeChange: (time: "now" | "today" | "tomorrow" | "all") => void;
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
  isFilterMobileOpen,
}: IFiltersProps) {
  useEffect(() => {
    if (searchType === "nearby") {
      onCityChange(null);
    }
  }, [searchType, onCityChange]);

  useEffect(() => {
    if (searchType === "city") {
      onRadiusChange(null);
    }
  }, [searchType, onRadiusChange]);

  return (
    <div
      className={clsx(
        isFilterMobileOpen ? "flex" : "hidden tablet:flex",
        "z-[1102] flex w-full flex-col items-center justify-center gap-x-2 gap-y-2 border-y border-gray-200 px-2 py-2 shadow-xl marker:z-[500] dark:border-gray-600 tablet:flex-row tablet:gap-y-0 tablet:px-0",
      )}
    >
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
      <DutyStatus
        timeQuery={timeQuery}
        onTimeChange={onTimeChange}
        searchType={searchType}
      />
    </div>
  );
}
