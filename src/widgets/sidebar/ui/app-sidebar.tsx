"use client";

import { Search, Crosshair } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/shared/ui/sidebar";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { PharmacyList } from "@/widgets/sidebar/ui/pharmacy-list";
import { useLocateMe } from "@/features/locate-user/model/use-locate-me";
import { useMapStore } from "@/shared/model/use-map-store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { locate, isLoading } = useLocateMe();
  const flyTo = useMapStore((state) => state.flyTo);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative size-10 shrink-0">
            <Image
              src="/pharmacy.png"
              alt="Pharmafinder"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">
            Pharmafinder
          </h1>
        </div>

        <div className="relative">
          <div className="flex w-full items-center rounded-full h-12 bg-sidebar-accent border border-sidebar-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 overflow-hidden">
            <div className="flex items-center justify-center pl-4 pr-2 text-muted-foreground">
              <Search className="size-5" />
            </div>
            <Input
              placeholder="Αναζήτηση πόλης ή περιοχής..."
              className="w-full bg-transparent border-none text-sidebar-foreground placeholder:text-muted-foreground focus-visible:ring-0 h-full text-base shadow-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button
            onClick={() => {
              locate((coords) => {
                flyTo([coords.longitude, coords.latitude], 15);
              });
            }}
            disabled={isLoading}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg transition-all active:scale-95"
            size="lg"
          >
            <Crosshair
              className={`mr-2 size-5 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Εντοπισμός..." : "Εντόπισέ Με"}
          </Button>
        </div>

        <SidebarSeparator className="mt-4" />
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <PharmacyList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-6 py-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Pharmafinder</span>
            <span className="flex gap-1">
              Made by{" "}
              <a
                href="https://ilias.dev"
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:text-primary hover:underline transition-colors"
              >
                Ilias Thalassochoritis
              </a>
            </span>
          </div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
