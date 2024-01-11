"use client";
import { IPharmacy } from "@/lib/interfaces";
import { formatGreekPhoneNumber } from "@/lib/utils";
import Image from "next/image";
import { FaStreetView } from "react-icons/fa";
import { MdDirections, MdPhone } from "react-icons/md";
import { parseAsString, useQueryState } from "nuqs";
import clsx from "clsx";

function PharmacyPopUpProps({
  name,
  address,
  phone,
  latitude,
  longitude,
}: Partial<IPharmacy>) {
  const [layerName] = useQueryState("layer", parseAsString.withDefault("road"));
  const isDarkMode = layerName === "dark";

  return (
    <div className="flex h-full w-[380px] overflow-hidden rounded-lg">
      {/* Left Column */}
      <div className="flex w-1/4 items-center justify-center bg-primary-500">
        <Image
          src="/pharmacy_popup_logo.png"
          alt="pharmacy"
          width={100}
          height={100}
        />
      </div>
      {/* Right Column */}
      <div
        className={clsx(
          "flex w-full flex-col items-start justify-start bg-white p-3",
          isDarkMode && "bg-slate-300"
        )}
      >
        <h1 className="text-xsm font-bold text-primary-500">{name}</h1>
        <p className="text-sm text-gray-500">
          {address?.split(", ").slice(0, -2).join(", ")}
        </p>
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500"
          >
            <MdPhone size={15} />

            {formatGreekPhoneNumber(phone)}
          </a>
        )}
        <hr
          className={clsx("my-2 w-full border-gray-300", {
            "border-slate-400": isDarkMode,
          })}
        />
        <div className="flex h-full w-full items-center justify-around gap-4">
          {/* street view */}

          <a
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
            className={clsx(
              "flex items-center gap-2 rounded-lg bg-primary-200 p-2 text-sm font-semibold !text-white no-underline transition duration-300 ease-in-out hover:bg-primary-300",
              {
                "!text-gray-700": isDarkMode,
              }
            )}
          >
            <FaStreetView />
            Street View
          </a>
          {/* Directions*/}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
            className={clsx(
              "flex items-center gap-2 rounded-lg bg-primary-200 p-2 text-sm font-semibold !text-white no-underline transition duration-300 ease-in-out hover:bg-primary-300",
              {
                "!text-gray-700": isDarkMode,
              }
            )}
          >
            <MdDirections />
            Οδηγίες
          </a>
        </div>
      </div>
    </div>
  );
}

export default PharmacyPopUpProps;
