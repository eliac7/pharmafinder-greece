"use client";

import { MapPin, RefreshCw } from "lucide-react";
import { useQueryState, parseAsInteger, parseAsStringLiteral } from "nuqs";

import { TIME_OPTIONS, normalizeRadius, type TimeFilter } from "@/entities/pharmacy";
import { DEFAULT_RADIUS } from "@/entities/pharmacy";
import { useProductNearbyPharmacies } from "@/features/find-pharmacies";
import { useLocateMe } from "@/features/locate-user/model/use-locate-me";
import { useLocationStore } from "@/features/locate-user";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { useVisualViewportSnapPoints } from "@/shared/lib/hooks/use-visual-viewport-snap-points";
import { useSidebar } from "@/shared/ui/sidebar";
import { ActionPharmacyCard } from "./action-pharmacy-card";

export function ProductNearbyList() {
  const { data, isLoading, isFetching, error, refetch } = useProductNearbyPharmacies();
  const [radius] = useQueryState("radius", parseAsInteger.withDefault(DEFAULT_RADIUS));
  const [time] = useQueryState<TimeFilter>("time", parseAsStringLiteral(TIME_OPTIONS).withDefault("now"));
  const { isMobile, setSnapPoint } = useSidebar();
  const { defaultSnap } = useVisualViewportSnapPoints();
  const { latitude, longitude } = useLocationStore();
  const { locate, isLoading: isLocating } = useLocateMe();
  const normalizedRadius = normalizeRadius(radius);

  if (isLoading) {
    return <div className="flex flex-col gap-3 py-2">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-22 rounded-2xl" />)}</div>;
  }

  if (error) {
    return <div className="flex flex-col items-center gap-3 p-6 text-center"><p className="text-sm text-destructive">Η ασφαλής αναζήτηση δεν είναι προσωρινά διαθέσιμη.</p><Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}><RefreshCw className="size-4 mr-2" /> Δοκιμάστε ξανά</Button></div>;
  }

  if (latitude == null || longitude == null) {
    return <div className="flex flex-col items-center gap-3 p-6 text-center"><MapPin className="size-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Εντοπίστε την τοποθεσία σας για να βρείτε φαρμακεία κοντά σας.</p><Button variant="outline" size="sm" onClick={() => locate()} disabled={isLocating}>{isLocating ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <MapPin className="mr-2 size-4" />}Εντοπισμός τοποθεσίας</Button></div>;
  }

  if (!data || data.items.length === 0) {
    return <ScrollArea className="flex-1"><div className="flex flex-col items-center gap-3 p-6 text-center"><MapPin className="size-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Δεν υπάρχουν εφημερεύοντα φαρμακεία σε ακτίνα {normalizedRadius}km.</p></div></ScrollArea>;
  }

  const coverageLabel = data.duty_coverage.status === "partial" ? "Μερική κάλυψη εφημεριών" : null;
  const snapToDefault = () => {
    if (!isMobile) return;
    setSnapPoint(null);
    setTimeout(() => setSnapPoint(defaultSnap), 50);
  };
  return <div className="flex flex-1 min-h-0 flex-col"><div className="flex items-center justify-between py-3 px-1 pr-3"><div><span className="text-sm font-semibold">{data.returned_count} φαρμακεία</span><span className="block text-xs text-muted-foreground">Σε ακτίνα {normalizedRadius}km{coverageLabel ? ` · ${coverageLabel}` : ""}</span></div>{isFetching && <RefreshCw className="size-4 animate-spin text-muted-foreground" />}</div><ScrollArea className="flex-1 min-h-0"><div className="flex flex-col gap-3 pr-3 pb-2">{data.items.map((item) => <ActionPharmacyCard key={item.handle} item={item} timeFilter={time} onPrimaryAction={snapToDefault} />)}{data.has_more && <p className="text-xs text-center text-muted-foreground py-2">Εμφανίζονται τα πρώτα 20 αποτελέσματα.</p>}</div></ScrollArea></div>;
}
