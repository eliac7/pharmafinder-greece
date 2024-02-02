"use client";

import { useState, useEffect } from "react";
import PharmacyList from "./PharmacyList";
import { IPharmacy } from "@/lib/interfaces";
import clsx from "clsx";
import toast from "react-hot-toast";
import { IFiltersMobileProps } from "@/app/(routes)/app/page";
import { DynamicPharmacyMap } from "./Index";

interface IMainDataContainerProps extends IFiltersMobileProps {
  pharmacies: IPharmacy[];
  count?: number;
  cityLabel?: string;
  isLoading?: boolean;
  radius?: string;
  setRadiusQuery?: (radius: string) => void;
  isError: boolean;
  error: Error | null;
  searchType: "city" | "nearby";
}

function MainDataContainer({
  pharmacies,
  count,
  radius,
  cityLabel,
  setRadiusQuery,
  isError,
  error,
  searchType,
  isFilterMobileOpen,
  setIsFilterMobileOpen,
}: IMainDataContainerProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<IPharmacy | null>(
    null,
  );
  const [isListVisible, setIsListVisible] = useState<boolean>(true);
  const [isListExpandedMobile, setIsListExpandedMobile] =
    useState<boolean>(false);

  // if there is an error, show a toast and reset the selected pharmacy
  useEffect(() => {
    if (isError) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Παρουσιάστηκε ένα σφάλμα. Παρακαλώ δοκιμάστε αργότερα.");
      }
      setSelectedPharmacy(null);
    }
  }, [isError, error]);

  // Auto-select the pharmacy if there's only one
  useEffect(() => {
    if (pharmacies.length === 0) {
      setSelectedPharmacy(null);
    } else if (pharmacies.length === 1) {
      setSelectedPharmacy(pharmacies[0]);
    } else if (pharmacies.length > 1) {
      setSelectedPharmacy(null);
    }
  }, [pharmacies]);

  const handelClickToFlyOnMap = (pharmacy: IPharmacy | null) => {
    setSelectedPharmacy(pharmacy);
  };

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible);
  };

  return (
    <div className="relative mx-auto flex h-full w-full flex-col overflow-hidden transition-all duration-500 md:flex-row">
      <div
        className={clsx(
          "sm:rounded-t-xl absolute bottom-0 left-0 right-0 z-[1100] transform bg-white transition-all duration-500 ease-in-out dark:bg-gray-800 dark:text-white md:static md:z-0 md:h-full md:w-1/3 md:rounded-none",
          isListVisible
            ? "max-w-[100%] opacity-100 md:max-w-[50%]"
            : "m-0 max-w-0 opacity-0",
          isListExpandedMobile ? "h-[60vh]" : "h-[10vh]",
        )}
      >
        <PharmacyList
          pharmacies={pharmacies}
          count={count || pharmacies.length}
          setSelectedPharmacy={handelClickToFlyOnMap}
          selectedPharmacy={selectedPharmacy}
          cityLabel={cityLabel}
          isListExpandedMobile={isListExpandedMobile}
          setIsListExpandedMobile={setIsListExpandedMobile}
          searchType={searchType}
        />
      </div>

      <div className="relative h-full w-full transition-all duration-500">
        <DynamicPharmacyMap
          pharmacies={pharmacies}
          selectedPharmacy={selectedPharmacy}
          setSelectedPharmacy={setSelectedPharmacy}
          toggleListVisibility={toggleListVisibility}
          isListVisible={isListVisible}
          radius={radius}
          setRadiusQuery={setRadiusQuery}
          searchType={searchType}
          isFilterMobileOpen={isFilterMobileOpen}
          setIsFilterMobileOpen={setIsFilterMobileOpen}
        />
      </div>
    </div>
  );
}

export default MainDataContainer;
