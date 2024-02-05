"use client";
import { useState } from "react";
import { MapContainer } from "react-leaflet";
import { useRouter } from "next/navigation";

import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { IThumbnailMapProps } from "./types";
import Link from "next/link";
import CustomTileLayer from "./CustomTileLayer";
import { getTileLayerTheme } from "@/utils/mapUtilts";

export default function ThumbnailMap({
  latitude,
  longitude,
  url,
  hoverText,
  zoom,
}: IThumbnailMapProps) {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const router = useRouter();
  const { theme } = useTheme();

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <Link
      className="relative h-32 w-32 overflow-hidden rounded-full tablet:h-40 tablet:w-40"
      href={url}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering && hoverText && (
        <div className="absolute inset-0 z-[500] flex cursor-pointer select-none items-center justify-center rounded-full bg-black bg-opacity-50 p-2 text-white backdrop-blur-sm backdrop-filter first-letter:text-sm">
          {hoverText}
        </div>
      )}

      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom ? zoom : 13}
        scrollWheelZoom={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        className={`h-full w-full rounded-full ${url ? "cursor-pointer" : ""}`}
        attributionControl={false}
      >
        <CustomTileLayer layerName={getTileLayerTheme(theme)} />
      </MapContainer>
    </Link>
  );
}
