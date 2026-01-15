"use client";

import { Heart, RefreshCw } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { pharmacyApi } from "@/entities/pharmacy/api/pharmacy.api";
import {
  PharmacyCard,
  TIME_OPTIONS,
  type TimeFilter,
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
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <ScrollArea className="flex-1">
      <div className="flex items-center justify-between py-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-rose-500/10">
            <Heart className="size-4 text-rose-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {favoriteIds.length}{" "}
              {favoriteIds.length === 1 ? "αγαπημένο" : "αγαπημένα"}
            </span>
            <span className="text-xs text-muted-foreground">φαρμακεία</span>
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
