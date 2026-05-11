# Plan: Login Firebase Auth

## Context
The login form (`app/(public)/login/`) renders the shared `AuthForm` with `mode="login"`. Currently, submitting the login form passes client-side validation but does nothing — the `handleSubmit` only has a `if (!isLogin)` branch for signup. This plan wires the login path to Firebase `signInWithEmailAndPassword`, shows a success message on the form, and surfaces meaningful errors on failure. No redirect is needed yet.

---

## Approach

Add a login branch inside `handleSubmit` in `AuthForm.tsx`, gated on `isLogin`. Reuse the existing `submitting` and `formError` states. Add a new `formSuccess` state (string | null) to display the success message. On submit:
1. Set `submitting = true`, clear both `formError` and `formSuccess`
2. Call `signInWithEmailAndPassword(auth, email, password)`
3. On success: set `formSuccess = "You're logged in!"`
4. On error: map known codes to friendly messages; fallback to generic
5. `finally`: set `submitting = false`

---

## Files to Modify

### `components/AuthForm/AuthForm.tsx`
- Add `signInWithEmailAndPassword` to the existing `firebase/auth` import
- Add state: `formSuccess: string | null` (default `null`)
- In `handleSubmit`, add an `if (isLogin)` block that:
  1. Sets `submitting = true`, clears `formError` and `formSuccess`
  2. Calls `signInWithEmailAndPassword(getAuth(app), email, password)`
  3. On success: sets `formSuccess = "You're logged in!"`
  4. On error: maps `auth/invalid-credential`, `auth/user-not-found`, `auth/wrong-password` → `"Incorrect email or password."`; all others → `"Something went wrong. Please try again."`
  5. `finally`: sets `submitting = false`
- Render `formSuccess` as a visible success message below the form fields (add a `.success` CSS class)
- Setting `formSuccess` should clear `formError` and vice versa — they are mutually exclusive

### `components/AuthForm/AuthForm.module.css`
- Add `.success` — small green text, reusing `color: var(--color-success)` theme token

### `tests/components/AuthForm.test.tsx`
- Add `mockSignInWithEmailAndPassword: vi.fn()` to the `vi.hoisted` block
- Add `signInWithEmailAndPassword: mockSignInWithEmailAndPassword` to the `vi.mock("firebase/auth", ...)` factory
- Add `mockSignInWithEmailAndPassword.mockResolvedValue({})` to `beforeEach`
- Add tests:
  1. Calls `signInWithEmailAndPassword` with correct args on login submission
  2. Shows success message (`/you're logged in/i`) after successful login
  3. Shows `"Incorrect email or password."` for `auth/invalid-credential`
  4. Shows generic error for unknown Firebase failure on login
  5. Submit button is disabled while login request is in flight (check for "Please wait…" text)

---

## Reuse

- `submitting` / `formError` states already exist in `AuthForm.tsx` — reuse directly
- `getAuth(app)` pattern already used in the signup branch of `AuthForm.tsx`
- `vi.hoisted` / `vi.mock` pattern already established in `tests/components/AuthForm.test.tsx`
- `.error` CSS class in `AuthForm.module.css` — model `.success` after it

---

## Verification

1. `npx vitest run tests/components/AuthForm.test.tsx` — all existing + new tests pass
2. `npm run dev` → visit `/login`, submit with valid credentials — confirm "You're logged in!" appears
3. Submit with wrong password — confirm "Incorrect email or password." appears
4. Submit with unknown email — confirm same credential error message
