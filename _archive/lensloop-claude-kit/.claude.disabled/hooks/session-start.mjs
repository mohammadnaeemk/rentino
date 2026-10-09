// SessionStart hook: prints a tiny status (stdout becomes session context). Keep it under ~10 lines.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const roadmap = join(cwd, "docs", "ROADMAP.md");
const out = ["Lensloop session. Rules in CLAUDE.md. Use /next-task or /feature; follow the feature-loop skill."];

if (!existsSync(join(cwd, "docs", "REPO-MAP.md"))) {
  out.push("Repo not mapped yet: run /bootstrap once before building features.");
}

if (existsSync(roadmap)) {
  const lines = readFileSync(roadmap, "utf8").split("\n");
  const open = lines.filter((l) => /^\s*- \[ \]/.test(l));
  const done = lines.filter((l) => /^\s*- \[x\]/i.test(l)).length;
  out.push(`Roadmap: ${done} done, ${open.length} open.`);
  if (open[0]) out.push(`Next: ${open[0].replace(/^\s*- \[ \]\s*/, "").slice(0, 160)}`);
}

console.log(out.join("\n"));
