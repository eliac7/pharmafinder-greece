"use client";

import { useQuery } from "@tanstack/react-query";
import { Command as CommandPrimitive } from "cmdk";
import {
  Crosshair,
  Loader2,
  MapPin,
  MapPinHouse,
  Pill,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useDebounce } from "@/shared";
import { useRevealWithChallenge } from "@/features/pharmacy-detail/model/use-reveal-with-challenge";
import { RevealChallengeBanner } from "@/features/pharmacy-detail/ui/reveal-challenge-banner";
import {
  querySearchAction,
  revealProductHandle,
  type SearchActionItem,
} from "@/entities/pharmacy";
import { useMapStore } from "@/shared/model/use-map-store";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/shared/ui/popover";

const CITY_GROUP_HEADING = (
  <span className="flex items-center gap-1.5">
    <MapPin className="size-3.5" />
    Πόλεις
  </span>
);

const PHARMACY_GROUP_HEADING = (
  <span className="flex items-center gap-1.5">
    <Pill className="size-3.5" />
    Φαρμακεία
  </span>
);

const ADDRESS_GROUP_HEADING = (
  <span className="flex items-center gap-1.5">
    <MapPinHouse className="size-3.5" />
    Διευθύνσεις
  </span>
);

export function SearchCity({
  onLocate,
  isLocating,
}: {
  onLocate?: () => void;
  isLocating?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const { push } = useRouter();
  const setProductPopupTarget = useMapStore((state) => state.setProductPopupTarget);
  const mapActive = useMapStore((state) => state.mapActive);
  const { challenge, challengeError, reveal, verifyChallenge } = useRevealWithChallenge();

  const debouncedQuery = useDebounce(inputValue, 300);
  const shouldSearch = debouncedQuery.length >= 3;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["product-search", debouncedQuery],
    queryFn: () => querySearchAction(debouncedQuery),
    enabled: shouldSearch,
    staleTime: 60_000,
    retry: false,
  });

  const hasResults =
    data &&
    (data.cities.length > 0 ||
      data.pharmacies.length > 0 ||
      data.addresses.length > 0);
  const showLoading = isLoading || isFetching;

  const openPopup = (detail: Awaited<ReturnType<typeof revealProductHandle>>) => {
    const { latitude, longitude } = detail.location;
    if (latitude == null || longitude == null) throw new Error("Pharmacy has no map coordinates");
    setProductPopupTarget({
      detail,
      center: [longitude, latitude],
      timeFilter: "now",
    });
  };

  const openDetail = (detail: Awaited<ReturnType<typeof revealProductHandle>>) => {
    // Without a mounted map the popup target has nowhere to render;
    // fall back to navigating to the canonical pharmacy URL.
    if (!mapActive) {
      push(detail.canonical_path);
      return;
    }
    openPopup(detail);
  };

  const openHandle = async (item: SearchActionItem) => {
    try {
      const detail = await reveal(item.handle);
      // Search results use the same reveal interaction as map results and
      // surface the popup on mapped layouts, or navigate to the canonical
      // URL where no map is mounted.
      if (detail) openDetail(detail);
    } catch {
      toast.error("Δεν ήταν δυνατή η φόρτωση των στοιχείων.");
    } finally {
      setOpen(false);
      setInputValue("");
    }
  };

  return (
    <div className="relative w-full">
      <Command className="overflow-visible bg-transparent" shouldFilter={false}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor>
            <div data-popover-anchor className="flex items-center w-full rounded-full h-12 bg-sidebar-accent border border-sidebar-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 overflow-hidden px-3">
              {showLoading ? <Loader2 className="size-5 shrink-0 text-muted-foreground mr-2 animate-spin" /> : <Search className="size-5 shrink-0 text-muted-foreground mr-2" />}
              <CommandPrimitive.Input placeholder="Αναζήτηση πόλης, φαρμακείου..." className="h-full w-full border-none focus:ring-0 bg-transparent text-base outline-none placeholder:text-muted-foreground" value={inputValue} onValueChange={setInputValue} onFocus={() => setOpen(true)} />
              {onLocate && <button type="button" onClick={onLocate} disabled={isLocating} className="ml-2 p-1.5 hover:bg-background rounded-full text-muted-foreground hover:text-primary transition-colors disabled:opacity-50">{isLocating ? <Loader2 className="size-5 shrink-0 animate-spin" /> : <Crosshair className="size-5 shrink-0" />}<span className="sr-only">Εντοπισμός</span></button>}
            </div>
          </PopoverAnchor>
          <PopoverContent className="p-0 w-(--radix-popover-trigger-width)" align="start" onOpenAutoFocus={(event) => event.preventDefault()}>
            <CommandList>
              {!shouldSearch && <div className="py-6 text-center text-sm text-muted-foreground">Πληκτρολογήστε τουλάχιστον 3 χαρακτήρες...</div>}
              {shouldSearch && !showLoading && !hasResults && <CommandEmpty>Δεν βρέθηκαν αποτελέσματα.</CommandEmpty>}
              {data?.cities.length ? <CommandGroup heading={CITY_GROUP_HEADING}>{data.cities.map((city: SearchActionItem) => <CommandItem key={`city-${city.handle}`} value={`city-${city.slug ?? city.name}`} onSelect={() => { setOpen(false); setInputValue(""); if (city.slug) push(`/efimeries/${city.slug}`); }}>{city.name}</CommandItem>)}</CommandGroup> : null}
              {data?.pharmacies.length ? <CommandGroup heading={PHARMACY_GROUP_HEADING}>{data.pharmacies.map((item: SearchActionItem) => <CommandItem key={`pharmacy-${item.handle}`} value={`pharmacy-${item.handle}`} onSelect={() => void openHandle(item)}><div className="flex flex-col"><span>{item.name}</span><span className="text-xs text-muted-foreground">{item.city}</span></div></CommandItem>)}</CommandGroup> : null}
              {data?.addresses.length ? <CommandGroup heading={ADDRESS_GROUP_HEADING}>{data.addresses.map((item: SearchActionItem) => <CommandItem key={`address-${item.handle}`} value={`address-${item.handle}`} onSelect={() => void openHandle(item)}><div className="flex flex-col"><span>{item.text ?? item.name}</span><span className="text-xs text-muted-foreground">{item.name} - {item.city}</span></div></CommandItem>)}</CommandGroup> : null}
              {data && Object.values(data.has_more).some(Boolean) && <div className="border-t px-3 py-2 text-xs text-muted-foreground">Εμφανίζονται τα πιο σχετικά αποτελέσματα.</div>}
            </CommandList>
          </PopoverContent>
        </Popover>
      </Command>
      <RevealChallengeBanner
        challenge={challenge}
        challengeError={challengeError}
        onVerified={async (providerToken) => {
          const detail = await verifyChallenge(providerToken);
          if (detail) openDetail(detail);
        }}
      />
    </div>
  );
}
