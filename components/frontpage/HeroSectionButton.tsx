"use client";

import { useLocationContext } from "@/context/LocationContext";
import { FaArrowRight } from "react-icons/fa";
import LinkButton from "../LinkButton";

export default function HeroText() {
  const { latitude, longitude } = useLocationContext().location;

  return (
    <div className="group relative flex transform items-center justify-center gap-x-6">
      <LinkButton
        href={
          latitude && longitude
            ? "/app?radius=3&time=now"
            : `/app?time=now&layer=road&searchType=city`
        }
        className="!p-4"
      >
        <span>
          {latitude && longitude
            ? "Βρείτε φαρμακεία κοντά σας"
            : "Βρείτε φαρμακεία στην πόλη σας"}
        </span>
        <FaArrowRight className="inline-block opacity-100 transition-transform duration-300 ease-in-out group-hover:translate-x-2 tablet:ml-2" />
      </LinkButton>
    </div>
  );
}
