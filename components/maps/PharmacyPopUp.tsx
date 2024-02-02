"use client";
import { IPharmacy } from "@/lib/interfaces";
import { formatDateInGreek, formatGreekPhoneNumber } from "@/lib/utils";
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
  data_hours,
  date,
}: Partial<IPharmacy>) {
  const [layerName] = useQueryState("layer", parseAsString.withDefault("road"));
  const isDarkMode = layerName === "dark";

  return (
    <div className="flex h-full w-full max-w-[80vw] flex-col overflow-hidden rounded-lg md:w-96 md:flex-row">
      {/* Left Column */}
      <div className="flex w-full items-center justify-center bg-primary-500 md:w-1/4">
        <Image
          src="/pharmacy_popup_logo.png"
          alt="pharmacy logo"
          width={0}
          height={0}
          sizes="100vw"
          className="h-auto w-1/4 object-contain md:w-full"
        />
      </div>
      {/* Right Column */}
      <div
        className={clsx(
          "flex w-full flex-col items-start justify-start bg-white p-3",
          isDarkMode && "bg-slate-600",
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
        {/* on duty hours*/}
        {data_hours && (
          <div className="flex flex-col gap-2">
            {data_hours.map((hour, index) => (
              <div
                key={index}
                className="flex flex-col items-start gap-2 tablet:flex-row tablet:items-center"
              >
                Εφημερεύει: {hour.open_time} - {hour.close_time}
                {date && (
                  <span className="italic">
                    <span className="hidden tablet:block">/</span>
                    {formatDateInGreek(date)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex h-full w-full items-center justify-center gap-4">
          {/* street view */}

          <a
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
            className={clsx(
              "flex items-center gap-2 rounded-lg bg-primary-200 p-2 text-sm font-semibold !text-white no-underline transition duration-300 ease-in-out hover:bg-primary-300",
              {
                "!text-gray-700": isDarkMode,
              },
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
              "flex items-center gap-2 rounded-lg bg-primary-200 p-2 text-sm font-semibold !text-white no-underline transition duration-300 ease-in-out hover:bg-primary-300 ",
              {
                "!text-gray-700": isDarkMode,
              },
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
