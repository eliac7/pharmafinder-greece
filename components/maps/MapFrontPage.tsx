"use client";

import { useRouter } from "next/navigation";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { topCities } from "@/data/topCities";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import MarkerClusterGroup from "react-leaflet-cluster";
import { customMarker } from "./PharmacyMarker";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import { useEffect } from "react";

const MapController = () => {
  const map = useMap();

  useEffect(() => {
    map.addHandler("gestureHandling", GestureHandling);
    // @ts-expect-error typescript does not see additional handler here
    map.gestureHandling.enable();
  }, [map]);

  return null;
};

export default function MapFrontPage() {
  const router = useRouter();
  const { theme } = useTheme();

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
    <div className="h-[35rem] w-full overflow-hidden rounded-lg">
      <MapContainer
        center={[37.98381, 23.727539]}
        zoomControl={false}
        zoom={5}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url={getTileLayerUrl()}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
        />
        <MarkerClusterGroup chunkedLoading>
          {topCities.map((city) => (
            <Marker
              key={city.name}
              position={[city.latitude, city.longitude]}
              icon={customMarker}
            >
              <Popup
                className="text-center"
                minWidth={200}
                maxWidth={200}
                autoPan={false}
              >
                <div className="flex flex-col items-center justify-center rounded-lg bg-white">
                  <h1 className="text-lg font-bold">{city.name}</h1>
                  <button
                    className="my-2 rounded-md bg-primary-700 px-4 py-2 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={() => {
                      router.push(
                        `/app?time=now&searchType=city&city=${city.url_name}`,
                      );
                    }}
                  >
                    Επιλογή
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
        <MapController />
      </MapContainer>
    </div>
  );
}
