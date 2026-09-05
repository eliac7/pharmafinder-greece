"use client";

import { DetailChallenge } from "./detail-challenge";

interface RevealChallengeBannerProps {
  challenge: unknown;
  challengeError?: string | null;
  variant?: "inline" | "overlay";
  onVerified: (turnstileToken: string) => Promise<void>;
}

export function RevealChallengeBanner({
  challenge,
  challengeError,
  variant = "inline",
  onVerified,
}: RevealChallengeBannerProps) {
  if (!challenge) return null;

  const containerClass =
    variant === "overlay"
      ? "absolute left-1/2 z-30 w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 rounded-xl border bg-background/95 p-4 text-center shadow-xl backdrop-blur top-[calc(env(safe-area-inset-top,0px)+1.25rem)]"
      : "mt-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-center";

  return (
    <div className={containerClass}>
      <p className="text-sm font-medium">
        Απαιτείται επιβεβαίωση για την προβολή στοιχείων.
      </p>
      <DetailChallenge errorMessage={challengeError} onVerified={onVerified} />
    </div>
  );
}
