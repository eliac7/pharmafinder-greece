"use client";

import { Crosshair, LocateFixed, MapPinned, Search } from "lucide-react";
import { toast } from "sonner";

import { useLocateMe, useLocationStore } from "@/features/locate-user";
import { CitySearchModal } from "@/features/search-city";
import { useMapStore } from "@/shared/model/use-map-store";
import { Button } from "@/shared/ui/button";

export function LocationChoicePanel() {
  const { latitude, longitude } = useLocationStore();
  const { locate, locateByIp, isLoading, isIpLoading, error } = useLocateMe();
  const setManualLocationAdjusting = useMapStore(
    (state) => state.setManualLocationAdjusting
  );

  if (latitude && longitude) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LocateFixed className="size-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Βρείτε το πιο χρήσιμο φαρμακείο
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Επιλέξτε πώς θέλετε να ορίσετε το σημείο εκκίνησης για κοντινά
            αποτελέσματα και εκτίμηση άφιξης.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <Button
          type="button"
          onClick={() => locate()}
          disabled={isLoading}
          className="h-11 justify-start rounded-xl gap-2"
        >
          <Crosshair className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Εντοπισμός..." : "Χρήση τοποθεσίας μου"}
        </Button>

        <CitySearchModal
          trigger={
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start rounded-xl gap-2"
            >
              <Search className="size-4" />
              Αναζήτηση πόλης
            </Button>
          }
        />

        <Button
          type="button"
          variant="outline"
          className="h-11 justify-start rounded-xl gap-2"
          onClick={() => {
            setManualLocationAdjusting(true);
            toast.info("Πατήστε πάνω στον χάρτη για να ορίσετε τοποθεσία.");
          }}
        >
          <MapPinned className="size-4" />
          Ορισμός στον χάρτη
        </Button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <p>{error}</p>
          <Button
            type="button"
            variant="link"
            className="mt-1 h-auto p-0 text-xs"
            disabled={isIpLoading}
            onClick={() => locateByIp()}
          >
            {isIpLoading
              ? "Εντοπισμός μέσω IP..."
              : "Χρήση κατά προσέγγιση τοποθεσίας μέσω IP"}
          </Button>
        </div>
      )}
    </div>
  );
}
