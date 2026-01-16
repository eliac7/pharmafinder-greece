"use client";

import { Heart, RefreshCw } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { pharmacyApi } from "@/entities/pharmacy/api/pharmacy.api";
import {
  PharmacyCard,
  TIME_OPTIONS,
  type TimeFilter,
  getPharmacyStatus,
} from "@/entities/pharmacy";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { useFavoritesStore } from "../model/use-favorites-store";

export function FavoritesList() {
  const { favoriteIds } = useFavoritesStore();
  const [timeFilter] = useQueryState<TimeFilter>(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now")
  );

  const pharmacyQueries = useQueries({
    queries: favoriteIds.map((id) => ({
      queryKey: ["pharmacy", id],
      queryFn: () => pharmacyApi.getPharmacyDetails(id),
      staleTime: 1000 * 60 * 5,
      refetchInterval: 1000 * 60 * 5,
    })),
  });

  const isLoading = pharmacyQueries.some((q) => q.isLoading);
  const isFetching = pharmacyQueries.some((q) => q.isFetching);
  const hasError = pharmacyQueries.some((q) => q.isError);

  const refetchAll = () => {
    pharmacyQueries.forEach((q) => q.refetch());
  };

  if (favoriteIds.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card text-center">
        <div className="flex items-center justify-center size-12 rounded-full bg-muted">
          <Heart className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Δεν υπάρχουν αγαπημένα
          </p>
          <p className="text-xs text-muted-foreground">
            Πατήστε το εικονίδιο καρδιάς σε ένα φαρμακείο για να το προσθέσετε
            στα αγαπημένα σας.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-2">
        {Array.from({ length: Math.min(favoriteIds.length, 4) }).map((_, i) => (
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

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 text-center">
        <p className="text-sm text-destructive">
          Σφάλμα κατά τη φόρτωση των αγαπημένων.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={refetchAll}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Φόρτωση..." : "Δοκιμάστε Ξανά"}
        </Button>
      </div>
    );
  }

  const pharmacies = pharmacyQueries
    .map((q) => q.data)
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .filter((pharmacy) => {
      const statusResult = getPharmacyStatus(
        pharmacy.data_hours,
        pharmacy.open_until_tomorrow ?? false,
        pharmacy.next_day_close_time ?? null,
        timeFilter
      );
      return statusResult.status !== "closed";
    });

  if (favoriteIds.length > 0 && pharmacies.length === 0 && !isLoading) {
    return (
      <ScrollArea className="flex-1">
        <div className="flex items-center justify-between py-3 px-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-rose-500/10">
              <Heart className="size-4 text-rose-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                0 εφημερεύοντα
              </span>
              <span className="text-xs text-muted-foreground">
                από {favoriteIds.length}{" "}
                {favoriteIds.length === 1 ? "αγαπημένο" : "αγαπημένα"}
              </span>
            </div>
          </div>
          {isFetching && (
            <RefreshCw className="size-4 text-muted-foreground animate-spin" />
          )}
        </div>
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-muted/50 text-center mt-4">
          <div className="flex items-center justify-center size-12 rounded-full bg-background border border-border">
            <RefreshCw className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Κανένα αγαπημένο δεν εφημερεύει
            </p>
            <p className="text-xs text-muted-foreground">
              Δοκιμάστε να αλλάξετε το φίλτρο ώρας ή δείτε τη λίστα με όλα τα
              εφημερεύοντα.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            className="gap-2 mt-2"
          >
            <RefreshCw className="size-3.5" />
            Ανανέωση
          </Button>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex items-center justify-between py-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-rose-500/10">
            <Heart className="size-4 text-rose-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {pharmacies.length}{" "}
              {pharmacies.length === 1 ? "αγαπημένο" : "αγαπημένα"}
            </span>
            <span className="text-xs text-muted-foreground">
              {pharmacies.length === 1 ? "φαρμακείο" : "φαρμακεία"}
            </span>
          </div>
        </div>
        {isFetching && (
          <RefreshCw className="size-4 text-muted-foreground animate-spin" />
        )}
      </div>

      <div className="flex flex-col gap-3 pb-2">
        {pharmacies.map((pharmacy) => (
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
