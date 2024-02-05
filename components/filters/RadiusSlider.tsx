"use client";

import { useEffect, useState } from "react";
import { FaChevronCircleDown } from "react-icons/fa";

export default function RadiusSlider({
  radiusQuery,
  onRadiusChange,
}: {
  radiusQuery: number;
  onRadiusChange: (radius: number) => void;
}) {
  const [radiusPopUpSlider, setRadiusPopUpSlider] = useState<boolean>(false);
  const [tempRadius, setTempRadius] = useState<number>(radiusQuery);

  const handleRadiusChange = (radius: number) => {
    setTempRadius(radius);
  };
  const handleRadiusChangeComplete = (radius: number) => {
    onRadiusChange(radius);
  };

  useEffect(() => {
    setTempRadius(radiusQuery);
    onRadiusChange(radiusQuery);
  }, [radiusQuery, onRadiusChange]);

  const renderStepper = () => {
    const steps = [];
    for (let i = 1; i <= 10; i++) {
      steps.push(
        <div
          key={i}
          className={`step ml-2 text-gray-300 ${tempRadius === i ? "active font-semibold text-white" : ""}`}
        >
          {i}
        </div>,
      );
    }
    return steps;
  };
  return (
    <div
      className="relative flex  h-full w-full cursor-pointer select-none items-center justify-between rounded-lg bg-primary-600 py-2 pl-3 pr-2 text-sm leading-5 text-white transition-colors duration-300 hover:bg-primary-500 tablet:w-fit tablet:justify-center"
      onClick={() => setRadiusPopUpSlider(!radiusPopUpSlider)}
    >
      <div className="block tablet:hidden"></div>
      <span>{tempRadius} χλμ.</span>
      <FaChevronCircleDown className="h-5 w-5 text-gray-300 tablet:ml-4" />
      <div
        className={`absolute left-1/2 top-20 z-[1000] flex h-16 w-60 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded-lg bg-cyan-950 px-2 text-white tablet:left-0 tablet:top-12  tablet:-translate-x-0 tablet:-translate-y-0 ${
          radiusPopUpSlider ? "block" : "hidden"
        }`}
      >
        <div className="stepper flex w-full justify-between">
          {renderStepper()}
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={tempRadius}
          onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
          onMouseUp={() => handleRadiusChangeComplete(tempRadius)}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-emerald-600 dark:bg-gray-700"
          onTouchStart={(e: React.TouchEvent<HTMLInputElement>) =>
            handleRadiusChange(
              parseInt((e.currentTarget as HTMLInputElement).value),
            )
          }
          onTouchEnd={() => {
            handleRadiusChangeComplete(tempRadius);
            setRadiusPopUpSlider(false);
          }}
        />
      </div>
    </div>
  );
}
