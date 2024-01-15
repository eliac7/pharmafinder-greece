"use client";
import { useLocationContext } from "@/context/LocationContext";
import { useMapMovement } from "@/hooks/mapMovementHook";
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet/dist/leaflet.css";
import { usePathname } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";
import { IMapProps, IPharmacyMapProps, IPoint } from "./interfaces";
import PharmacyMarker, { userLocationMarker } from "./pharmacy-marker";

import { ILocation } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { CiViewList } from "react-icons/ci";
import { FaLocationArrow } from "react-icons/fa";

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
}: {
  toggleListVisibility: () => void;
}) => {
  const map = useMap();

  const handleClick = () => {
    toggleListVisibility();
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  };

  return (
    <button
      className="absolute right-0 top-20 z-[1000] m-4 hidden rounded-full bg-complementary-400 p-2 shadow-md transition-all duration-300 hover:bg-complementary-500 md:block"
      onClick={handleClick}
      aria-label="Εμφάνιση/Απόκρυψη λίστας φαρμακείων"
      title="Εμφάνιση/Απόκρυψη λίστας φαρμακείων"
    >
      <CiViewList size={24} color="white" />
    </button>
  );
};

const RadiusRangeSlider = ({
  radius,
  circleRef,
  setRadiusQuery,
  is_by_city,
}: {
  radius: string | undefined;
  circleRef: React.MutableRefObject<L.Circle | null>;
  setRadiusQuery: (radius: string) => void;
  is_by_city: boolean;
}) => {
  const map = useMap();
  const [value, setValue] = useState(radius || "1");

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (map) {
      map.dragging.disable();
    }
    setValue(e.target.value);
  };

  const handleInteractionEnd = (e: React.SyntheticEvent) => {
    if (map) {
      map.dragging.enable();
    }
    setRadiusQuery(value);
    circleRef.current?.setRadius(parseFloat(value) * 1000);
  };

  return (
    <div
      className={clsx(
        "sm:top-0 absolute left-[50%] z-[500] block translate-x-[-50%] transform rounded-b-xl rounded-t-none bg-slate-600 bg-opacity-50 px-5 py-2 backdrop-blur-sm backdrop-filter dark:bg-primary-600 dark:bg-opacity-50 md:bottom-4 md:rounded-xl",
        is_by_city && "hidden"
      )}
      onMouseDown={() => map?.dragging.disable()}
      onMouseUp={handleInteractionEnd}
      onTouchEnd={handleInteractionEnd}
    >
      <label
        htmlFor="steps-range"
        className="mb-2 block text-sm font-semibold text-white"
      >
        Ακτίνα αναζήτησης: {value} χλμ
      </label>
      <input
        id="steps-range"
        type="range"
        min="1"
        max="10"
        value={value}
        step="1"
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 outline-none dark:bg-gray-700"
        onChange={handleSliderChange}
        onMouseUp={handleInteractionEnd}
      />
    </div>
  );
};

const TimeframeButtons = () => {
  enum Timeframe {
    NOW = "now",
    TODAY = "today",
    TOMORROW = "tomorrow",
  }

  const timeframeLabels: Record<Timeframe, string> = {
    [Timeframe.NOW]: "Τώρα",
    [Timeframe.TODAY]: "Σήμερα",
    [Timeframe.TOMORROW]: "Αύριο",
  };

  const [date, setDate] = useQueryState(
    "date",
    parseAsString.withDefault(Timeframe.NOW)
  );

  const timeframes: Timeframe[] = [
    Timeframe.NOW,
    Timeframe.TODAY,
    Timeframe.TOMORROW,
  ];

  const handleClick = useCallback(
    (timeframe: Timeframe) => {
      setDate(timeframe);
    },
    [setDate]
  );

  return (
    <div className="sm:top-0 absolute left-[50%] z-[500] flex translate-x-[-50%] transform gap-2 rounded-b-xl rounded-t-none bg-slate-600 bg-opacity-50 p-1 backdrop-blur-sm backdrop-filter dark:bg-primary-600 dark:bg-opacity-50 md:bottom-4 md:rounded-xl md:px-5 md:py-2">
      {timeframes.map((timeframe) => (
        <button
          key={timeframe}
          className={clsx(
            "block text-sm font-semibold text-white p-2 rounded-lg transition-all duration-300",
            date !== timeframe && "hover:bg-white hover:bg-opacity-10",
            date === timeframe && "bg-primary-900"
          )}
          onClick={() => handleClick(timeframe)}
        >
          {timeframeLabels[timeframe]}
        </button>
      ))}
    </div>
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
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());

  // We use the useMapEvents hook to access the map instance so we can keep track of the current zoom level
  useMapEvents({
    zoomend: () => {
      setCurrentZoom(map.getZoom());
    },
  });

  const relocateUser = () => {
    if (!location.latitude || !location.longitude) {
      return;
    }
    map.setView([location.latitude, location.longitude], currentZoom);
    setIsPopupOpen(false);
  };

  return (
    <div className="absolute left-3 top-28 z-[400] transition-all duration-300">
      <button
        className={cn(
          "rounded-full bg-white p-2 shadow-md hover:bg-gray-100",
          isPopupOpen && "bg-slate-500 hover:bg-slate-600"
        )}
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        aria-label="Επαναϋπολόγισε ή εστίασε σην τρέχουσα τοποθεσία"
        title="Επαναϋπολόγισε ή εστίασε σην τρέχουσα τοποθεσία"
      >
        <FaLocationArrow size={16} color="black" />
      </button>

      <div
        className={cn(
          "absolute left-0 top-10 z-[401] flex cursor-auto items-center rounded-lg  text-xs font-semibold text-gray-700  duration-300 invisible opacity-0 transition-all backdrop-blur-sm backdrop-filter bg-gray-500 dark:bg-primary-600 bg-opacity-50",
          isPopupOpen && "visible opacity-100"
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

export default function PharmacyMap({
  pharmacies,
  selectedPharmacy,
  setSelectedPharmacy,
  toggleListVisibility,
  radius,
  setRadiusQuery,
}: IPharmacyMapProps) {
  const { location, updateLocation, getLocation } = useLocationContext();
  const { theme } = useTheme();

  const defaultLayer = theme === "dark" ? "dark" : "road";

  const [layerName, setLayerName] = useQueryState(
    "layer",
    parseAsString.withDefault(defaultLayer)
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
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      case "satellite":
        return "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png";
      case "dark":
        return "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
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
      <LayersControl position="topright">
        <LayersControl.BaseLayer
          name="Οδικός Χάρτης"
          checked={layerName === "road"}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains={["a", "b", "c"]}
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
            url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
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

      {radius && location.latitude && location.longitude && (
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

      <FullscreenControl />
      <ToggleListButton toggleListVisibility={toggleListVisibility} />
      {radius && setRadiusQuery && (
        <RadiusRangeSlider
          radius={radius}
          circleRef={circleRef}
          setRadiusQuery={setRadiusQuery}
          is_by_city={is_by_city}
        />
      )}
      {is_by_city && <TimeframeButtons />}
    </MapContainer>
  );
}
