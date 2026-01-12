"use client";

import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { CitySearchModal } from "@/features/search-city/ui/city-search-modal";

const POPULAR_CITIES = [
  { name: "Αθήνα", slug: "athina" },
  { name: "Θεσσαλονίκη", slug: "thessaloniki" },
  { name: "Πειραιάς", slug: "peiraias" },
  { name: "Πάτρα", slug: "patra" },
  { name: "Ηράκλειο", slug: "irakleio" },
  { name: "Λάρισα", slug: "larisa" },
] as const;

export function QuickCityJump() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Δημοφιλείς Πόλεις</p>
      <div className="flex flex-wrap gap-2">
        {POPULAR_CITIES.map((city) => (
          <Badge
            key={city.slug}
            variant="outline"
            asChild
            className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
          >
            <Link href={`/efimeries/${city.slug}`}>{city.name}</Link>
          </Badge>
        ))}
      </div>
      <CitySearchModal
        trigger={
          <button className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2">
            Δεν βρήκες την πόλη σου;
          </button>
        }
      />
    </div>
  );
}
