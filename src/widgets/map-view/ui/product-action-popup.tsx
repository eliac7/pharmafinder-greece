"use client";

import { Clock, Cross, Eye, MapPin, Phone } from "lucide-react";

import { PharmacyNavigationDialog } from "@/features/pharmacy-navigation";
import {
  formatPharmacyHours,
  getPharmacyStatus,
  type ActionPublicDetail,
  type PharmacyHour,
  type TimeFilter,
} from "@/entities/pharmacy";
import { cn } from "@/shared";
import { MapPopup } from "@/shared/ui/map";
import { useMapStore } from "@/shared/model/use-map-store";

function toPharmacyHours(detail: ActionPublicDetail): PharmacyHour[] {
  return detail.duty.periods.map((period) => ({
    open_time: period.opens_at,
    close_time: period.closes_at,
    date: period.date ?? null,
  }));
}

export function ProductActionPopup({
  detail,
  center,
  timeFilter = "now",
}: {
  detail: ActionPublicDetail;
  center?: [number, number];
  timeFilter?: TimeFilter;
}) {
  const clearProductPopup = useMapStore((state) => state.setProductPopupTarget);
  const { latitude, longitude } = detail.location;
  const popupLongitude = center?.[0] ?? longitude;
  const popupLatitude = center?.[1] ?? latitude;
  const navigationPharmacy = {
    name: detail.name,
    address: detail.address,
    phone: detail.phone,
    latitude,
    longitude,
  };
  const dataHours = toPharmacyHours(detail);
  const status = getPharmacyStatus(dataHours, null, null, timeFilter);
  const hasConfirmedDuty = detail.duty.data_status === "fresh" || detail.duty.data_status === "partial";
  const statusLabel = hasConfirmedDuty
    ? status.status === "closing-soon"
      ? `Κλείνει σε ${status.minutesUntilClose} λεπτά`
      : status.status === "open"
        ? "Ανοιχτό"
        : status.status === "scheduled"
          ? null
          : "Κλειστό"
    : "Η κατάσταση εφημερίας δεν έχει επιβεβαιωθεί";
  const statusColor = hasConfirmedDuty
    ? status.status === "closing-soon"
      ? "bg-amber-500/15 text-amber-600"
      : status.status === "open" || status.status === "scheduled"
        ? "bg-emerald-500/15 text-emerald-700 dark:bg-primary/15 dark:text-primary"
        : "bg-muted text-muted-foreground"
    : "bg-muted text-muted-foreground";

  if (popupLatitude == null || popupLongitude == null) return null;

  return (
    <MapPopup
      longitude={popupLongitude}
      latitude={popupLatitude}
      closeButton
      onClose={() => clearProductPopup(null)}
    >
      <div className="flex min-w-65 max-w-[320px] flex-col gap-3 p-0.5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full",
              hasConfirmedDuty && status.status === "closing-soon"
                ? "bg-amber-500/10 text-amber-600"
                : hasConfirmedDuty && (status.status === "open" || status.status === "scheduled")
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
            )}
          >
            <Cross className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="line-clamp-2 text-base font-semibold leading-snug text-card-foreground">
              {detail.name}
            </h4>
            {statusLabel && (
              <span className={cn("mt-1 inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold", statusColor)}>
                {statusLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span className="leading-tight">{detail.address}</span>
        </div>

        {dataHours.length > 0 && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Clock className="size-4 shrink-0" />
            <span>Εφημερεύει: {formatPharmacyHours(dataHours)}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Phone className="size-4 shrink-0" />
          {detail.phone ? (
            <a href={`tel:${detail.phone}`} className="font-medium transition-colors hover:text-primary">
              {detail.phone}
            </a>
          ) : (
            <span>Δεν υπάρχει διαθέσιμο τηλέφωνο</span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between gap-2 border-t border-border pt-3">
          <a href={detail.canonical_path} className="text-sm font-medium text-primary transition-colors hover:underline">
            Λεπτομέρειες
          </a>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${popupLatitude},${popupLongitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <Eye className="size-3.5" />
              Street View
            </a>
            <PharmacyNavigationDialog
              pharmacy={navigationPharmacy}
              triggerLabel="Οδηγίες"
              className="h-auto gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold shadow-sm"
            />
          </div>
        </div>
      </div>
    </MapPopup>
  );
}

export function ProductActionPopupTarget() {
  const target = useMapStore((state) => state.productPopupTarget);
  if (!target) return null;

  return <ProductActionPopup detail={target.detail} center={target.center} timeFilter={target.timeFilter} />;
}
