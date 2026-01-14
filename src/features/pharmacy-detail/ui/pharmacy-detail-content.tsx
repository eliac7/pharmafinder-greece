"use client";

import {
  Cross,
  MapPin,
  Phone,
  Navigation,
  Eye,
  ArrowLeft,
  Flag,
  Sparkles,
} from "lucide-react";
import { cn, useIsMobile } from "@/shared";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ReportPharmacyForm } from "./report-pharmacy-form";
import {
  getPharmacyStatus,
  formatPharmacyHours,
  type Pharmacy,
} from "@/entities/pharmacy";

interface PharmacyDetailContentProps {
  pharmacy: Pharmacy;
  showReportForm: boolean;
  onToggleReportForm: () => void;
  onBack: () => void;
}

// Title Case helper for Greek
function formatPrefecture(prefecture: string): string {
  return prefecture
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function PharmacyDetailContent({
  pharmacy,
  showReportForm,
  onToggleReportForm,
  onBack,
}: PharmacyDetailContentProps) {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${pharmacy.latitude},${pharmacy.longitude}`;

  return (
    <div className="flex flex-col h-full">
      {/* Header with gradient background */}
      <div className="relative bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="absolute top-4 left-4 size-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <ArrowLeft className="size-4" />
        </Button>

        {/* Pharmacy Icon */}
        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="flex items-center justify-center size-20 rounded-2xl bg-primary/15 text-primary shadow-lg shadow-primary/20">
            <Cross className="size-10" />
          </div>

          {/* Frequent Duty Badge */}
          {pharmacy.is_frequent_duty && (
            <Badge
              variant="secondary"
              className="gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20"
            >
              <Sparkles className="size-3.5" />
              Συχνά Εφημερεύον
            </Badge>
          )}

          {/* Name */}
          <h2 className="text-xl font-bold text-center text-foreground leading-tight px-4">
            {pharmacy.name}
          </h2>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-6">
        <div className="flex flex-col gap-5 py-6">
          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-muted shrink-0">
              <MapPin className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {pharmacy.address}
              </span>
              <span className="text-xs text-muted-foreground">
                {pharmacy.city}, {formatPrefecture(pharmacy.prefecture)}
              </span>
            </div>
          </div>
          {/* Phone */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-muted shrink-0">
              <Phone className="size-5 text-muted-foreground" />
            </div>
            <a
              href={`tel:${pharmacy.phone}`}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {pharmacy.phone}
            </a>
          </div>
          {/* Distance (if available) */}
          {typeof pharmacy.distance_km === "number" &&
            pharmacy.distance_km > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-xl bg-muted shrink-0">
                  <Navigation className="size-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {pharmacy.distance_km.toFixed(1)} km απόσταση
                </span>
              </div>
            )}
          <Separator className="my-2" />
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              asChild
              className="h-12 rounded-xl gap-2 font-semibold shadow-md shadow-primary/20"
            >
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="size-4" />
                Οδηγίες
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-xl gap-2 font-semibold"
            >
              <a
                href={`tel:${pharmacy.phone}`}
                className="flex items-center justify-center"
              >
                <Phone className="size-4" />
                Κλήση
              </a>
            </Button>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl gap-2 text-muted-foreground"
          >
            <a href={streetViewUrl} target="_blank" rel="noopener noreferrer">
              <Eye className="size-4" />
              Προβολή Street View
            </a>
          </Button>
          <Separator className="my-2" />
          {/* Report Section */}
          <div className="flex flex-col gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleReportForm}
              className={cn(
                "gap-2 text-muted-foreground hover:text-destructive",
                showReportForm && "text-destructive"
              )}
            >
              <Flag className="size-4" />
              Αναφορά Προβλήματος
            </Button>

            {showReportForm && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <ReportPharmacyForm
                  pharmacyId={pharmacy.id}
                  onSuccess={onToggleReportForm}
                />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
