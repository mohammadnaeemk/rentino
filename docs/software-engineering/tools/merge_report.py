#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Concatenate phase1/*.md into the single report consumed by build_docx.py.

Order is by filename (00-front-matter, 01..11, 99-appendices). Each file must
end with a newline; the merged file needs no extra separator because every
chapter file starts with a level-1 heading.
"""

from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
SRC = BASE / "phase1"
OUT = BASE / "Rentino-Phase1-Report.md"


def main() -> None:
    parts = []
    for path in sorted(SRC.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        if not text.endswith("\n"):
            text += "\n"
        parts.append(text)

    merged = "".join(parts)
    OUT.write_text(merged, encoding="utf-8")

    words = len(merged.split())
    h1 = sum(1 for line in merged.splitlines() if line.startswith("# "))
    print(f"merged {len(parts)} files -> {OUT.name}")
    print(f"words: {words} | h1: {h1}")


if __name__ == "__main__":
    main()
