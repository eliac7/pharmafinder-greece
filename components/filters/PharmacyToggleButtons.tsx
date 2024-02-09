import { useLocationContext } from "@/context/LocationContext";
import clsx from "clsx";
import { useEffect, useState } from "react";

type SearchType = "nearby" | "city";

interface IPharmacyToggleButtonsProps {
  searchType: SearchType;
  setSearchType: (searchType: SearchType) => void;
}

function PharmacyToggleButtons({
  searchType,
  setSearchType,
}: IPharmacyToggleButtonsProps) {
  const { location } = useLocationContext();
  const [isNearbyButtonDisabled, setIsNearbyButtonDisabled] = useState(
    location?.latitude === null || location?.longitude === null,
  );

  useEffect(() => {
    const isDisabled =
      location?.latitude === null || location?.longitude === null;
    setIsNearbyButtonDisabled(isDisabled);
  }, [location]);

  const toggleNearbyView = () => {
    if (isNearbyButtonDisabled) return;
    setSearchType("nearby");
  };

  const toggleCityView = () => {
    setSearchType("city");
  };

  const commonButtonClasses =
    "relative flex-1 flex items-center justify-center cursor-pointer text-md text-center text-gray-900 dark:text-gray-400 py-[0.2rem]";
  const activeButtonClasses =
    "border-primary-700 bg-primary-400 text-white dark:text-white";
  const hoverButtonClasses =
    "hover:bg-primary-100 dark:hover:bg-gray-700 hover:text-white hover:dark:text-gray-200 ";

  const getButtonClasses = (buttonType: SearchType) => {
    const isDisabled = buttonType === "nearby" && isNearbyButtonDisabled;
    const hoverClasses = isDisabled ? "" : hoverButtonClasses;
    return clsx(
      commonButtonClasses,
      searchType === buttonType ? activeButtonClasses : hoverClasses,
      searchType === buttonType &&
        (buttonType === "nearby"
          ? "rounded-bl-lg rounded-tl-lg"
          : "rounded-br-lg rounded-tr-lg"),
      isDisabled && "!cursor-not-allowed bg-gray-500 opacity-50",
    );
  };

  return (
    <div
      role="tablist"
      className="relative flex h-full w-full overflow-hidden rounded-lg border border-primary-700 shadow-sm dark:border-gray-600 tablet:max-w-[15rem]"
    >
      <div
        role="tab"
        aria-selected={searchType === "nearby"}
        aria-disabled={isNearbyButtonDisabled}
        className={getButtonClasses("nearby")}
        onClick={toggleNearbyView}
      >
        Κοντά μου
      </div>
      <div
        role="tab"
        aria-selected={searchType === "city"}
        className={getButtonClasses("city")}
        onClick={toggleCityView}
      >
        Ανά πόλη
      </div>
    </div>
  );
}

export default PharmacyToggleButtons;
