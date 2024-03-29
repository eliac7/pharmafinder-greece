"use client";

import DutyStatus from "../filters/DutyStatus";
import CitySearch from "../filters/CitySearch";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { useFilters } from "@/context/FiltersContext";

const PharmacyToggleButtons = dynamic(
  () => import("../filters/PharmacyToggleButtons"),
  {
    ssr: false,
  },
);

const RadiusSliderNOSSR = dynamic(() => import("../filters/RadiusSlider"), {
  ssr: false,
});

export default function Filters() {
  const {
    searchType,
    setSearchType,
    radiusQuery,
    setRadiusQuery,
    cityQuery,
    cityLabel,
    setCityQuery,
    timeQuery,
    setTimeQuery,
    isFilterOpen,
  } = useFilters();

  useEffect(() => {
    if (searchType === "nearby") {
      setCityQuery(null);
    }
  }, [searchType, setCityQuery]);

  useEffect(() => {
    if (searchType === "city") {
      setRadiusQuery(null);
    }
  }, [searchType, setRadiusQuery]);

  return (
    <div
      className={clsx(
        isFilterOpen ? "flex" : "hidden",
        "z-[1100] flex w-full flex-col items-center justify-center gap-x-2 gap-y-2 border-y border-gray-200 px-2 py-2 shadow-xl marker:z-[500] dark:border-gray-600 tablet:flex-row tablet:gap-y-0 tablet:px-0",
      )}
    >
      <PharmacyToggleButtons
        searchType={searchType}
        setSearchType={setSearchType}
      />
      {searchType === "nearby" ? (
        <RadiusSliderNOSSR
          radiusQuery={radiusQuery}
          onRadiusChange={setRadiusQuery}
        />
      ) : (
        <>
          <CitySearch
            cityQuery={cityQuery}
            cityLabel={cityLabel}
            onCityChange={setCityQuery}
          />
        </>
      )}
      <DutyStatus
        timeQuery={timeQuery}
        onTimeChange={setTimeQuery}
        searchType={searchType}
      />
    </div>
  );
}
