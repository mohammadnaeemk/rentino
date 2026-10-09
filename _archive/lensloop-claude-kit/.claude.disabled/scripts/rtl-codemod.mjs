#!/usr/bin/env node
// Convert physical Tailwind classes to logical ones.
// Usage: node .claude/scripts/rtl-codemod.mjs [--write] [paths...]
// Default is a dry run over src|app|components|lib. Review items (translate-x, directional icons) are only reported.
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { extname } from "node:path";
import { fixText, findReview, sourceRoots, walk } from "./rtl-rules.mjs";

const args = process.argv.slice(2);
const write = args.includes("--write");
const targets = args.filter((a) => !a.startsWith("--"));

const files = [];
if (targets.length) {
  for (const t of targets) {
    if (statSync(t).isDirectory()) walk(t, [".tsx", ".jsx", ".ts", ".js"], files);
    else if ([".tsx", ".jsx", ".ts", ".js"].includes(extname(t))) files.push(t);
  }
} else {
  for (const root of sourceRoots()) walk(root, [".tsx", ".jsx", ".ts", ".js"], files);
}

let changedFiles = 0, total = 0, review = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const { text, count } = fixText(src);
  review += findReview(src).length;
  if (count) {
    changedFiles++; total += count;
    console.log(`${write ? "fixed" : "would fix"} ${count}\t${f}`);
    if (write) writeFileSync(f, text);
  }
}
console.log(`\n${write ? "Fixed" : "Would fix"} ${total} class(es) in ${changedFiles} file(s). ${review} item(s) need manual RTL review (run: node .claude/scripts/rtl-scan.mjs).`);
if (!write && total) console.log("Re-run with --write to apply.");
