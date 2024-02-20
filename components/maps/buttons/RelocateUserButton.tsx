"use client";

import { ILocation } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FaLocationArrow } from "react-icons/fa";
import { useMap } from "react-leaflet";

interface IRelocateUserButton {
  getLocation: () => void;
  location: Partial<ILocation>;
}

const RelocateUserButton = ({ getLocation, location }: IRelocateUserButton) => {
  const map = useMap();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const relocateUser = () => {
    if (!location.latitude || !location.longitude) {
      return;
    }
    map.setView([location.latitude, location.longitude], 16);
    setIsPopupOpen(false);
  };

  return (
    <div className="absolute right-3 top-44 z-[400] transition-all duration-300">
      <button
        className={cn(
          "rounded-lg bg-white p-2 shadow-md hover:bg-gray-100",
          isPopupOpen && "bg-slate-500 hover:bg-slate-600",
        )}
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        aria-label="Επαναϋπολόγισε ή εστίασε σην τρέχουσα τοποθεσία"
        title="Επαναϋπολόγισε ή εστίασε σην τρέχουσα τοποθεσία"
      >
        <FaLocationArrow size={16} color="black" />
      </button>

      <div
        className={cn(
          "invisible absolute right-0 top-10 z-[401] flex cursor-auto items-center  rounded-lg bg-gray-500 bg-opacity-50  text-xs font-semibold text-gray-700 opacity-0 backdrop-blur-sm backdrop-filter transition-all duration-300 dark:bg-primary-600",
          isPopupOpen && "visible opacity-100",
        )}
      >
        <ul className="flex list-none flex-col gap-1 p-2">
          <li
            className="cursor-pointer rounded-lg bg-primary-100 p-2 hover:bg-primary-300"
            onClick={relocateUser}
          >
            Τρέχουσα
          </li>
          <li
            className="cursor-pointer rounded-lg bg-primary-100 p-2 hover:bg-primary-300"
            onClick={() => {
              getLocation();
              setIsPopupOpen(false);
            }}
          >
            Επανατοποθέτηση
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RelocateUserButton;
