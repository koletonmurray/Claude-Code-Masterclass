# Plan: Navbar Logout with Avatar Dropdown

## Context
The Navbar currently has no auth awareness — it's a static server component. This plan wires it to the existing `AuthContext` so that when a user is signed in, their `Avatar` appears in the navbar. Clicking the avatar opens a small dropdown containing a "Log Out" option. Clicking it calls Firebase `signOut`. No redirect is needed.

---

## Approach

Convert `Navbar` to a client component so it can call `useUser()` from `AuthContext`. Add a `showMenu` boolean state and a `ref`-based click-outside handler to manage the dropdown. Render the `Avatar` (passing `user.displayName`) and dropdown only when `!loading && user`. Call `signOut(getAuth(app))` on logout click.

---

## Files to Modify

### `components/Navbar/Navbar.tsx`
- Add `"use client"` as the first line
- Import `useUser` from `@/contexts/AuthContext`
- Import `Avatar` from `@/components/Avatar`
- Import `getAuth`, `signOut` from `firebase/auth`
- Import `app` from `@lib/firebase/config`
- Import `useRef`, `useState`, `useEffect` from `react`
- Add `showMenu: boolean` state (default `false`)
- Add a `ref` on the dropdown wrapper; attach a `mousedown` listener in `useEffect` that sets `showMenu` to false when clicking outside
- When `!loading && user`:
  - Render `<Avatar name={user.displayName ?? "User"} />` as a button that toggles `showMenu`
  - When `showMenu` is true, render a dropdown div below the avatar containing a "Log Out" button
  - On "Log Out" click: call `signOut(getAuth(app))` and set `showMenu` to false
- When `loading` or `!user`: render nothing in that slot

### `components/Navbar/Navbar.module.css`
- Add `.avatarWrapper` — `position: relative` container for avatar button + dropdown
- Add `.avatarBtn` — resets button styles, `cursor: pointer`
- Add `.menu` — `position: absolute`, right-aligned, `bg-lighter`, rounded, shadow, `min-w` for the dropdown panel
- Add `.menuItem` — full-width button, padded, hover state using `bg-light`

### `tests/components/Navbar.test.tsx`
Overwrite the existing minimal test file. Add `vi.hoisted` + `vi.mock` blocks for:
- `@/contexts/AuthContext` — mock `useUser` to return controllable `{ user, loading }`
- `firebase/auth` — mock `getAuth` and `signOut`
- `@lib/firebase/config` — `{ default: {} }`

Tests to cover:
1. Avatar is not rendered when `user` is null
2. Avatar is rendered when `user` is present (uses `user.displayName`)
3. Clicking the avatar opens the dropdown (Log Out button appears)
4. Clicking "Log Out" calls `signOut`
5. Clicking outside the dropdown closes it (simulate `mousedown` on `document.body`)

Existing tests (heading renders, Create Mission link) should still pass.

---

## Reuse

- `useUser()` from `contexts/AuthContext.tsx` — already tracks `user` and `loading`
- `Avatar` from `components/Avatar/` — accepts `name` prop, renders initials
- `vi.hoisted` / `vi.mock` pattern from `tests/contexts/AuthContext.test.tsx`
- `getAuth(app)` pattern from `components/AuthForm/AuthForm.tsx`

---

## Verification

1. `npx vitest run tests/components/Navbar.test.tsx` — all tests pass
2. `npm run dev` → log in → confirm avatar appears in navbar
3. Click avatar → confirm dropdown with "Log Out" appears
4. Click outside → dropdown closes
5. Click "Log Out" → user is signed out, avatar disappears
