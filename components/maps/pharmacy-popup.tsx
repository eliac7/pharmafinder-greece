import { IPharmacy } from "@/lib/interfaces";
import { formatGreekPhoneNumber } from "@/lib/utils";
import React from "react";

function PharmacyPopUpProps({
  name,
  address,
  phone,
  latitude,
  longitude,
}: Partial<IPharmacy>) {
  return (
    <div className="flex flex-col rounded-lg bg-slate-500 p-4 shadow-lg">
      <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-950 dark:text-neutral-50">
        {name}
      </h5>
      <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
        {address}
      </p>
      {phone && <span>{formatGreekPhoneNumber(phone)}</span>}
      <div className="align-center mt-4 flex justify-center gap-2">
        <a
          href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-600 px-4 py-2 text-base font-medium !text-white hover:bg-slate-700"
        >
          Street View
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-600 px-4 py-2 text-base font-medium !text-white hover:bg-slate-700"
        >
          Οδηγίες
        </a>
      </div>
    </div>
  );
}

export default PharmacyPopUpProps;
