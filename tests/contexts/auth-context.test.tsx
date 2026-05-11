import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockOnAuthStateChanged } = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: mockOnAuthStateChanged,
}));
vi.mock("@lib/firebase/config", () => ({ default: {} }));

import { AuthProvider, useUser } from "@/contexts/auth-context";

function TestConsumer() {
  const { user, loading } = useUser();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : "null"}</span>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    mockOnAuthStateChanged.mockReset();
    mockOnAuthStateChanged.mockReturnValue(() => {});
  });

  it("loading is true before auth resolves, false after", async () => {
    let resolve: (u: null) => void;
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      resolve = cb;
      return () => {};
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading").textContent).toBe("true");

    await act(async () => resolve(null));

    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("returns { user: null, loading: false } when no user is signed in", async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return () => {};
    });

    await act(async () =>
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      ),
    );

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("returns the user object when signed in", async () => {
    const fakeUser = { email: "test@example.com" };
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(fakeUser);
      return () => {};
    });

    await act(async () =>
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      ),
    );

    expect(screen.getByTestId("user").textContent).toBe("test@example.com");
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("throws a descriptive error when useUser is called outside AuthProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useUser must be used within an AuthProvider",
    );
    spy.mockRestore();
  });
});
