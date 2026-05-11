import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUseUser, mockReplace, mockUsePathname } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockReplace: vi.fn(),
  mockUsePathname: vi.fn(),
}));

vi.mock("@/contexts/auth-context", () => ({ useUser: mockUseUser }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: mockUsePathname,
}));

import PublicLayout from "@/app/(public)/layout";

describe("PublicLayout", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUsePathname.mockReturnValue("/login");
  });

  it("renders spinner while loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    render(<PublicLayout>content</PublicLayout>);
    expect(screen.queryByText("content")).not.toBeInTheDocument();
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  it("renders children when user is not authenticated", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<PublicLayout>content</PublicLayout>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("redirects to /missions when authenticated user visits /login", async () => {
    mockUsePathname.mockReturnValue("/login");
    mockUseUser.mockReturnValue({
      user: { displayName: "TestUser" },
      loading: false,
    });
    render(<PublicLayout>content</PublicLayout>);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/missions"));
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("redirects to /missions when authenticated user visits /signup", async () => {
    mockUsePathname.mockReturnValue("/signup");
    mockUseUser.mockReturnValue({
      user: { displayName: "TestUser" },
      loading: false,
    });
    render(<PublicLayout>content</PublicLayout>);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/missions"));
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders children for authenticated user on /", () => {
    mockUsePathname.mockReturnValue("/");
    mockUseUser.mockReturnValue({
      user: { displayName: "TestUser" },
      loading: false,
    });
    render(<PublicLayout>content</PublicLayout>);
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
