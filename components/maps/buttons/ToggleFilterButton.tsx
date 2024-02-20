import { useFilters } from "@/context/FiltersContext";
import useFullscreenStatus from "@/hooks/useFullscreenStatus";
import clsx from "clsx";
import { FaFilter } from "react-icons/fa";
import { useMap } from "react-leaflet";

const ToggleFilterButton = () => {
  const isFullscreen = useFullscreenStatus();
  const map = useMap();
  const { isFilterOpen, setIsFilterOpen } = useFilters();

  const toggleFilter = () => {
    if (!isFullscreen) {
      setIsFilterOpen(!isFilterOpen);
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  };

  let label = isFilterOpen ? "Απόκρυψη φίλτρων" : "Εμφάνιση φίλτρων";
  return (
    <div
      onClick={toggleFilter}
      className={clsx(
        "group absolute left-2 top-7 z-[1000] cursor-pointer rounded-lg bg-white p-2 shadow-md transition-all duration-300 hover:bg-complementary-400",
        {
          "!bg-complementary-400": isFilterOpen,
          hidden: isFullscreen,
        },
      )}
    >
      <button className="block md:block" aria-label={label} title={label}>
        <FaFilter size={20} color={isFilterOpen ? "white" : "black"} />
      </button>
      <div className="shadow-xs invisible absolute -top-2.5 left-12 rounded-lg bg-gray-950 p-1 px-3 text-white group-hover:visible">
        <span className="flex items-center whitespace-pre-wrap px-2 py-1 text-center text-sm font-medium normal-case">
          {label}
        </span>
        <span className="absolute -left-1 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 transform bg-gray-950"></span>
      </div>
    </div>
  );
};

export default ToggleFilterButton;
