"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone } from "lucide-react";

import {
  dutyPeriodsToPharmacyHours,
  getPharmacyStatus,
  completeProductChallenge,
  getProductDetail,
  type ActionPublicDetail,
  type PharmacyHour,
} from "@/entities/pharmacy";
import { FavoriteButton } from "@/features/favorites";
import {
  NavigationSettingsSheet,
  PharmacyNavigationDialog,
} from "@/features/pharmacy-navigation";
import {
  PharmacyHours,
  PharmacyStatusBadge,
  DetailChallenge,
  getChallengeErrorMessage,
  getChallengeRequestToken,
  ReportDialog,
  SharePharmacyDialog,
} from "@/features/pharmacy-detail";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Map, MapMarker, MarkerContent } from "@/shared/ui/map";
import { BackButton } from "./back-button";
import { PharmacyMapMarkerContent } from "./pharmacy-map-marker";

export function ProductPharmacyPage({ requestedPath }: { requestedPath: string }) {
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<ActionPublicDetail | null>(null);
  const [error, setError] = useState(false);
  const [challengeRequestToken, setChallengeRequestToken] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const publicId = requestedPath.split("--").at(-1) ?? requestedPath;

  const loadDetail = useCallback(() => {
    let active = true;
    void getProductDetail(publicId).then((value) => {
      if (!active) return;
      setPharmacy(value);
      setError(false);
      setChallengeRequestToken(null);
      if (value.canonical_path !== `/farmakeia/${requestedPath}`) {
        router.replace(value.canonical_path);
      }
    }).catch((reason: unknown) => {
      if (!active) return;
      const requestToken = getChallengeRequestToken(reason);
      if (requestToken) {
        setChallengeRequestToken(requestToken);
        setChallengeError(null);
      } else if (reason instanceof Error && "status" in reason && (reason as { status?: number }).status === 428) {
        setChallengeError(getChallengeErrorMessage(reason));
      } else {
        setError(true);
      }
    });
    return () => { active = false; };
  }, [publicId, requestedPath, router]);

  useEffect(() => loadDetail(), [loadDetail]);

  const handleChallengeVerified = useCallback(async (turnstileToken: string) => {
    if (!challengeRequestToken) return;
    try {
      await completeProductChallenge(challengeRequestToken, turnstileToken);
      setChallengeRequestToken(null);
      setChallengeError(null);
      loadDetail();
    } catch (reason) {
      setChallengeError(getChallengeErrorMessage(reason));
      throw reason;
    }
  }, [challengeRequestToken, loadDetail]);

  const hours = useMemo<PharmacyHour[]>(
    () => (pharmacy ? dutyPeriodsToPharmacyHours(pharmacy.duty.periods) : []),
    [pharmacy],
  );

  if (challengeRequestToken || challengeError) return <div className="grid min-h-screen place-items-center p-6 text-center"><div><p className="text-base font-semibold">Απαιτείται επιβεβαίωση</p><p className="mt-2 text-sm text-muted-foreground">Η προβολή πολλών διαφορετικών στοιχείων απαιτεί πρόσθετο έλεγχο.</p>{challengeRequestToken ? <DetailChallenge errorMessage={challengeError} onVerified={handleChallengeVerified} /> : <p className="mt-3 text-sm text-destructive">{challengeError}</p>}</div></div>;
  if (error) return <div className="grid min-h-screen place-items-center p-6"><p className="text-sm text-destructive">Το φαρμακείο δεν βρέθηκε ή η υπηρεσία δεν είναι διαθέσιμη.</p></div>;
  if (!pharmacy) return <div className="grid min-h-screen place-items-center p-6"><p className="text-sm text-muted-foreground">Φόρτωση στοιχείων...</p></div>;

  const coordinates = pharmacy.location.latitude != null && pharmacy.location.longitude != null;
  const navigationPharmacy = {
    name: pharmacy.name,
    address: pharmacy.address,
    phone: pharmacy.phone,
    latitude: pharmacy.location.latitude,
    longitude: pharmacy.location.longitude,
  };
  const liveDuty = pharmacy.duty.data_status === "fresh" || pharmacy.duty.data_status === "partial";
  const statusResult = liveDuty
    ? getPharmacyStatus(hours, null, null, "now")
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <div className="relative z-10 flex min-h-[50vh] flex-1 flex-col bg-background md:h-screen md:overflow-y-auto">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/80 p-6 backdrop-blur-xl md:border-none">
          <BackButton />
          <span className="max-w-50 truncate text-sm font-medium md:hidden">{pharmacy.name}</span>
          <div className="flex items-center gap-1">
            <NavigationSettingsSheet className="rounded-full border-0 hover:bg-muted/50" />
            <SharePharmacyDialog pharmacyName={pharmacy.name} pharmacyAddress={pharmacy.address} />
            <FavoriteButton pharmacyId={pharmacy.public_id} className="text-foreground hover:text-rose-500" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl space-y-8 px-6 pb-32 pt-2 md:pb-10">
          <div className="space-y-4">
            {pharmacy.is_frequent_duty && (
              <Badge variant="secondary" className="gap-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100/80 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/40">
                <span aria-hidden="true">★</span>
                ΣΥΧΝΑ ΕΦΗΜΕΡΕΥΟΝ
              </Badge>
            )}

            <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{pharmacy.name}</h1>

            <div className="flex items-start gap-2">
              <MapPin className="mt-1 size-5 shrink-0 text-muted-foreground" />
              <p className="text-lg leading-snug text-muted-foreground">{pharmacy.address}</p>
            </div>

            {statusResult ? (
              <PharmacyStatusBadge status={statusResult.status} minutes={statusResult.minutesUntilClose} />
            ) : (
              <p className="text-sm text-amber-700 dark:text-amber-400">Η ζωντανή κατάσταση εφημερίας δεν είναι διαθέσιμη σε αυτή την προβολή.</p>
            )}
          </div>

          <div className="h-px w-full bg-border/50" />

          <div className="hidden grid-cols-2 gap-3 md:grid">
            {pharmacy.phone ? (
              <Button size="lg" className="h-14 flex-col items-center justify-center gap-1 rounded-2xl text-lg shadow-sm transition-transform hover:scale-[1.02] md:h-20" asChild>
                <a href={`tel:${pharmacy.phone}`}>
                  <div className="flex items-center gap-2"><Phone className="size-5" /><span>Κλήση</span></div>
                  <span className="hidden text-xs font-normal opacity-80 md:block">{pharmacy.phone}</span>
                </a>
              </Button>
            ) : (
              <Button size="lg" className="h-14 rounded-2xl text-lg md:h-20" disabled><Phone className="size-5" /> Κλήση</Button>
            )}
            <PharmacyNavigationDialog
              pharmacy={navigationPharmacy}
              triggerVariant="secondary"
              triggerLabel="Οδηγίες"
              className="h-14 flex-col items-center justify-center gap-1 rounded-2xl border border-transparent bg-muted/50 text-lg transition-all hover:scale-[1.02] hover:border-border hover:bg-muted md:h-20"
            />
          </div>

          <div className="space-y-4">
            <PharmacyHours hours={hours} />

            {pharmacy.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground md:hidden">
                <Phone className="size-4" />
                <a href={`tel:${pharmacy.phone}`} className="font-medium hover:text-primary">{pharmacy.phone}</a>
              </div>
            )}

            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && coordinates && (
              <div className="group relative aspect-video overflow-hidden rounded-3xl border bg-muted">
                <iframe
                  title={`Street View για ${pharmacy.name}`}
                  sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                  className="h-full w-full opacity-90 transition-opacity group-hover:opacity-100"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&location=${pharmacy.location.latitude},${pharmacy.location.longitude}&pitch=10&fov=80`}
                />
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${pharmacy.location.latitude},${pharmacy.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/0"
                >
                  <Button variant="secondary" className="bg-background/80 shadow-lg backdrop-blur-md hover:bg-background">Άνοιγμα Street View</Button>
                </a>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <ReportDialog pharmacyId={pharmacy.public_id} pharmacyName={pharmacy.name} />
            </div>
          </div>
        </main>
      </div>

      <div className="relative order-first h-[40vh] border-b border-border bg-muted md:order-last md:sticky md:top-0 md:h-screen md:w-[50%] md:border-l lg:w-[55%]">
        {coordinates ? (
          <Map center={[pharmacy.location.longitude!, pharmacy.location.latitude!]} zoom={15} attributionControl={false} interactive={false}>
            <MapMarker longitude={pharmacy.location.longitude!} latitude={pharmacy.location.latitude!}>
              <MarkerContent>
                <PharmacyMapMarkerContent pharmacyId={pharmacy.public_id} pharmacyName={pharmacy.name} />
              </MarkerContent>
            </MapMarker>
          </Map>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-muted/50 text-muted-foreground"><MapPin className="mb-4 size-12 opacity-20" /><p>Ο χάρτης δεν είναι διαθέσιμος</p></div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-gradient-to-t from-background via-background/50 to-transparent md:hidden" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 p-4 backdrop-blur-lg md:hidden">
        <div className="grid grid-cols-2 gap-3">
          {pharmacy.phone ? (
            <Button size="lg" className="w-full rounded-xl shadow-lg" asChild><a href={`tel:${pharmacy.phone}`}><Phone className="mr-2 size-4" /> Κλήση</a></Button>
          ) : (
            <Button size="lg" className="w-full rounded-xl" disabled><Phone className="mr-2 size-4" /> Κλήση</Button>
          )}
          <PharmacyNavigationDialog pharmacy={navigationPharmacy} triggerLabel="Πλοήγηση" className="w-full rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700" />
        </div>
      </div>
    </div>
  );
}
