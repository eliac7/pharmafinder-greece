"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { toast } from "sonner";
import type MapLibreGL from "maplibre-gl";

import {
  drillMapAction,
  queryMapAction,
  revealProductHandle,
  TIME_OPTIONS,
  getDutySummaryStatus,
  type DutyTime,
  type MapActionResponse,
  type NearbyActionItem,
  type ViewportBounds,
} from "@/entities/pharmacy";
import { useProductNearbyPharmacies } from "@/features/find-pharmacies";
import { useRevealWithChallenge } from "@/features/pharmacy-detail/model/use-reveal-with-challenge";
import { RevealChallengeBanner } from "@/features/pharmacy-detail/ui/reveal-challenge-banner";
import { Button } from "@/shared/ui/button";
import { MapMarker, MarkerContent, MarkerTooltip, useMap } from "@/shared/ui/map";
import { useMapStore } from "@/shared/model/use-map-store";
import { ProductActionPopupTarget } from "./product-action-popup";
import { ProductActionMarkerContent } from "./product-action-marker";

type MoveEvent = MapLibreGL.MapLibreEvent & { originalEvent?: Event };

function roundBounds(bounds: ViewportBounds): ViewportBounds {
  return {
    west: Number(bounds.west.toFixed(4)),
    south: Number(bounds.south.toFixed(4)),
    east: Number(bounds.east.toFixed(4)),
    north: Number(bounds.north.toFixed(4)),
  };
}

function sameBounds(left: ViewportBounds, right: ViewportBounds): boolean {
  return left.west === right.west && left.south === right.south && left.east === right.east && left.north === right.north;
}

function ActionLayer({ response, timeFilter, onDrill }: { response: MapActionResponse; timeFilter: DutyTime; onDrill: (next: MapActionResponse) => void }) {
  const { map } = useMap();
  const setProductPopupTarget = useMapStore((state) => state.setProductPopupTarget);
  const { challenge, challengeError, reveal, verifyChallenge } = useRevealWithChallenge();
  const [pendingCenter, setPendingCenter] = useState<[number, number] | null>(null);

  const openPopup = (
    detail: Awaited<ReturnType<typeof revealProductHandle>>,
    fallbackCenter?: [number, number],
  ) => {
    const location = {
      latitude: detail.location.latitude ?? fallbackCenter?.[1] ?? null,
      longitude: detail.location.longitude ?? fallbackCenter?.[0] ?? null,
    };
    if (location.latitude == null || location.longitude == null) {
      throw new Error("Pharmacy has no map coordinates");
    }
    setProductPopupTarget({
      detail: { ...detail, location },
      center: [location.longitude, location.latitude],
      timeFilter,
    });
  };

  const open = async (handle: string, fallbackCenter?: [number, number]) => {
    setPendingCenter(fallbackCenter ?? null);
    try {
      const detail = await reveal(handle);
      if (detail) openPopup(detail, fallbackCenter);
    } catch {
      toast.error("Δεν ήταν δυνατή η φόρτωση των στοιχείων.");
    }
  };
  const drill = async (handle: string) => {
    try {
      const targetZoom = Math.min(22, Math.floor(map?.getZoom() ?? 12) + 2);
      const next = await drillMapAction(handle, targetZoom);
      onDrill(next);
    } catch {
      toast.error("Δεν ήταν δυνατή η μεγέθυνση της περιοχής.");
    }
  };

  return <>
    <RevealChallengeBanner
      challenge={challenge}
      challengeError={challengeError}
      variant="overlay"
      onVerified={async (providerToken) => {
        const detail = await verifyChallenge(providerToken);
        if (detail) {
          openPopup(detail, pendingCenter ?? undefined);
          setPendingCenter(null);
        }
      }}
    />
    {response.mode === "clusters" ? response.clusters.map((cluster) => <MapMarker key={cluster.handle} longitude={cluster.center.longitude} latitude={cluster.center.latitude}><MarkerContent><button type="button" onClick={() => void drill(cluster.handle)} className="flex size-10 items-center justify-center rounded-full border-2 border-primary bg-primary text-xs font-bold text-primary-foreground shadow-lg">{cluster.count}</button></MarkerContent><MarkerTooltip>{cluster.count} φαρμακεία</MarkerTooltip></MapMarker>) : response.markers.map((marker) => <MapMarker key={marker.handle} longitude={marker.longitude} latitude={marker.latitude}><MarkerContent><button type="button" onClick={() => void open(marker.handle, [marker.longitude, marker.latitude])} className="cursor-pointer border-0 bg-transparent p-0"><ProductActionMarkerContent publicId={marker.public_id} status={marker.duty_summary ? getDutySummaryStatus(marker.duty_summary, timeFilter).status : timeFilter === "now" ? "open" : "scheduled"} /><span className="sr-only">{marker.name}</span></button></MarkerContent><MarkerTooltip className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg">{marker.name}</MarkerTooltip></MapMarker>)}<ProductActionPopupTarget />
  </>;
}

export function ProductActionViewport() {
  const { map, isLoaded } = useMap();
  const [time] = useQueryState<DutyTime>("time", parseAsStringLiteral(TIME_OPTIONS).withDefault("now"));
  const [pendingBounds, setPendingBounds] = useState<ViewportBounds | null>(null);
  const [committedBounds, setCommittedBounds] = useState<ViewportBounds | null>(null);
  const [drilledResponse, setDrilledResponse] = useState<MapActionResponse | null>(null);
  const movementRef = useRef(false);
  const query = useQuery({
    queryKey: ["product-map", committedBounds, time],
    queryFn: async () => {
      const requestedBounds = committedBounds!;
      const result = await queryMapAction(requestedBounds, Math.floor(map?.getZoom() ?? 12), time);
      setPendingBounds((current) => current && sameBounds(current, requestedBounds) ? null : current);
      return result;
    },
    enabled: committedBounds !== null,
    staleTime: 30_000,
    retry: false,
  });
  const nearbyQuery = useProductNearbyPharmacies();

  useEffect(() => {
    if (!map || !isLoaded) return;
    const start = (event: MoveEvent) => { movementRef.current = Boolean(event.originalEvent); };
    const end = () => {
      if (!movementRef.current) return;
      movementRef.current = false;
      const bounds = map.getBounds();
      setDrilledResponse(null);
      setPendingBounds(roundBounds({ west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth() }));
    };
    map.on("movestart", start);
    map.on("moveend", end);
    return () => { map.off("movestart", start); map.off("moveend", end); };
  }, [isLoaded, map]);

  const [prevTime, setPrevTime] = useState(time);
  if (prevTime !== time) {
    setPrevTime(time);
    setDrilledResponse(null);
  }

  const nearbyResponse: MapActionResponse | undefined = nearbyQuery.data
    ? {
        mode: "markers",
        markers: nearbyQuery.data.items.flatMap((item: NearbyActionItem) =>
          item.latitude == null || item.longitude == null
            ? []
            : [{
                handle: item.handle,
                name: item.name,
                public_id: item.public_id,
                latitude: item.latitude,
                longitude: item.longitude,
                city: item.city,
                duty_summary: item.duty_summary,
              }],
        ),
        clusters: [],
        returned_count: nearbyQuery.data.returned_count,
        matched_count: nearbyQuery.data.returned_count,
        zoom_required: false,
        duty_coverage: nearbyQuery.data.duty_coverage,
      }
    : undefined;
  const response = drilledResponse ?? query.data ?? nearbyResponse;
  const searchArea = () => {
    if (!pendingBounds || query.isFetching) return;
    if (query.error && committedBounds && sameBounds(pendingBounds, committedBounds)) {
      void query.refetch();
      return;
    }
    setCommittedBounds(pendingBounds);
  };

  return <>
    {response && <ActionLayer response={response} timeFilter={time} onDrill={setDrilledResponse} />}
    {(pendingBounds || query.isFetching) && <div className="absolute top-5 left-1/2 z-20 -translate-x-1/2"><Button type="button" size="sm" onClick={searchArea} disabled={query.isFetching} className="rounded-full border border-white/10 bg-[rgba(20,20,30,0.82)] px-4 text-white shadow-lg backdrop-blur-sm">{query.isFetching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}{query.isFetching ? "Αναζήτηση..." : query.error && committedBounds && sameBounds(pendingBounds!, committedBounds) ? "Δοκιμάστε ξανά" : "Αναζήτηση σε αυτή την περιοχή"}</Button></div>}
    {query.error && pendingBounds && <div className="absolute top-16 left-1/2 z-20 -translate-x-1/2 rounded-full bg-destructive/90 px-3 py-1 text-xs text-destructive-foreground shadow">Η αναζήτηση απέτυχε.</div>}
    {response?.duty_coverage.status === "partial" && <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800 shadow">Μερική κάλυψη εφημεριών</div>}
  </>;
}
