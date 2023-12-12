"use client";
import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";
import { useEffect } from "react";
import { IPharmacy, IPharmacyResponse } from "@/lib/interfaces";
import { formatGreekPhoneNumber } from "@/lib/utils";
import { useLocationContext } from "@/context/LocationContext";

interface Point {
  lat: number;
  lng: number;
}

interface MapProps {
  points: Point[];
}

interface PharmacyMapProps {
  pharmacies: IPharmacy[] | null;
}

const MapView = ({ points }: MapProps) => {
  const map = useMap();
  const minZoomLevel = 16;

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p.lat, p.lng)));

      if (points.length === 1) {
        map.setView(bounds.getCenter(), minZoomLevel);
      } else {
        map.fitBounds(bounds);
      }
    }
  }, [points, map]);

  return null;
};

const PopUp = ({ name, address, phone }: Partial<IPharmacy>) => (
  <div className="flex flex-col bg-slate-500 p-4 rounded-lg shadow-lg">
    <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-950 dark:text-neutral-50">
      {name}
    </h5>
    <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
      {address}
    </p>
    {phone && <span>{formatGreekPhoneNumber(phone)}</span>}

    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${name},${address}`}
      target="_blank"
      rel="noreferrer"
      // className=" make it like a button
      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white! bg-slate-600 hover:bg-slate-700"
    >
      Directions
    </a>
  </div>
);

export default function PharmacyMap({ pharmacies }: PharmacyMapProps) {
  const { location } = useLocationContext();

  // check if pharmacies is an array
  if (!Array.isArray(pharmacies)) {
    console.error("Pharmacies is not an array", pharmacies);
    return null;
  }

  const points = pharmacies.map((pharmacy) => ({
    lat: pharmacy.latitude,
    lng: pharmacy.longitude,
  }));

  const customMarker = L.icon({
    iconUrl: "/pharmacy.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  let circleCenter = { lat: 37.957569, lng: 23.657761 };
  if (location.latitude && location.longitude) {
    circleCenter = {
      lat: location.latitude,
      lng: location.longitude,
    };
  }
  // Custom red marker for user's location
  const userLocationMarker = L.icon({
    iconUrl: "/me_myself_and_i.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <MapContainer
      center={circleCenter}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "800px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution=""
      />
      {points.map((point, index) => (
        <Marker
          position={[point.lat, point.lng]}
          key={index}
          icon={customMarker}
        >
          <Popup>
            <PopUp {...pharmacies[index]} />
          </Popup>
        </Marker>
      ))}
      <Circle center={[circleCenter.lat, circleCenter.lng]} radius={1000} />
      <MapView points={points} />

      {location.latitude && location.longitude && (
        <Marker
          position={[location.latitude, location.longitude]}
          icon={userLocationMarker}
        />
      )}
    </MapContainer>
  );
}
