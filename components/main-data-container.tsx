"use client";

import { useState, useEffect } from "react";
import PharmacyList from "./pharmacy-list";
import { IPharmacy } from "@/lib/interfaces";
import { DynamicPharmacyMap } from "@/components/maps/";

function MainDataContainer({
  pharmacies,
  count,
  radius,
  cityLabel,
}: {
  pharmacies: IPharmacy[];
  count?: number;
  radius?: string;
  cityLabel?: string;
  isLoading?: boolean;
}) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<IPharmacy | null>(
    null
  );
  const [isListVisible, setIsListVisible] = useState(true);

  // Auto-select the pharmacy if there's only one
  useEffect(() => {
    if (pharmacies.length === 1) {
      setSelectedPharmacy(pharmacies[0]);
    }
  }, [pharmacies]);

  const handelClickToFlyOnMap = (pharmacy: IPharmacy | null) => {
    setSelectedPharmacy(pharmacy);
  };

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible);
  };

  return (
    <div className="mx-auto flex h-screen w-full overflow-hidden rounded-3xl transition-all duration-500">
      <div
        className={`flex-grow transition-all duration-500 ${
          isListVisible ? "w-2/3" : "w-full"
        } bg-blue-300`}
      >
        <DynamicPharmacyMap
          pharmacies={pharmacies}
          selectedPharmacy={selectedPharmacy}
          setSelectedPharmacy={setSelectedPharmacy}
          radius={radius}
          toggleListVisibility={toggleListVisibility}
        />
      </div>
      {isListVisible && (
        <div className="bg-white p-4 transition-all duration-100 md:w-1/3">
          <PharmacyList
            pharmacies={pharmacies}
            count={count}
            setSelectedPharmacy={handelClickToFlyOnMap}
            selectedPharmacy={selectedPharmacy}
            cityLabel={cityLabel}
            radius={radius}
          />
        </div>
      )}
    </div>
  );
}

export default MainDataContainer;
