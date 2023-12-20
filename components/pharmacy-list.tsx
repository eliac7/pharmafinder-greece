"use client";

import { IPharmacy } from "@/lib/interfaces";
import { cn, formatGreekPhoneNumber, formatKM } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface IPharmacyListProps {
  pharmacies: IPharmacy[];
  count?: number;
  selectedPharmacy?: IPharmacy | null;
  setSelectedPharmacy: (pharmacy: IPharmacy) => void;
  cityLabel?: string;
}

function PharmacyList({
  pharmacies,
  count,
  selectedPharmacy,
  cityLabel,
  setSelectedPharmacy,
}: IPharmacyListProps) {
  type Refs = Record<string, HTMLLIElement | null>;

  const itemRefs = useRef<Refs>({});
  const listContainerRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();
  const isCityPage = pathname.includes("/by_city/");

  useEffect(() => {
    // Check if the selected pharmacy is set, the corresponding list item exists, and the list container is mounted
    if (
      selectedPharmacy &&
      itemRefs.current[selectedPharmacy.address] &&
      listContainerRef.current
    ) {
      const listItem = itemRefs.current[selectedPharmacy.address];
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

  const countLabel = count === 1 ? `${count} φαρμακείο` : `${count} φαρμακεία`;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <span className="mb-2 rounded-full bg-primary-800 px-4 py-2 font-sans text-sm font-semibold text-white no-underline shadow-md focus:outline-none active:shadow-none">
        {isCityPage ? (
          <span>
            {countLabel} στην περιοχή {cityLabel}
          </span>
        ) : (
          <span>{countLabel} στην περιοχή σας</span>
        )}
      </span>
      <ul
        ref={listContainerRef}
        className="m-0 h-full max-h-[800px] w-full list-none overflow-y-scroll p-0 text-lg font-medium leading-8 text-gray-700"
      >
        {pharmacies.map((pharmacy) => (
          <li
            ref={(el) => (itemRefs.current[pharmacy.address] = el)}
            key={pharmacy.address}
            className={cn(
              "p-2 border-b border-gray-400 hover:bg-gray-100 cursor-pointer rounded-lg",
              selectedPharmacy && selectedPharmacy.address === pharmacy.address
                ? "bg-complementary-600 text-white hover:bg-gray-600"
                : ""
            )}
            onClick={() => {
              pharmacy.address == selectedPharmacy?.address && selectedPharmacy
                ? setSelectedPharmacy(null!)
                : setSelectedPharmacy(pharmacy);
            }}
          >
            {pharmacy.name}
            <br />
            {pharmacy.address}
            <br />
            {pharmacy.phone && formatGreekPhoneNumber(pharmacy.phone)}
            <br />

            {pharmacy.distance_km && (
              <span>
                {formatKM(pharmacy.distance_km)}
                <br />
              </span>
            )}

            {pharmacy.data_hours &&
              pharmacy.data_hours.map((hours, index) => (
                <span key={index}>
                  {hours.open_time} - {hours.close_time}
                  <br />
                </span>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PharmacyList;
