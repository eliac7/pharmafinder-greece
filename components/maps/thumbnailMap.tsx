"use client";
import { useLocationContext } from "@/context/LocationContext";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

export default function ThumbnailMap() {
  const { location } = useLocationContext();

  if (!location.latitude || !location.longitude) {
    return null;
  }

  const UserLocationView = () => {
    const map = useMap();
    const { location } = useLocationContext();

    useEffect(() => {
      if (location.latitude && location.longitude) {
        map.setView([location.latitude, location.longitude], 13);
      }
    }, [location, map]);

    return null;
  };

  return (
    <div className="h-40 w-40 overflow-hidden rounded-full">
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={15}
        scrollWheelZoom={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        style={{ height: "150px", width: "150px" }}
        className="rounded-full"
        attributionControl={false}
      >
        <TileLayer
          url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          attribution=""
        />

        {location.latitude && location.longitude && (
          <Marker
            position={[location.latitude, location.longitude]}
            interactive={false}
          />
        )}

        <UserLocationView />
      </MapContainer>
    </div>
  );
}
