---
name: gemini-ai-search
description: Use when building/modifying the natural-language gear search feature powered by Google Gemini's free-tier API — prompt design, structured JSON output, and safe server-side integration in this Next.js app.
---

## Where this lives
Route Handler: `src/app/api/ai-search/route.ts` (create if missing).
Server-only env var: `GEMINI_API_KEY` (never `NEXT_PUBLIC_*`).

## Minimal integration (REST, no extra SDK needed)
Free-tier model: `gemini-2.0-flash` (or newer `flash` model available on the
free tier — check https://ai.google.dev/pricing before picking a model name,
pricing/availability changes).

```ts
// src/app/api/ai-search/route.ts
import { NextRequest, NextResponse } from "next/server";

const SCHEMA_PROMPT = `Extract rental-search intent as JSON only, matching:
{"category": string|null, "keywords": string[], "minPrice": number|null, "maxPrice": number|null}
Query (Persian or English): `;

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ success: false, message: "query is required" }, { status: 400 });
  }

  try {
    const intent = await extractIntent(query);
    return NextResponse.json({ success: true, data: intent });
  } catch {
    // fallback: no AI, let caller do plain keyword search client-side
    return NextResponse.json({ success: true, data: fallbackIntent(query) });
  }
}
```

Keep `extractIntent` and `fallbackIntent` as separately exported, unit-testable
pure functions in `src/lib/ai-search.ts` — don't inline parsing logic in the
route handler, so a Vitest test can mock the Gemini call cleanly once the test
runner is installed (see `_archive/skills/writing-vitest-tests/`).

## Calling Gemini
```ts
const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: SCHEMA_PROMPT + query }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  },
);
if (!res.ok) throw new Error(`Gemini ${res.status}`);
const data = await res.json();
const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
if (!text) throw new Error("empty Gemini response");
return JSON.parse(text); // validate with zod before trusting
```

Always validate the parsed JSON with a Zod schema (`src/lib/validations.ts`)
before using it to filter listings — never trust model output structurally.

## Fallback (required, not optional)
```ts
export function fallbackIntent(query: string) {
  return { category: null, keywords: query.split(/\s+/).filter(Boolean), minPrice: null, maxPrice: null };
}
```

## Ranking results
Merge the structured intent with existing `/gear` listings
(`src/lib/gear.ts` `toGearItem`): filter by category if present, then score by
keyword overlap against `title`/`description`/`specs` values, sort descending.

## Testing
Mock `global.fetch` for Gemini calls; assert `extractIntent` returns the
expected shape and that `fallbackIntent` is used when `fetch` rejects/returns
non-OK. Never hit the real Gemini API in CI/tests.
