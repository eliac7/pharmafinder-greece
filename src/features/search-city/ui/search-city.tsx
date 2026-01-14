"use client";

import { useQuery } from "@tanstack/react-query";
import { Command as CommandPrimitive } from "cmdk";
import { Loader2, MapPin, MapPinHouse, Pill, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { useDebounce, searchApi } from "@/shared";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/shared/ui/popover";

export function SearchCity() {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const router = useRouter();

  const debouncedQuery = useDebounce(inputValue, 300);

  const shouldSearch = debouncedQuery.length >= 3;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["unified-search", debouncedQuery],
    queryFn: () => searchApi.unifiedSearch({ q: debouncedQuery }),
    enabled: shouldSearch,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const hasResults =
    data &&
    (data.cities.length > 0 ||
      data.pharmacies.length > 0 ||
      data.addresses.length > 0);

  const showLoading = isLoading || isFetching;

  return (
    <div className="relative w-full">
      <Command className="overflow-visible bg-transparent" shouldFilter={false}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor>
            <div className="flex items-center w-full rounded-full h-12 bg-sidebar-accent border border-sidebar-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 overflow-hidden px-3">
              {showLoading ? (
                <Loader2 className="size-5 shrink-0 text-muted-foreground mr-2 animate-spin" />
              ) : (
                <Search className="size-5 shrink-0 text-muted-foreground mr-2" />
              )}
              <CommandPrimitive.Input
                placeholder="Αναζήτηση πόλης, φαρμακείου..."
                className="h-full w-full border-none focus:ring-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                value={inputValue}
                onValueChange={setInputValue}
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
              {!shouldSearch && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Πληκτρολογήστε τουλάχιστον 3 χαρακτήρες...
                </div>
              )}

              {shouldSearch && !showLoading && !hasResults && (
                <CommandEmpty>Δεν βρέθηκαν αποτελέσματα.</CommandEmpty>
              )}

              {data && data.cities.length > 0 && (
                <CommandGroup
                  heading={
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      Πόλεις
                    </span>
                  }
                >
                  {data.cities.map((city) => (
                    <CommandItem
                      key={`city-${city.id}`}
                      value={`city-${city.slug}`}
                      onSelect={() => {
                        setOpen(false);
                        setInputValue("");
                        router.push(`/efimeries/${city.slug}`);
                      }}
                    >
                      {city.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {data && data.pharmacies.length > 0 && (
                <CommandGroup
                  heading={
                    <span className="flex items-center gap-1.5">
                      <Pill className="size-3.5" />
                      Φαρμακεία
                    </span>
                  }
                >
                  {data.pharmacies.map((pharmacy) => (
                    <CommandItem
                      key={`pharmacy-${pharmacy.id}`}
                      value={`pharmacy-${pharmacy.id}`}
                      onSelect={() => {
                        setOpen(false);
                        setInputValue("");
                        router.push(`/farmakeia/${pharmacy.id}`);
                      }}
                    >
                      <div className="flex flex-col">
                        <span>{pharmacy.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {pharmacy.city}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {data && data.addresses.length > 0 && (
                <CommandGroup
                  heading={
                    <span className="flex items-center gap-1.5">
                      <MapPinHouse className="size-3.5" />
                      Διευθύνσεις
                    </span>
                  }
                >
                  {data.addresses.map((pharmacy) => (
                    <CommandItem
                      key={`address-${pharmacy.id}`}
                      value={`address-${pharmacy.id}-${pharmacy.address}`}
                      onSelect={() => {
                        setOpen(false);
                        setInputValue("");
                        router.push(`/farmakeia/${pharmacy.id}`);
                      }}
                    >
                      <div className="flex flex-col">
                        <span>{pharmacy.address}</span>
                        <span className="text-xs text-muted-foreground">
                          {pharmacy.name} - {pharmacy.city}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </PopoverContent>
        </Popover>
      </Command>
    </div>
  );
}
