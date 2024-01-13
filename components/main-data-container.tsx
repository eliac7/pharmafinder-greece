"use client";

import { useState, useEffect } from "react";
import PharmacyList from "./maps/pharmacy-list";
import { IPharmacy } from "@/lib/interfaces";
import { DynamicPharmacyMap } from "@/components/maps/";
import clsx from "clsx";
import toast from "react-hot-toast";

interface IMainDataContainerProps {
  pharmacies: IPharmacy[];
  count?: number;
  cityLabel?: string;
  isLoading?: boolean;
  radius?: string;
  setRadiusQuery?: (radius: string) => void;
  isError: any;
}

function MainDataContainer({
  pharmacies,
  count,
  radius,
  cityLabel,
  isLoading,
  setRadiusQuery,
  isError,
}: IMainDataContainerProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<IPharmacy | null>(
    null
  );
  const [isListVisible, setIsListVisible] = useState<boolean>(true);
  const [isListExpandedMobile, setIsListExpandedMobile] =
    useState<boolean>(false);

  // if there is an error, show a toast and reset the selected pharmacy
  useEffect(() => {
    if (isError) {
      if (isError instanceof Error) {
        toast.error(isError.message);
      } else {
        toast.error("Παρουσιάστηκε ένα σφάλμα. Παρακαλώ δοκιμάστε αργότερα.");
      }
      setSelectedPharmacy(null);
    }
  }, [isError]);

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
  ``;
  return (
    <div className="relative mx-auto flex h-full w-full flex-col overflow-hidden rounded-3xl transition-all duration-500 md:flex-row">
      {isLoading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm backdrop-filter dark:bg-gray-800 dark:bg-opacity-50">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white"></div>
        </div>
      )}
      <div
        className={`relative transition-all duration-500 flex-shrink-0 h-full  ${
          isListVisible ? "flex-grow w-full md:w-2/3" : "w-full"
        }`}
      >
        <DynamicPharmacyMap
          pharmacies={pharmacies}
          selectedPharmacy={selectedPharmacy}
          setSelectedPharmacy={setSelectedPharmacy}
          toggleListVisibility={toggleListVisibility}
          radius={radius}
          setRadiusQuery={setRadiusQuery}
        />
      </div>
      <div
        className={clsx(
          "bg-white p-4 transition-all duration-500 transform md:w-1/4  dark:bg-gray-800 dark:text-white absolute  left-0 z-[1100] md:z-0 right-0 md:static h-full sm:rounded-t-xl md:rounded-none",
          isListVisible
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0",
          isListExpandedMobile ? "top-[10vh]" : "top-[60vh]"
        )}
      >
        <PharmacyList
          pharmacies={pharmacies}
          count={count}
          setSelectedPharmacy={handelClickToFlyOnMap}
          selectedPharmacy={selectedPharmacy}
          cityLabel={cityLabel}
          radius={radius}
          isListExpandedMobile={isListExpandedMobile}
          setIsListExpandedMobile={setIsListExpandedMobile}
        />
      </div>
    </div>
  );
}

export default MainDataContainer;
