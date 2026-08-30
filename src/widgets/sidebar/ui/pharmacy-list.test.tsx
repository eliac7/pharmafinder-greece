import { render, screen } from "@testing-library/react";

import { PharmacyList } from "./pharmacy-list";

jest.mock("./product-nearby-list", () => ({
  ProductNearbyList: () => <div>bounded nearby list</div>,
}));

describe("PharmacyList", () => {
  it("uses the bounded v1 nearby list", () => {
    render(<PharmacyList />);
    expect(screen.getByText("bounded nearby list")).toBeInTheDocument();
  });
});
