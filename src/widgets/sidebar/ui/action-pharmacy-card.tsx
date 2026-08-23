"use client";

import { useState } from "react";
import { Clock, Cross, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { FavoriteButton } from "@/features/favorites";
import { PharmacyNavigationDialog } from "@/features/pharmacy-navigation";
import { useRevealWithChallenge } from "@/features/pharmacy-detail/model/use-reveal-with-challenge";
import { DetailChallenge } from "@/features/pharmacy-detail/ui/detail-challenge";
import {
  formatPharmacyHours,
  getDutySummaryStatus,
  revealProductHandle,
  type ActionPharmacyListItem,
  type TimeFilter,
} from "@/entities/pharmacy";
import { cn } from "@/shared";
import { useMapStore } from "@/shared/model/use-map-store";
import { Badge } from "@/shared/ui/badge";

export function ActionPharmacyCard({
  item,
  timeFilter,
  onPrimaryAction,
}: {
  item: ActionPharmacyListItem;
  timeFilter: TimeFilter;
  onPrimaryAction?: () => void;
}) {
  const flyTo = useMapStore((state) => state.flyTo);
  const setProductPopupTarget = useMapStore((state) => state.setProductPopupTarget);
  const {
    challenge,
    challengeError,
    reveal,
    verifyChallenge,
  } = useRevealWithChallenge();
  const [isOpening, setIsOpening] = useState(false);
  const dataHours = item.duty_summary.periods.map((period) => ({
    open_time: period.opens_at,
    close_time: period.closes_at,
    date: period.date ?? null,
  }));
  const { status, statusColor, minutesUntilClose } = getDutySummaryStatus(item.duty_summary, timeFilter);
  const hasConfirmedDuty = item.duty_summary.data_status === "fresh" || item.duty_summary.data_status === "partial";
  const isOpen = hasConfirmedDuty && (status === "open" || status === "scheduled");
  const isClosingSoon = status === "closing-soon";
  const isScheduled = status === "scheduled";

  const openPopup = (detail: Awaited<ReturnType<typeof revealProductHandle>>) => {
    const location = {
      latitude: detail.location.latitude ?? item.latitude,
      longitude: detail.location.longitude ?? item.longitude,
    };
    if (location.latitude == null || location.longitude == null) {
      throw new Error("Pharmacy has no map coordinates");
    }
    setProductPopupTarget({
      detail: { ...detail, location },
      center: [location.longitude, location.latitude],
      timeFilter,
    });
    flyTo([location.longitude, location.latitude], 16, item.public_id ?? undefined);
  };

  const openDetails = async () => {
    if (isOpening) return;
    onPrimaryAction?.();
    setIsOpening(true);
    try {
      const detail = await reveal(item.handle);
      if (detail) openPopup(detail);
    } catch {
      toast.error("Δεν ήταν δυνατή η φόρτωση των στοιχείων.");
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group flex rounded-xl border border-border bg-card p-3",
          "transition-all duration-200 shadow-sm hover:border-primary/40 hover:bg-accent/50",
          isClosingSoon && "border-amber-500/40",
        )}
      >
      <button
        type="button"
        onClick={() => void openDetails()}
        disabled={isOpening}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
      >
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
            isClosingSoon
              ? "bg-amber-500/10 text-amber-600"
              : isOpen
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
          )}
        >
          <Cross className="size-5" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={cn(
                    "truncate text-sm font-bold leading-tight",
                    isOpen ? "text-card-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </h3>
                {!isScheduled && (
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      statusColor,
                    )}
                  >
                    {!hasConfirmedDuty
                      ? "Η κατάσταση δεν έχει επιβεβαιωθεί"
                      : isClosingSoon
                      ? `Κλείνει σε ${minutesUntilClose}'`
                      : isOpen
                        ? "Ανοιχτό"
                        : "Κλειστό"}
                  </span>
                )}
              </div>
              {item.is_frequent_duty && (
                <Badge
                  variant="secondary"
                  className="w-fit shrink-0 gap-1 border-amber-500/30 bg-amber-500/15 px-1.5 py-0 text-[10px] font-semibold text-amber-600"
                >
                  <Sparkles className="size-2.5" />
                  Συχνά
                </Badge>
              )}
            </div>
            {typeof item.distance_km === "number" && item.distance_km > 0 && (
              <span className="ml-auto shrink-0 whitespace-nowrap text-xs font-medium text-muted-foreground">
                {item.distance_km.toFixed(1)}km
              </span>
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            {dataHours.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3 shrink-0" />
                <span className="truncate">
                  Εφημερεύει: {formatPharmacyHours(dataHours)}
                </span>
              </span>
            )}
            <p className="truncate text-xs leading-snug text-muted-foreground">
              {item.address_short}
            </p>
          </div>
        </div>
      </button>

      <div className="ml-1 flex shrink-0 flex-col gap-1 self-center">
        {item.public_id && <FavoriteButton pharmacyId={item.public_id} size="sm" />}
        <PharmacyNavigationDialog
          pharmacy={{
            name: item.name,
            address: item.address_short,
            phone: item.phone,
            latitude: item.latitude,
            longitude: item.longitude,
          }}
          compact
          triggerVariant="ghost"
          triggerLabel="Οδηγίες"
          className="text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary"
        />
      </div>
      </div>
      {challenge && (
        <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="text-sm font-medium">Απαιτείται επιβεβαίωση για την προβολή στοιχείων.</p>
          <DetailChallenge
            errorMessage={challengeError}
            onVerified={async (providerToken) => {
              const detail = await verifyChallenge(providerToken);
              if (detail) openPopup(detail);
            }}
          />
        </div>
      )}
    </>
  );
}
