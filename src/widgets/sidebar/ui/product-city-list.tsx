"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  queryCityAction,
  useProductCityPharmacies,
  type CityActionItem,
  type DutyTime,
} from "@/entities/pharmacy";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ActionPharmacyCard } from "./action-pharmacy-card";
import { useVisualViewportSnapPoints } from "@/shared/lib/hooks/use-visual-viewport-snap-points";
import { useSidebar } from "@/shared/ui/sidebar";

export function ProductCityList({ citySlug, time }: { citySlug: string; time: DutyTime }) {
  const query = useProductCityPharmacies(citySlug, time);
  const [items, setItems] = useState<CityActionItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const { isMobile, setSnapPoint } = useSidebar();
  const { defaultSnap } = useVisualViewportSnapPoints();

  useEffect(() => {
    setItems([]);
    setNextCursor(undefined);
  }, [citySlug, time]);

  const currentItems = items.length > 0 ? items : (query.data?.items ?? []);
  const coverage = query.data?.duty_coverage.status === "partial" ? " · Μερική κάλυψη εφημεριών" : "";

  const loadMore = async () => {
    const cursor = nextCursor === undefined ? query.data?.next_cursor : nextCursor;
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await queryCityAction(citySlug, time, cursor);
      setItems((previous) => [...(previous.length ? previous : query.data?.items ?? []), ...next.items]);
      setNextCursor(next.next_cursor);
    } catch {
      toast.error("Δεν ήταν δυνατή η φόρτωση περισσότερων αποτελεσμάτων.");
    } finally {
      setLoadingMore(false);
    }
  };

  if (query.isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="size-5 animate-spin" /></div>;
  if (query.error) return <div className="flex flex-col items-center gap-3 p-6 text-center"><p className="text-sm text-destructive">Η ασφαλής λίστα εφημεριών δεν είναι προσωρινά διαθέσιμη.</p><Button variant="outline" size="sm" onClick={() => void query.refetch()}><RefreshCw className="mr-2 size-4" /> Δοκιμάστε ξανά</Button></div>;
  if (currentItems.length === 0) return <p className="p-6 text-center text-sm text-muted-foreground">Δεν βρέθηκαν φαρμακεία για αυτή την επιλογή.</p>;

  const hasMore = (nextCursor === undefined ? query.data?.next_cursor : nextCursor) !== null;
  const snapToDefault = () => {
    if (!isMobile) return;
    setSnapPoint(null);
    setTimeout(() => setSnapPoint(defaultSnap), 50);
  };

  return <div className="flex min-h-0 flex-1 flex-col"><div className="px-1 pb-2 text-xs font-semibold text-muted-foreground">ΦΑΡΜΑΚΕΙΑ ({currentItems.length}{hasMore ? "+" : ""}){coverage}</div><ScrollArea className="flex-1"><div className="flex flex-col gap-3 pr-3 pb-2">{currentItems.map((item) => <ActionPharmacyCard key={item.handle} item={item} timeFilter={time} onPrimaryAction={snapToDefault} />)}{hasMore && <Button variant="outline" size="sm" onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore ? <Loader2 className="size-4 animate-spin" /> : "Φόρτωση περισσότερων"}</Button>}</div></ScrollArea></div>;
}
