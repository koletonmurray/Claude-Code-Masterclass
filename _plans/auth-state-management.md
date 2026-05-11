# Plan: Auth State Management

## Context
The app has Firebase Auth enabled (email/password) but no mechanism to track who is currently logged in. Every page and component that needs the current user would have to set up its own Firebase listener — creating duplication and inconsistent state. This plan introduces a single global `onAuthStateChanged` listener via React context, and a `useUser` hook that any component or page can call to read the current user without prop-drilling. No sign-up, login, or logout UI is introduced here.

## Approach

Create an `AuthContext` that wraps the entire app at the root layout level. It subscribes once to Firebase's `onAuthStateChanged`, stores `{ user, loading }` in state, and exposes them via a `useUser` hook. Because Next.js root layouts are server components, the provider is extracted into a thin client component (`AuthProvider`) that the server layout imports and wraps around `{children}`.

---

## Files to Create

### `contexts/AuthContext.tsx`
- `"use client"` directive
- Imports `getAuth`, `onAuthStateChanged`, `User` from `firebase/auth`
- Imports the Firebase app from `@lib/firebase/config`
- Creates `AuthContext` with `{ user: User | null, loading: boolean }`, default `{ user: null, loading: true }`
- `AuthProvider` component: subscribes to `onAuthStateChanged` on mount, unsubscribes on unmount, sets `loading: false` once first callback fires
- `useUser` hook: reads context, throws a descriptive error if called outside `AuthProvider`

### `tests/contexts/AuthContext.test.tsx`
Tests (mock `firebase/auth` with `vi.mock`):
- `useUser` returns `{ user: null, loading: false }` after auth resolves with no user
- `useUser` returns the user object after auth resolves with a signed-in user
- `loading` is `true` before the first `onAuthStateChanged` callback fires, `false` after
- Calling `useUser` outside `AuthProvider` throws a descriptive error

---

## Files to Modify

### `app/layout.tsx`
- Import `AuthProvider` from `@/contexts/AuthContext`
- Wrap `{children}` with `<AuthProvider>` — covers every route group automatically

---

## Reuse

- Firebase app instance from `@lib/firebase/config` (already initialised, avoids double-init)
- `onAuthStateChanged` / `getAuth` from `firebase/auth` (already installed as part of `firebase` v12)
- No new UI primitives needed

---

## Verification

1. Run `npx vitest run tests/contexts/AuthContext.test.tsx` — all tests pass
2. Run `npm run dev`, open browser console, confirm no errors on page load
3. Add a temporary `console.log(useUser())` in any page component — confirm it logs `{ user: null, loading: false }` when not signed in
4. Sign in a user via the Firebase console emulator or direct SDK call — confirm the hook updates reactively
