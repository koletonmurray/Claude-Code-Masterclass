# Plan: Route Protection

## Context
The app has no auth guards — anyone can visit `/missions` or `/login` regardless of auth state. This plan adds protection to both route group layouts, completes the post-login redirect (currently shows a success message instead of navigating), adds a logout redirect to home, and wires a context-aware login button into the Navbar.

---

## Approach

Convert both group layouts to client components so they can call `useUser()`. While `loading` is true, render a full-page centered `Clock8` spinner (reusing the logo icon, with Tailwind's `animate-spin`). Once resolved, redirect or render children based on auth state. Make the remaining redirect/UI changes to `AuthForm` and `Navbar`.

---

## Files to Modify

### `app/(public)/layout.tsx`
- Add `"use client"`
- Import `useUser` from `@/contexts/AuthContext`, `useRouter` from `next/navigation`, `useEffect` from `react`, `Clock8` from `lucide-react`
- While `loading`: render full-page centered `<Clock8 size={64} className="animate-spin" />`
- Once resolved: if `user` exists, `router.replace("/missions")`; otherwise render `<main className="public">{children}</main>`

### `app/(dashboard)/layout.tsx`
- Add `"use client"`
- Import `useUser`, `useRouter`, `useEffect`, `Clock8`
- While `loading`: render full-page centered `<Clock8 size={64} className="animate-spin" />`
- Once resolved: if `!user`, `router.replace("/login")`; otherwise render `<><Navbar /><main>{children}</main></>`

### `components/AuthForm/AuthForm.tsx`
- In the login branch, replace `setFormSuccess("You're logged in!")` with `router.push("/missions")`
- Remove the `formSuccess` state and its JSX render (no longer needed for login)
- Remove `.success` CSS class usage from JSX (keep the CSS class in case it's reused later)

### `components/Navbar/Navbar.tsx`
- In `handleLogout`: after `signOut` resolves, call `router.push("/")`
- Add a "Log In" `<Link>` when `!loading && !user` in the `<ul>`, styled with `className="btn"`, pointing to `/login`

### `tests/layouts/PublicLayout.test.tsx` *(new file)*
Mock `useUser`, `useRouter`, `next/navigation`. Tests:
1. Renders spinner while loading
2. Redirects to `/missions` when user is present
3. Renders children when user is null

### `tests/layouts/DashboardLayout.test.tsx` *(new file)*
Same mock setup. Tests:
1. Renders spinner while loading
2. Redirects to `/login` when user is null
3. Renders children (including Navbar) when user is present

### `tests/components/Navbar.test.tsx`
- Add: "Log In" link is visible when user is null and not loading
- Add: "Log In" link is not visible when user is present
- Update: "clicking Log Out" test to also assert `mockPush` was called with `"/"`

### `tests/components/AuthForm.test.tsx`
- Replace the "shows success message after successful login" test with "redirects to /missions after successful login" — assert `mockPush` was called with `"/missions"`

---

## Reuse

- `useUser()` from `contexts/AuthContext.tsx` — provides `user` and `loading`
- `Clock8` from `lucide-react` — already imported in `components/Navbar/Navbar.tsx`
- `animate-spin` — Tailwind v4 built-in utility, no custom CSS needed
- `mockUseUser` vi.mock pattern from `tests/components/Navbar.test.tsx`
- `mockPush` already in `tests/components/AuthForm.test.tsx` hoisted block

---

## Verification

1. `npx vitest run` — all 37+ tests pass
2. `npm run dev`:
   - Visit `/missions` while logged out → redirected to `/login`
   - Visit `/login` while logged in → redirected to `/missions`
   - Log out → redirected to `/`
   - Log in → redirected to `/missions`
   - Navbar shows "Log In" when logged out, avatar when logged in
   - Clock spinner visible briefly on page load before auth resolves
