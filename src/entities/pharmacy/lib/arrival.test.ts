import type { Pharmacy } from "../model/types";
import {
  estimateDrivingMinutes,
  getArrivalEstimate,
  sortPharmaciesByRecommendation,
  type ArrivalEstimate,
} from "./arrival";

const basePharmacy: Pharmacy = {
  id: 1,
  name: "Base",
  address: "Address",
  city: "Athens",
  prefecture: "Attica",
  prefecture_english: "Attica",
  phone: "2100000000",
  latitude: 37.9838,
  longitude: 23.7275,
  distance_km: 1,
  data_hours: [],
};

function pharmacy(overrides: Partial<Pharmacy>): Pharmacy {
  return { ...basePharmacy, ...overrides };
}

function estimate(
  risk: ArrivalEstimate["risk"],
  estimatedTravelMinutes: number | null,
  minutesUntilClose: number | null
): ArrivalEstimate {
  return {
    risk,
    estimatedTravelMinutes,
    minutesUntilClose,
    marginMinutes:
      estimatedTravelMinutes == null || minutesUntilClose == null
        ? null
        : minutesUntilClose - estimatedTravelMinutes,
  };
}

describe("arrival estimates", () => {
  it("estimates driving minutes from distance", () => {
    expect(estimateDrivingMinutes(2)).toBe(8);
    expect(estimateDrivingMinutes(5)).toBe(15);
  });

  it("marks an arrival as safe when the close margin is at least 10 minutes", () => {
    const result = getArrivalEstimate({
      pharmacy: pharmacy({ distance_km: 2 }),
      minutesUntilClose: 20,
    });

    expect(result).toMatchObject({
      estimatedTravelMinutes: 8,
      minutesUntilClose: 20,
      marginMinutes: 12,
      risk: "safe",
    });
  });

  it("marks an arrival as tight when the user can arrive with less than 10 minutes margin", () => {
    const result = getArrivalEstimate({
      pharmacy: pharmacy({ distance_km: 2 }),
      minutesUntilClose: 12,
    });

    expect(result.risk).toBe("tight");
    expect(result.marginMinutes).toBe(4);
  });

  it("marks an arrival as too late when ETA is after closing", () => {
    const result = getArrivalEstimate({
      pharmacy: pharmacy({ distance_km: 2 }),
      minutesUntilClose: 7,
    });

    expect(result.risk).toBe("too_late");
    expect(result.marginMinutes).toBe(-1);
  });

  it("marks an arrival as unknown when distance or closing time is unavailable", () => {
    expect(
      getArrivalEstimate({
        pharmacy: pharmacy({ distance_km: null }),
        minutesUntilClose: 20,
      }).risk
    ).toBe("unknown");

    expect(
      getArrivalEstimate({
        pharmacy: pharmacy({ distance_km: 2 }),
        minutesUntilClose: null,
      }).risk
    ).toBe("unknown");
  });
});

describe("sortPharmaciesByRecommendation", () => {
  it("sorts by arrival risk, ETA, confidence, freshness, and favorites", () => {
    const safeSlow = pharmacy({ id: 1, name: "Safe Slow", confidence: "high" });
    const safeFastOld = pharmacy({
      id: 2,
      name: "Safe Fast Old",
      confidence: "medium",
      last_updated_at: "2026-01-01T10:00:00.000Z",
    });
    const safeFastFresh = pharmacy({
      id: 3,
      name: "Safe Fast Fresh",
      confidence: "medium",
      last_updated_at: "2026-01-02T10:00:00.000Z",
    });
    const tight = pharmacy({ id: 4, name: "Tight" });
    const unknownFavorite = pharmacy({ id: 5, name: "Unknown Favorite" });
    const unknown = pharmacy({ id: 6, name: "Unknown" });
    const tooLate = pharmacy({ id: 7, name: "Too Late" });

    const estimates = new Map<number, ArrivalEstimate>([
      [safeSlow.id, estimate("safe", 14, 40)],
      [safeFastOld.id, estimate("safe", 8, 40)],
      [safeFastFresh.id, estimate("safe", 8, 40)],
      [tight.id, estimate("tight", 8, 12)],
      [unknownFavorite.id, estimate("unknown", null, 40)],
      [unknown.id, estimate("unknown", null, 40)],
      [tooLate.id, estimate("too_late", 8, 4)],
    ]);

    const sorted = sortPharmaciesByRecommendation(
      [tooLate, unknown, tight, safeSlow, unknownFavorite, safeFastOld, safeFastFresh],
      {
        timeFilter: "now",
        favoriteIds: [unknownFavorite.id],
        getEstimate: (item) => estimates.get(item.id)!,
      }
    );

    expect(sorted.map((item) => item.id)).toEqual([
      safeFastFresh.id,
      safeFastOld.id,
      safeSlow.id,
      tight.id,
      unknownFavorite.id,
      unknown.id,
      tooLate.id,
    ]);
  });
});
