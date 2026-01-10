"use client";

import { MapPin, Search, Crosshair, Stethoscope } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/shared/ui/sidebar";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { PharmacyList } from "@/widgets/sidebar/ui/pharmacy-list";
import { useLocateMe } from "@/features/locate-user/model/use-locate-me";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { locate, isLoading } = useLocateMe();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-border/5 p-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-lg tracking-tight">
              Pharmafinder
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Εφημερεύοντα Φαρμακεία
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Αναζήτηση περιοχής ή Τ.Κ."
                className="pl-9 bg-sidebar-accent/50 border-sidebar-border focus-visible:ring-primary/50"
              />
            </div>

            <div className="mt-4">
              <Button
                onClick={locate}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-95 group"
                variant="default"
                size="lg"
              >
                <Crosshair
                  className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Εντοπισμός..." : "Εντόπισέ Με"}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <div className="flex flex-col h-full min-h-0 px-2 py-2">
            <h3 className="mb-2 px-2 text-sm font-medium text-muted-foreground">
              Κοντινά Φαρμακεία
            </h3>
            <PharmacyList />
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/5 p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <p>© 2026 Pharmafinder</p>
          </div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
