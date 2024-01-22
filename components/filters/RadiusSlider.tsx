"use client";

import { useState } from "react";
import { BiChevronDown } from "react-icons/bi";

export default function RadiusSlider({
  radiusQuery,
  onRadiusChange,
}: {
  radiusQuery: number;
  onRadiusChange: (radius: number) => void;
}) {
  const [radiusPopUpSlider, setRadiusPopUpSlider] = useState(false);
  const [tempRadius, setTempRadius] = useState(radiusQuery);

  const handleRadiusChange = (radius: number) => {
    setTempRadius(radius);
  };
  const handleRadiusChangeComplete = (radius: number) => {
    onRadiusChange(radius);
  };
  const renderStepper = () => {
    const steps = [];
    for (let i = 1; i <= 10; i++) {
      steps.push(
        <div
          key={i}
          className={`step ${tempRadius === i ? "active" : ""}`}
          style={{ left: `${(i - 1) * 10}%` }}
        >
          {i}
        </div>,
      );
    }
    return steps;
  };
  return (
    <div
      className=" relative flex h-full w-fit cursor-pointer select-none items-center justify-center rounded-lg bg-primary-600 py-2 pl-3 pr-2 text-sm leading-5 text-white transition-colors duration-300 hover:bg-primary-500"
      onClick={() => setRadiusPopUpSlider(!radiusPopUpSlider)}
    >
      {tempRadius} χλμ. <BiChevronDown className="ml-4" size={20} />
      <div
        className={`absolute left-0 top-10  z-[1000] flex h-10 w-32 flex-col items-center justify-center rounded-lg  bg-primary-300 text-white ${
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
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-red-500 dark:bg-gray-700"
          onTouchStart={() => setRadiusPopUpSlider(true)}
          onTouchEnd={() => setRadiusPopUpSlider(false)}
        />
      </div>
    </div>
  );
}
