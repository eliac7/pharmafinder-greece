"use client";

import { useFilters } from "@/context/FiltersContext";
import { IPharmacy } from "@/lib/interfaces";
import clsx from "clsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DynamicPharmacyMap } from "./Index";
import PharmacyList from "./PharmacyList";

interface IMainDataContainerProps {
  pharmacies: IPharmacy[];
  count?: number;
  isLoading?: boolean;
  isError: boolean;
  error: Error | null;
}

function MainDataContainer({
  pharmacies,
  count,
  isError,
  error,
}: IMainDataContainerProps) {
  const { isListExpandedMobile, isListVisible, setSelectedPharmacy } =
    useFilters();

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
  }, [isError, error, setSelectedPharmacy]);

  // Auto-select the pharmacy if there's only one
  useEffect(() => {
    if (pharmacies.length === 0) {
      setSelectedPharmacy(null);
    } else if (pharmacies.length === 1) {
      setSelectedPharmacy(pharmacies[0]);
    } else if (pharmacies.length > 1) {
      setSelectedPharmacy(null);
    }
  }, [pharmacies, setSelectedPharmacy]);

  const [isHoveringHideButton, setIsHoveringHideButton] = useState(false);

  return (
    <div className="relative mx-auto flex h-full w-full flex-col overflow-hidden transition-all duration-500 md:flex-row">
      <div
        className={clsx(
          "absolute bottom-0 left-0 right-0 z-[1100] transform rounded-t-xl bg-white opacity-100 transition-all duration-100 ease-in-out dark:bg-gray-800 dark:text-white md:static md:z-0 md:h-full md:w-1/3 md:rounded-t-none",
          isListVisible
            ? "max-w-[100%] opacity-100 md:max-w-[50%]"
            : "m-0 max-w-0 opacity-0",
          isListExpandedMobile ? "h-[60vh]" : "h-[10vh]",
          isHoveringHideButton && "opacity-50",
        )}
      >
        <PharmacyList
          pharmacies={pharmacies}
          count={count || pharmacies.length}
        />
      </div>

      <div className="relative h-full w-full transition-all duration-500">
        <DynamicPharmacyMap
          pharmacies={pharmacies}
          isHoveringHideButton={isHoveringHideButton}
          setIsHoveringHideButton={setIsHoveringHideButton}
        />
      </div>
    </div>
  );
}

export default MainDataContainer;
