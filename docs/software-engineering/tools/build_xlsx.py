#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build MSP, references and definitions spreadsheets from the report."""

import csv
import re
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

BASE = Path(__file__).resolve().parents[1]
REPORT = BASE / "Rentino-Phase1-Report.md"
text = REPORT.read_text(encoding="utf-8")

HEADER_FILL = PatternFill("solid", fgColor="1F4E79")
HEADER_FONT = Font(name="B Nazanin", size=11, bold=True, color="FFFFFF")
BODY_FONT = Font(name="B Nazanin", size=11)
THIN = Side(style="thin", color="BFBFBF")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="center", horizontal="right")
CENTER = Alignment(wrap_text=True, vertical="center", horizontal="center")


def style_sheet(ws, widths, freeze="A2"):
    ws.sheet_view.rightToLeft = True
    ws.freeze_panes = freeze
    for idx, width in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(idx)].width = width
    for cell in ws[1]:
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = CENTER
        cell.border = BORDER
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.font = BODY_FONT
            cell.border = BORDER
            cell.alignment = WRAP
    ws.auto_filter.ref = ws.dimensions


def parse_table(lines):
    rows = []
    for line in lines:
        s = line.strip()
        if not s.startswith("|"):
            continue
        if re.fullmatch(r"\|[\s:\-|]+\|", s):
            continue
        rows.append([c.strip() for c in s.strip("|").split("|")])
    return rows


def section_tables(start, end):
    seg = text.split(start, 1)[1].split(end, 1)[0]
    blocks, current = [], []
    for line in seg.splitlines():
        if line.strip().startswith("|"):
            current.append(line)
        elif current:
            blocks.append(parse_table(current))
            current = []
    if current:
        blocks.append(parse_table(current))
    return blocks


# ---------------------------------------------------------------------------
# MSP workbook
# ---------------------------------------------------------------------------

tasks = [
    ("1.1", "Kickoff & scope", "محمد نعیم", "2026-10-17", "2026-10-17", 1, "-", "-"),
    ("2.1", "Market review", "معین نوری", "2026-10-18", "2026-10-19", 2, "1.1", "-"),
    ("2.2", "Competitor analysis", "محمد سجاد", "2026-10-18", "2026-10-19", 2, "1.1", "-"),
    ("2.3", "Market needs", "معین نوری", "2026-10-19", "2026-10-20", 2, "2.1, 2.2", "-"),
    ("2.4", "Research synthesis", "معین نوری", "2026-10-20", "2026-10-20", 1, "2.3", "-"),
    ("3.1", "Member FR drafts", "همه", "2026-10-20", "2026-10-20", 1, "2.3", "-"),
    ("3.2", "FR consolidation", "محمد سجاد", "2026-10-21", "2026-10-21", 1, "3.1", "-"),
    ("3.3", "Traceability review", "ارشیا احمدی", "2026-10-21", "2026-10-21", 1, "3.2", "-"),
    ("4.1", "Objectives", "ارشیا احمدی", "2026-10-19", "2026-10-19", 1, "1.1", "-"),
    ("4.2", "Opportunities & risks", "امیررضا زارع", "2026-10-19", "2026-10-19", 1, "2.4", "-"),
    ("4.3", "Technology stack", "امیرحسین ترک", "2026-10-20", "2026-10-20", 1, "1.1", "-"),
    ("5.1", "WBS", "امیررضا زارع", "2026-10-21", "2026-10-21", 1, "4.1, 4.2, 4.3", "-"),
    ("5.2", "Schedule & critical path", "امیررضا زارع", "2026-10-21", "2026-10-21", 1, "5.1", "-"),
    ("5.3", "RACI", "امیررضا زارع", "2026-10-21", "2026-10-21", 0.5, "5.1", "-"),
    ("6.1", "Definitions & acronyms", "ارشیا احمدی", "2026-10-22", "2026-10-22", 1, "2.4, 4.3", "-"),
    ("6.2", "References", "معین نوری", "2026-10-22", "2026-10-22", 1, "2.4, 4.3", "-"),
    ("6.3", "Assembly & layout", "محمد نعیم + ارشیا", "2026-10-22", "2026-10-23", 2, "3.3, 4.2, 4.3, 5.2, 6.1, 6.2", "-"),
    ("6.4", "QA review", "محمد سجاد + امیرحسین", "2026-10-23", "2026-10-23", 1, "6.3", "-"),
    ("M1", "Review-ready version", "محمد نعیم", "2026-10-23", "2026-10-23", 0, "6.4", "نقطۀ عطف"),
    ("7.1", "Slide deck", "محمد نعیم + ارشیا", "2026-10-24", "2026-10-25", 2, "M1", "-"),
    ("7.2", "Rehearsal", "همه", "2026-10-25", "2026-10-26", 2, "7.1", "-"),
    ("M2", "Presentation", "همه", "2026-10-27", "2026-10-27", 0, "7.2", "نقطۀ عطف"),
]

wb = Workbook()
ws = wb.active
ws.title = "MSP"
headers = ["ID", "Task Name", "Owner", "Start", "Finish", "Duration (d)", "Predecessors", "Milestone"]
ws.append(headers)
for row in tasks:
    ws.append(list(row))
style_sheet(ws, [8, 38, 18, 13, 13, 12, 26, 10])
for row in ws.iter_rows(min_row=2, min_col=4, max_col=5):
    for cell in row:
        cell.alignment = CENTER
for row in ws.iter_rows(min_row=2, min_col=6, max_col=8):
    for cell in row:
        cell.alignment = CENTER

# Calendar sheet
ws2 = wb.create_sheet("Calendar")
ws2.append(["تاریخ", "روز", "فعالیت‌های اصلی", "خروجی روز"])
calendar = [
    ("۲۵/۰۷ (2026-10-17)", "شنبه", "جلسۀ شروع؛ تثبیت دامنه؛ آغاز پژوهش", "صورت‌جلسه؛ نقشۀ منابع"),
    ("۲۶/۰۷ (2026-10-18)", "یکشنبه", "فصل ۱؛ فصل ۵؛ فصل ۶؛ آغاز فصل ۷", "پیش‌نویس سه فصل"),
    ("۲۷/۰۷ (2026-10-19)", "دوشنبه", "جلسۀ میانی؛ فصل ۲؛ فصل ۸؛ پایان فصل ۷", "اهداف و ریسک‌ها"),
    ("۲۸/۰۷ (2026-10-20)", "سه‌شنبه", "پیش‌نویس FR هر عضو؛ فصل ۱۰", "FRهای خام؛ فناوری"),
    ("۲۹/۰۷ (2026-10-21)", "چهارشنبه", "تجمیع FR (فصل ۹)؛ MSP (فصل ۱۱)", "FR تثبیت‌شده؛ برنامه"),
    ("۳۰/۰۷ (2026-10-22)", "پنجشنبه", "یکپارچه‌سازی؛ تعاریف/مراجع؛ بازبینی", "نسخۀ یکپارچۀ اولیه"),
    ("۰۱/۰۸ (2026-10-23)", "جمعه", "Review-ready version", "تحویل به بازبین"),
    ("۰۲/۰۸ (2026-10-24)", "شنبه", "اصلاحات بازبینی", "نسخۀ اصلاح‌شده"),
    ("۰۳/۰۸ (2026-10-25)", "یکشنبه", "تمرین ارائه؛ اصلاح اسلاید", "اسلاید نهایی"),
    ("۰۴/۰۸ (2026-10-26)", "دوشنبه", "بافر؛ تمرین نهایی", "آمادگی ارائه"),
    ("۰۵/۰۸ (2026-10-27)", "سه‌شنبه", "ارائه", "تحویل نهایی"),
]
for row in calendar:
    ws2.append(list(row))
style_sheet(ws2, [22, 14, 48, 32])

# RACI sheet
ws3 = wb.create_sheet("RACI")
raci = [
    ["فعالیت", "محمد نعیم", "معین نوری", "محمد سجاد", "امیرحسین ترک", "امیررضا زارع", "ارشیا احمدی"],
    ["تثبیت دامنه", "A/R", "C", "C", "C", "C", "C"],
    ["Market review", "A", "R", "C", "I", "C", "I"],
    ["Competitor analysis", "A", "C", "R", "I", "C", "I"],
    ["Market needs", "A", "R", "C", "I", "C", "I"],
    ["Objectives", "A", "I", "I", "I", "C", "R"],
    ["Opportunities & risks", "A", "C", "C", "C", "R", "I"],
    ["نیازمندی‌های کارکردی", "A", "C", "R", "C", "C", "C"],
    ["تکنولوژی‌ها", "A", "I", "C", "R", "C", "I"],
    ["WBS و زمان‌بندی", "A", "C", "I", "C", "R", "I"],
    ["RACI", "A", "C", "I", "I", "R", "C"],
    ["Definitions & acronyms", "A", "C", "C", "C", "C", "R"],
    ["References", "A", "R", "C", "C", "C", "C"],
    ["یکپارچه‌سازی", "A/R", "C", "C", "C", "C", "R"],
    ["QA review", "A", "C", "R", "R", "C", "C"],
    ["اسلاید ارائه", "A/R", "C", "C", "C", "C", "R"],
    ["ارائه", "A/R", "R", "R", "R", "R", "R"],
]
for row in raci:
    ws3.append(row)
style_sheet(ws3, [28, 14, 14, 14, 16, 12, 14])
for row in ws3.iter_rows(min_row=2):
    for cell in row[1:]:
        cell.alignment = CENTER

wb.save(BASE / "Rentino-Phase1-MSP.xlsx")
with (BASE / "Rentino-Phase1-MSP.csv").open("w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(tasks)

# ---------------------------------------------------------------------------
# References workbook
# ---------------------------------------------------------------------------

ref_block = text.split("## ۴-۳. فهرست مراجع", 1)[1].split("## ۴-۴.", 1)[0]
refs = re.findall(r"^\[(\d+)\]\s+(.+)$", ref_block, re.M)

# classify by position of subheadings
def classify(ref_id):
    n = int(ref_id)
    if n <= 12:
        return "علمی/کتابی"
    if n <= 23:
        return "رسمی/بازار"
    if n <= 32:
        return "مستندات فنی"
    return "تکمیلی"


def clean(text):
    return text.replace("`", "").strip()

wb2 = Workbook()
ws = wb2.active
ws.title = "References"
ws.append(["#", "شناسه", "مرجع (IEEE)", "دسته"])
for idx, (rid, ref) in enumerate(refs, start=1):
    ws.append([idx, f"[{rid}]", clean(ref).replace("*", ""), classify(rid)])
style_sheet(ws, [6, 10, 110, 18])
for row in ws.iter_rows(min_row=2, min_col=1, max_col=2):
    for cell in row:
        cell.alignment = CENTER
wb2.save(BASE / "Rentino-Phase1-References.xlsx")

# ---------------------------------------------------------------------------
# Definitions workbook
# ---------------------------------------------------------------------------

sections = [
    ("## ۳-۲.", "## ۳-۳.", "بازار و مدل کسب‌وکار", 3),
    ("## ۳-۳.", "## ۳-۴.", "اعتماد، رزرو و عملیات", 3),
    ("## ۳-۴.", "## ۳-۵.", "فناوری", 3),
    ("## ۳-۵.", "## ۳-۶.", "مهندسی نرم‌افزار و مدیریت پروژه", 3),
    ("## ۳-۶.", "## ۳-۷.", "ارجاع علمی", 2),
]

wb3 = Workbook()
ws = wb3.active
ws.title = "واژه‌نامه"
ws.append(["#", "اصطلاح", "معادل انگلیسی", "تعریف", "دسته"])
counter = 1
for start, end, category, ncols in sections:
    for table in section_tables(start, end):
        for row in table[1:]:
            row = row + [""] * (ncols - len(row))
            if ncols == 2:
                term = clean(row[0])
                definition = clean(row[1])
                english = ""
                m = re.match(r"^(.*?)\s*\((.*?)\)$", term)
                if m and any("a" <= ch.lower() <= "z" for ch in m.group(2)):
                    term, english = m.group(1).strip(), m.group(2).strip()
            else:
                term, english, definition = clean(row[0]), clean(row[1]), clean(row[2])
            ws.append([counter, term, english, definition, category])
            counter += 1
style_sheet(ws, [6, 26, 34, 90, 28])
for row in ws.iter_rows(min_row=2, min_col=1, max_col=1):
    for cell in row:
        cell.alignment = CENTER

ws2 = wb3.create_sheet("سرنام‌ها")
ws2.append(["#", "سرنام", "شکل کامل", "معادل فارسی"])
acro_tables = section_tables("## ۳-۷.", "## ۳-۸.")
count = 1
for table in acro_tables:
    for row in table[1:]:
        row = row + [""] * (3 - len(row))
        ws2.append([count, clean(row[0]), clean(row[1]), clean(row[2])])
        count += 1
style_sheet(ws2, [6, 12, 50, 46])
for row in ws2.iter_rows(min_row=2, min_col=1, max_col=2):
    for cell in row:
        cell.alignment = CENTER

wb3.save(BASE / "Rentino-Phase1-Definitions.xlsx")

print("refs:", len(refs), "definitions:", counter - 1, "acronyms:", count - 1)
print("wrote MSP.xlsx / MSP.csv / References.xlsx / Definitions.xlsx")
