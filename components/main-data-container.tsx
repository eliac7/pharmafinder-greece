"use client";

import { useState } from "react";
import PharmacyList from "./pharmacy-list";
import { IPharmacy } from "@/lib/interfaces";
import { PharmacyMap } from "@/components/maps/";

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
}) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<IPharmacy | null>(
    null
  );

  const handelClickToFlyOnMap = (pharmacy: IPharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  return (
    <div className="mx-auto grid h-full max-h-[800px] w-full max-w-[95%] grid-cols-3 gap-4 overflow-hidden rounded-3xl border">
      <div className="bg-gray-200 p-4">
        <PharmacyList
          pharmacies={pharmacies}
          count={count}
          setSelectedPharmacy={handelClickToFlyOnMap}
          selectedPharmacy={selectedPharmacy}
          cityLabel={cityLabel}
        />
      </div>
      <div className="col-span-2 bg-blue-300">
        <PharmacyMap
          pharmacies={pharmacies}
          selectedPharmacy={selectedPharmacy}
          setSelectedPharmacy={setSelectedPharmacy}
          radius={radius}
        />
      </div>
    </div>
  );
}

export default MainDataContainer;
