"use client";

import useFullscreenStatus from "@/hooks/useFullscreenStatus";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { useMap } from "react-leaflet";

interface IToggleListButton {
  toggleListVisibility: (isVisible: boolean) => void;
  isListVisible: boolean;
  isHoveringHideButton: boolean;
  setIsHoveringHideButton: (value: boolean) => void;
}

const ToggleListButton = ({
  toggleListVisibility,
  isListVisible,
  isHoveringHideButton,
  setIsHoveringHideButton,
}: IToggleListButton) => {
  const isFullscreen = useFullscreenStatus();
  const map = useMap();

  const handleClick = () => {
    toggleListVisibility(!isListVisible);
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  if (isFullscreen) {
    return null;
  }

  const handleMouseEnter = () => {
    setIsHoveringHideButton(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringHideButton(false);
  };

  const label = isListVisible ? "Απόκρυψη λίστας" : "Εμφάνιση λίστας";

  return (
    <button
      className={cn(
        "absolute left-2 top-1/2  z-[1000] hidden rounded-lg transition-all duration-500 md:block",
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={label}
      title={label}
    >
      <div className="relative flex h-[72px] w-8 items-center justify-center transition-opacity duration-100">
        <div className="flex h-8 w-8 flex-col items-center justify-center rounded-full bg-complementary-400 text-center">
          <div
            className={clsx(
              "translate-z-0 h-3 w-1 translate-y-[0.15rem] transform rounded-full bg-white transition-transform duration-300 dark:bg-white",
              {
                "!rotate-0": isHoveringHideButton && isListVisible,
                "rotate-45": isListVisible,
                "-rotate-45": !isListVisible,
              },
            )}
          />
          <div
            className={clsx(
              "translate-z-0 h-3 w-1 -translate-y-[0.15rem] transform rounded-full bg-white transition-transform duration-300 dark:bg-white",
              {
                "-rotate-45 ": isListVisible,
                "rotate-0": isHoveringHideButton && isListVisible,
                "rotate-45": !isListVisible,
              },
            )}
          />
        </div>
        {isHoveringHideButton && (
          <div className="shadow-xs absolute left-10 rounded-lg bg-gray-950 p-1 px-3 text-white">
            <span className="flex items-center whitespace-pre-wrap px-2 py-1 text-center text-sm font-medium normal-case">
              {label}
            </span>
            <span className="absolute -left-1 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 transform bg-gray-950"></span>
          </div>
        )}
      </div>
    </button>
  );
};

export default ToggleListButton;
