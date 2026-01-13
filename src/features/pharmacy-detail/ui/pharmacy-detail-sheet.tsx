"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/shared/lib/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/shared/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet";
import { PharmacyDetailContent } from "@/features/pharmacy-detail";
import { type Pharmacy } from "@/entities/pharmacy";

interface PharmacyDetailSheetProps {
  pharmacy: Pharmacy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PharmacyDetailSheet({
  pharmacy,
  open,
  onOpenChange,
}: PharmacyDetailSheetProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [showReportForm, setShowReportForm] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setShowReportForm(false);
  };

  const handleBack = () => {
    handleClose();
    router.back();
  };

  const content = (
    <PharmacyDetailContent
      pharmacy={pharmacy}
      showReportForm={showReportForm}
      onToggleReportForm={() => setShowReportForm(!showReportForm)}
      onBack={handleBack}
    />
  );

  const formatPrefecture = (prefecture: string) => {
    return prefecture
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{pharmacy.name}</SheetTitle>
            <SheetDescription>
              {pharmacy.address}, {formatPrefecture(pharmacy.prefecture)}
            </SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{pharmacy.name}</DrawerTitle>
          <DrawerDescription>
            {pharmacy.address}, {formatPrefecture(pharmacy.prefecture)}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}
