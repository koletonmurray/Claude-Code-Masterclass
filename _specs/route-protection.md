# Spec for route-protection
branch: feat/route-protection

## Summary
Add auth-based route protection to both Next.js route groups, complete post-auth redirects, a logout redirect, and a context-aware login button in the Navbar. The `(public)` group (login, signup) should only be accessible to unauthenticated users — authenticated users are redirected to `/missions`. The `(dashboard)` group (missions) should only be accessible to authenticated users — unauthenticated users are redirected to `/login`. Both group layouts show a minimal loading indicator while Firebase resolves auth state. After signup or login, users land on `/missions`. After logout, users are redirected to `/` (home). The Navbar shows a login button when the user is not authenticated and the avatar dropdown when they are.

## Functional requirements

### Route protection
- Use the existing `useUser()` hook from `AuthContext` to access `user` and `loading` in each layout.
- While `loading` is true, both layouts render a simple full-page loader instead of their children.
- Once `loading` is false:
  - `(public)` layout: if `user` is present, redirect to `/missions`. Otherwise render children.
  - `(dashboard)` layout: if `user` is null, redirect to `/login`. Otherwise render children.
- Redirects use `useRouter` from `next/navigation`.
- The loader is a large `Clock8` icon (the same icon used in the Navbar logo, from `lucide-react`), centred on the page. It should have a gentle spin animation applied via CSS.

### Post-auth redirects
- After successful **signup**, redirect to `/missions`. *(Note: this redirect already exists in `AuthForm.tsx` — verify it is still in place.)*
- After successful **login**, redirect to `/missions` instead of showing the current success message.

### Logout redirect
- After `signOut` completes in the Navbar, redirect to `/` (home page) using `useRouter`.

### Navbar login button
- When the user is not authenticated (`!loading && !user`), show a "Log In" link/button in the Navbar in place of the avatar.
- When the user is authenticated (`!loading && user`), show the avatar dropdown as currently implemented.
- While `loading`, show nothing in that slot (no flash).

## Possible edge cases
- Firebase auth state briefly appears as loading on first render — the loader must cover this window to avoid flashing protected content or triggering premature redirects.
- Layouts that use `useUser()` must be client components (`"use client"`).
- The `(public)` layout currently may not be a client component — this will need to change.

## Acceptance criteria
- Visiting `/login` or `/signup` while authenticated immediately redirects to `/missions`.
- Visiting any `/missions` route while unauthenticated immediately redirects to `/login`.
- A loader is shown in each layout while `loading` is true.
- After successful signup, user lands on `/missions`.
- After successful login, user is redirected to `/missions` (no longer shows success message).
- After logout, user is redirected to `/`.
- Navbar shows "Log In" link when unauthenticated, avatar dropdown when authenticated, nothing while loading.

## Testing guidelines
Write or update tests in `tests/`. Mock `useUser` and `useRouter`. Cover:
- `(public)` layout: loader shown while loading
- `(public)` layout: authenticated user is redirected to `/missions`
- `(public)` layout: unauthenticated user sees children
- `(dashboard)` layout: loader shown while loading
- `(dashboard)` layout: unauthenticated user is redirected to `/login`
- `(dashboard)` layout: authenticated user sees children
- Navbar: shows login link when unauthenticated
- Navbar: shows avatar when authenticated
- Navbar: redirects to `/` after logout
- AuthForm login mode: redirects to `/missions` on success (replaces success message test)
