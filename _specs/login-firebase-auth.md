# Spec for login-firebase-auth
branch: feat/login-firebase-auth

## Summary
Wire the existing login form in `app/(public)/login/` to Firebase Authentication. When a user submits valid credentials, they are signed in via Firebase. On success, a success message is displayed in the form. No redirect is needed at this stage. Validation errors and Firebase auth errors should be surfaced appropriately.

## Functional requirements
- The login form already renders email and password fields via the shared `AuthForm` component with `mode="login"`.
- On valid form submission, call Firebase's `signInWithEmailAndPassword` with the provided credentials.
- While the sign-in request is in flight, the form should be disabled (inputs and submit button).
- On success, display a success message within the form (e.g. "You're logged in!"). No redirect.
- On failure, map Firebase error codes to user-friendly messages:
  - `auth/invalid-credential` or `auth/user-not-found` or `auth/wrong-password` → "Incorrect email or password."
  - All other errors → "Something went wrong. Please try again."
- Client-side validation (email format, password min length) already exists and should remain unchanged.

## Possible edge cases
- User submits with correct format but wrong credentials — Firebase error should surface as a form-level error.
- User submits while a request is already in flight — form should remain disabled.
- Success message should replace any previous form-level error, and vice versa.

## Acceptance criteria
- Submitting valid credentials signs the user in via Firebase and shows a success message.
- Submitting invalid credentials shows an appropriate error message.
- Form inputs and submit button are disabled while the request is in progress.
- Client-side validation still runs before any Firebase call is made.
- No redirect occurs after successful login.

## Testing guidelines
Update `tests/components/AuthForm.test.tsx`. Mock `signInWithEmailAndPassword` from `firebase/auth` (already partially mocked). Cover:
- Calls `signInWithEmailAndPassword` with the correct email and password on login submission
- Shows success message on successful sign-in
- Shows "Incorrect email or password" for `auth/invalid-credential`
- Shows generic error for unknown Firebase errors
- Form is disabled while submitting
