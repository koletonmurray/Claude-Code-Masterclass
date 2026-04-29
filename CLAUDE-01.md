# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git

Run git commands without a `-C` path flag — the working directory is always the project root.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # ESLint
npm run test     # run all tests (Vitest)
npx vitest run tests/components/Navbar.test.tsx  # run a single test file
```

## Architecture

**Pocket Heist** is a Next.js 16 app (React 19, TypeScript, Tailwind CSS v4) with no backend yet — all data is currently static/mocked.

### Route groups

Routes are split into two Next.js route groups, each with its own layout:

- `app/(public)/` — unauthenticated pages (home splash, login, signup, preview). The home page (`/`) is intended as a redirect gate: logged-in users go to `/heists`, others to `/login`. Auth is not yet implemented.
- `app/(dashboard)/` — authenticated heist management pages wrapped in a layout that renders `<Navbar>`. Contains `heists/` (list), `heists/create/`, and `heists/[id]/` (detail).

### Styling

Tailwind CSS v4 is configured via PostCSS (`postcss.config.mjs`). Custom theme tokens are defined in `app/globals.css` under `@theme` — use these instead of arbitrary values:

| Token | Value |
|---|---|
| `primary` | #C27AFF (purple) |
| `secondary` | #FB64B6 (pink) |
| `dark` | #030712 (page bg) |
| `light` / `lighter` | #0A101D / #101828 |
| `success` / `error` | #05DF72 / #FF6467 |
| `heading` / `body` | white / #99A1AF |

Shared layout utilities (`.page-content`, `.center-content`, `.form-title`) are also defined in `globals.css`.

### Components

Each component lives in its own directory under `components/` and must include three files:

- `ComponentName.tsx` — the component
- `ComponentName.module.css` — scoped styles (start with `@reference "../../app/globals.css";` to access theme tokens)
- `index.ts` — re-exports the default: `export { default } from "./ComponentName"`

Import components via the directory name: `import SkeletonCard from "@/components/SkeletonCard"`.

When creating a new component, add it to `app/(public)/preview/page.tsx` so it can be visually reviewed at `/preview`.

Prefer CSS modules over inline Tailwind classes when an element has more than one style. Move multi-class styling into the component's `.module.css` file using `@apply`. Single global utility classes (e.g. `btn`) may stay inline.

### Testing

Tests live in `tests/components/` and use Vitest + Testing Library with jsdom. The `@/` path alias resolves to the repo root (same as in app code).