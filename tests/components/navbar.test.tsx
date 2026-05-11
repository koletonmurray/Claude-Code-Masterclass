import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUseUser, mockSignOut, mockGetAuth, mockPush, mockUsePathname } =
  vi.hoisted(() => ({
    mockUseUser: vi.fn(),
    mockSignOut: vi.fn(),
    mockGetAuth: vi.fn(),
    mockPush: vi.fn(),
    mockUsePathname: vi.fn(),
  }));

vi.mock("@/contexts/auth-context", () => ({
  useUser: mockUseUser,
}));

vi.mock("firebase/auth", () => ({
  getAuth: mockGetAuth,
  signOut: mockSignOut,
}));

vi.mock("@lib/firebase/config", () => ({ default: {} }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: mockUsePathname,
}));

import Navbar from "@/components/navbar";

describe("Navbar", () => {
  beforeEach(() => {
    mockGetAuth.mockReturnValue({});
    mockSignOut.mockResolvedValue(undefined);
    mockPush.mockReset();
    mockUsePathname.mockReturnValue("/missions");
  });

  it("renders the main heading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders the Create Mission link when user is authenticated", () => {
    mockUseUser.mockReturnValue({
      user: { displayName: "SwiftRavenVault" },
      loading: false,
    });
    render(<Navbar />);
    const createLink = screen.getByRole("link", { name: /create mission/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/missions/create");
  });

  it("hides the Create Mission link when user is not authenticated", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    expect(
      screen.queryByRole("link", { name: /create mission/i }),
    ).not.toBeInTheDocument();
  });

  it("shows Log In link when user is not authenticated", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    const loginLink = screen.getByRole("link", { name: /log in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("hides Log In link on /login", () => {
    mockUsePathname.mockReturnValue("/login");
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    expect(
      screen.queryByRole("link", { name: /log in/i }),
    ).not.toBeInTheDocument();
  });

  it("hides Log In link on /signup", () => {
    mockUsePathname.mockReturnValue("/signup");
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    expect(
      screen.queryByRole("link", { name: /log in/i }),
    ).not.toBeInTheDocument();
  });

  it("does not show Log In link when user is authenticated", () => {
    mockUseUser.mockReturnValue({
      user: { displayName: "SwiftRavenVault" },
      loading: false,
    });
    render(<Navbar />);
    expect(
      screen.queryByRole("link", { name: /log in/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render avatar when user is null", () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<Navbar />);
    expect(
      screen.queryByRole("button", { name: /user menu/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render avatar while auth is loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    render(<Navbar />);
    expect(
      screen.queryByRole("button", { name: /user menu/i }),
    ).not.toBeInTheDocument();
  });

  it("renders avatar when user is logged in", () => {
    mockUseUser.mockReturnValue({
      user: { displayName: "SwiftRavenVault" },
      loading: false,
    });
    render(<Navbar />);
    expect(
      screen.getByRole("button", { name: /user menu/i }),
    ).toBeInTheDocument();
  });

  it("clicking avatar opens the dropdown with display name and log out", async () => {
    const user = userEvent.setup();
    mockUseUser.mockReturnValue({
      user: { displayName: "SwiftRavenVault" },
      loading: false,
    });
    render(<Navbar />);

    expect(
      screen.queryByRole("button", { name: /log out/i }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /user menu/i }));
    expect(screen.getByText("Swift Raven Vault")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /log out/i }),
    ).toBeInTheDocument();
  });

  it("clicking Log Out calls signOut and redirects to /", async () => {
    const user = userEvent.setup();
    mockUseUser.mockReturnValue({
      user: { displayName: "SwiftRavenVault" },
      loading: false,
    });
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: /user menu/i }));
    await user.click(screen.getByRole("button", { name: /log out/i }));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("clicking outside the dropdown closes it", async () => {
    const user = userEvent.setup();
    mockUseUser.mockReturnValue({
      user: { displayName: "SwiftRavenVault" },
      loading: false,
    });
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: /user menu/i }));
    expect(
      screen.getByRole("button", { name: /log out/i }),
    ).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(
      screen.queryByRole("button", { name: /log out/i }),
    ).not.toBeInTheDocument();
  });
});
