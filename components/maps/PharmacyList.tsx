"use client";

import { IPharmacy } from "@/lib/interfaces";
import {
  capitalizeFirstLetterOfEachWord,
  cn,
  formatGreekPhoneNumber,
  formatKM,
} from "@/lib/utils";
import { useEffect, useRef } from "react";

import { FaChevronDown, FaChevronUp, FaPhone } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import { MdOutlineSchedule } from "react-icons/md";
import { IPharmacyListProps } from "./types";
import { useFilters } from "@/context/FiltersContext";
import PharmacyListIsClosingSoon from "./PharmacyListIsClosingSoon";

const getPharmacyCountLabel = (
  count: number,
  searchType: "city" | "nearby",
  cityLabel: string | undefined,
) => {
  const baseLabel =
    searchType === "city" ? `στην πόλη ${cityLabel}` : `στην περιοχή σας`;

  if (searchType === "city" && !cityLabel) {
    return `Παρακαλώ επιλέξτε μια πόλη.`;
  }

  switch (count) {
    case 0:
      return `Δεν βρέθηκαν φαρμακεία ${baseLabel}.`;
    case 1:
      return `Βρέθηκε 1 φαρμακείο ${baseLabel}.`;
    default:
      return `Βρέθηκαν ${count} φαρμακεία ${baseLabel}.`;
  }
};

function PharmacyList({ pharmacies, count }: IPharmacyListProps) {
  type Refs = Record<string, HTMLLIElement | null>;

  const {
    cityLabel,
    searchType,
    selectedPharmacy,
    setSelectedPharmacy,
    isListExpandedMobile,
    setIsListExpandedMobile,
  } = useFilters();

  const itemRefs = useRef<Refs>({});
  const listContainerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    // Check if the selected pharmacy is set, the corresponding list item exists, and the list container is mounted
    if (
      selectedPharmacy &&
      itemRefs.current[selectedPharmacy.name] &&
      listContainerRef.current
    ) {
      const listItem = itemRefs.current[selectedPharmacy.name];
      // Ensure the list item is not null (i.e., it's actually rendered and ref is attached)

      if (listItem) {
        const listContainer = listContainerRef.current;
        // Calculate the top position of the list item within its container
        const listItemTop = listItem.offsetTop;
        // Get the height of the list item
        const listItemHeight = listItem.offsetHeight;

        /*Calculate the desired scrollTop position to center the list item in the container
        It takes into account the height of the container and the list item to adjust for the margin*/
        const scrollTopWithMargin =
          listItemTop - listContainer.offsetHeight / 2 + listItemHeight / 2;

        /*Update the scrollTop of the list container to bring the selected list item into view
          This centers the list item with some margin above and below it for better visibility*/

        listContainer.scrollTop = scrollTopWithMargin;
      }
    }
  }, [selectedPharmacy, pharmacies]);

  const toggleExpand = (
    event: React.MouseEvent<HTMLButtonElement>,
    pharmacy: IPharmacy,
  ) => {
    event.stopPropagation(); // Prevent triggering the list item's onClick
    if (selectedPharmacy && selectedPharmacy.name === pharmacy.name) {
      setSelectedPharmacy(null); // Deselect and collapse if the same pharmacy is clicked again
    } else {
      setSelectedPharmacy(pharmacy); // Select and expand the clicked pharmacy
    }
  };

  return (
    <div
      className="relative z-10 flex h-full w-full flex-col items-center justify-start gap-y-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:z-10 after:h-10 after:bg-gradient-to-t after:from-primary-100 after:to-transparent after:opacity-60 after:content-[''] dark:after:from-slate-700 dark:after:to-transparent
      "
    >
      <span
        className="absolute -top-8 z-0 flex cursor-pointer items-center justify-center rounded-full bg-slate-500 p-2 transition-all duration-300 hover:bg-gray-500 md:hidden"
        onClick={() => {
          setIsListExpandedMobile(!isListExpandedMobile);
        }}
      >
        {isListExpandedMobile ? (
          <FaChevronDown color="white" size={20} />
        ) : (
          <FaChevronUp color="white" size={20} />
        )}
      </span>

      <span className=" mx-2 mt-2 rounded-full bg-primary-800 px-4 py-2 text-center font-sans text-sm font-semibold text-white no-underline shadow-md focus:outline-none">
        {count &&
          getPharmacyCountLabel(
            count,
            searchType,
            cityLabel.split(" ").slice(0, -1).join(" "),
          )}
      </span>

      <ul
        ref={listContainerRef}
        className="scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 dark:scrollbar-thumb-opacity-50 scrollbar-track-rounded-full relative m-0 w-full list-none overflow-y-auto p-2 text-lg font-medium leading-8 text-gray-700 scrollbar-thin
        scrollbar-track-primary-100 scrollbar-thumb-primary-600 dark:text-gray-300 dark:scrollbar-track-slate-900 dark:scrollbar-thumb-slate-400 md:h-full"
      >
        {pharmacies.map((pharmacy) => (
          <li
            ref={(el) => (itemRefs.current[pharmacy.name] = el)}
            key={`${pharmacy.name}-${pharmacy.address}`}
            className={cn(
              "mb-1 cursor-pointer rounded-lg border-2 border-gray-400 border-opacity-40 py-2 hover:bg-primary-100 dark:hover:bg-slate-900",
              selectedPharmacy &&
                selectedPharmacy.name === pharmacy.name &&
                "bg-primary-400 hover:bg-opacity-100 dark:bg-gray-700",
            )}
            onClick={() => {
              {
                selectedPharmacy && selectedPharmacy.name === pharmacy.name
                  ? setSelectedPharmacy(null)
                  : setSelectedPharmacy(pharmacy);
              }
              setIsListExpandedMobile(false);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex w-full flex-col items-start justify-center gap-1 px-3">
                <h1 className="text-base font-semibold leading-6 tracking-tight">
                  {capitalizeFirstLetterOfEachWord(pharmacy.name)}
                </h1>
                <p
                  className={cn(
                    "text-sm text-gray-500",
                    selectedPharmacy &&
                      selectedPharmacy.name === pharmacy.name &&
                      "text-white",
                  )}
                >
                  {pharmacy.address.trim().split(",").slice(0, -1).join(",")}
                </p>
                <div className="flex w-full flex-col items-start justify-center">
                  {pharmacy.distance_km && (
                    <div className="flex w-full gap-1">
                      <GiPathDistance className="mr-1 inline-block h-8 w-8" />
                      <p>{formatKM(pharmacy.distance_km)}</p>
                    </div>
                  )}
                  <PharmacyListIsClosingSoon pharmacy={pharmacy} />
                  {selectedPharmacy &&
                    selectedPharmacy.name === pharmacy.name && (
                      <>
                        <div className="flex w-full gap-1">
                          {pharmacy.phone && (
                            <div className="flex items-center justify-start">
                              <FaPhone className="mr-2" />
                              <a
                                href={`tel:${pharmacy.phone}`}
                                className={cn(
                                  "font-semibold text-gray-500 underline hover:text-gray-900 dark:text-white dark:hover:text-gray-300",
                                  selectedPharmacy &&
                                    selectedPharmacy.name === pharmacy.name &&
                                    "text-gray-200",
                                )}
                              >
                                {formatGreekPhoneNumber(pharmacy.phone)}
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex w-full gap-1">
                          {pharmacy.data_hours &&
                            pharmacy.data_hours.length > 0 && (
                              <div className="flex-col items-center justify-start">
                                {pharmacy.data_hours.map((hours, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-start"
                                  >
                                    <MdOutlineSchedule className="mr-2" />
                                    <span>
                                      {hours.open_time} - {hours.close_time}
                                    </span>
                                    <span className="ml-1">
                                      {pharmacy.data_hours &&
                                        index ===
                                          pharmacy.data_hours.length - 1 &&
                                        pharmacy.open_until_tomorrow &&
                                        (pharmacy.next_day_close_time
                                          ? `(${new Intl.DateTimeFormat(
                                              "el-GR",
                                              {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "2-digit",
                                              },
                                            ).format(
                                              new Date(
                                                pharmacy.next_day_close_time,
                                              ),
                                            )})`
                                          : "(Αύριο)")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </>
                    )}
                </div>

                <button
                  onClick={(event) => toggleExpand(event, pharmacy)}
                  className="rounded-lg text-sm font-semibold text-gray-600 underline hover:text-gray-900 focus:outline-none dark:text-white dark:hover:text-gray-300"
                >
                  {selectedPharmacy && selectedPharmacy.name === pharmacy.name
                    ? "Λιγότερα"
                    : "Περισσότερα"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PharmacyList;
