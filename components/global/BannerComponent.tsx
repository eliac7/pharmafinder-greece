"use client";

import { useState } from "react";
import ReactCountryFlag from "react-country-flag";

interface IBannerComponentProps {
  text: string;
  country?: string;
}

export default function BannerComponent({
  text,
  country,
}: IBannerComponentProps) {
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);

  return (
    <div className="fixed bottom-0 z-[9999] w-full">
      {isBannerVisible && (
        <div className="bg-red-500 p-4 text-white">
          {text}
          {country && (
            <ReactCountryFlag
              className="mx-2"
              countryCode={country}
              svg
              title={country}
            />
          )}

          <button
            onClick={() => setIsBannerVisible(false)}
            className="float-right"
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}
