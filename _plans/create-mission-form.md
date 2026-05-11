# Plan: Create Mission Form

## Context
The `/missions/create` page is currently a stub. This plan implements the full create-mission flow: a form component that fetches users from Firestore, collects mission data, writes a new document to the `missions` collection, and redirects to `/missions` on success.

---

## Files to Create

### 1. `lib/types/user.ts`
Simple type for documents in the `users` Firestore collection.

```
interface User {
  id: string;
  codename: string;
}
```

### 2. `lib/firebase/firestore.ts`
Firestore service layer — keeps Firebase calls out of components.

Two exported functions:
- `getUsers(): Promise<User[]>` — queries the `users` collection, returns all user documents
- `createMission(data: CreateMissionInput & { deadline: Date }): Promise<string>` — calls `addDoc` on the `missions` collection, converts `deadline: Date` to a Firestore `Timestamp`, sets `finalStatus: null`, returns the new document ID

Imports: `getFirestore`, `collection`, `getDocs`, `addDoc`, `Timestamp` from `firebase/firestore`; `app` from `lib/firebase/config`; `User` from `lib/types/user`; `CreateMissionInput` and `Mission` from `lib/types/mission`.

### 3. `components/CreateMissionForm/CreateMissionForm.tsx`
Client component (`"use client"`). Responsible for:

**State:**
- `title`, `description`, `deadline` (string) — controlled inputs
- `assignedTo: { uid: string; codename: string } | null` — selected user from dropdown
- `users: User[]` — list loaded from Firestore on mount
- `usersLoading: boolean` — true while fetching users
- `submitting: boolean` — true during form submission
- `errors: { title?: string; description?: string; deadline?: string; assignedTo?: string }` — field-level validation
- `formError: string | null` — Firestore write failure message

**On mount (`useEffect`):**
Call `getUsers()` and populate `users`. If the fetch fails, set `formError`.

**Current user codename:**
Read `user` from `useUser()` hook. The `user.displayName` is already the codename (set during signup via `updateProfile`). Use `user.uid` for `createdBy` and `user.displayName` for `createdByCodename`.

**Validation (client-side, before submit):**
- Title: required, non-empty
- Description: required, non-empty
- Deadline: required, must be a valid date and not in the past
- AssignedTo: required (a user must be selected)

**Submit handler:**
1. Run validation — set errors and return early if invalid
2. Set `submitting = true`
3. Call `createMission({ title, description, deadline: new Date(deadline), assignedTo: assignedTo.uid, assignedToCodename: assignedTo.codename, createdBy: user.uid, createdByCodename: user.displayName })`
4. On success: `router.push("/missions")`
5. On error: set `formError`, set `submitting = false`

**Fields rendered:**
- Text input — Title
- Textarea — Description
- Date-time input (`type="datetime-local"`) — Deadline
- Select/dropdown — Assign To (options are users' codenames; disabled while `usersLoading` is true or `submitting`)
- Submit button — disabled when `usersLoading || submitting`; text: "Creating…" while submitting, "Create Mission" otherwise

### 4. `components/CreateMissionForm/CreateMissionForm.module.css`
Follows AuthForm pattern:
- `@reference "../../app/globals.css";` at top
- `.form` — flex column, gap, max-width, `@apply`
- `.field` — flex column, label + input stacked
- `.label` — small, medium weight
- `.input`, `.textarea`, `.select` — full width, dark background (`var(--color-lighter)`), padding, border, focus ring with primary color
- `.error` — `var(--color-error)`, small text
- `.formError` — error banner shown below the form

### 5. `components/CreateMissionForm/index.ts`
```ts
export { default } from "./CreateMissionForm";
```

---

## Files to Modify

### 6. `app/(dashboard)/missions/create/page.tsx`
Replace stub with:
```tsx
import CreateMissionForm from "@/components/CreateMissionForm";

export default function CreateMissionPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h2 className="form-title">Create a New Mission</h2>
        <CreateMissionForm />
      </div>
    </div>
  );
}
```

### 7. `app/(public)/preview/page.tsx`
Add `<CreateMissionForm />` to the preview page so it can be visually reviewed. Wrap in a section with a heading (same pattern as other components on the page).

---

## Tests: `tests/components/CreateMissionForm.test.tsx`

Use `vi.hoisted()` for all mocks (established project pattern).

**Mocks needed:**
- `lib/firebase/firestore` — mock `getUsers` and `createMission`
- `contexts/AuthContext` — mock `useUser` returning a fake user `{ uid: "u1", displayName: "SilverQuietFox" }`
- `next/navigation` — mock `useRouter` with a `push` spy
- `lib/firebase/config` — mock `app` export

**Test cases:**
1. Renders all form fields (title, description, deadline, assign-to select, submit button)
2. Populates the "Assign To" dropdown with codenames returned by mocked `getUsers`
3. Submit button is disabled while users are loading
4. Client validation: shows field errors when submitting empty form
5. Deadline in the past triggers a validation error
6. Successful submission calls `createMission` with the correct payload and navigates to `/missions`
7. Firestore write failure displays a `formError` message and does not navigate

---

## Verification

1. `npm run dev` — visit `/missions/create`, fill the form, submit, confirm redirect to `/missions` and document appears in Firestore
2. `npm run test` — all tests pass including new `CreateMissionForm.test.tsx`
3. `npm run lint` — no ESLint errors
4. Visit `/preview` to confirm form renders in the preview page