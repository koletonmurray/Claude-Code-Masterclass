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

## Slash Commands

Project-specific slash commands live in `.claude/commands/`:

- `/commit-message` — analyzes staged changes and proposes an emoji commit message; waits for approval before committing
- `/component <description>` — TDD scaffold: writes tests first, then creates the component, iterates until tests pass, adds to preview page
- `/spec <idea>` — checks for a clean working tree, creates `_specs/<slug>.md` from a short idea, and switches to a new `feat/<slug>` branch

## Spec & Plan Workflow

Feature work follows a three-step process:
1. `/spec <idea>` — creates a spec in `_specs/` and a feature branch
2. Plan mode (`plan the feature described in this spec`) — writes an implementation plan to `_plans/<slug>.md`
3. Implementation — execute the plan

## Architecture

**Pocket Mission** is a Next.js 16 app (React 19, TypeScript, Tailwind CSS v4) with no backend yet — all data is currently static/mocked.

### Route groups

Routes are split into two Next.js route groups, each with its own layout:

- `app/(public)/` — unauthenticated pages (home splash, login, signup, preview). The home page (`/`) is intended as a redirect gate: logged-in users go to `/missions`, others to `/login`. Auth is not yet implemented.
- `app/(dashboard)/` — authenticated mission management pages wrapped in a layout that renders `<Navbar>`. Contains `missions/` (list), `missions/create/`, and `missions/[id]/` (detail).

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

Shared layout utilities (`.page-content`, `.center-content`, `.form-title`, `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-gradient`) are defined in `globals.css`. `.btn-gradient` is the gradient variant (primary → secondary) used for prominent CTAs; `.btn-primary` and `.btn-secondary` are solid-color variants.

### Components

Each component lives in its own directory under `components/` and must include three files:

- `ComponentName.tsx` — the component
- `ComponentName.module.css` — scoped styles (start with `@reference "../../app/globals.css";` to access theme tokens)
- `index.ts` — re-exports the default: `export { default } from "./ComponentName"`

Import components via the directory name: `import AuthForm from "@/components/AuthForm"`.

When creating a new component, add it to `app/(public)/preview/page.tsx` so it can be visually reviewed at `/preview`.

Prefer CSS modules over inline Tailwind classes when an element has more than one style. Move multi-class styling into the component's `.module.css` file using `@apply`. Single global utility classes (e.g. `btn`) may stay inline.

Components that use React hooks (`useState`, `useEffect`, etc.) must include `"use client"` as the first line.

### Hooks (PostToolUse)

A Prettier hook runs automatically after every `Write` or `Edit` on `.ts`/`.tsx` files. **Always `Read` a file before making a second edit to it** — the formatter may have changed whitespace or semicolons since your last write.

### Testing

Tests live in `tests/components/` and use Vitest + Testing Library with jsdom. The `@/` path alias resolves to the repo root (same as in app code).

For interaction tests, use `@testing-library/user-event` (already installed):

```ts
const user = userEvent.setup();
await user.type(screen.getByLabelText("Email"), "test@example.com");
await user.click(screen.getByRole("button", { name: "Log In" }));
```

Use exact label strings with `getByLabelText` when a component also has `aria-label` attributes on buttons — regex matching can accidentally match both.

## Checking Documentation

- **important:** when implementing any lib/framework-specific features, ALWAYS check the appropriate lib/framework documentation using the Context7 mcp server before writing any code