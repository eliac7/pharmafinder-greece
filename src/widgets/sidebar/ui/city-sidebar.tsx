"use client";

import * as React from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Crosshair, Loader2 } from "lucide-react";
import { useLocateMe } from "@/features/locate-user/model/use-locate-me";
import { useLocationStore } from "@/features/locate-user";

import {
  type Pharmacy,
  type TimeFilter,
} from "@/entities/pharmacy";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/shared/ui/sidebar";
import {
  ProductCityList,
  SidebarBranding,
  SidebarCopyright,
} from "@/widgets/sidebar";

import {
  buildNearbyPharmaciesUrl,
  CityTimeFilter,
} from "@/features/find-pharmacies";
import { CitySearchModal, SearchCity } from "@/features/search-city";
import { Button } from "@/shared/ui/button";

interface CitySidebarProps extends React.ComponentProps<typeof Sidebar> {
  cityName: string;
  citySlug: string;
  activeTime: TimeFilter;
  pharmacies: Pharmacy[];
  nearbyRadius?: string;
}

export function CitySidebar({
  cityName,
  citySlug,
  activeTime,
  pharmacies: _initialPharmacies,
  nearbyRadius,
  ...props
}: CitySidebarProps) {
  // Retained for the server compatibility boundary; ProductCityList owns the live count.
  void _initialPharmacies;
  const { locate, isLoading } = useLocateMe();
  const { latitude, longitude } = useLocationStore();
  const router = useRouter();
  const nearbyUrl = buildNearbyPharmaciesUrl({
    timeFilter: activeTime,
    radius: nearbyRadius,
  });
  const hasLocation = latitude != null && longitude != null;

  const handleNearby = () => {
    if (hasLocation) {
      router.push(nearbyUrl);
      return;
    }

    locate(() => {
      router.push(nearbyUrl);
    });
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="md:hidden px-4 pt-4 pb-2 gap-3">
        {/* MOBILE HEADER */}
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0">
            <Image
              src="/pharmacy.png"
              alt="Pharmafinder"
              width={36}
              height={36}
              className="object-contain"
            />
          </Link>
          <div className="flex-1 relative">
            <SearchCity />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 mask-fade-right">
          <button
            type="button"
            onClick={handleNearby}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground border border-primary whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Crosshair className="size-3.5" />
            )}
            Κοντά μου
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground border border-border whitespace-nowrap shrink-0">
            <span className="text-muted-foreground text-xs">Πόλη:</span>
            <span className="font-bold">{cityName}</span>
            <CitySearchModal
              trigger={
                <button
                  type="button"
                  className="ml-1 p-0.5 hover:bg-black/5 rounded-full transition-colors"
                >
                  <ArrowRightLeft className="size-3" />
                </button>
              }
            />
          </div>

          {/* Time Filter Chips */}
          <CityTimeFilter citySlug={citySlug} activeTime={activeTime} />
        </div>
      </SidebarHeader>

      <SidebarHeader className="hidden md:block px-6 pt-6 pb-4">
        {/* DESKTOP HEADER */}
        <SidebarBranding />

        <div className="relative mt-2">
          <SearchCity />
        </div>

        <div className="mt-4">
          <Button
            onClick={handleNearby}
            disabled={isLoading}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg transition-all active:scale-95"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-5 animate-spin" />
            ) : (
              <Crosshair className="mr-2 size-5" />
            )}
            {isLoading ? "Εντοπισμός..." : "Εφημερίες κοντά μου"}
          </Button>
        </div>

        <div className="mt-4 px-1 space-y-3">
          <div>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-xs font-medium text-muted-foreground">
                Εφημερίες σε{" "}
                <span className="text-foreground font-bold">{cityName}</span>
              </span>
              <CitySearchModal
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-teal-700 dark:text-primary font-medium hover:text-teal-600 dark:hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="size-3" />
                    <span>Αλλαγή</span>
                  </button>
                }
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full">
              <CityTimeFilter
                citySlug={citySlug}
                activeTime={activeTime}
                fullWidth
              />
            </div>
          </div>
        </div>

        <SidebarSeparator className="mt-4" />
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden pt-0 flex-1 min-h-0">
          <SidebarGroupContent className="flex flex-1 min-h-0 flex-col">
            <ProductCityList citySlug={citySlug} time={activeTime} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-6 py-4 border-t border-sidebar-border">
        <SidebarCopyright />
      </SidebarFooter>
    </Sidebar>
  );
}
