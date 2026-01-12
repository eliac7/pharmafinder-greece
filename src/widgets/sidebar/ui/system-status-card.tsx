"use client";

import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "@/entities/statistics/api/statistics.api";

export function SystemStatusCard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["statistics"],
    queryFn: () => statisticsApi.getStatistics(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-muted/50 p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-2" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="rounded-xl bg-muted/50 border border-border/50 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-green-500" />
        </span>
        <span className="text-sm font-medium text-foreground">
          Σύστημα Online
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {stats.counts.on_duty_today.toLocaleString("el-GR")}
        </span>{" "}
        φαρμακεία σε εφημερία σήμερα
      </p>
      <p className="text-xs text-muted-foreground">
        Αθήνα, Θεσσαλονίκη, Πάτρα και άλλες πόλεις
      </p>
    </div>
  );
}
