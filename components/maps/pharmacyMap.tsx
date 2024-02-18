"use client";
import { useLocationContext } from "@/context/LocationContext";
import { useMapMovement } from "@/hooks/useMapMovement";
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet/dist/leaflet.css";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";
import PharmacyMarker, { userLocationMarker } from "./PharmacyMarker";
import { IMapProps, IPharmacyMapProps, IPoint } from "./types";

import { useFilters } from "@/context/FiltersContext";
import { ILocation } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { FaFilter, FaLocationArrow } from "react-icons/fa";
import TileLayerComponent from "./CustomTileLayer";

const POI: React.FC<IMapProps> = ({ selectedPharmacy }) => {
  const map = useMap();
  useMapMovement(map, selectedPharmacy);
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
  isHoveringHideButton,
  setIsHoveringHideButton,
}: {
  toggleListVisibility: (isVisible: boolean) => void;
  isListVisible: boolean;
  isHoveringHideButton: boolean;
  setIsHoveringHideButton: (value: boolean) => void;
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
    toggleListVisibility(!isListVisible);
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  };

  if (isFullscreen) {
    return null;
  }

  const handleMouseEnter = () => {
    setIsHoveringHideButton(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringHideButton(false);
  };

  const label = isListVisible ? "Απόκρυψη λίστας" : "Εμφάνιση λίστας";

  return (
    <button
      className={cn(
        "absolute left-2 top-1/2  z-[1000] hidden rounded-lg transition-all duration-500 md:block",
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={label}
      title={label}
    >
      <div className="relative flex h-[72px] w-8 items-center justify-center transition-opacity duration-100">
        <div className="flex h-8 w-8 flex-col items-center justify-center rounded-full bg-complementary-400 text-center">
          <div
            className={clsx(
              "translate-z-0 h-3 w-1 translate-y-[0.15rem] transform rounded-full bg-white transition-transform duration-300 dark:bg-white",
              {
                "!rotate-0": isHoveringHideButton && isListVisible,
                "rotate-45": isListVisible,
                "-rotate-45": !isListVisible,
              },
            )}
          />
          <div
            className={clsx(
              "translate-z-0 h-3 w-1 -translate-y-[0.15rem] transform rounded-full bg-white transition-transform duration-300 dark:bg-white",
              {
                "-rotate-45 ": isListVisible,
                "rotate-0": isHoveringHideButton && isListVisible,
                "rotate-45": !isListVisible,
              },
            )}
          />
        </div>
        {isHoveringHideButton && (
          <div className="shadow-xs absolute left-10 rounded-lg bg-gray-950 p-1 px-3 text-white">
            <span className="flex items-center whitespace-pre-wrap px-2 py-1 text-center text-sm font-medium normal-case">
              {label}
            </span>
            <span className="absolute -left-1 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 transform bg-gray-950"></span>
          </div>
        )}
      </div>
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

const ToggleFilterButton = () => {
  const map = useMap();
  const { isFilterOpen, setIsFilterOpen } = useFilters();

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  let label = {
    open: "Εμφάνιση φίλτρων",
    close: "Απόκρυψη φίλτρων",
  };

  return (
    <div
      onClick={toggleFilter}
      className={clsx(
        "group absolute left-2 top-7 z-[1000] cursor-pointer rounded-lg bg-white p-2 shadow-md transition-all duration-300 hover:bg-complementary-400",
        {
          "!bg-complementary-400": isFilterOpen,
        },
      )}
    >
      <button
        className="block md:block"
        aria-label={isFilterOpen ? label.close : label.open}
        title={isFilterOpen ? label.close : label.open}
      >
        <FaFilter size={20} color={isFilterOpen ? "white" : "black"} />
      </button>
      <div className="shadow-xs invisible absolute -top-2.5 left-12 rounded-lg bg-gray-950 p-1 px-3 text-white group-hover:visible">
        <span className="flex items-center whitespace-pre-wrap px-2 py-1 text-center text-sm font-medium normal-case">
          {label[isFilterOpen ? "close" : "open"]}
        </span>
        <span className="absolute -left-1 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 transform bg-gray-950"></span>
      </div>
    </div>
  );
};

export default function PharmacyMap({
  pharmacies,
  isHoveringHideButton,
  setIsHoveringHideButton,
}: IPharmacyMapProps) {
  const {
    radiusQuery: radius,
    searchType,
    selectedPharmacy,
    setSelectedPharmacy,
    isListVisible,
    setIsListVisible,
  } = useFilters();

  const { location, updateLocation, getLocation } = useLocationContext();
  const { resolvedTheme } = useTheme();

  const [layerName, setLayerName] = useQueryState<string>(
    "layer",
    parseAsString.withDefault(resolvedTheme === "dark" ? "dark" : "road"),
  );

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setStyle({
        color: layerName === "dark" ? "#6c8e8c" : "#d9534f ",
      });
    }
  }, [resolvedTheme, layerName]);

  const markerRefs = useRef(new Map());
  const circleRef = useRef<L.Circle | null>(null);

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

  return (
    <MapContainer
      center={circleCenter}
      zoom={16}
      scrollWheelZoom={true}
      attributionControl={false}
      className="h-full w-full"
      maxZoom={18}
    >
      <LayersControl position="bottomright">
        <LayersControl.BaseLayer
          name="Οδικός Χάρτης"
          checked={layerName === "road"}
        >
          <TileLayerComponent
            layerName={layerName}
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
          <TileLayerComponent
            layerName={layerName}
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
          <TileLayerComponent
            layerName={layerName}
            eventHandlers={{
              add: () => {
                setLayerName("dark");
              },
            }}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <TileLayerComponent layerName={layerName} />

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
            radius={radius * 1000}
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
        toggleListVisibility={setIsListVisible}
        isListVisible={isListVisible}
        isHoveringHideButton={isHoveringHideButton}
        setIsHoveringHideButton={setIsHoveringHideButton}
      />

      <ToggleFilterButton />
    </MapContainer>
  );
}
