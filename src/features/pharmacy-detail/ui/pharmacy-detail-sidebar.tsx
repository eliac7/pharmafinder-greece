"use client";

import {
  getPharmacyStatus,
  formatPharmacyHours,
  type TimeFilter,
  type Pharmacy,
} from "@/entities/pharmacy";
import { useMapStore } from "@/shared/model/use-map-store";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/shared/ui/sidebar";
import { cn, useIsMobile } from "@/shared";
import { SidebarCopyright } from "@/widgets/sidebar/ui/sidebar-shared";
import { ArrowLeft, MapPin, Navigation, Phone, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ReportDialog } from "./report-dialog";

interface PharmacyDetailSidebarProps {
  pharmacy: Pharmacy;
}

function StatusBadge({
  status,
  statusColor,
  minutes,
}: {
  status: "open" | "closing-soon" | "closed" | "scheduled";
  statusColor: string;
  minutes: number | null;
}) {
  const label =
    status === "open"
      ? "Ανοιχτό"
      : status === "closing-soon"
      ? `Κλείνει σε ${minutes} λεπτά`
      : status === "scheduled"
      ? "Προγραμματισμένο"
      : "Κλειστό";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusColor
      )}
    >
      {label}
    </span>
  );
}

export function PharmacyDetailSidebar({
  pharmacy,
}: PharmacyDetailSidebarProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const flyTo = useMapStore((state) => state.flyTo);

  const statusResult = getPharmacyStatus(
    pharmacy.data_hours,
    pharmacy.open_until_tomorrow ?? false,
    pharmacy.next_day_close_time ?? null,
    "now"
  );

  const isFrequentDuty =
    pharmacy.is_frequent_duty ?? (pharmacy.data_hours?.length ?? 0) > 20;

  useEffect(() => {
    if (pharmacy.latitude && pharmacy.longitude) {
      flyTo([pharmacy.longitude, pharmacy.latitude], 16);
    }
  }, [pharmacy.latitude, pharmacy.longitude, flyTo]);

  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0 size-9 rounded-full"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-lg font-bold line-clamp-1 flex-1">
            {pharmacy.name}
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <ScrollArea className="flex-1">
          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-card border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {pharmacy.city}, {pharmacy.prefecture}
                </span>
                <StatusBadge
                  status={statusResult.status}
                  statusColor={statusResult.statusColor}
                  minutes={statusResult.minutesUntilClose}
                />
              </div>

              {isFrequentDuty && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Star className="size-3.5 fill-current" />
                  Συχνά Εφημερεύον
                </div>
              )}

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{pharmacy.address}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                <a
                  href={`tel:${pharmacy.phone}`}
                  className="font-medium text-primary hover:underline"
                >
                  {pharmacy.phone}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="gap-2" asChild>
                <a href={`tel:${pharmacy.phone}`}>
                  <Phone className="size-4" />
                  Κλήση
                </a>
              </Button>
              <Button className="gap-2" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="size-4" />
                  Πλοήγηση
                </a>
              </Button>
            </div>
            <ReportDialog
              pharmacyId={pharmacy.id}
              pharmacyName={pharmacy.name}
            />
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="px-6 py-4 border-t border-sidebar-border">
        <SidebarCopyright />
      </SidebarFooter>
    </Sidebar>
  );
}
