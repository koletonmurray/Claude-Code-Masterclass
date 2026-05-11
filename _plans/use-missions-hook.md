# Plan: useMissions Hook

## Context
The `/missions` dashboard page is a stub with three empty sections. This plan implements a `useMissions` hook that subscribes to real-time Firestore data and filters missions by mode, then wires it into the dashboard page so each section renders its mission titles live.

---

## Files to Create

### 1. `lib/hooks/useMissions.ts`
Custom hook. `"use client"` is not needed — it's a plain hook file, not a component.

**Signature:**
```
useMissions(mode: "active" | "assigned" | "expired")
  → { missions: Mission[], loading: boolean, error: string | null }
```

**Dependencies:**
- `useEffect`, `useState` from React
- `getFirestore`, `collection`, `query`, `where`, `onSnapshot`, `Timestamp` from `firebase/firestore`
- `app` from `lib/firebase/config`
- `useUser` from `contexts/AuthContext`
- `Mission` type from `lib/types/mission`

**Logic per mode:**

| Mode | Firestore `where` clauses | Client-side filter |
|---|---|---|
| `"active"` | `assignedTo == user.uid`, `deadline >= Timestamp.now()` | none |
| `"assigned"` | `createdBy == user.uid`, `deadline >= Timestamp.now()` | none |
| `"expired"` | `deadline < Timestamp.now()` | `finalStatus !== null` |

> **Note on "expired"**: Firestore does not allow two inequality filters on different fields in a single query. So the `deadline < now` filter runs in Firestore; `finalStatus !== null` is applied client-side on the snapshot results.

**Behaviour:**
- On mount (or when `mode`/`user.uid` changes), build the appropriate Firestore query and call `onSnapshot`.
- Initialise `loading: true`; set `loading: false` after the first snapshot.
- Map each snapshot doc to `{ id: doc.id, ...doc.data() } as Mission`.
- Apply the client-side `finalStatus` filter for `"expired"` mode after mapping.
- On Firestore error, set `error` string and `loading: false`.
- If `user` is `null`, return `{ missions: [], loading: false, error: null }` immediately without opening a listener.
- Return the `onSnapshot` unsubscribe function from `useEffect` for cleanup.

**File location:** `lib/hooks/useMissions.ts`

---

## Files to Modify

### 2. `app/(dashboard)/missions/page.tsx`
Add `"use client"` (hook requires client context). Replace stub sections with three instances of `useMissions`:

- **"Your Active Missions"** — `useMissions("active")`
- **"Missions You've Assigned"** — `useMissions("assigned")`
- **All Expired Missions** — `useMissions("expired")`

Each section:
- Shows a spinner or "Loading…" text while `loading` is true
- Shows the `error` string if non-null
- Shows "No missions here." (or similar) if `missions` is empty
- Otherwise renders a `<ul>` with each mission's `title` as a `<li>`

---

## Tests: `tests/hooks/useMissions.test.ts`

Use `renderHook` from `@testing-library/react`. Use `vi.hoisted()` for all mocks.

**Mocks needed:**
- `firebase/firestore` — mock `getFirestore`, `collection`, `query`, `where`, `onSnapshot`, `Timestamp`
- `lib/firebase/config` — mock `app`
- `contexts/AuthContext` — mock `useUser`

**`onSnapshot` mock pattern:**
```
mockOnSnapshot.mockImplementation((q, callback) => {
  callback({ docs: [...] });  // simulate snapshot
  return vi.fn();             // return unsubscribe fn
});
```

**Test cases:**
1. Returns `loading: true` before snapshot fires, `loading: false` after.
2. `"active"` mode calls `where("assignedTo", "==", uid)` and `where("deadline", ">=", ...)`.
3. `"assigned"` mode calls `where("createdBy", "==", uid)` and `where("deadline", ">=", ...)`.
4. `"expired"` mode calls `where("deadline", "<", ...)` and client-filters `finalStatus !== null`.
5. Returns correct `missions` array mapped from snapshot docs (including `id` from `doc.id`).
6. Sets `error` when `onSnapshot` calls back with an error.
7. Calls the unsubscribe function returned by `onSnapshot` on unmount.
8. Returns empty array and skips `onSnapshot` when `user` is `null`.

---

## Firestore Index Note
The `"active"` and `"assigned"` queries combine an equality filter with a range filter on a different field (`deadline`). Firestore requires a **composite index** for each:
- Collection `missions`: fields `assignedTo ASC`, `deadline ASC`
- Collection `missions`: fields `createdBy ASC`, `deadline ASC`

These will need to be created in the Firebase console (or via `firestore.indexes.json`) before the queries work in production.

---

## Verification
1. `npm run test` — all tests pass including new `useMissions.test.ts`
2. `npm run lint` — no ESLint errors
3. `npm run dev` — log in, visit `/missions`, create missions via `/missions/create`, confirm titles appear in the correct sections in real time
