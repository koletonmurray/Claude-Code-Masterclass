# Spec for Create Mission Form
branch: feat/create-mission-form

## Summary
A form on the `/missions/create` page that allows an authenticated user to create a new mission document in the Firestore `missions` collection. The form captures the mission title, description, deadline, and the user to assign the mission to. On submission, the document is written to Firestore and the user is redirected to `/missions`.

## Functional requirements
- The form must collect the following fields:
  - **Title** — short text, required
  - **Description** — longer text, required
  - **Deadline** — date/time picker, required
  - **Assign To** — dropdown/select populated from the `users` Firestore collection, required. Displays each user's `codename`; the selected value captures both the user's `uid` and `codename`.
- The `createdBy` and `createdByCodename` fields are derived from the currently authenticated user (Firebase Auth current user matched to the `users` collection).
- On successful submission, a new document is added to the `missions` Firestore collection with all required fields, `finalStatus` set to `null`, and `deadline` stored as a Firestore `Timestamp`.
- After a successful write, the user is redirected to `/missions`.
- While the form is submitting, the submit button should be disabled and show a loading state.
- If the Firestore write fails, display an inline error message and do not redirect.

## Data model
Fields written to the `missions` collection on submit (referencing `lib/types/mission.ts`):

| Field | Source |
|---|---|
| `title` | Form input |
| `description` | Form input |
| `deadline` | Form input → converted to Firestore `Timestamp` |
| `assignedTo` | Selected user's `uid` |
| `assignedToCodename` | Selected user's `codename` |
| `createdBy` | Current user's `uid` |
| `createdByCodename` | Current user's `codename` (fetched from `users` collection) |
| `finalStatus` | Always `null` on creation |

## Users collection
Each document in the `users` Firestore collection is expected to have at least:
- `uid` (string)
- `codename` (string)

These are fetched on page load to populate the "Assign To" dropdown.

## Possible edge cases
- The `users` collection fetch fails or returns an empty list — show an error state or disable the "Assign To" field with a message.
- The current user's document is not found in the `users` collection — handle gracefully and surface an error.
- The user submits before the users list has loaded — the submit button should remain disabled until the users list is available.
- Network failure during Firestore write — display an error without losing form data.
- The deadline field is set in the past — either prevent submission with a validation message or warn the user.

## Acceptance criteria
- Visiting `/missions/create` renders a form with fields for title, description, deadline, and assign-to.
- The "Assign To" dropdown is populated with codenames fetched from the `users` Firestore collection.
- Submitting a valid form creates a document in the `missions` Firestore collection with all required fields.
- After a successful submission the app navigates to `/missions`.
- A failed Firestore write surfaces an inline error and keeps the user on the form.
- The submit button is disabled while the form is submitting or while the users list is still loading.

## Testing guidelines
Create test file(s) in `./tests/` for the new feature. Focus on:
- Renders all form fields (title, description, deadline, assign-to dropdown).
- "Assign To" dropdown is populated from a mocked `users` collection fetch.
- Submit button is disabled while users are loading.
- Submitting the form calls the Firestore `addDocument` function with the correct payload.
- Successful submission triggers navigation to `/missions`.
- A Firestore write error surfaces an error message without navigating.
- Validation prevents submission when required fields are empty.
