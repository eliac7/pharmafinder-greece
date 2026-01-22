"use client";

import { useAutoLocate } from "@/features/locate-user/model/use-auto-locate";

export function AutoLocateProvider() {
  useAutoLocate();
  return null;
}
