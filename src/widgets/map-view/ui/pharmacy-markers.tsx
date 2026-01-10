"use client";

import { useNearbyPharmacies } from "@/features/find-pharmacies/model/use-nearby-pharmacies";
import {
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/shared/ui/map";
import { Phone, MapPin, Navigation, Cross, Clock } from "lucide-react";
import { cn } from "@/shared/lib/hooks/utils";
import {
  getPharmacyStatus,
  formatPharmacyHours,
} from "@/shared/lib/pharmacy-status";

export function PharmacyMarkers() {
  const { data } = useNearbyPharmacies();

  if (!data?.data) return null;

  return (
    <>
      {data.data.map((pharmacy) => {
        if (!pharmacy.latitude || !pharmacy.longitude) return null;

        const { status, minutesUntilClose } = getPharmacyStatus(
          pharmacy.data_hours,
          pharmacy.open_until_tomorrow ?? null,
          pharmacy.next_day_close_time ?? null
        );

        if (status === "closed") return null;

        const isOpen = true;
        const isClosingSoon = status === "closing-soon";

        return (
          <MapMarker
            key={pharmacy.id}
            longitude={pharmacy.longitude}
            latitude={pharmacy.latitude}
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

            <MarkerTooltip>
              <div
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold shadow-lg",
                  isClosingSoon
                    ? "bg-amber-500 text-white"
                    : isOpen
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {pharmacy.name}
              </div>
            </MarkerTooltip>

            <MarkerPopup>
              <div className="flex flex-col gap-2 min-w-[220px] bg-card p-3 rounded-xl border border-border shadow-xl">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center size-10 rounded-lg",
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
                    <h4 className="font-bold text-sm text-card-foreground truncate">
                      {pharmacy.name}
                    </h4>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded font-semibold",
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
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 mt-0.5 shrink-0" />
                  <span>
                    {pharmacy.address}, {pharmacy.city}
                  </span>
                </div>

                {pharmacy.data_hours && pharmacy.data_hours.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" />
                    <span>{formatPharmacyHours(pharmacy.data_hours)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="size-3.5 shrink-0" />
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {pharmacy.phone}
                  </a>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {pharmacy.distance_km?.toFixed(1)} km
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Navigation className="size-3" />
                    Οδηγίες
                  </a>
                </div>
              </div>
            </MarkerPopup>
          </MapMarker>
        );
      })}
    </>
  );
}
