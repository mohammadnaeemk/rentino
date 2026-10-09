// Single source of truth for RTL and design-token rules.
// Imported by .claude/hooks/check-edit.mjs, rtl-scan.mjs and rtl-codemod.mjs.
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

// A Tailwind utility starts at line start, whitespace, a quote, a variant colon, "!" or an opening bracket.
const BOUNDARY = "(?<=^|[\\s\"'`:!({])";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// [physical, logical]. Order does not matter: each rule is anchored on a full token.
const PAIRS = [
  ["ml-", "ms-"], ["mr-", "me-"], ["pl-", "ps-"], ["pr-", "pe-"],
  ["scroll-ml-", "scroll-ms-"], ["scroll-mr-", "scroll-me-"],
  ["scroll-pl-", "scroll-ps-"], ["scroll-pr-", "scroll-pe-"],
  ["text-left", "text-start"], ["text-right", "text-end"],
  ["float-left", "float-start"], ["float-right", "float-end"],
  ["clear-left", "clear-start"], ["clear-right", "clear-end"],
  ["border-l", "border-s"], ["border-r", "border-e"],
  ["rounded-tl", "rounded-ss"], ["rounded-tr", "rounded-se"],
  ["rounded-bl", "rounded-es"], ["rounded-br", "rounded-ee"],
  ["rounded-l", "rounded-s"], ["rounded-r", "rounded-e"],
  ["left-", "start-"], ["right-", "end-"],
];

export const RULES = PAIRS.map(([from, to]) => {
  let tail;
  if (from === "left-" || from === "right-") {
    // `left-1/2 -translate-x-1/2` is physical centering and must stay as is.
    tail = "(?!1/2(?![\\d])|\\[50%\\])";
  } else if (from.endsWith("-")) {
    tail = "";
  } else {
    tail = "(?=$|[-\\s\"'`)}\\]])";
  }
  return { from, to, re: new RegExp(`${BOUNDARY}(-?)${esc(from)}${tail}`, "gm") };
});

// Not auto-fixable: report for human/Claude review.
export const REVIEW = [
  { re: new RegExp(`${BOUNDARY}-?translate-x-(?!1/2(?![\\d]))`, "gm"), why: "translate-x is physical; add an rtl: variant or use logical positioning" },
  { re: /\bslide-(?:in|out)-(?:from|to)-(?:left|right)/g, why: "physical slide animation; check direction in RTL" },
  { re: /\b(?:Chevron|Arrow|ArrowBig|ChevronsL|ChevronsR)(?:Left|Right)\b/g, why: "directional icon; in RTL 'next' points left (use rtl:rotate-180 or swap)" },
  { re: /\bspace-x-/g, why: "prefer gap-*; space-x depends on physical margins" },
];

// Colors must come from tokens. 6/8-digit hex and rgb()/hsl() literals are flagged.
export const HEX = /(?<!href=["'])#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\b|\b(?:rgb|rgba|hsl|hsla)\(/g;

// CSS files: physical properties.
export const CSS_PHYSICAL =
  /\b(?:margin|padding|border)-(?:left|right)\b|\btext-align\s*:\s*(?:left|right)\b|(?:^|[;{\s])(?:left|right)\s*:/gm;

function lineStarts(text) {
  const idx = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") idx.push(i + 1);
  return idx;
}
function lineOf(starts, pos) {
  let lo = 0, hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= pos) lo = mid; else hi = mid - 1;
  }
  return lo + 1;
}

export function findViolations(text) {
  const starts = lineStarts(text);
  const out = [];
  for (const r of RULES) {
    for (const m of text.matchAll(r.re)) {
      out.push({ line: lineOf(starts, m.index), found: m[0].replace(/^-/, ""), fix: r.to, neg: m[0].startsWith("-") });
    }
  }
  return out.sort((a, b) => a.line - b.line);
}

export function fixText(text) {
  let count = 0;
  for (const r of RULES) {
    text = text.replace(r.re, (_m, neg) => { count++; return neg + r.to; });
  }
  return { text, count };
}

export function findReview(text) {
  const starts = lineStarts(text);
  const out = [];
  for (const r of REVIEW) {
    for (const m of text.matchAll(r.re)) out.push({ line: lineOf(starts, m.index), found: m[0], why: r.why });
  }
  return out.sort((a, b) => a.line - b.line);
}

export function findHex(text) {
  if (text.includes("allow-hex")) return [];
  const starts = lineStarts(text);
  const out = [];
  for (const m of text.matchAll(HEX)) out.push({ line: lineOf(starts, m.index), found: m[0] });
  return out;
}

export function findCssPhysical(text) {
  const starts = lineStarts(text);
  const out = [];
  for (const m of text.matchAll(CSS_PHYSICAL)) out.push({ line: lineOf(starts, m.index), found: m[0].trim() });
  return out;
}

const SKIP = new Set(["node_modules", ".next", ".git", "dist", "build", "coverage", ".claude", ".turbo"]);
export const SOURCE_DIRS = ["src", "app", "components", "lib", "hooks", "pages"];

export function sourceRoots(cwd = process.cwd()) {
  const found = SOURCE_DIRS.map((d) => join(cwd, d)).filter((d) => existsSync(d));
  return found.length ? found : [cwd];
}

export function walk(dir, exts, acc = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, exts, acc);
    else if (exts.includes(extname(p))) acc.push(p);
  }
  return acc;
}
