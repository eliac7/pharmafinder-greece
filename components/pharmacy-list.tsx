"use client";

import { IPharmacy } from "@/lib/interfaces";
import {
  capitalizeFirstLetterOfEachWord,
  cn,
  formatGreekPhoneNumber,
  formatKM,
} from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { FaChevronDown, FaChevronUp, FaPhone } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import { MdOutlineSchedule } from "react-icons/md";

interface IPharmacyListProps {
  pharmacies: IPharmacy[];
  count?: number | undefined;
  selectedPharmacy?: IPharmacy | null;
  radius?: string;
  setSelectedPharmacy: (pharmacy: IPharmacy | null) => void;
  cityLabel?: string;
  isListExpandedMobile: boolean;
  setIsListExpandedMobile: (isListExpandedMobile: boolean) => void;
}

function PharmacyList({
  pharmacies,
  count,
  selectedPharmacy,
  cityLabel,
  setSelectedPharmacy,
  isListExpandedMobile,
  setIsListExpandedMobile,
  radius,
}: IPharmacyListProps) {
  type Refs = Record<string, HTMLLIElement | null>;

  const itemRefs = useRef<Refs>({});
  const listContainerRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();
  const isCityPage = pathname.includes("/city/");
  const isNowPage = pathname.includes("/now");

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

  const countLabel =
    count === undefined || count === null
      ? "0 φαρμακεία"
      : count === 1
      ? `${count} φαρμακείο`
      : `${count} φαρμακεία`;

  const toggleExpand = (
    event: React.MouseEvent<HTMLButtonElement>,
    pharmacy: IPharmacy
  ) => {
    event.stopPropagation(); // Prevent triggering the list item's onClick
    if (selectedPharmacy && selectedPharmacy.name === pharmacy.name) {
      setSelectedPharmacy(null); // Deselect and collapse if the same pharmacy is clicked again
    } else {
      setSelectedPharmacy(pharmacy); // Select and expand the clicked pharmacy
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <span
        className={cn(
          "absolute -top-10 flex md:hidden cursor-pointer items-center justify-center rounded-full bg-gray-200 p-2 hover:bg-gray-500 transition-all duration-300",
          isListExpandedMobile && "bg-slate-500 text-white"
        )}
        onClick={() => {
          setIsListExpandedMobile(!isListExpandedMobile);
        }}
      >
        {isListExpandedMobile ? (
          <FaChevronDown color="white" size={20} />
        ) : (
          <FaChevronUp color="black" size={20} />
        )}
      </span>

      <span className="mb-2 rounded-full bg-primary-800 px-4 py-2 text-center font-sans text-sm font-semibold text-white no-underline shadow-md focus:outline-none">
        {isCityPage
          ? `${countLabel} στην περιοχή ${cityLabel ? cityLabel : "σας"}`
          : `${countLabel} στην περιοχή σας σε ακτίνα ${radius} χλμ.`}
      </span>

      <ul
        ref={listContainerRef}
        className="scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 dark:scrollbar-thumb-opacity-50 scrollbar-track-rounded-full relative m-0 h-full w-full list-none overflow-y-scroll p-2 text-lg font-medium leading-8 text-gray-700 scrollbar-thin scrollbar-track-complementary-400 scrollbar-thumb-slate-500 dark:text-gray-300 dark:scrollbar-track-complementary-700 dark:scrollbar-thumb-slate-400"
      >
        {pharmacies.map((pharmacy) => (
          <li
            ref={(el) => (itemRefs.current[pharmacy.name] = el)}
            key={`${pharmacy.name}-${pharmacy.address}`}
            className={cn(
              "py-2 mb-1  border-2 border-gray-400 border-opacity-40 dark:hover:bg-slate-900 hover:bg-primary-100 cursor-pointer rounded-lg",
              selectedPharmacy &&
                selectedPharmacy.name === pharmacy.name &&
                "bg-primary-400 dark:bg-gray-700 hover:bg-opacity-100"
            )}
            onClick={() => {
              {
                selectedPharmacy && selectedPharmacy.name === pharmacy.name
                  ? setSelectedPharmacy(null)
                  : setSelectedPharmacy(pharmacy);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex w-full flex-col items-start justify-center gap-1 px-1">
                <h1 className="break-all text-sm font-semibold semilg:text-lg">
                  {capitalizeFirstLetterOfEachWord(pharmacy.name)}
                </h1>
                <p
                  className={cn(
                    "text-gray-500 text-sm",
                    selectedPharmacy &&
                      selectedPharmacy.name === pharmacy.name &&
                      "text-white"
                  )}
                >
                  {pharmacy.address.trim().split(",").slice(0, -1).join(",")}
                </p>
                {pharmacy.distance_km && (
                  <p>
                    <GiPathDistance className="mr-1 inline-block h-8 w-8" />
                    {formatKM(pharmacy.distance_km)}
                  </p>
                )}
                {selectedPharmacy &&
                  selectedPharmacy.name === pharmacy.name && (
                    <div className="mt-2">
                      {pharmacy.phone && (
                        <div className="flex items-center justify-start">
                          <FaPhone className="mr-2" />
                          <a
                            href={`tel:${pharmacy.phone}`}
                            className="font-semibold text-gray-500 underline hover:text-gray-900 dark:text-white dark:hover:text-gray-300"
                          >
                            {formatGreekPhoneNumber(pharmacy.phone)}
                          </a>
                        </div>
                      )}
                      {pharmacy.data_hours && (
                        <div className="flex-col items-center justify-start">
                          {(() => {
                            const lastIndex = pharmacy.data_hours.length - 1;
                            return pharmacy.data_hours.map((hours, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-start"
                              >
                                <MdOutlineSchedule className="mr-2" />
                                {hours.open_time} - {hours.close_time} {""}
                                {index === lastIndex &&
                                  pharmacy.open_until_tomorrow &&
                                  (pharmacy.next_day_close_time
                                    ? new Intl.DateTimeFormat("el-GR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "2-digit",
                                      }).format(
                                        new Date(pharmacy.next_day_close_time)
                                      )
                                    : "Αύριο")}
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  )}
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
