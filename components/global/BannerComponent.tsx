"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { useState } from "react";
import { FaTimesCircle } from "react-icons/fa";

interface IBannerComponentProps {
  children: React.ReactNode;
}

export default function BannerComponent({ children }: IBannerComponentProps) {
  const [hasClosedBanner, setHasClosedBanner] = useLocalStorage<boolean>(
    "PHARMAFINDER_HAS_CLOSED_BANNER",
    false,
  );
  const handleCloseBanner = () => {
    setHasClosedBanner(true);
  };

  return (
    <>
      {!hasClosedBanner && (
        <div className="fixed bottom-0 z-[9999] w-full">
          <div className="flex items-center justify-between space-x-2 bg-complementary-600 p-4 text-white">
            {children}
            <button onClick={handleCloseBanner} className="float-right">
              <FaTimesCircle />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
