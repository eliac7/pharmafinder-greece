"use client";

import { RefreshCw, MapPin } from "lucide-react";
import { useQueryState, parseAsStringLiteral, parseAsInteger } from "nuqs";
import { useNearbyPharmacies } from "@/features/find-pharmacies";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared";
import { Button } from "@/shared/ui/button";
import {
  TIME_OPTIONS,
  DEFAULT_RADIUS,
  type TimeFilter,
  PharmacyCard,
} from "@/entities/pharmacy";
import { SystemStatusCard, QuickCityJump } from "@/widgets/sidebar";

export function PharmacyList() {
  const { data, isLoading, error, refetch, isFetching } = useNearbyPharmacies();
  const [timeFilter] = useQueryState<TimeFilter>(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now")
  );
  const [radius] = useQueryState(
    "radius",
    parseAsInteger.withDefault(DEFAULT_RADIUS)
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex p-4 rounded-2xl bg-card gap-4">
            <Skeleton className="size-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 text-center">
        <p className="text-sm text-destructive">
          Σφάλμα κατά τη φόρτωση των φαρμακείων.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          {isFetching ? "Φόρτωση..." : "Δοκιμάστε Ξανά"}
        </Button>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 py-2">
          <SystemStatusCard />
          <QuickCityJump />
        </div>
      </ScrollArea>
    );
  }

  const count = data.count;

  return (
    <ScrollArea className="flex-1">
      <div className="flex items-center justify-between py-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <MapPin className="size-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {count} {count === 1 ? "φαρμακείο" : "φαρμακεία"}
            </span>
            <span className="text-xs text-muted-foreground">
              σε ακτίνα {radius}km
            </span>
          </div>
        </div>
        {isFetching && (
          <RefreshCw className="size-4 text-muted-foreground animate-spin" />
        )}
      </div>

      <div className="flex flex-col gap-3 pb-2">
        {data.data.map((pharmacy) => (
          <PharmacyCard
            key={pharmacy.id}
            pharmacy={pharmacy}
            timeFilter={timeFilter}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
