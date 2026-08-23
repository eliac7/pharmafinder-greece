import { render, screen } from "@testing-library/react";
import { ApiError } from "@/shared/api/base";

const challengeProblem = {
  type: "https://pharmafinder.app/problems/challenge-required",
  title: "Απαιτείται επιβεβαίωση",
  status: 428,
  code: "CHALLENGE_REQUIRED",
  challenge: { type: "turnstile", request_token: "req-token-1" },
};

const challengeError = new ApiError(428, "Precondition Required", challengeProblem);

jest.mock("@tanstack/react-query", () => ({
  useQueries: () => [
    {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: challengeError,
      refetch: jest.fn(),
    },
  ],
}));

jest.mock("@/entities/pharmacy", () => ({
  ...jest.requireActual("@/entities/pharmacy/lib/status"),
  getProductDetail: jest.fn(),
  PharmacyCard: () => null,
  getPharmacyReference: (pharmacy: { id: number }) => String(pharmacy.id),
  isPublicPharmacyId: (value: unknown) => typeof value === "string",
  TIME_OPTIONS: ["now", "today", "tomorrow"],
  getPharmacyStatus: () => ({ status: "open", statusColor: "", minutesUntilClose: null }),
  completeProductChallenge: jest.fn(),
}));

jest.mock("nuqs", () => ({
  parseAsStringLiteral: () => ({ withDefault: () => "now" }),
  useQueryState: () => ["now"],
}));

jest.mock("@/shared/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("../model/use-favorites-store", () => ({
  useFavoritesStore: () => ({ favoriteIds: ["tzXWQaGNQo-McMZEziHSgQ"] }),
}));

import { FavoritesList } from "./favorites-list";

describe("FavoritesList", () => {
  it("shows the Turnstile challenge banner when the detail fetch returns 428", () => {
    render(<FavoritesList />);
    expect(
      screen.getByText("Απαιτείται επιβεβαίωση για την προβολή στοιχείων.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Σφάλμα κατά τη φόρτωση των αγαπημένων.")).not.toBeInTheDocument();
  });
});
