"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTheme } from "next-themes";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/hooks/utils";
import { useReportPharmacy } from "../model/use-report-pharmacy";

interface ReportPharmacyFormProps {
  pharmacyId: number;
  onSuccess?: () => void;
}

export function ReportPharmacyForm({
  pharmacyId,
  onSuccess,
}: ReportPharmacyFormProps) {
  const { resolvedTheme } = useTheme();
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { mutate, isPending } = useReportPharmacy();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) return;

    mutate(
      {
        pharmacyId,
        data: {
          report_type: reportType,
          description,
          turnstile_token: turnstileToken,
        },
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setReportType("");
          setDescription("");
          setTimeout(() => {
            setShowSuccess(false);
            onSuccess?.();
          }, 2000);
        },
      }
    );
  };

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.warn("Turnstile site key not configured");
    return null;
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in duration-300">
        <div className="flex items-center justify-center size-12 rounded-full bg-primary/15 text-primary">
          <CheckCircle className="size-6" />
        </div>
        <p className="text-sm font-medium text-primary">
          Η αναφορά σας υποβλήθηκε επιτυχώς!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Τύπος προβλήματος (π.χ. Λάθος ωράριο)"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          required
          className="h-11 rounded-xl"
        />
        <textarea
          placeholder="Περιγραφή (προαιρετικό)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={cn(
            "flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          )}
        />
      </div>

      <div className="flex justify-center">
        <Turnstile
          siteKey={siteKey}
          onSuccess={setTurnstileToken}
          onError={() => setTurnstileToken(null)}
          onExpire={() => setTurnstileToken(null)}
          options={{
            theme: resolvedTheme === "dark" ? "dark" : "light",
            size: "normal",
            language: "el",
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || !turnstileToken || !reportType.trim()}
        className="h-11 rounded-xl gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Υποβολή...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Υποβολή Αναφοράς
          </>
        )}
      </Button>
    </form>
  );
}
