---
description: Create a UI component using TDD (test-driven development)
allowed-tools: Read, Write, Edit, Glob, Bash(npm test:*), Bash(npx vitest:*)
argument-hint: "[Brief component description]"
---

## User input:
The user has provided information about the component to make: **$ARGUMENTS**

## Build the component
### 1. - Name the component:
From the component information above, determine a PascalCase component name (e.g., "a card showing user stats" → "UserStatsCard" ).

### 2. - Create basic test: 
Create `tests/components/[ComponentName].test.tsx` with 2-3 simple tessts:
- Test that the component renders
- Test key elements are presenet (roles, text)

Pattern:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import ComponentName from "@/components/ComponentName"

describe("ComponentName", () => {
  it("renders successfully", () => {
    render(<ComponentName />)
    // assertions
  })
})
```

### 3. - Run tests (expect failure)
```bash
npm test tests/components/[ComponentName].test.tsx
```

### 4. - Create component
- `components/[ComponentName]/[ComponentName].tsx`
- `components/[ComponentName]/[ComponentName].module.css`
- `components/[ComponentName]/index.tsx` → `export { default } from './[ComponentName]'`

Conventions: no semicolons, CSS modules, tehem colors from global.css wehn needed.

### 5. Run tests (expect pass)
```bash
npm test tests/components/[ComponentName].test.tsx
```

Iterate on component development until all tests pass.

### 6. Add to preview page
Update `app/(public)/preview/page.tsx` with a labeled section showing the component.

## Rules
- Keep tests minimal
- Only proceed when current step passes