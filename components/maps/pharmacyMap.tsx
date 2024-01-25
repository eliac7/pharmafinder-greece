"use client";
import { useLocationContext } from "@/context/LocationContext";
import { useMapMovement } from "@/hooks/mapMovementHook";
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet/dist/leaflet.css";
import { usePathname } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";
import PharmacyMarker, { userLocationMarker } from "./PharmacyMarker";
import { IMapProps, IPharmacyMapProps, IPoint } from "./types";

import { IFiltersMobileProps } from "@/app/(routes)/app/page";
import { ILocation } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaLocationArrow,
} from "react-icons/fa";

const POI: React.FC<IMapProps> = ({ points, selectedPharmacy }) => {
  const map = useMap();
  useMapMovement(map, points, selectedPharmacy);
  return null;
};

const MapBoundsAdjuster = ({ points }: { points: IPoint[] }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0 && points.every((p) => p.lat && p.lng)) {
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p.lat, p.lng)));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
};

const ToggleListButton = ({
  toggleListVisibility,
  isListVisible,
}: {
  toggleListVisibility: () => void;
  isListVisible: boolean;
}) => {
  const map = useMap();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = () => {
    setIsFullscreen((isFullscreen) => !isFullscreen);
  };

  useEffect(() => {
    map.on("enterFullscreen", handleFullscreenChange);
    map.on("exitFullscreen", handleFullscreenChange);

    return () => {
      map.off("enterFullscreen", handleFullscreenChange);
      map.off("exitFullscreen", handleFullscreenChange);
    };
  }, [map]);

  const handleClick = () => {
    toggleListVisibility();
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  };

  if (isFullscreen) {
    return null;
  }

  return (
    <button
      className={cn(
        "absolute left-2 top-10 z-[1000] hidden rounded-lg bg-white p-2 shadow-md transition-all duration-300 hover:bg-complementary-500 md:block",
        isListVisible && "bg-complementary-500 hover:bg-complementary-700",
      )}
      onClick={handleClick}
      aria-label={
        isListVisible
          ? "Απόκρυψη λίστας φαρμακείων"
          : "Εμφάνιση λίστας φαρμακείων"
      }
      title={
        isListVisible
          ? "Απόκρυψη λίστας φαρμακείων"
          : "Εμφάνιση λίστας φαρμακείων"
      }
    >
      {isListVisible ? (
        <FaChevronLeft size={24} color={"white"} />
      ) : (
        <FaChevronRight size={24} color={"black"} />
      )}
    </button>
  );
};

const ReloacateButton = ({
  getLocation,
  location,
}: {
  getLocation: () => void;
  location: Partial<ILocation>;
}) => {
  const map = useMap();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const relocateUser = () => {
    if (!location.latitude || !location.longitude) {
      return;
    }
    map.setView([location.latitude, location.longitude], 16);
    setIsPopupOpen(false);
  };

  return (
    <div className="absolute right-3 top-28 z-[400] transition-all duration-300">
      <button
        className={cn(
          "rounded-full bg-white p-2 shadow-md hover:bg-gray-100",
          isPopupOpen && "bg-slate-500 hover:bg-slate-600",
        )}
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        aria-label="Επαναϋπολόγισε ή εστίασε σην τρέχουσα τοποθεσία"
        title="Επαναϋπολόγισε ή εστίασε σην τρέχουσα τοποθεσία"
      >
        <FaLocationArrow size={16} color="black" />
      </button>

      <div
        className={cn(
          "invisible absolute right-0 top-10 z-[401] flex cursor-auto items-center  rounded-lg bg-gray-500 bg-opacity-50  text-xs font-semibold text-gray-700 opacity-0 backdrop-blur-sm backdrop-filter transition-all duration-300 dark:bg-primary-600",
          isPopupOpen && "visible opacity-100",
        )}
      >
        <ul className="flex list-none flex-col gap-1 p-2">
          <li
            className="cursor-pointer rounded-lg bg-primary-100 p-2 hover:bg-primary-300"
            onClick={relocateUser}
          >
            Τρέχουσα
          </li>
          <li
            className="cursor-pointer rounded-lg bg-primary-100 p-2 hover:bg-primary-300"
            onClick={() => {
              getLocation();
              setIsPopupOpen(false);
            }}
          >
            Επανατοποθέτηση
          </li>
        </ul>
      </div>
    </div>
  );
};

const ToggleFilterButton = ({
  isFilterMobileOpen,
  setIsFilterMobileOpen,
}: IFiltersMobileProps) => {
  const map = useMap();

  const toggleFilter = () => {
    setIsFilterMobileOpen(!isFilterMobileOpen);
  };

  let label = {
    open: "Εμφάνιση φίλτρων",
    close: "Απόκρυψη φίλτρων",
  };

  return (
    <button
      className={cn(
        "absolute left-2 top-10 z-[1000] block rounded-lg bg-white p-2 shadow-md transition-all duration-300 hover:bg-complementary-500 md:hidden",
        isFilterMobileOpen && "bg-primary-800 hover:bg-complementary-700",
      )}
      onClick={toggleFilter}
      aria-label={isFilterMobileOpen ? label.close : label.open}
      title={isFilterMobileOpen ? label.close : label.open}
    >
      <FaFilter size={24} color={isFilterMobileOpen ? "white" : "black"} />
    </button>
  );
};

export default function PharmacyMap({
  pharmacies,
  selectedPharmacy,
  setSelectedPharmacy,
  toggleListVisibility,
  isListVisible,
  radius,
  searchType,
  isFilterMobileOpen,
  setIsFilterMobileOpen,
}: IPharmacyMapProps) {
  const { location, updateLocation, getLocation } = useLocationContext();
  const { theme } = useTheme();

  const defaultLayer = theme === "dark" ? "dark" : "road";

  const [layerName, setLayerName] = useQueryState(
    "layer",
    parseAsString.withDefault(defaultLayer),
  );

  const pathname = usePathname().split("/")[1];
  const is_by_city = pathname === "city";

  const markerRefs = useRef(new Map());
  const circleRef = useRef<L.Circle | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setStyle({
        color: layerName === "dark" ? "#6c8e8c" : "#d9534f",
      });
    }
  }, [layerName]);

  useEffect(() => {
    setLayerName(defaultLayer);
  }, [defaultLayer, setLayerName]);

  useEffect(() => {
    if (selectedPharmacy) {
      const markerRef = markerRefs.current.get(selectedPharmacy.name);
      markerRef?.openPopup();
    } else {
      markerRefs.current.forEach((ref) => ref?.closePopup());
    }
  }, [selectedPharmacy, pharmacies]);

  const points: IPoint[] = useMemo(() => {
    if (!Array.isArray(pharmacies)) {
      return [];
    }
    return pharmacies.map((p) => ({ lat: p.latitude, lng: p.longitude }));
  }, [pharmacies]);

  let circleCenter = { lat: 37.97562008259405, lng: 23.734130859375 };
  if (location.latitude && location.longitude) {
    circleCenter = { lat: location.latitude, lng: location.longitude };
  }

  const setMap = (map: L.Map) => {
    mapRef.current = map;
  };

  const getTileLayerUrl = () => {
    switch (layerName) {
      case "road":
        return "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
      case "satellite":
        return "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png";
      case "dark":
        return "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";
      default:
        return "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    }
  };
  return (
    <MapContainer
      center={circleCenter}
      zoom={is_by_city ? 14 : 16}
      scrollWheelZoom={true}
      attributionControl={false}
      className="h-full w-full"
      ref={setMap}
      maxZoom={18}
    >
      <LayersControl position="bottomright">
        <LayersControl.BaseLayer
          name="Οδικός Χάρτης"
          checked={layerName === "road"}
        >
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
            eventHandlers={{
              add: () => {
                setLayerName("road");
              },
            }}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer
          name="Αεροφωτογραφίες"
          checked={layerName === "satellite"}
        >
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
            subdomains={["a", "b", "c"]}
            eventHandlers={{
              add: () => {
                setLayerName("satellite");
              },
            }}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer
          name="Σκοτεινός Χάρτης"
          checked={layerName === "dark"}
        >
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            subdomains={["a", "b", "c"]}
            eventHandlers={{
              add: () => {
                setLayerName("dark");
              },
            }}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <TileLayer url={getTileLayerUrl()} subdomains={["a", "b", "c"]} />

      {pharmacies && (
        <MarkerClusterGroup chunkedLoading>
          {pharmacies.map((pharmacy, index) => (
            <PharmacyMarker
              key={index}
              pharmacy={pharmacy}
              isSelected={selectedPharmacy?.name === pharmacy.name}
              onPharmacySelect={setSelectedPharmacy}
              ref={(ref) => {
                markerRefs.current.set(pharmacy.name, ref);
              }}
              closePopup={!selectedPharmacy}
            />
          ))}
        </MarkerClusterGroup>
      )}

      <POI points={points} selectedPharmacy={selectedPharmacy} />

      {location.latitude && location.longitude && (
        <>
          <Marker
            draggable={true}
            icon={userLocationMarker}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                updateLocation(position);
              },
            }}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <span className="flex justify-center rounded-lg bg-white p-3 text-center">
                Βρίσκεστε εδώ, αν θέλετε να αλλάξετε την τοποθεσία σας σύρετε το
                εικονίδιο.
              </span>
            </Popup>
          </Marker>

          <ReloacateButton getLocation={getLocation} location={location} />
        </>
      )}

      {searchType === "nearby" &&
        radius &&
        location.latitude &&
        location.longitude && (
          <Circle
            center={[location.latitude, location.longitude]}
            radius={parseFloat(radius) * 1000}
            fillOpacity={0}
            weight={2}
            ref={circleRef}
            color={layerName === "dark" ? "#6c8e8c" : "#3a515d "}
            dashArray="10,10"
          />
        )}

      <MapBoundsAdjuster points={points} />

      <FullscreenControl
        title="Εμφάνιση σε πλήρη οθόνη"
        titleCancel="Έξοδος από πλήρη οθόνη"
        position="topright"
      />

      <ToggleListButton
        toggleListVisibility={toggleListVisibility}
        isListVisible={isListVisible}
      />

      <ToggleFilterButton
        isFilterMobileOpen={isFilterMobileOpen}
        setIsFilterMobileOpen={setIsFilterMobileOpen}
      />
    </MapContainer>
  );
}
