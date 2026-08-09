"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import type MapLibreGL from "maplibre-gl";

import {
  DEFAULT_RADIUS,
  pharmacyApi,
  TIME_OPTIONS,
  type TimeFilter,
  type ViewportBounds,
} from "@/entities/pharmacy";
import { useLocationStore } from "@/features/locate-user";
import {
  useNearbyPharmacies,
  useViewportPharmaciesStore,
} from "@/features/find-pharmacies";
import { Button } from "@/shared/ui/button";
import { useMap } from "@/shared/ui/map";
import { MapLoadingPill } from "./map-loading-pill";
import { PharmacyMarkers } from "./pharmacy-markers";

type MoveEvent = MapLibreGL.MapLibreEvent & { originalEvent?: Event };

export function roundViewportBounds(bounds: ViewportBounds): ViewportBounds {
  return {
    west: Number(bounds.west.toFixed(4)),
    south: Number(bounds.south.toFixed(4)),
    east: Number(bounds.east.toFixed(4)),
    north: Number(bounds.north.toFixed(4)),
  };
}

function boundsEqual(
  left: ViewportBounds | null,
  right: ViewportBounds | null
) {
  return (
    left !== null &&
    right !== null &&
    left.west === right.west &&
    left.south === right.south &&
    left.east === right.east &&
    left.north === right.north
  );
}

export function HomeViewportPharmacies() {
  const { map, isLoaded } = useMap();
  const { latitude, longitude } = useLocationStore();
  const { isFetching: isNearbyFetching } = useNearbyPharmacies();
  const [time] = useQueryState<TimeFilter>(
    "time",
    parseAsStringLiteral(TIME_OPTIONS).withDefault("now")
  );
  const [radius] = useQueryState(
    "radius",
    parseAsInteger.withDefault(DEFAULT_RADIUS)
  );
  const [pendingBounds, setPendingBounds] = useState<ViewportBounds | null>(null);
  const [committedBounds, setCommittedBounds] =
    useState<ViewportBounds | null>(null);
  const viewportPharmacies = useViewportPharmaciesStore(
    (state) => state.pharmacies
  );
  const setViewportPharmacies = useViewportPharmaciesStore(
    (state) => state.setPharmacies
  );
  const setViewportFetching = useViewportPharmaciesStore(
    (state) => state.setIsFetching
  );
  const resetViewport = useViewportPharmaciesStore((state) => state.reset);
  const userMovementRef = useRef(false);
  const resetKey = `${latitude ?? ""}:${longitude ?? ""}:${radius}`;
  const previousResetKeyRef = useRef(resetKey);

  const viewportQuery = useQuery({
    queryKey: [
      "viewport-pharmacies",
      committedBounds?.west,
      committedBounds?.south,
      committedBounds?.east,
      committedBounds?.north,
      time,
    ],
    queryFn: ({ signal }) =>
      pharmacyApi.getViewportOnDuty(committedBounds!, time, signal),
    enabled: committedBounds !== null,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleMoveStart = (event: MoveEvent) => {
      userMovementRef.current = Boolean(event.originalEvent);
    };
    const handleMoveEnd = () => {
      if (!userMovementRef.current) return;
      userMovementRef.current = false;
      const bounds = map.getBounds();
      setPendingBounds(
        roundViewportBounds({
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        })
      );
    };

    map.on("movestart", handleMoveStart);
    map.on("moveend", handleMoveEnd);
    return () => {
      map.off("movestart", handleMoveStart);
      map.off("moveend", handleMoveEnd);
    };
  }, [isLoaded, map]);

  useEffect(() => {
    if (previousResetKeyRef.current === resetKey) return;
    previousResetKeyRef.current = resetKey;
    setPendingBounds(null);
    setCommittedBounds(null);
    resetViewport();
  }, [resetKey, resetViewport]);

  useEffect(() => {
    setViewportFetching(viewportQuery.isFetching);
  }, [setViewportFetching, viewportQuery.isFetching]);

  useEffect(
    () => () => {
      resetViewport();
    },
    [resetViewport]
  );

  useEffect(() => {
    if (!viewportQuery.data || !committedBounds) return;
    setViewportPharmacies(viewportQuery.data.data);
    if (boundsEqual(pendingBounds, committedBounds)) {
      setPendingBounds(null);
    }
  }, [committedBounds, pendingBounds, viewportQuery.data]);

  useEffect(() => {
    if (!viewportQuery.isError) return;
    if (committedBounds) setPendingBounds(committedBounds);
    const isRateLimited =
      viewportQuery.error instanceof Error &&
      viewportQuery.error.message.includes("429");
    toast.error(
      isRateLimited
        ? "Έγιναν πολλές αναζητήσεις. Δοκιμάστε ξανά σε λίγο."
        : "Η αναζήτηση στην περιοχή απέτυχε. Δοκιμάστε ξανά."
    );
  }, [committedBounds, viewportQuery.error, viewportQuery.isError]);

  const markerPharmacies = useMemo(
    () => viewportPharmacies ?? undefined,
    [viewportPharmacies]
  );

  const searchArea = () => {
    if (!pendingBounds || viewportQuery.isFetching) return;
    if (boundsEqual(pendingBounds, committedBounds)) {
      void viewportQuery.refetch();
      return;
    }
    setCommittedBounds(pendingBounds);
  };

  return (
    <>
      <PharmacyMarkers pharmacies={markerPharmacies} />
      <MapLoadingPill
        isLoading={
          isNearbyFetching && !pendingBounds && !viewportQuery.isFetching
        }
      />
      {(pendingBounds || viewportQuery.isFetching) && (
        <div className="absolute top-5 left-1/2 z-20 -translate-x-1/2">
          <Button
            type="button"
            size="sm"
            onClick={searchArea}
            disabled={viewportQuery.isFetching}
            className="rounded-full border border-white/10 bg-[rgba(20,20,30,0.82)] px-4 text-white shadow-lg shadow-black/20 backdrop-blur-sm hover:bg-[rgba(20,20,30,0.92)]"
          >
            {viewportQuery.isFetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {viewportQuery.isFetching
              ? "Αναζήτηση..."
              : "Αναζήτηση σε αυτή την περιοχή"}
          </Button>
        </div>
      )}
    </>
  );
}
