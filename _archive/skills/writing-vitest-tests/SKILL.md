---
name: writing-vitest-tests
description: Use when writing or running unit/component tests in this Next.js + React 19 + TypeScript project (Vitest + React Testing Library). Covers setup, file placement, and mocking the api client.
---

## Setup (one-time, check before assuming it exists)
Run `ls vitest.config.mts package.json` and check for a `test` script.
If missing, install and configure:
```
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths
```
`vitest.config.mts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: { environment: "jsdom", globals: true, setupFiles: ["./vitest.setup.ts"] },
});
```
`vitest.setup.ts`: `import "@testing-library/jest-dom/vitest";`
Add to `package.json` scripts: `"test": "vitest"`, `"test:run": "vitest run"`.

## File placement
Colocate: `src/lib/foo.ts` -> `src/lib/foo.test.ts`. Components:
`src/components/x/y.tsx` -> `src/components/x/y.test.tsx`.

## Pure function (lib) test pattern
```ts
import { describe, it, expect } from "vitest";
import { toGearItem } from "./gear";

describe("toGearItem", () => {
  it("marks RENTED when availableStock is 0", () => {
    const result = toGearItem({ ...baseApiGear, availableStock: 0 });
    expect(result.availability).toBe("RENTED");
  });
});
```

## Component test pattern
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GearCard } from "./gear-card";

it("renders the gear title", () => {
  render(<GearCard gear={mockGear} />);
  expect(screen.getByText(mockGear.title)).toBeInTheDocument();
});
```

## Mocking `src/lib/api.ts`
```ts
import { vi } from "vitest";
vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
```
Never make real network calls in tests, including to Gemini — mock
`fetch`/the API client instead.

## Rules
- One behavior per `it()`; name tests by behavior, not implementation detail.
- Always run `npx vitest run <path>` after writing a test and report the real output.
- Don't test shadcn/ui primitives themselves — only project-specific logic/composition.
