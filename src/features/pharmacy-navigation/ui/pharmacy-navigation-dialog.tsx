"use client";

import { useId, useMemo, useState } from "react";
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
  getNavigationProviderUrl,
} from "../lib/build-navigation-links";
import type {
  NavigationPharmacy,
  NavigationProvider,
} from "../model/types";
import { useNavigationPreference } from "../model/use-navigation-preference";

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
}

export function PharmacyNavigationDialog({
  pharmacy,
  triggerVariant = "default",
  triggerLabel = "Οδηγίες",
  compact = false,
  className,
}: PharmacyNavigationDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rememberSelection, setRememberSelection] = useState(false);
  const rememberSelectionId = useId();
  const { preferredProvider, setPreferredProvider } =
    useNavigationPreference();
  const links = useMemo(() => buildNavigationLinks(pharmacy), [pharmacy]);
  const directNavigationUrl =
    preferredProvider === "ask"
      ? null
      : getNavigationProviderUrl(links, preferredProvider);

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
      id: "google-maps",
      name: "Google Maps",
      icon: Navigation,
      url: links.googleMapsUrl,
      className: "hover:border-primary/40 hover:bg-primary/10",
    },
    {
      id: "apple-maps",
      name: "Apple Maps",
      icon: Apple,
      url: links.appleMapsUrl,
      className: "hover:border-foreground/30 hover:bg-muted",
    },
    {
      id: "waze",
      name: "Waze",
      icon: MapPinned,
      url: links.wazeUrl,
      className: "hover:border-sky-500/40 hover:bg-sky-500/10",
    },
  ] satisfies Array<{
    id: NavigationProvider;
    name: string;
    icon: typeof Navigation;
    url: string | null;
    className: string;
  }>;

  const handleProviderClick = (provider: NavigationProvider) => {
    if (rememberSelection) {
      setPreferredProvider(provider);
    }

    setOpen(false);
    setRememberSelection(false);
  };

  const triggerContent = (
    <>
      <Navigation className={compact ? "size-4" : "size-5"} />
      {!compact && <span>{triggerLabel}</span>}
    </>
  );

  if (directNavigationUrl) {
    return (
      <Button
        variant={triggerVariant}
        size={compact ? "icon" : "lg"}
        className={cn(compact && "size-8 rounded-full", className)}
        aria-label={compact ? triggerLabel : undefined}
        asChild
      >
        <a
          href={directNavigationUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {triggerContent}
        </a>
      </Button>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setRememberSelection(false);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={compact ? "icon" : "lg"}
          className={cn(compact && "size-8 rounded-full", className)}
          aria-label={compact ? triggerLabel : undefined}
        >
          {triggerContent}
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
                      onClick={() => handleProviderClick(provider.id)}
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

          {links.hasCoordinates && (
            <label
              htmlFor={rememberSelectionId}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground"
            >
              <input
                id={rememberSelectionId}
                type="checkbox"
                checked={rememberSelection}
                onChange={(event) =>
                  setRememberSelection(event.target.checked)
                }
                className="size-4 accent-primary"
              />
              <span>Να θυμάσαι την επιλογή μου</span>
            </label>
          )}

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
