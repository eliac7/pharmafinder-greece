"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { cn } from "@/shared/lib/hooks/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/shared/ui/popover";
import { cityApi } from "@/entities/city/api/city.api";

export function SearchCity() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: () => cityApi.getCities(),
  });

  return (
    <div className="relative w-full">
      <Command className="overflow-visible bg-transparent">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor>
            <div className="flex items-center w-full rounded-full h-12 bg-sidebar-accent border border-sidebar-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 overflow-hidden px-3">
              <Search className="size-5 shrink-0 text-muted-foreground mr-2" />
              <CommandPrimitive.Input
                placeholder="Αναζήτηση πόλης ή περιοχής..."
                className="h-full w-full border-none focus:ring-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                onFocus={() => setOpen(true)}
              />
            </div>
          </PopoverAnchor>
          <PopoverContent
            className="p-0 w-(--radix-popover-trigger-width)"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <CommandList>
              <CommandEmpty>Δεν βρέθηκε πόλη.</CommandEmpty>
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.slug}
                    value={city.city}
                    onSelect={() => {
                      setOpen(false);
                      router.push(`/efimeries/${city.slug}`);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                    {city.city}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({city.prefecture})
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </PopoverContent>
        </Popover>
      </Command>
    </div>
  );
}
