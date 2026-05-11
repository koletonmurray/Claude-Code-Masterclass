import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUseUser, mockReplace } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockReplace: vi.fn(),
}));

vi.mock("@/contexts/auth-context", () => ({ useUser: mockUseUser }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));
vi.mock("@/components/navbar", () => ({
  default: () => <nav data-testid="navbar" />,
}));

import DashboardLayout from "@/app/(dashboard)/layout";

describe("DashboardLayout", () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it("renders spinner while loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    render(<DashboardLayout>content</DashboardLayout>);
    expect(document.querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("redirects to / when user is not authenticated", async () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<DashboardLayout>content</DashboardLayout>);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders navbar and children when user is authenticated", () => {
    mockUseUser.mockReturnValue({
      user: { displayName: "TestUser" },
      loading: false,
    });
    render(<DashboardLayout>content</DashboardLayout>);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
