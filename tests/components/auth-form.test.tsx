import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockCreateUserWithEmailAndPassword,
  mockSignInWithEmailAndPassword,
  mockUpdateProfile,
  mockGetAuth,
  mockGetFirestore,
  mockDoc,
  mockSetDoc,
  mockPush,
} = vi.hoisted(() => ({
  mockCreateUserWithEmailAndPassword: vi.fn(),
  mockSignInWithEmailAndPassword: vi.fn(),
  mockUpdateProfile: vi.fn(),
  mockGetAuth: vi.fn(),
  mockGetFirestore: vi.fn(),
  mockDoc: vi.fn(),
  mockSetDoc: vi.fn(),
  mockPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("firebase/auth", () => ({
  getAuth: mockGetAuth,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  updateProfile: mockUpdateProfile,
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: mockGetFirestore,
  doc: mockDoc,
  setDoc: mockSetDoc,
}));

vi.mock("@lib/firebase/config", () => ({ default: {} }));
vi.mock("@lib/codename", () => ({ generateCodename: () => "SwiftRavenVault" }));

import AuthForm from "@/components/auth-form";

describe("AuthForm", () => {
  beforeEach(() => {
    mockGetAuth.mockReturnValue({});
    mockGetFirestore.mockReturnValue({});
    mockDoc.mockReturnValue({});
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "test-uid" },
    });
    mockSignInWithEmailAndPassword.mockResolvedValue({});
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSetDoc.mockResolvedValue(undefined);
  });

  it("renders email, password, and submit button in login mode", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("renders email, password, and submit button in signup mode", () => {
    render(<AuthForm mode="signup" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("login form contains a link to /signup", () => {
    render(<AuthForm mode="login" />);
    const link = screen.getByRole("link", { name: /sign up/i });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("signup form contains a link to /login", () => {
    render(<AuthForm mode="signup" />);
    const link = screen.getByRole("link", { name: /log in/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("password field defaults to hidden", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("toggling switches the password to visible and back", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);
    const passwordField = screen.getByLabelText("Password");

    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(passwordField).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordField).toHaveAttribute("type", "password");
  });

  it("calls createUserWithEmailAndPassword on valid signup submission", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() =>
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "new@example.com",
        "password123",
      ),
    );
  });

  it("sets displayName to generated codename on signup", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith(expect.anything(), {
        displayName: "SwiftRavenVault",
      }),
    );
  });

  it("writes id and codename to Firestore users collection on signup", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() =>
      expect(mockSetDoc).toHaveBeenCalledWith(expect.anything(), {
        id: "test-uid",
        codename: "SwiftRavenVault",
      }),
    );
  });

  it("shows an error when email is already in use", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue({
      code: "auth/email-already-in-use",
    });
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Email"), "existing@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() =>
      expect(screen.getByText(/already exists/i)).toBeInTheDocument(),
    );
  });

  it("shows a generic error on unknown Firebase failure", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue({
      code: "auth/network-request-failed",
    });
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() =>
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument(),
    );
  });

  it("shows an error when the email is invalid", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  it("shows an error when the password is too short", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "abc");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(screen.getByText(/at least 6/i)).toBeInTheDocument();
  });

  it("calls signInWithEmailAndPassword with correct args on login", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() =>
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "user@example.com",
        "password123",
      ),
    );
  });

  it("redirects to /missions after successful login", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/missions"));
  });

  it("shows credential error for auth/invalid-credential on login", async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({
      code: "auth/invalid-credential",
    });
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() =>
      expect(
        screen.getByText(/incorrect email or password/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows generic error on unknown Firebase failure during login", async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({
      code: "auth/network-request-failed",
    });
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() =>
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument(),
    );
  });

  it("shows Please wait while login request is in flight", async () => {
    let resolve: (v: object) => void;
    mockSignInWithEmailAndPassword.mockImplementation(
      () => new Promise((res) => (resolve = res)),
    );
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(screen.getByText("Please wait…")).toBeInTheDocument();
    await act(async () => resolve!({}));
  });
});
