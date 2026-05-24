"use client";

import { useMemo, useState } from "react";
import { Apple, Check, Copy, MapPinned, Navigation, Phone } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/shared";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  buildNavigationLinks,
} from "../lib/build-navigation-links";
import type { ArrivalEstimate } from "@/entities/pharmacy";
import type { NavigationPharmacy } from "../model/types";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

interface PharmacyNavigationDialogProps {
  pharmacy: NavigationPharmacy;
  triggerVariant?: ButtonVariant;
  triggerLabel?: string;
  compact?: boolean;
  className?: string;
  arrivalEstimate?: ArrivalEstimate | null;
}

export function PharmacyNavigationDialog({
  pharmacy,
  triggerVariant = "default",
  triggerLabel = "Οδηγίες",
  compact = false,
  className,
  arrivalEstimate,
}: PharmacyNavigationDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const links = useMemo(() => buildNavigationLinks(pharmacy), [pharmacy]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(links.copyText);
      setCopied(true);
      toast.success("Τα στοιχεία αντιγράφηκαν!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying navigation details:", error);
      toast.error("Αποτυχία αντιγραφής");
    }
  };

  const providerLinks = [
    {
      name: "Google Maps",
      icon: Navigation,
      url: links.googleMapsUrl,
      className: "hover:border-primary/40 hover:bg-primary/10",
    },
    {
      name: "Apple Maps",
      icon: Apple,
      url: links.appleMapsUrl,
      className: "hover:border-foreground/30 hover:bg-muted",
    },
    {
      name: "Waze",
      icon: MapPinned,
      url: links.wazeUrl,
      className: "hover:border-sky-500/40 hover:bg-sky-500/10",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={compact ? "icon" : "lg"}
          className={cn(compact && "size-8 rounded-full", className)}
          aria-label={compact ? triggerLabel : undefined}
        >
          <Navigation className={compact ? "size-4" : "size-5"} />
          {!compact && <span>{triggerLabel}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Πλοήγηση</DialogTitle>
          <DialogDescription>
            Επιλέξτε εφαρμογή για το φαρμακείο {pharmacy.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {arrivalEstimate?.risk === "tight" && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
              Ο χρόνος είναι οριακός. Καλό είναι να τηλεφωνήσετε πριν
              ξεκινήσετε.
            </div>
          )}

          {arrivalEstimate?.risk === "too_late" && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Μάλλον δεν προλαβαίνετε πριν κλείσει. Δείτε και τις επόμενες
              προτεινόμενες επιλογές.
            </div>
          )}

          <div className="grid gap-2">
            {providerLinks.map((provider) => {
              const Icon = provider.icon;

              return (
                <Button
                  key={provider.name}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "h-12 justify-start text-base",
                    provider.className
                  )}
                  disabled={!provider.url}
                  asChild={Boolean(provider.url)}
                >
                  {provider.url ? (
                    <a
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="size-5" />
                      <span>{provider.name}</span>
                    </a>
                  ) : (
                    <span>
                      <Icon className="size-5" />
                      <span>{provider.name}</span>
                    </span>
                  )}
                </Button>
              );
            })}
          </div>

          {!links.hasCoordinates && (
            <p className="text-xs text-muted-foreground">
              Δεν υπάρχουν διαθέσιμες συντεταγμένες. Μπορείτε να αντιγράψετε τη
              διεύθυνση ή να καλέσετε το φαρμακείο.
            </p>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="secondary"
              size="lg"
              className="h-12 justify-center text-base"
              onClick={handleCopy}
            >
              {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
              {copied ? "Αντιγράφηκε" : "Αντιγραφή"}
            </Button>

            {links.telUrl && (
              <Button
                variant="secondary"
                size="lg"
                className="h-12 justify-center text-base"
                asChild
              >
                <a href={links.telUrl}>
                  <Phone className="size-5" />
                  Κλήση
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
