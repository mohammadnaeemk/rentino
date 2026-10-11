// PostToolUse hook (Edit|Write|MultiEdit). Silent on success; exit 2 + stderr feeds problems back to Claude.
// Enforces the RTL / design-token / ESLint rules from .claude/scripts/rtl-rules.mjs on every file Claude edits.
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { extname, join, relative, sep } from "node:path";
import { findViolations, findReview, findHex, findCssPhysical } from "../scripts/rtl-rules.mjs";

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8")); } catch { process.exit(0); }

const file = input?.tool_input?.file_path;
if (!file || !existsSync(file)) process.exit(0);

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const rel = relative(cwd, file).split(sep).join("/");
// .claude/ and docs/ hold tooling and prose, not product UI. backend/ is a separate NestJS app.
// _archive/ is superseded reference material — never lint it.
const SKIP_PREFIXES = ["node_modules/", ".next/", ".claude/", "docs/", "_archive/", "backend/", "images/", "public/"];
if (SKIP_PREFIXES.some((p) => rel.startsWith(p))) process.exit(0);

const ext = extname(file);
const isCode = [".ts", ".tsx", ".js", ".jsx", ".mjs"].includes(ext);
const isUi = [".tsx", ".jsx"].includes(ext);
const isCss = ext === ".css";
if (!isCode && !isCss) process.exit(0);

const text = readFileSync(file, "utf8");
const msgs = [];
let advisory = [];
const cap = (arr, n = 8) => (arr.length > n ? [...arr.slice(0, n), `… +${arr.length - n} more`] : arr);

if (isUi || ext === ".ts") {
  const v = findViolations(text);
  if (v.length) {
    msgs.push(`RTL: physical Tailwind classes in ${rel} (fix: node .claude/scripts/rtl-codemod.mjs --write ${rel})`);
    msgs.push(...cap(v.map((x) => `  L${x.line} ${x.neg ? "-" : ""}${x.found} -> ${x.neg ? "-" : ""}${x.fix}`)));
  }
}
if (isUi) {
  const h = findHex(text);
  if (h.length) {
    msgs.push(`TOKENS: raw color literals in ${rel}; use design tokens (or add an "allow-hex" comment for OG images)`);
    msgs.push(...cap(h.map((x) => `  L${x.line} ${x.found}`), 5));
  }
  // Advisory only (never blocks): directional icons are fine when the file already uses rtl: variants.
  const hasRtlVariant = /\brtl:/.test(text);
  advisory = findReview(text).filter((x) => !(hasRtlVariant && /Chevron|Arrow/.test(x.found)));
}
if (isCss) {
  const c = findCssPhysical(text);
  if (c.length) {
    msgs.push(`RTL: physical CSS properties in ${rel}; use margin-inline-*, padding-inline-*, inset-inline-*, text-align:start/end`);
    msgs.push(...cap(c.map((x) => `  L${x.line} ${x.found}`), 5));
  }
}

if (isCode) {
  const bin = join(cwd, "node_modules", "eslint", "bin", "eslint.js");
  if (existsSync(bin)) {
    try {
      execFileSync(process.execPath, [bin, "--quiet", "--no-warn-ignored", file], {
        cwd, encoding: "utf8", timeout: 60000, stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      const out = String(e.stdout || e.stderr || "").trim().split("\n").filter(Boolean);
      if (out.length) {
        msgs.push(`ESLINT errors in ${rel}:`);
        msgs.push(...cap(out.map((l) => "  " + l), 12));
      }
    }
  }
}

if (msgs.length) {
  process.stderr.write(msgs.join("\n") + "\n");
  process.exit(2);
}
if (advisory.length) {
  const note = `RTL check in ${rel} (verify, not an error): ` +
    cap(advisory.map((x) => `L${x.line} ${x.found} — ${x.why}`), 3).join("; ");
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: note } }));
}
process.exit(0);
