// SessionStart hook: prints a tiny status line into session context. Keep it short and deterministic (no model calls).
// Read docs/STATUS.md §"Recommended next steps" for the next open item.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const out = ["Lensloop (Persian RTL rental marketplace). Rules in CLAUDE.md + .claude/rules/project-invariants.md."];

// Surface the current stack gap: docs still say "no test runner installed".
const status = join(cwd, "docs", "STATUS.md");
if (existsSync(status)) {
  const text = readFileSync(status, "utf8");
  const block = text.split(/##\s*Recommended next steps/i)[1] || "";
  // Steps may wrap across lines; collapse the first one to a single line.
  const first = block.split(/^\s*\d+\.\s*/m)[1] || "";
  const step = first.split("\n").slice(0, -1).join(" ").replace(/\s+/g, " ").trim();
  if (step) out.push(`Next: ${step.length > 180 ? step.slice(0, 180).replace(/\s+\S*$/, "") + " …" : step}`);
}

if (!existsSync(join(cwd, ".env.local"))) {
  out.push("No .env.local — copy .env.example and set NEXT_PUBLIC_API_URL (backend is external).");
}

out.push("Verify UI in a browser with the web-testing skill; never claim a page works without loading it.");
console.log(out.join("\n"));
