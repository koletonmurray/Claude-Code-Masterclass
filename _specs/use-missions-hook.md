# Spec for useMissions Hook
branch: feat/use-missions-hook

## Summary
A custom React hook, `useMissions`, that subscribes to real-time Firestore data from the `missions` collection and returns a filtered array of `Mission` objects based on a `mode` argument. The hook drives the three sections of the `/missions` dashboard page, each showing the relevant mission titles.

## Functional requirements

### Hook: `useMissions(mode)`

The hook accepts a single `mode` argument with one of three string values:

| Mode | Query description |
|---|---|
| `"active"` | Missions where `assignedTo === currentUser.uid` AND `deadline` has not yet passed |
| `"assigned"` | Missions where `createdBy === currentUser.uid` AND `deadline` has not yet passed |
| `"expired"` | Missions where `deadline` has passed AND `finalStatus` is not `null`, regardless of user |

- The hook must use Firestore's real-time listener (`onSnapshot`) so the UI updates automatically when documents change.
- The hook returns an object with:
  - `missions: Mission[]` — the filtered array of mission documents
  - `loading: boolean` — true while the initial snapshot is pending
  - `error: string | null` — set if the Firestore subscription fails
- The hook must unsubscribe from the Firestore listener when the component unmounts.
- The current user is obtained from the existing `useUser()` hook. If the user is not authenticated, the hook should return an empty array and not attempt a Firestore query.
- Deadline comparisons must use Firestore `Timestamp` values for consistency.

### Page: `app/(dashboard)/missions/page.tsx`

- Use `useMissions` three times (once per mode) to populate three sections:
  - **Your Active Missions** — mode `"active"`
  - **Missions You've Assigned** — mode `"assigned"`
  - **All Expired Missions** — mode `"expired"`
- Each section renders only the `title` of each mission as a list.
- Each section shows a loading state while data is being fetched.
- Each section shows an error message if the query fails.
- Each section shows an empty state message when its list is empty (e.g. "No active missions").

## Possible edge cases
- User is not yet authenticated when the hook mounts — should skip the query and return empty results.
- A mission's `deadline` is stored as a Firestore `Timestamp` — comparisons must account for this type, not a plain JS `Date`.
- The `mode` argument changes at runtime — the hook should unsubscribe the old listener and create a new one.
- Firestore rules may block the query if the user is not authorized — surface this via the `error` field.
- Multiple hooks on the same page each open their own listener — this is acceptable for now.

## Acceptance criteria
- `useMissions("active")` returns only missions assigned to the current user with a future deadline, updating in real time.
- `useMissions("assigned")` returns only missions created by the current user with a future deadline, updating in real time.
- `useMissions("expired")` returns only missions with a past deadline and a non-null `finalStatus`, updating in real time.
- The `/missions` page renders three labelled sections, each listing mission titles from the appropriate query.
- Each section independently shows loading, error, and empty states.
- Unmounting a component using the hook correctly cleans up the Firestore listener.

## Testing guidelines
Create a test file in `./tests/` for the new hook. Focus on:
- `useMissions("active")` calls `onSnapshot` with a query filtered by `assignedTo` and a future deadline.
- `useMissions("assigned")` calls `onSnapshot` with a query filtered by `createdBy` and a future deadline.
- `useMissions("expired")` calls `onSnapshot` with a query filtered by a past deadline and non-null `finalStatus`.
- Returns `loading: true` before the first snapshot arrives, then `loading: false` after.
- Returns the correct `missions` array from snapshot data.
- Sets `error` when the Firestore listener calls back with an error.
- Unsubscribes the listener on unmount.
- Returns an empty array and skips the query when user is `null`.
