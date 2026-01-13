"use client";

import { useNearbyPharmacies } from "@/features/find-pharmacies/model/use-nearby-pharmacies";
import {
  MapHybridClusterLayer,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/shared/ui/map";
import { Phone, MapPin, Navigation, Cross, Clock, Eye } from "lucide-react";
import { cn } from "@/shared/lib/hooks/utils";
import {
  getPharmacyStatus,
  formatPharmacyHours,
} from "@/entities/pharmacy/lib/status";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import {
  TIME_OPTIONS,
  type TimeFilter,
  type Pharmacy,
} from "@/entities/pharmacy/model/types";
import { useMemo } from "react";

interface PharmacyMarkersProps {
  pharmacies?: Pharmacy[];
  timeFilter?: TimeFilter;
}

export function PharmacyMarkers({
  pharmacies: propPharmacies,
  timeFilter: propTimeFilter,
}: PharmacyMarkersProps) {
  const { data } = useNearbyPharmacies();
  const [queryTime] = useQueryState<TimeFilter>(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now")
  );

  const effectiveTimeFilter = propTimeFilter ?? queryTime;

  // Use prop data if available, otherwise use hook data
  const pharmaciesToRender = propPharmacies ?? (data?.data || []);

  const points = useMemo(() => {
    if (pharmaciesToRender.length === 0)
      return {
        type: "FeatureCollection",
        features: [],
      } as GeoJSON.FeatureCollection<
        GeoJSON.Point,
        Pharmacy & GeoJSON.GeoJsonProperties
      >;

    return {
      type: "FeatureCollection",
      features: pharmaciesToRender
        .filter((p) => p.latitude && p.longitude)
        .map((pharmacy) => ({
          type: "Feature",
          id: pharmacy.id,
          geometry: {
            type: "Point",
            coordinates: [pharmacy.longitude!, pharmacy.latitude!],
          },
          properties: pharmacy,
        })),
    } as GeoJSON.FeatureCollection<
      GeoJSON.Point,
      Pharmacy & GeoJSON.GeoJsonProperties
    >;
  }, [pharmaciesToRender]);

  if (pharmaciesToRender.length === 0) return null;

  return (
    <MapHybridClusterLayer
      data={points}
      clusterColors={[
        "hsl(166, 18%, 73%)", // Primary (Light)
        "hsl(166, 25%, 60%)", // Medium (Darker)
        "hsl(166, 35%, 50%)", // Large (Darkest)
      ]}
      clusterTextColor="#000000"
    >
      {(features) => (
        <>
          {features.map((feature) => {
            const pharmacy = feature.properties as Pharmacy;
            const coordinates = (feature.geometry as GeoJSON.Point).coordinates;

            let dataHours = pharmacy.data_hours;
            if (typeof dataHours === "string") {
              try {
                dataHours = JSON.parse(dataHours);
              } catch {
                dataHours = [];
              }
            }

            let openUntilTomorrow = pharmacy.open_until_tomorrow ?? null;
            if (typeof openUntilTomorrow === "string") {
              openUntilTomorrow = openUntilTomorrow === "true";
            }

            const { status, minutesUntilClose } = getPharmacyStatus(
              dataHours,
              openUntilTomorrow,
              pharmacy.next_day_close_time ?? null,
              effectiveTimeFilter
            );

            if (status === "closed") return null;

            const isScheduled = status === "scheduled";
            const isOpen = status === "open" || isScheduled;
            const isClosingSoon = status === "closing-soon";

            return (
              <MapMarker
                key={pharmacy.id}
                longitude={coordinates[0]}
                latitude={coordinates[1]}
              >
                <MarkerContent>
                  <div className="relative flex flex-col items-center group cursor-pointer">
                    <div
                      className={cn(
                        "flex items-center justify-center p-2.5 rounded-full border-2 transition-transform hover:scale-110",
                        isClosingSoon
                          ? "bg-amber-500 text-white border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                          : isOpen
                          ? "bg-primary text-primary-foreground border-sidebar shadow-[0_0_15px_hsl(166_18%_73%/0.6)]"
                          : "bg-muted text-muted-foreground border-sidebar shadow-md"
                      )}
                    >
                      <Cross className="size-6" />
                    </div>
                    {/* Pin stem */}
                    <div
                      className={cn(
                        "w-1 h-3 -mt-0.5",
                        isClosingSoon
                          ? "bg-amber-500/60"
                          : isOpen
                          ? "bg-primary/60"
                          : "bg-muted/60"
                      )}
                    />
                  </div>
                </MarkerContent>

                <MarkerTooltip
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg",
                    isClosingSoon
                      ? "bg-amber-500 text-white"
                      : isOpen
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {pharmacy.name}
                </MarkerTooltip>

                <MarkerPopup>
                  <div className="flex flex-col gap-3 min-w-[260px] max-w-[320px] p-0.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex items-center justify-center size-11 rounded-full shrink-0",
                          isClosingSoon
                            ? "bg-amber-500/10 text-amber-600"
                            : isOpen
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Cross className="size-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base text-card-foreground line-clamp-2 leading-snug">
                          {pharmacy.name}
                        </h4>
                        {!isScheduled && (
                          <span
                            className={cn(
                              "text-sm inline-block mt-1 px-2.5 py-0.5 rounded-full font-semibold",
                              isClosingSoon
                                ? "bg-amber-500/15 text-amber-600"
                                : isOpen
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {isClosingSoon
                              ? `Κλείνει σε ${minutesUntilClose} λεπτά`
                              : isOpen
                              ? "Ανοιχτό"
                              : "Κλειστό"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <MapPin className="size-4 mt-0.5 shrink-0" />
                      <span className="leading-tight">
                        {pharmacy.address}, {pharmacy.city}
                      </span>
                    </div>

                    {dataHours && dataHours.length > 0 && (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Clock className="size-4 shrink-0" />
                        <span>{formatPharmacyHours(dataHours)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Phone className="size-4 shrink-0" />
                      <a
                        href={`tel:${pharmacy.phone}`}
                        className="hover:text-primary transition-colors font-medium"
                      >
                        {pharmacy.phone}
                      </a>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
                      <a
                        href={`/farmakeia/${pharmacy.id}`}
                        className="text-sm font-medium text-primary hover:underline transition-colors"
                      >
                        Λεπτομέρειες
                      </a>
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coordinates[1]},${coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Eye className="size-3.5" />
                          Street View
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <Navigation className="size-3.5" />
                          Οδηγίες
                        </a>
                      </div>
                    </div>
                  </div>
                </MarkerPopup>
              </MapMarker>
            );
          })}
        </>
      )}
    </MapHybridClusterLayer>
  );
}
