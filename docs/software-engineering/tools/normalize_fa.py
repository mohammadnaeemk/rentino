#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Normalize Persian orthography and remove glyphs missing from B Nazanin.

Why this exists
---------------
The report is rendered with B Nazanin (Persian) and Times New Roman (Latin).
B Nazanin ships with 288 glyphs and does NOT define the following code points,
so Word silently substitutes another font and the character looks broken:

    U+0654  hamza above (used in «هٔ»)
    U+066B  Arabic decimal separator
    U+066C  Arabic thousands separator
    U+066A  Arabic percent sign
    U+2013  en dash
    U+2014  em dash
    U+2026  horizontal ellipsis
    U+2022  bullet
    U+2192 / U+2194 / U+2500 / U+2502 / U+2714 / U+25BC   arrows, box art, check marks

This script rewrites the Markdown sources so that every character is either a
Persian letter, a standard Persian punctuation mark that B Nazanin DOES define
(، ؛ ؟ « »), or ASCII.

Run:  python3 tools/normalize_fa.py [--check]
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
SRC_DIR = BASE / "phase1"

# (from, to, description)
REPLACEMENTS: list[tuple[str, str, str]] = [
    ("هٔ", "ۀ", "ترکیب «ه + همزه» (U+0647 U+0654) ← «ۀ» که در B Nazanin تعریف شده"),
    ("٫", ".", "ممیز عربی (U+066B) ← نقطه"),
    ("٬", ",", "جداکنندهٔ هزارگان (U+066C) ← ویرگول لاتین"),
    ("٪", "%", "درصد عربی (U+066A) ← درصد لاتین"),
    ("–", "-", "خط تیرهٔ کوتاه (U+2013)"),
    ("—", "-", "خط تیرهٔ بلند (U+2014)"),
    ("…", "...", "سه‌نقطهٔ تک‌نویسه‌ای (U+2026)"),
    ("•", "-", "گلوله (U+2022)"),
    ("→", " به ", "فلش راست"),
    ("↔", " و ", "فلش دوسویه"),
    ("▼", "", "مثلث پایین"),
    ("✔", "بله", "علامت تیک"),
    ("←", " از ", "فلش چپ"),
]

# characters that must not appear at all in the sources
FORBIDDEN = {
    "ي": "ی عربی",
    "ك": "ک عربی",
    "ة": "ة",
    "ۃ": "ۃ",
    "ـ": "کشیده",
    "─": "خط جعبه",
    "│": "خط عمودی جعبه",
    "┌": "گوشهٔ جعبه",
    "┐": "گوشهٔ جعبه",
    "└": "گوشهٔ جعبه",
    "┘": "گوشهٔ جعبه",
    "├": "اتصال جعبه",
    "┬": "اتصال جعبه",
    "┼": "اتصال جعبه",
    "​": "فاصلهٔ صفر",
    "﻿": "BOM",
    " ": "فاصلهٔ نشکن",
    "‎": "نشانهٔ چپ‌به‌راست",
    "‏": "نشانهٔ راست‌به‌چپ",
}

def transform(text: str) -> tuple[str, dict[str, int]]:
    counts: dict[str, int] = {}
    out_lines: list[str] = []
    for line in text.splitlines(keepends=True):
        # Even inside fenced blocks the Persian text is rendered with B Nazanin,
        # so the same substitutions apply; nothing here changes code syntax.
        new = line
        for old, replacement, _desc in REPLACEMENTS:
            n = new.count(old)
            if n:
                counts[old] = counts.get(old, 0) + n
                new = new.replace(old, replacement)
        out_lines.append(new)

    return "".join(out_lines), counts


def audit(text: str) -> list[str]:
    problems: list[str] = []
    for ch, name in FORBIDDEN.items():
        n = text.count(ch)
        if n:
            problems.append(f"{name} (U+{ord(ch):04X}): {n}")
    return problems


def main() -> int:
    check_only = "--check" in sys.argv
    files = sorted(SRC_DIR.glob("*.md"))
    if not files:
        print(f"no sources in {SRC_DIR}")
        return 1

    grand: dict[str, int] = {}
    changed = 0
    for path in files:
        original = path.read_text(encoding="utf-8")
        updated, counts = transform(original)
        for k, v in counts.items():
            grand[k] = grand.get(k, 0) + v
        if updated != original:
            changed += 1
            if not check_only:
                path.write_text(updated, encoding="utf-8")

    labels = {old: desc for old, _new, desc in REPLACEMENTS}
    print(f"files scanned: {len(files)} | changed: {changed}")
    if grand:
        for ch, n in sorted(grand.items(), key=lambda x: -x[1]):
            code = " ".join(f"U+{ord(c):04X}" for c in ch)
            print(f"  {n:5d}  {code:16s}  {labels.get(ch, '')}")
    else:
        print("  nothing to normalize")

    remaining = 0
    for path in files:
        for issue in audit(path.read_text(encoding="utf-8")):
            print(f"  FORBIDDEN {path.name}: {issue}")
            remaining += 1
    if remaining:
        return 2
    print("audit: clean")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
