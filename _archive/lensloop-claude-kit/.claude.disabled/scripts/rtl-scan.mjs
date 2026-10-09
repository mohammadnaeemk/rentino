#!/usr/bin/env node
// Project-wide RTL / token audit. Compact output. Exit 1 if hard violations exist.
// Usage: node .claude/scripts/rtl-scan.mjs [--review]
import { readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { findViolations, findReview, findHex, findCssPhysical, sourceRoots, walk } from "./rtl-rules.mjs";

const showReview = process.argv.includes("--review");
const cwd = process.cwd();
const files = [];
for (const root of sourceRoots(cwd)) walk(root, [".tsx", ".jsx", ".ts", ".css"], files);

const hard = []; // [file, kind, line, text]
const soft = [];
for (const f of files) {
  const text = readFileSync(f, "utf8");
  const rel = relative(cwd, f).replace(/\\/g, "/");
  if (f.endsWith(".css")) {
    for (const x of findCssPhysical(text)) hard.push([rel, "css-physical", x.line, x.found]);
    continue;
  }
  for (const x of findViolations(text)) hard.push([rel, "physical-class", x.line, `${x.found} -> ${x.fix}`]);
  if (f.endsWith(".tsx") || f.endsWith(".jsx")) {
    for (const x of findHex(text)) hard.push([rel, "raw-color", x.line, x.found]);
    for (const x of findReview(text)) soft.push([rel, "review", x.line, `${x.found} (${x.why})`]);
  }
}

// Root layout must declare Persian + RTL.
const layouts = ["app/layout.tsx", "src/app/layout.tsx"].map((p) => join(cwd, p)).filter(existsSync);
for (const l of layouts) {
  const t = readFileSync(l, "utf8");
  const rel = relative(cwd, l).replace(/\\/g, "/");
  if (!/lang=["']fa["']/.test(t)) hard.push([rel, "root-layout", 1, 'missing lang="fa"']);
  if (!/dir=["']rtl["']/.test(t)) hard.push([rel, "root-layout", 1, 'missing dir="rtl"']);
}

const byFile = new Map();
for (const h of hard) byFile.set(h[0], (byFile.get(h[0]) || 0) + 1);
const top = [...byFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

console.log(`Scanned ${files.length} files. Hard violations: ${hard.length} in ${byFile.size} file(s). Review items: ${soft.length}.`);
for (const [f, n] of top) console.log(`  ${String(n).padStart(4)}  ${f}`);
if (hard.length && hard.length <= 25) for (const h of hard) console.log(`  ${h[0]}:${h[2]}  ${h[1]}  ${h[3]}`);
if (showReview) for (const s of soft.slice(0, 40)) console.log(`  ${s[0]}:${s[2]}  ${s[3]}`);
if (hard.length) console.log("Fix classes with: node .claude/scripts/rtl-codemod.mjs --write");
process.exit(hard.length ? 1 : 0);
