"use client";

import * as React from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";
import { useLocateMe } from "@/features/locate-user/model/use-locate-me";
import { useMapStore } from "@/shared/model/use-map-store";

import {
  type Pharmacy,
  type TimeFilter,
  useCityPharmacies,
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
  CityPharmacyList,
  SidebarBranding,
  SidebarCopyright,
} from "@/widgets/sidebar";

import { CityTimeFilter } from "@/features/find-pharmacies";
import { CitySearchModal, SearchCity } from "@/features/search-city";

interface CitySidebarProps extends React.ComponentProps<typeof Sidebar> {
  cityName: string;
  citySlug: string;
  activeTime: TimeFilter;
  pharmacies: Pharmacy[];
}

export function CitySidebar({
  cityName,
  citySlug,
  activeTime,
  pharmacies: initialPharmacies,
  ...props
}: CitySidebarProps) {
  const { locate, isLoading } = useLocateMe();
  const flyTo = useMapStore((state) => state.flyTo);
  const router = useRouter();

  const handleLocate = () => {
    locate((coords) => {
      flyTo([coords.longitude, coords.latitude], 15);
    });
  };

  const { data: pharmacies } = useCityPharmacies({
    citySlug,
    timeFilter: activeTime,
    initialData: initialPharmacies,
  });

  const displayPharmacies = pharmacies ?? initialPharmacies;

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
            <SearchCity onLocate={handleLocate} isLocating={isLoading} />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 mask-fade-right">
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
        <SidebarGroup className="group-data-[collapsible=icon]:hidden pt-0">
          <SidebarGroupContent>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Φαρμακεια ({displayPharmacies.length})
              </span>
            </div>
            <CityPharmacyList
              pharmacies={displayPharmacies}
              count={displayPharmacies.length}
              timeFilter={activeTime}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-6 py-4 border-t border-sidebar-border">
        <SidebarCopyright />
      </SidebarFooter>
    </Sidebar>
  );
}
