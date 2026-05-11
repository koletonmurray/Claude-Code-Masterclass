"use client";

import { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "@lib/firebase/config";
import { generateCodename } from "@lib/codename";
import styles from "./auth-form.module.css";

interface AuthFormProps {
  mode: "login" | "signup";
}

interface Errors {
  email?: string;
  password?: string;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isLogin = mode === "login";
  const title = isLogin ? "Log in to Your Account" : "Sign up for an Account";
  const submitLabel = isLogin ? "Log In" : "Sign Up";
  const altHref = isLogin ? "/signup" : "/login";
  const altText = isLogin
    ? "Don't have an account? Sign up"
    : "Already have an account? Log in";

  async function handleSubmit(e: FormEvent) {
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
      if (isLogin) {
        setSubmitting(true);
        setFormError(null);
        try {
          await signInWithEmailAndPassword(getAuth(app), email, password);
          router.push("/missions");
        } catch (err: unknown) {
          const code = (err as { code?: string }).code;
          if (
            code === "auth/invalid-credential" ||
            code === "auth/user-not-found" ||
            code === "auth/wrong-password"
          ) {
            setFormError("Incorrect email or password.");
          } else {
            setFormError("Something went wrong. Please try again.");
          }
        } finally {
          setSubmitting(false);
        }
      } else {
        setSubmitting(true);
        setFormError(null);
        try {
          const auth = getAuth(app);
          const db = getFirestore(app);
          const credential = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
          );
          const codename = generateCodename();
          await updateProfile(credential.user, { displayName: codename });
          await setDoc(doc(db, "users", credential.user.uid), {
            id: credential.user.uid,
            codename,
          });
          router.push("/missions");
        } catch (err: unknown) {
          const code = (err as { code?: string }).code;
          if (code === "auth/email-already-in-use") {
            setFormError("An account with this email already exists.");
          } else {
            setFormError("Something went wrong. Please try again.");
          }
        } finally {
          setSubmitting(false);
        }
      }
    }
  }

  return (
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
          disabled={submitting}
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p id="email-error" className={styles.error} role="alert">
            {errors.email}
          </p>
        )}
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
            disabled={submitting}
            aria-describedby={errors.password ? "password-error" : undefined}
            aria-invalid={!!errors.password}
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
        {errors.password && (
          <p id="password-error" className={styles.error} role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {formError && (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      )}

      <button type="submit" className="btn-gradient" disabled={submitting}>
        {submitting ? "Please wait…" : submitLabel}
      </button>

      <Link href={altHref} className="btn">
        {altText}
      </Link>
    </form>
  );
}
