import { render, screen } from "@testing-library/react";

import packageJson from "../../../../package.json";
import { SidebarCopyright } from "./sidebar-shared";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("@/features/pharmacy-navigation", () => ({
  NavigationSettingsSheet: () => null,
}));

jest.mock("@/shared/ui/theme-toggle", () => ({ ThemeToggle: () => null }));

describe("SidebarCopyright", () => {
  it("renders the package version", () => {
    render(<SidebarCopyright />);

    expect(
      screen.getByText(new RegExp(`Pharmafinder \\| ${packageJson.version}$`))
    ).toBeInTheDocument();
  });
});
