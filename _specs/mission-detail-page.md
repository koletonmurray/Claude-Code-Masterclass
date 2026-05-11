# Spec for Mission Detail Page
branch: feat/mission-detail-page

## Summary

A full-featured detail page for an individual mission, reachable at `/missions/[id]`. The page fetches the mission document from Firestore in real time and renders all available data in a visually rich layout that is consistent with the `/missions` operations board and the home splash — using the same dark palette, Space Mono / Teko typography, gradient accents, and card-style surfaces. The page supports two primary roles: the person who created the mission (the assigner) and the person assigned to it (the operative).

## Functional requirements

### Data & Real-Time Subscription
- Fetch the mission document from Firestore using the `[id]` route parameter.
- Use a real-time `onSnapshot` listener so status changes (e.g. `finalStatus` being set) are reflected immediately without a page reload.
- Show a skeleton loading state while the first snapshot is pending.
- Show a styled "Not found" state if the document does not exist.
- Show a styled error state if the Firestore subscription fails.

### Page Header
- Display the mission `title` prominently as the page headline (large Teko font, matching the Operations Board `pageTitle` style).
- Include a small tagline or breadcrumb link back to `/missions` (e.g. "← Operations Board").
- Show a deadline badge using the same urgency-colour logic as the mission cards on `/missions`: normal / urgent (≤ 3 days) / critical (overdue).

### Mission Info Section
- `description` — full text, not clamped.
- Assigner info: `createdByCodename` with a label (e.g. "Mission Commander").
- Operative info: `assignedToCodename` with a label (e.g. "Assigned Operative").
- Deadline: human-friendly formatted date/time (e.g. "May 15, 2026 at 3:00 PM") plus the countdown badge.

### Status Section
- If `finalStatus` is `null` and the deadline has not passed: show an "In Progress" badge.
- If `finalStatus` is `null` and the deadline has passed: show an "Expired" badge.
- If `finalStatus` is `"success"`: show a "Mission Success" badge in green (`--color-success`).
- If `finalStatus` is `"failure"`: show a "Mission Failed" badge in red (`--color-error`).

### Action: Mark Outcome (Assigner Only)
- If the current user is the creator (`createdBy === user.uid`) and `finalStatus` is `null`:
  - Show two action buttons: "Mark as Success" and "Mark as Failed".
  - On click, update `finalStatus` in Firestore.
  - Show a loading/disabled state on the buttons while the write is in-flight.
  - Show an error message if the write fails.
- If the current user is not the creator, or `finalStatus` is already set, these buttons are hidden.

### Visual Design
- Consistent with `/missions` page: dark card surfaces (`--color-light`, `--color-lighter`), gradient accent lines, Space Mono labels, Teko headings.
- Use a single-column layout with clear visual sections separated by subtle dividers or spacing.
- Gradient accent bar on the left edge of info cards (matching the section accents on the Operations Board).
- Corner bracket decorations on the header (matching the home page hero aesthetic).
- Shimmer skeleton cards during loading (matching the Operations Board skeleton style).

## Possible edge cases
- User navigates directly to a mission ID that does not exist — show a "Mission Not Found" empty state with a link back to `/missions`.
- Firestore permission denied (user is not the creator or assignee) — surface the error clearly.
- Deadline passes while the user is on the page — the deadline badge should update reactively since `onSnapshot` re-fires; the status badge should also re-evaluate.
- `finalStatus` is set by another session while the user is viewing — the UI reflects the change immediately via the real-time listener.
- The assigner and operative are the same user (self-assigned mission) — the UI should still render correctly without duplication issues.

## Acceptance criteria
- Visiting `/missions/[id]` renders the full mission detail with all fields populated from Firestore in real time.
- The deadline badge displays the correct urgency colour and countdown.
- The status badge reflects `finalStatus` or deadline-derived state correctly.
- The "Mark as Success" / "Mark as Failed" buttons are visible only to the creator when `finalStatus` is null.
- Clicking either button updates Firestore and the UI reflects the change immediately.
- Loading, error, and not-found states all render with styled UI (not blank or unstyled).
- The page is visually consistent with `/missions` and the home page in typography, colour tokens, and layout patterns.
- Navigating back to `/missions` via the breadcrumb works correctly.

## Open questions
- Should operatives be able to self-report outcome, or is that strictly the assigner's privilege?
- Is there a comments / notes field planned for missions that should appear here?
- Should the page show a history of when the mission was created vs. deadline set?

## Testing guidelines
Create a test file in `./tests/` for the new page or its hook. Focus on:
- Real-time listener returns correct mission data and maps `id` from `doc.id`.
- Loading state is true before first snapshot, false after.
- Not-found state is triggered when `doc.exists()` is false.
- Error state is set when `onSnapshot` errors.
- Listener is unsubscribed on unmount.
- `finalStatus` update writes the correct value to Firestore.
- Outcome buttons are hidden when the current user is not the creator.
- Outcome buttons are hidden when `finalStatus` is already set.
