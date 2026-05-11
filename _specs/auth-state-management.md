# Spec for auth-state-management
branch: feat/auth-state-management

## Summary
Add a global Firebase auth state listener that exposes the current user via a `useUser` hook. Any component or page can call `useUser()` to get the authenticated user object (or `null` when logged out) without prop-drilling or redundant listener setup. This does not include signup, login, or logout flows.

## Functional requirements
- A React context (`AuthContext`) wraps the app and subscribes to Firebase's `onAuthStateChanged` listener once on mount.
- The context value provides `user` (`FirebaseUser | null`) and a `loading` boolean (true until the first auth state is resolved).
- A `useUser` hook reads from `AuthContext` and returns `{ user, loading }`.
- The hook must be usable in any client component or page without additional setup.
- Any existing component that references a hardcoded or placeholder user value is updated to use `useUser` instead.
- No sign-up, login, or logout UI or logic is introduced.

## Possible edge cases
- Hook called outside of `AuthContext` provider — should throw a clear error.
- Component renders before auth state has resolved (`loading: true`) — UI should handle this gracefully (e.g. avoid rendering user-dependent content until loading is false).
- Firebase SDK not initialised before the provider mounts — `AuthContext` must import from `@lib/firebase/config` to guarantee initialisation.

## Acceptance criteria
- `useUser()` returns `{ user: null, loading: false }` when no user is signed in.
- `useUser()` returns `{ user: <FirebaseUser>, loading: false }` when a user is signed in.
- `loading` is `true` until the first `onAuthStateChanged` callback fires.
- The `AuthContext` provider is mounted at the app root so all routes have access.
- Calling `useUser()` outside the provider throws a descriptive error.
- No prop-drilling of user state anywhere in the component tree.

## Testing guidelines
Create a test file in `./tests` for the new feature, covering the following without going too heavy:
- `useUser` returns `{ user: null, loading: false }` when auth resolves with no user
- `useUser` returns the user object when auth resolves with a signed-in user
- `loading` is `true` before auth state resolves, then `false` after
- Calling `useUser` outside the provider throws an error
