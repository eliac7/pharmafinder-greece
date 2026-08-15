import { act, render, screen } from "@testing-library/react";

import type { Pharmacy } from "@/entities/pharmacy";
import { ApiError } from "@/shared/api/base";
import { useViewportPharmaciesStore } from "@/features/find-pharmacies";
import { PharmacyList } from "./pharmacy-list";

const nearbyPharmacy = { id: 1, name: "Nearby" };
const viewportPharmacy = { id: 2, name: "Viewport" } as Pharmacy;

const mockNearbyQuery: {
  data: { count: number; data: Array<{ id: number }> };
  isLoading: boolean;
  error: Error | null;
  refetch: jest.Mock;
  isFetching: boolean;
} = {
  data: { count: 1, data: [nearbyPharmacy] },
  isLoading: false,
  error: null,
  refetch: jest.fn(),
  isFetching: false,
};
const mockSetRadius = jest.fn();
let mockRadius = 2;

jest.mock("@/features/find-pharmacies", () => ({
  useNearbyPharmacies: () => mockNearbyQuery,
  useViewportPharmaciesStore: jest.requireActual(
    "@/features/find-pharmacies/model/use-viewport-pharmacies-store"
  ).useViewportPharmaciesStore,
}));

jest.mock("nuqs", () => ({
  useQueryState: (key: string) =>
    key === "time" ? ["now"] : [mockRadius, mockSetRadius],
  parseAsStringLiteral: () => ({ withDefault: jest.fn() }),
  parseAsInteger: { withDefault: jest.fn() },
}));

jest.mock("@/widgets/sidebar", () => ({
  SystemStatusCard: () => null,
  QuickCityJump: () => null,
}));

jest.mock("@/shared/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("./pharmacy-list-content", () => ({
  PharmacyListContent: ({
    pharmacies,
    subtitle,
  }: {
    pharmacies: Array<{ id: number }>;
    subtitle: string;
  }) => (
    <div>
      <span data-testid="pharmacy-ids">
        {pharmacies.map((pharmacy) => pharmacy.id).join(",")}
      </span>
      <span>{subtitle}</span>
    </div>
  ),
}));

describe("PharmacyList viewport synchronization", () => {
  beforeEach(() => {
    mockRadius = 2;
    mockSetRadius.mockClear();
    mockNearbyQuery.error = null;
    act(() => useViewportPharmaciesStore.getState().reset());
  });

  afterEach(() => {
    act(() => useViewportPharmaciesStore.getState().reset());
  });

  it("switches between nearby and committed viewport pharmacies", () => {
    render(<PharmacyList />);

    expect(screen.getByTestId("pharmacy-ids")).toHaveTextContent("1");
    expect(screen.getByText("Σε ακτίνα 2km")).toBeInTheDocument();

    act(() => {
      useViewportPharmaciesStore
        .getState()
        .setPharmacies([viewportPharmacy]);
    });

    expect(screen.getByTestId("pharmacy-ids")).toHaveTextContent("2");
    expect(screen.getByText("Στην περιοχή του χάρτη")).toBeInTheDocument();

    act(() => useViewportPharmaciesStore.getState().reset());
    expect(screen.getByTestId("pharmacy-ids")).toHaveTextContent("1");
  });

  it("shows a viewport-specific empty message", () => {
    useViewportPharmaciesStore.getState().setPharmacies([]);
    render(<PharmacyList />);

    expect(
      screen.getByText(
        "Δεν υπάρχουν εφημερεύοντα φαρμακεία στην ορατή περιοχή του χάρτη."
      )
    ).toBeInTheDocument();
  });

  it("offers an explicit smaller radius on nearby overflow", () => {
    mockRadius = 20;
    mockNearbyQuery.error = new ApiError(422, "Unprocessable Entity", {
      code: "RESULT_SET_TOO_LARGE",
      endpoint: "nearby",
      remediation: { kind: "reduce_radius", suggested_radius_km: 10 },
    });
    render(<PharmacyList />);

    expect(screen.getByText("Η ακτίνα επιστρέφει πάρα πολλά αποτελέσματα.")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Μείωση ακτίνας σε 10km" }).click());
    expect(mockSetRadius).toHaveBeenCalledWith(10);
  });
});
