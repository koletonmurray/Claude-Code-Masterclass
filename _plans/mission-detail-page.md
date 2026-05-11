# Plan: Mission Detail Page

## Context
The `/missions/[id]` route is a stub (`<div className="page-content"><h2>Mission Details</h2></div>`). This plan replaces it with a fully functional, visually rich detail page that matches the design language of the Operations Board and home splash — dark card surfaces, Teko/Space Mono typography, gradient accent bars, corner brackets, shimmer skeletons, and staggered fade-up entrance animations. The page uses a real-time Firestore listener so status changes reflect instantly, and allows the mission creator to mark the outcome.

---

## Files to Create / Modify

| File | Action |
|---|---|
| `lib/firebase/firestore.ts` | Add `updateMissionStatus` export |
| `lib/hooks/useMission.ts` | Create — single-document real-time hook |
| `tests/hooks/useMission.test.ts` | Create — hook tests |
| `app/(dashboard)/missions/[id]/mission-detail.module.css` | Create — all page styles |
| `app/(dashboard)/missions/[id]/page.tsx` | Replace stub with full page |

---

## Step 1 — Add `updateMissionStatus` to `lib/firebase/firestore.ts`

Add `doc` and `updateDoc` to the existing `firebase/firestore` import. Add `FinalStatus` to the existing type import from `@lib/types/mission`.

New export:
```
updateMissionStatus(id: string, status: FinalStatus): Promise<void>
  → await updateDoc(doc(db, "missions", id), { finalStatus: status })
```

The module-level `const db = getFirestore(app)` already exists — reuse it.

---

## Step 2 — Create `lib/hooks/useMission.ts`

Pattern mirrors `lib/hooks/useMissions.ts` exactly, adapted for a single document.

**Signature:**
```
useMission(id: string)
  → { mission: Mission | null, loading: boolean, error: string | null, notFound: boolean }
```

**Firestore imports needed:** `getFirestore`, `doc`, `onSnapshot` from `firebase/firestore`

**Logic:**
- Guard: `if (!user) return { mission: null, loading: false, error: null, notFound: false }`
- `onSnapshot(doc(db, "missions", id), snapshot => { ... }, err => { ... })`
- On success: if `!snapshot.exists()` → set `notFound: true, loading: false`; else set `mission: { id: snapshot.id, ...snapshot.data() } as Mission, loading: false`
- On error: set `error: err.message, loading: false`
- Return `unsubscribe` from `useEffect`
- Effect dependencies: `[id, user]`

---

## Step 3 — Create `tests/hooks/useMission.test.ts`

Follow the `vi.hoisted` → `vi.mock` → import pattern from `tests/hooks/useMissions.test.ts`.

**Mocks needed:** `mockGetFirestore`, `mockDoc`, `mockOnSnapshot`, `mockUseUser`, `mockUnsubscribe`

**Mock modules:** `firebase/firestore` (getFirestore, doc, onSnapshot), `@lib/firebase/config`, `@/contexts/AuthContext`

**7 test cases:**
1. `loading` is true before snapshot fires
2. `loading` becomes false after snapshot fires
3. Maps `snapshot.id` to `mission.id` and all fields correctly
4. `notFound: true` when `snapshot.exists()` returns false
5. Sets `error` and `loading: false` when `onSnapshot` errors
6. Calls unsubscribe on unmount
7. Returns empty result and skips `onSnapshot` when `user` is null

**Snapshot helper for single-doc:**
```
makeDocSnapshot(exists: boolean, id = "h1", data = fakeMissionData)
  → { exists: () => exists, id, data: () => data }
```

---

## Step 4 — Create `app/(dashboard)/missions/[id]/mission-detail.module.css`

**Critical:** First line must be `@reference "../../../globals.css";` — three levels up (not two like the sibling `missions.module.css`).

**Sections to define:**

- **Page:** `.page` — max-width 72rem, centered, padding 2.5rem 1.25rem 5rem
- **Header:** `.header` — card surface, relative, overflow hidden; `.headerTop` — flex space-between; `.backLink` — Space Mono, primary color, no underline; `.tagline` — Space Mono 0.62rem uppercase primary; `.pageTitle` — Teko 3.75rem 700 uppercase white
- **Corner brackets:** `.corner`, `.tl`, `.tr`, `.bl`, `.br` — 22×22px absolute, border sides at `rgba(152, 16, 250, 0.3)`, 1.5rem from edges (match `page.module.css` exactly)
- **Cards:** `.card` — light surface, border, radius 6px, padding 1.25rem, relative, overflow hidden; `.cardAccent` — absolute left 0, 3px wide, full height, primary→secondary gradient; `.cardLabel` — Space Mono 0.52rem muted uppercase; `.cardBody` — 0.9rem body color line-height 1.7 (no clamping)
- **Intel grid:** `.intelGrid` — 2-col CSS grid gap 1rem; `.intelItem`, `.intelLabel`, `.intelValue` — Space Mono metadata pattern
- **Deadline badges:** `.deadline`, `.deadlineNormal`, `.deadlineUrgent`, `.deadlineCritical` — identical values to `missions.module.css`
- **Status badges:** `.statusBadge` base + `.badgeInProgress` (purple tint), `.badgeExpired` (muted), `.badgeSuccess` (green), `.badgeFailure` (red)
- **Actions:** `.actions` — lighter surface card; `.actionsLabel`, `.actionButtons`; `.btnSuccess` (green tint, green border, disabled state); `.btnFailure` (red tint); `.actionError`
- **Skeleton:** `.skeletonHeader` (148px), `.skeletonCard` (120px), `.skeletonCardTall` (180px) — shimmer animation identical to `missions.module.css`
- **Error:** `.error` — identical to `missions.module.css`
- **Not-found:** `.notFound` — centered flex card; `.notFoundLabel`
- **Entrance:** `@keyframes fadeUp` + `.fadeUp` — identical to `page.module.css` (home)

---

## Step 5 — Implement `app/(dashboard)/missions/[id]/page.tsx`

Replace stub entirely. First line: `"use client"`.

**Imports:** `Link`, `useParams`, `useState`, `dayjs`, `useUser`, `useMission`, `updateMissionStatus`, `type { FinalStatus }`, `styles`

**Helpers (define in file, not in components):**
- `deadlineInfo(seconds)` — copy verbatim from `missions/page.tsx`
- `formatDeadline(seconds)` — `dayjs.unix(seconds).format("MMM D, YYYY [at] h:mm A")`

**Main component:**
```
const { id } = useParams<{ id: string }>();
const { user } = useUser();
const { mission, loading, error, notFound } = useMission(id);
const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState<string | null>(null);
```

**Derived values** (computed before JSX when mission is non-null):
- `deadlineSecs` — cast `mission.deadline` to `{ seconds: number }.seconds`
- `dl` — from `deadlineInfo(deadlineSecs)`
- `deadlineFormatted` — from `formatDeadline(deadlineSecs)`
- `isOverdue` — `dayjs.unix(deadlineSecs).isBefore(dayjs())`
- `canMarkOutcome` — `user?.uid === mission.createdBy && mission.finalStatus === null`

**Conditional renders (in order):**
1. Loading → skeleton divs (skeletonHeader + 3× skeletonCard)
2. Error → `.error` paragraph + back link
3. Not-found → `.notFound` with "Mission Not Found" + Link to `/missions`
4. Main content (mission non-null)

**Page layout (main content):**
```
<div className={styles.page}>
  <header className={styles.header}>          ← tagline, h1 title, back link, deadline badge, corner brackets
  <div className={styles.card}>               ← description (full text, no clamp)
  <div className={styles.card}>               ← intel grid (commander, operative, deadline date)
  <div className={styles.card}>               ← status badge
  {canMarkOutcome && <div className={styles.actions}>}   ← success + failure buttons
</div>
```

**Staggered `animationDelay`:** 0ms (header), 80ms (briefing), 160ms (intel), 240ms (status), 320ms (actions) — matching home page pattern.

**`handleMarkOutcome(status: FinalStatus)`:**
```
setSubmitting(true); setSubmitError(null);
try { await updateMissionStatus(mission.id, status); }
catch (err) { setSubmitError((err as Error).message ?? "Failed to update."); }
finally { setSubmitting(false); }
```

---

## Dependency Order

Steps 1, 2, and 4 have no cross-dependencies — implement in parallel.
Step 3 requires Step 2.
Step 5 requires Steps 1, 2, and 4.

---

## Verification

1. `npm run test` — all tests pass including new `useMission.test.ts`
2. `npm run lint` — no ESLint errors
3. `npm run dev` — log in, create a mission, navigate to `/missions`, click a card → detail page renders with correct data, deadline badge, status, and action buttons (as creator)
4. Open a second session as the assignee → action buttons should not appear
5. Mark outcome → status badge updates instantly; action buttons disappear
6. Navigate to `/missions/nonexistent-id` → "Mission Not Found" state renders correctly
