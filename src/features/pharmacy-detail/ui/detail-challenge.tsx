"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTheme } from "next-themes";

interface DetailChallengeProps {
  onVerified: (turnstileToken: string) => Promise<void>;
  errorMessage?: string | null;
}

export function DetailChallenge({ onVerified, errorMessage }: DetailChallengeProps) {
  const { resolvedTheme } = useTheme();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return (
      <p className="mt-3 text-sm text-destructive">
        Η επαλήθευση δεν είναι διαθέσιμη σε αυτό το περιβάλλον.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <Turnstile
        aria-label="Επαλήθευση Cloudflare Turnstile"
        siteKey={siteKey}
        options={{
          theme: resolvedTheme === "dark" ? "dark" : "light",
          size: "normal",
          language: "el",
        }}
        onSuccess={(token) => {
          setPending(true);
          setMessage(null);
          void onVerified(token)
            .catch(() => setMessage("Η επαλήθευση απέτυχε. Δοκιμάστε ξανά."))
            .finally(() => setPending(false));
        }}
        onError={() => setMessage("Η επαλήθευση απέτυχε. Δοκιμάστε ξανά.")}
        onExpire={() => setMessage("Η επαλήθευση έληξε. Δοκιμάστε ξανά.")}
      />
      {pending && <p className="text-sm text-muted-foreground">Επαλήθευση...</p>}
      {(errorMessage || message) && (
        <p className="text-sm text-destructive">{errorMessage || message}</p>
      )}
    </div>
  );
}
