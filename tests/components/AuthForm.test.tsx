import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import AuthForm from "@/components/AuthForm";

describe("AuthForm", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
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

  it("logs email and password on valid login submission", async () => {
    const user = userEvent.setup();
    const logSpy = vi.spyOn(console, "log");
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(logSpy).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });

  it("logs email and password on valid signup submission", async () => {
    const user = userEvent.setup();
    const logSpy = vi.spyOn(console, "log");
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(logSpy).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "password123",
    });
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
});
