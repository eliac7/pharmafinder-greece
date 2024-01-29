"use client";
import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useRouter } from "next/navigation";

import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { IThumbnailMapProps } from "./types";

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

  const handleClick = () => {
    if (url) {
      router.push(url);
    }
  };

  const getTileLayerUrl = () => {
    switch (theme) {
      case "light":
        return "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
      case "dark":
        return "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";
      default:
        return "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    }
  };

  return (
    <div
      className="relative h-32 w-32 overflow-hidden rounded-full tablet:h-40 tablet:w-40"
      onClick={handleClick}
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
        <TileLayer
          url={getTileLayerUrl()}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
        />
      </MapContainer>
    </div>
  );
}
