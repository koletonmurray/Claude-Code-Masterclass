# Plan: Signup Firebase Auth

## Context
The signup form (`app/(public)/signup/`) currently validates email/password and logs to the console — it has no real auth logic. This plan wires it to Firebase Authentication, generates a random PascalCase codename for each new user, sets it as their `displayName`, and writes a document to the `users` Firestore collection with only `id` and `codename` (no email). The Firebase app instance at `@lib/firebase/config` is already initialised.

## Approach

Add Firebase signup logic directly inside `AuthForm.tsx`, gated on `mode === "signup"`. This keeps the signup page thin and avoids making it a client component. Two new states are added — `submitting` (disables the form during the async call) and `formError` (surfaces Firebase-specific errors). A pure `generateCodename` utility is extracted to `lib/codename.ts` so it can be tested independently.

Because `AuthForm` will now import from `firebase/auth` and `firebase/firestore` at the module level, the existing test file needs top-level Firebase mocks added (using the `vi.hoisted` pattern already established in `tests/contexts/AuthContext.test.tsx`). The existing assertions remain valid — only the signup submission test is updated to check Firebase was called.

---

## Files to Create

### `lib/codename.ts`
- Three disjoint arrays of capitalised words (~20 each):
  - Set A: Adjectives (e.g. Swift, Silent, Iron, Crimson …)
  - Set B: Animals/Creatures (e.g. Fox, Wolf, Raven, Viper …)
  - Set C: Objects/Places (e.g. Vault, Ghost, Storm, Cipher …)
- `generateCodename()`: picks one random word from each array, concatenates them (already PascalCase since words are capitalised) — e.g. `SwiftRavenVault`
- Exported as a named export

### `tests/lib/codename.test.ts`
- Returns a non-empty string
- Output matches `/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/` (three PascalCase words joined)
- The three words each come from their respective sets (no cross-set duplicates)
- Multiple calls produce varied results (run 50 times, assert not all identical)

---

## Files to Modify

### `components/AuthForm/AuthForm.tsx`
- Add imports: `getAuth`, `createUserWithEmailAndPassword`, `updateProfile` from `firebase/auth`; `getFirestore`, `doc`, `setDoc` from `firebase/firestore`; `app` from `@lib/firebase/config`; `generateCodename` from `@lib/codename`
- Add state: `submitting: boolean` (default `false`), `formError: string | null` (default `null`)
- Disable the submit button and inputs while `submitting` is `true`
- Render `formError` as a visible error message below the form fields (reuse the existing `.error` CSS class)
- In `handleSubmit`, after client-side validation passes, if `mode === "signup"`:
  1. Set `submitting = true`, clear `formError`
  2. Call `createUserWithEmailAndPassword(auth, email, password)`
  3. Call `generateCodename()` and `updateProfile(userCredential.user, { displayName: codename })`
  4. Write `{ id: userCredential.user.uid, codename }` to `users/{uid}` via `setDoc`
  5. On error: map `auth/email-already-in-use` → "An account with this email already exists."; all others → "Something went wrong. Please try again."
  6. Set `submitting = false` in finally block
- Login mode (`mode === "login"`) is unchanged — still `console.log`s

### `tests/components/AuthForm.test.tsx`
- Add `vi.hoisted` + `vi.mock` for `firebase/auth`, `firebase/firestore`, `@lib/firebase/config`, `@lib/codename` at the top of the file (same pattern as `tests/contexts/AuthContext.test.tsx`)
- Update the "logs email and password on valid signup submission" test to assert `createUserWithEmailAndPassword` was called with the correct args (instead of `console.log`)
- Add: shows `formError` when Firebase returns `auth/email-already-in-use`
- Login submission test remains: still checks `console.log`

---

## Reuse

- `app` from `@lib/firebase/config` — already initialised, import directly
- `vi.hoisted` / `vi.mock` pattern from `tests/contexts/AuthContext.test.tsx`
- `.error` CSS class in `AuthForm.module.css` — reuse for `formError` display
- `submitting` state follows the same pattern as the existing `errors` state

---

## Verification

1. `npx vitest run tests/lib/codename.test.ts` — all codename tests pass
2. `npx vitest run tests/components/AuthForm.test.tsx` — all existing + new tests pass
3. `npm run dev` → visit `/signup`, submit with a new email — confirm Firebase user is created in the Firebase console and `users` collection has the document
4. Submit again with the same email — confirm "An account with this email already exists." appears in the form