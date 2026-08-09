"use client";

import { Apple, Check, CircleHelp, MapPinned, Navigation, Settings } from "lucide-react";

import { cn } from "@/shared";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import type { NavigationPreference } from "../model/types";
import { useNavigationPreference } from "../model/use-navigation-preference";

interface NavigationSettingsSheetProps {
  className?: string;
}

const preferenceOptions = [
  {
    value: "ask",
    label: "Να με ρωτάει κάθε φορά",
    description: "Εμφάνιση όλων των διαθέσιμων εφαρμογών.",
    icon: CircleHelp,
  },
  {
    value: "google-maps",
    label: "Google Maps",
    description: "Άμεσο άνοιγμα οδηγιών στο Google Maps.",
    icon: Navigation,
  },
  {
    value: "apple-maps",
    label: "Apple Maps",
    description: "Άμεσο άνοιγμα οδηγιών στο Apple Maps.",
    icon: Apple,
  },
  {
    value: "waze",
    label: "Waze",
    description: "Άμεσο άνοιγμα οδηγιών στο Waze.",
    icon: MapPinned,
  },
] satisfies Array<{
  value: NavigationPreference;
  label: string;
  description: string;
  icon: typeof Settings;
}>;

export function NavigationSettingsSheet({
  className,
}: NavigationSettingsSheetProps) {
  const { preferredProvider, setPreferredProvider } =
    useNavigationPreference();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("shrink-0", className)}
          aria-label="Ρυθμίσεις"
        >
          <Settings className="size-[1.2rem]" />
        </Button>
      </SheetTrigger>
      <SheetContent className="border-border bg-background">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="text-lg">Ρυθμίσεις</SheetTitle>
          <SheetDescription>
            Προσαρμόστε τον τρόπο που λειτουργεί το Pharmafinder σε αυτή τη
            συσκευή.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-6 py-2">
          <div>
            <h2 className="font-semibold text-foreground">Πλοήγηση</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Προεπιλεγμένη εφαρμογή για οδηγίες προς ένα φαρμακείο.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Προεπιλεγμένη εφαρμογή πλοήγησης"
            className="grid gap-2"
          >
            {preferenceOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = preferredProvider === option.value;

              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 transition-colors",
                    "hover:border-primary/50 hover:bg-primary/5",
                    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                    isSelected && "border-primary bg-primary/10"
                  )}
                >
                  <input
                    type="radio"
                    name="navigation-preference"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setPreferredProvider(option.value)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-card-foreground">
                      {option.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border border-border",
                      isSelected &&
                        "border-primary bg-primary text-primary-foreground"
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="size-3.5" />}
                  </span>
                </label>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Η επιλογή αποθηκεύεται μόνο σε αυτό το πρόγραμμα περιήγησης.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
