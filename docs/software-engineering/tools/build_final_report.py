#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the clean phase-1-only report.

The clean report keeps the front matter and the eleven course chapters, drops
the eight appendices, replaces the long phase-2 survey plan with a one-page
validation summary, and appends the team task-division section.
"""

import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
SRC = BASE / "phase1"
FINAL = BASE / "final"
OUT_MD = BASE / "Rentino-Phase1-Final.md"
OUT_DOCX = BASE / "Rentino-Phase1-Final.docx"

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_docx  # noqa: E402


def read(name: str) -> str:
    return (SRC / name).read_text(encoding="utf-8")


def main() -> None:
    parts = []
    for path in sorted(SRC.glob("*.md")):
        try:
            number = int(path.name[:2])
        except ValueError:
            continue
        if number > 11:
            continue
        text = path.read_text(encoding="utf-8")
        if not text.endswith("\n"):
            text += "\n"
        parts.append(text)

    merged = "".join(parts)

    condensed = (FINAL / "07-7-condensed.md").read_text(encoding="utf-8").rstrip()
    pattern = re.compile(
        r"## ۷-۷\. طرح اعتبارسنجی نیازها در فاز دوم\n.*?(?=## ۷-۸\.)",
        re.S,
    )
    if not pattern.search(merged):
        raise SystemExit("7-7 block not found; refusing to build without replacement")
    merged = pattern.sub(condensed + "\n\n", merged, count=1)

    tasks = (FINAL / "12-team-tasks.md").read_text(encoding="utf-8").rstrip()
    merged = merged.rstrip() + "\n\n---\n\n" + tasks + "\n"

    OUT_MD.write_text(merged, encoding="utf-8")
    words = len(merged.split())
    h1 = sum(1 for line in merged.splitlines() if line.startswith("# "))
    print(f"wrote {OUT_MD.name}: {words:,} words, {h1} level-1 headings")

    build_docx.main(OUT_MD, OUT_DOCX)


if __name__ == "__main__":
    main()
