# Spec for signup-firebase-auth
branch: feat/signup-firebase-auth

## Summary
Wire the existing signup form (`app/(public)/signup/`) to Firebase Authentication using the Firebase web SDK. On successful account creation, generate a random codename by combining one word from each of three distinct word sets in PascalCase and set it as the user's `displayName`. Also create a document in the `users` Firestore collection storing the user's `id` and `codename` — no email is stored.

## Functional requirements
- The signup form submits to `createUserWithEmailAndPassword` via the Firebase Auth web SDK.
- On success, a random codename is generated: one word picked from each of three curated word sets, joined in PascalCase (e.g. `SwiftShadowVault`).
- The codename is set as the Firebase Auth user's `displayName` via `updateProfile`.
- A document is written to the `users` Firestore collection with fields: `id` (the Firebase UID) and `codename`. Email must not be stored.
- All Firebase access goes through the existing `@lib/firebase/config` app instance.
- Only the Firebase web SDK is used (no Admin SDK, no server actions).
- On failure (e.g. email already in use, weak password), an appropriate error message is shown in the form.
- On success, the form does not need to redirect yet — console logging the result is acceptable for now.

## Possible edge cases
- Codename collision in Firestore — acceptable to ignore for now (low probability with large word sets).
- Firebase Auth errors (email already in use, weak password, network error) must surface as user-readable messages in the form.
- Firestore write fails after Auth account is created — the Auth account will exist but the user doc won't. Log the error but do not block the user.
- Word sets should each contain enough unique words to produce meaningful variety.

## Acceptance criteria
- Submitting the form with a valid email and password creates a Firebase Auth account.
- The created user's `displayName` is a PascalCase codename composed of words from three distinct sets.
- A document exists in `users/{uid}` containing `id` and `codename` fields, with no email field.
- Submitting with an already-registered email shows a readable error in the form.
- Submitting with a password shorter than 6 characters shows a readable error (existing validation already covers this).
- The Firebase app instance is imported from `@lib/firebase/config`.

## Testing guidelines
Create a test file in `./tests` for the new feature, covering the following:
- Codename generator returns a string in PascalCase made of exactly three words (one from each set).
- Codename generator never returns the same word twice across sets (sets are disjoint).
- Codename generator output varies across multiple calls (not always the same result).
- Form shows an error when Firebase returns `auth/email-already-in-use`.
- Form calls `createUserWithEmailAndPassword` with correct email and password on valid submission.
- `updateProfile` is called with the generated codename as `displayName`.
- Firestore `setDoc` is called with `id` and `codename` fields (no email).
