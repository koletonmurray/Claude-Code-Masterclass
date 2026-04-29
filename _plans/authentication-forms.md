# Plan: Authentication Forms

## Context
The `/login` and `/signup` pages are currently bare stubs with only a heading. This plan adds functional authentication forms to both pages — email/password fields, a password visibility toggle, light client-side validation, and console logging on submit. The forms share a navigation link so users can switch between them easily.

## Approach

Create a shared `AuthForm` component used by both pages. This avoids duplicating near-identical form logic. The component accepts a `mode` prop (`"login" | "signup"`) to control labels and the cross-page link.

Both pages become thin wrappers that render `<AuthForm mode="login" />` or `<AuthForm mode="signup" />`.

---

## Files to Create

### `components/AuthForm/AuthForm.tsx`
- `"use client"` directive (requires `useState`)
- Props: `mode: "login" | "signup"`
- State: `email`, `password`, `showPassword`, `errors`
- Email field: `type="email"`, required
- Password field: `type="password"` by default, toggled to `type="text"` via `showPassword`
- Show/hide toggle: `Eye` / `EyeOff` icons from `lucide-react` (already a project dependency)
- Submit button: labeled "Log In" or "Sign Up" based on `mode`, styled with `.btn`
- Cross-page link: "Don't have an account? Sign up" / "Already have an account? Log in" — linked with `next/link`, styled with `.btn`
- On submit: validate fields; if valid, `console.log({ email, password })`

**Light validation rules:**
- Email: must not be empty, must match basic email pattern (`/\S+@\S+\.\S+/`)
- Password: must not be empty, minimum 6 characters
- Inline error messages shown below each field on failed validation

### `components/AuthForm/AuthForm.module.css`
- `@reference "../../app/globals.css";`
- Styles for: form wrapper, field groups, labels, inputs, error messages, toggle button position (absolute within password field wrapper)

### `components/AuthForm/index.ts`
- `export { default } from "./AuthForm"`

### `tests/components/AuthForm.test.tsx`
Tests (using `@testing-library/user-event` for interactions, already in devDependencies):
- Login form renders email field, password field, and submit button
- Signup form renders email field, password field, and submit button
- Password field defaults to `type="password"`
- Clicking the toggle changes password to `type="text"` and back
- Submitting with valid values calls `console.log` with `{ email, password }`
- Shows validation error when email is empty or invalid
- Shows validation error when password is too short
- Login form contains a link to `/signup`
- Signup form contains a link to `/login`

---

## Files to Modify

### `app/(public)/login/page.tsx`
Replace stub with `<AuthForm mode="login" />` — `AuthForm` handles its own layout using the existing `.center-content` / `.page-content` globals.

### `app/(public)/signup/page.tsx`
Same pattern with `mode="signup"`.

---

## Reuse

- `.btn` global class (`app/globals.css`) — submit button and cross-page link
- `.form-title` global class — form heading
- `.center-content` / `.page-content` — layout wrappers
- `Eye` / `EyeOff` from `lucide-react` (already installed)
- `Link` from `next/link` (already used in Navbar)

---

## Verification

1. Run `npm run dev` and visit `/login` and `/signup`
2. Confirm both forms render with email, password, toggle, submit button, and cross-page link
3. Enter valid credentials and submit — confirm `{ email, password }` logged to console
4. Try submitting with empty/invalid fields — confirm inline errors appear
5. Click password toggle — confirm field switches between hidden/visible and icon updates
6. Click cross-page link — confirm navigation between `/login` and `/signup`
7. Run tests: `npx vitest run tests/components/AuthForm.test.tsx`