# Spec for navbar-logout
branch: feat/navbar-logout

## Summary
When a user is authenticated, the `Navbar` displays their `Avatar` component. Clicking the avatar opens a small dropdown menu containing a "Log Out" option. Clicking "Log Out" signs the user out via Firebase. Nothing is shown when the user is not logged in. No redirect behaviour is required at this stage.

## Functional requirements
- The `Navbar` must read the current Firebase Auth state to determine whether a user is logged in.
- When the user is logged in, their `Avatar` is rendered in the navbar (no standalone logout button).
- When the user is not logged in (or auth state is still loading), neither the avatar nor the dropdown is rendered.
- Clicking the avatar toggles a dropdown menu open/closed.
- The dropdown contains a single "Log Out" option.
- Clicking "Log Out" calls Firebase's `signOut` and closes the dropdown.
- Clicking outside the dropdown closes it without signing out.
- No redirect occurs after sign-out — the navbar simply updates to hide the avatar.

## Possible edge cases
- Auth state is still loading on first render — the avatar should not flash visible before auth resolves.
- `signOut` call fails — should fail silently or log the error without breaking the UI.
- Dropdown should close on outside click to avoid it remaining open after the user navigates away or interacts elsewhere.

## Acceptance criteria
- Avatar is visible in the navbar when a user is authenticated.
- No avatar or dropdown is visible when no user is authenticated.
- Clicking the avatar opens a dropdown with a "Log Out" option.
- Clicking outside the dropdown closes it.
- Clicking "Log Out" calls Firebase `signOut`.
- After sign-out, the avatar and dropdown disappear from the navbar without a page reload.
- No redirect happens on sign-out.

## Testing guidelines
Create a test file in `tests/components/` for `Navbar`. Mock `firebase/auth` and `next/navigation` as needed. Cover:
- Avatar is not rendered when user is null
- Avatar is rendered when a user is present
- Clicking the avatar opens the dropdown
- Clicking outside the dropdown closes it
- Clicking "Log Out" calls `signOut`
- Avatar disappears after sign-out resolves
