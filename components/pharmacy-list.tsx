"use client";

import { IPharmacy } from "@/lib/interfaces";
import { cn, formatGreekPhoneNumber, formatKM } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { GiPathDistance } from "react-icons/gi";

interface IPharmacyListProps {
  pharmacies: IPharmacy[];
  count?: number;
  selectedPharmacy?: IPharmacy | null;
  setSelectedPharmacy: (pharmacy: IPharmacy | null) => void;
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

  const toggleExpand = (
    event: React.MouseEvent<HTMLButtonElement>,
    pharmacy: IPharmacy
  ) => {
    event.stopPropagation(); // Prevent triggering the list item's onClick
    if (selectedPharmacy && selectedPharmacy.address === pharmacy.address) {
      setSelectedPharmacy(null); // Deselect and collapse if the same pharmacy is clicked again
    } else {
      setSelectedPharmacy(pharmacy); // Select and expand the clicked pharmacy
    }
  };

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
              "p-2 border-b border-gray-400 border-opacity-40 bg-gray- hover:bg-gray-100 cursor-pointer rounded-lg",
              selectedPharmacy &&
                selectedPharmacy.address === pharmacy.address &&
                "bg-slate-400"
            )}
            onClick={() => {
              {
                selectedPharmacy &&
                selectedPharmacy.address === pharmacy.address
                  ? setSelectedPharmacy(null)
                  : setSelectedPharmacy(pharmacy);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start justify-center">
                <h1 className="text-xl font-semibold">{pharmacy.name}</h1>
                <p className={"my-1 text-sm text-gray-400"}>
                  {pharmacy.address.trim().split(",").slice(0, -1).join(",")}
                </p>
                {selectedPharmacy &&
                  selectedPharmacy.address === pharmacy.address && (
                    <div className="mt-2">
                      {pharmacy.phone && (
                        <p>{formatGreekPhoneNumber(pharmacy.phone)}</p>
                      )}
                      {pharmacy.distance_km && (
                        <p>
                          <GiPathDistance className="mr-1 inline-block h-8 w-8" />
                          {formatKM(pharmacy.distance_km)}
                        </p>
                      )}

                      {/* ... display other details ... */}
                    </div>
                  )}
                <button
                  onClick={(event) => toggleExpand(event, pharmacy)}
                  className="rounded-lg bg-primary-800 px-4 py-2 font-semibold text-white hover:bg-primary-700"
                >
                  {selectedPharmacy &&
                  selectedPharmacy.address === pharmacy.address
                    ? "Less"
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
