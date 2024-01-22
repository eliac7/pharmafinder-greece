"use client";
import { useLocationContext } from "@/context/LocationContext";
import clsx from "clsx";

interface IPharmacyToggleButtonsProps {
  searchType: "nearby" | "city";
  setSearchType: (searchType: "nearby" | "city") => void;
}

function PharmacyToggleButtons({
  searchType,
  setSearchType,
}: IPharmacyToggleButtonsProps) {
  const { location } = useLocationContext();

  const toggleNearbyView = () => {
    if (location?.latitude === null || location?.longitude === null) {
      return;
    }
    setSearchType("nearby");
  };

  const toggleCityView = () => {
    setSearchType("city");
  };

  const commonButtonClasses =
    "flex-1 flex items-center justify-center cursor-pointer text-md text-center text-gray-900 dark:text-gray-400 py-[0.2rem]";

  const activeButtonClasses =
    "border-primary-700 bg-primary-400 text-white dark:text-white";

  return (
    <div className="relative flex h-full w-full max-w-[15rem] overflow-hidden rounded-lg border border-primary-700 shadow-sm dark:border-gray-600">
      <div
        className={clsx(
          commonButtonClasses,
          searchType === "nearby" && activeButtonClasses,
          searchType === "nearby" && "rounded-bl-lg rounded-tl-lg",
          location?.latitude === null || location?.longitude === null
            ? "cursor-not-allowed bg-gray-500 opacity-50"
            : "",
        )}
        onClick={toggleNearbyView}
        aria-disabled={
          location?.latitude === null || location?.longitude === null
        }
      >
        Κοντά μου
      </div>
      <div
        className={clsx(
          commonButtonClasses,
          searchType === "city" && activeButtonClasses,
          searchType === "city" && "rounded-br-lg rounded-tr-lg",
        )}
        onClick={toggleCityView}
      >
        Ανά πόλη
      </div>
    </div>
  );
}

export default PharmacyToggleButtons;
