"use client";

import { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import styles from "./AuthForm.module.css";

interface AuthFormProps {
  mode: "login" | "signup";
}

interface Errors {
  email?: string;
  password?: string;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const isLogin = mode === "login";
  const title = isLogin ? "Log in to Your Account" : "Sign up for an Account";
  const submitLabel = isLogin ? "Log In" : "Sign Up";
  const altHref = isLogin ? "/signup" : "/login";
  const altText = isLogin
    ? "Don't have an account? Sign up"
    : "Already have an account? Log in";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      next.email = "Please enter a valid email";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    setErrors(next);

    if (Object.keys(next).length === 0) {
      console.log({ email, password });
    }
  }

  return (
    <div className="center-content">
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <h1 className="form-title">{title}</h1>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={styles.toggle}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className={styles.error}>{errors.password}</p>}
        </div>

        <button type="submit" className="btn">
          {submitLabel}
        </button>

        <Link href={altHref} className="btn">
          {altText}
        </Link>
      </form>
    </div>
  );
}
