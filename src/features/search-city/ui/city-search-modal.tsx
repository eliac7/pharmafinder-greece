"use client";

import { cityApi } from "@/entities/city/api/city.api";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

interface CitySearchModalProps {
  trigger: React.ReactNode;
}

export function CitySearchModal({ trigger }: CitySearchModalProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: () => cityApi.getCities(),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="p-0 gap-0 max-w-md">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Αναζήτηση Πόλης</DialogTitle>
        </DialogHeader>
        <Command className="border-t">
          <CommandInput placeholder="Αναζήτηση..." />
          <CommandList className="max-h-[300px]">
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
                  className="cursor-pointer"
                >
                  {city.city}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({city.prefecture})
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
