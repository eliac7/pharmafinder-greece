"use client";

import { useRouter } from "next/navigation";
import { PharmacyDetailContent } from "@/features/pharmacy-detail/ui/pharmacy-detail-content";
import { useState, useEffect } from "react";
import type { Pharmacy } from "@/entities/pharmacy/model/types";

interface PharmacyDetailPageProps {
  pharmacy: Pharmacy;
}

export function PharmacyDetailPage({ pharmacy }: PharmacyDetailPageProps) {
  const router = useRouter();
  const [showReportForm, setShowReportForm] = useState(false);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto">
        <PharmacyDetailContent
          pharmacy={pharmacy}
          showReportForm={showReportForm}
          onToggleReportForm={() => setShowReportForm(!showReportForm)}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
