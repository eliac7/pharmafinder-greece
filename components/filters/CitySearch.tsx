"use client";

import { CitiesData } from "@/data/CitiesData";
import Select from "../select";

interface ICitySearchProps {
  cityQuery: string;
  cityLabel?: string;
  onCityChange: (city: string | null) => void;
}

export default function CitySearch({
  cityQuery,
  cityLabel,
  onCityChange,
}: ICitySearchProps) {
  const handleCityChange = (city: string) => {
    if (city) {
      onCityChange(city);
    } else {
      onCityChange(null);
    }
  };

  return (
    <Select
      options={CitiesData.map((city) => ({
        value: city.value,
        label: city.label,
      }))}
      searchable={true}
      initialSelection={{
        value: cityQuery,
        label: cityLabel || "Επιλέξτε πόλη...",
      }}
      onChange={(city) => handleCityChange(city.value)}
    />
  );
}
