"use client";

import Link from "next/link";
import { useLocationContext } from "@/context/LocationContext";
import { FaArrowRight } from "react-icons/fa";
import LinkButton from "../LinkButton";

export default function HeroText() {
  const { latitude, longitude } = useLocationContext().location;

  return (
    <div className="mt-10 flex items-center justify-center gap-x-6">
      <LinkButton
        href={
          latitude && longitude
            ? "/app?radius=3&time=now"
            : `/app?time=now&layer=road&searchType=city`
        }
      >
        {latitude && longitude
          ? "Βρείτε φαρμακεία κοντά σας"
          : "Βρείτε φαρμακεία στην πόλη σας"}{" "}
        <FaArrowRight className="hidden h-4 w-4 tablet:ml-2 tablet:inline-block" />
      </LinkButton>
    </div>
  );
}
