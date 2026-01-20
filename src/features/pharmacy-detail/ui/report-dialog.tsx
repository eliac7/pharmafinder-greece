"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Flag } from "lucide-react";
import { ReportPharmacyForm } from "@/features/pharmacy-detail";

interface ReportDialogProps {
  pharmacyId: number;
  pharmacyName: string;
}

export function ReportDialog({ pharmacyId, pharmacyName }: ReportDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-destructive mt-2"
        >
          <Flag className="size-4" />
          Αναφορά Προβλήματος
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Αναφορά Προβλήματος</DialogTitle>
          <DialogDescription>
            Αναφέρετε κάποιο πρόβλημα για το φαρμακείο {pharmacyName}. (π.χ.
            λάθος ωράριο, λάθος διεύθυνση)
          </DialogDescription>
        </DialogHeader>
        <ReportPharmacyForm
          pharmacyId={pharmacyId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
