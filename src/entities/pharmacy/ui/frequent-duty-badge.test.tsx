import { fireEvent, render, screen } from "@testing-library/react";

import { FrequentDutyBadge } from "./frequent-duty-badge";

describe("FrequentDutyBadge", () => {
  it("renders a self-explanatory label with an accessible explanation", () => {
    render(<FrequentDutyBadge />);

    expect(screen.getByText("Συχνά εφημερεύει")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /συχνά εφημερεύει/i }),
    ).toHaveAttribute(
      "aria-label",
      expect.stringContaining("πιο συχνά"),
    );
  });

  it("opens the explanation on tap without bubbling to the card", () => {
    const onCardClick = jest.fn();
    render(
      <div onClick={onCardClick}>
        <FrequentDutyBadge />
      </div>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Συχνά εφημερεύει. Εφημερεύει πιο συχνά από τα περισσότερα φαρμακεία της περιοχής.",
      }),
    );

    expect(
      screen.getByText(
        "Εφημερεύει πιο συχνά από τα περισσότερα φαρμακεία της περιοχής.",
      ),
    ).toBeInTheDocument();
    expect(onCardClick).not.toHaveBeenCalled();
  });
});
