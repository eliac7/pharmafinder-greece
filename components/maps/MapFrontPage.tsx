"use client";

import greeceGeoJSON from "@/data/Greece.json";
import { topCities } from "@/data/topCities";
import L, { Polygon as LPolygon, LatLngExpression } from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import Link from "next/link";
import { MutableRefObject, useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { customMarker } from "./PharmacyMarker";

type MultiPolygonCoordinates = number[][][][];
type PolygonRefs = MutableRefObject<(LPolygon<any> | null)[]>;

const MapController = () => {
  const map = useMap();

  useEffect(() => {
    map.addHandler("gestureHandling", GestureHandling);
    // @ts-expect-error typescript does not see additional handler here
    map.gestureHandling.enable();
  }, [map]);

  return null;
};

const convertMultiPolygonToLatLngs = (
  multiPolygon: MultiPolygonCoordinates,
): LatLngExpression[][] => {
  // Iterate over each polygon in the MultiPolygon
  return multiPolygon.map(
    (polygon) =>
      // For each polygon, convert the first array of coordinates (outer boundary) to LatLngs
      polygon.map((ring) =>
        ring.map(
          (coordinatePair) =>
            new L.LatLng(coordinatePair[1], coordinatePair[0]),
        ),
      )[0],
  );
};

export default function MapFrontPage() {
  const { theme } = useTheme();
  const polyRefs: PolygonRefs = useRef([]);

  useEffect(() => {
    polyRefs.current.forEach((ref) => {
      if (ref) {
        ref.setStyle({
          color:
            theme === "dark" ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.5)",
        });
      }
    });
  }, [theme]);

  const greeceBordersLatLngs = convertMultiPolygonToLatLngs(
    greeceGeoJSON.features[0].geometry.coordinates,
  );

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
        zoom={6}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url={getTileLayerUrl()}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
        />
        {greeceBordersLatLngs.map(
          (latLngs: LatLngExpression[], index: number) => (
            <Polygon
              key={index}
              positions={latLngs}
              ref={(el) => (polyRefs.current[index] = el)}
              color={
                theme === "dark" ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.5)"
              }
            />
          ),
        )}
        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
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
                  <Link
                    className="my-2 rounded-md bg-primary-700 px-4 py-2 !text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    href={`/app?time=now&searchType=city&city=${city.url_name}`}
                  >
                    Επιλογή
                  </Link>
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
