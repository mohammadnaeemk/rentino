#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the phase-1 task-division workbook.

One source of truth for who owns which phase-1 output, including the survey
data-collection workstream. Statuses reflect the state on 26 Mehr 1405.
"""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

BASE = Path(__file__).resolve().parents[1]
OUT = BASE / "Rentino-Phase1-Task-Division.xlsx"

HEADER_FILL = PatternFill("solid", fgColor="1F4E79")
HEADER_FONT = Font(name="B Nazanin", size=11, bold=True, color="FFFFFF")
BODY_FONT = Font(name="B Nazanin", size=11)
TITLE_FONT = Font(name="B Nazanin", size=13, bold=True)
THIN = Side(style="thin", color="BFBFBF")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="center", horizontal="right")
CENTER = Alignment(wrap_text=True, vertical="center", horizontal="center")

MEMBERS = [
    "محمد نعیم کریم‌زاده",
    "معین نوری",
    "محمد سجاد حسین جعفرپور",
    "امیرحسین ترک",
    "امیررضا زارع",
    "ارشیا احمدی",
]

ROLES = {
    "محمد نعیم کریم‌زاده": "سرگروه، یکپارچه‌سازی و تأیید نهایی",
    "معین نوری": "پژوهش بازار، نیازسنجی و تحلیل",
    "محمد سجاد حسین جعفرپور": "رقبا، نیازمندی‌ها، گردآوری و پاک‌سازی داده",
    "امیرحسین ترک": "فناوری، کیفیت داده و زیرساخت فرم",
    "امیررضا زارع": "ریسک، برنامه‌ریزی و گردآوری سمت عرضه",
    "ارشیا احمدی": "اهداف، صفحه‌آرایی و پایلوت",
}

# (بخش, مسئول اصلی, همکار, خروجی, وضعیت)
REPORT = [
    ("فصل ۱: مقدمه و دامنه", "محمد نعیم کریم‌زاده", "همه اعضا", "متن فصل و تثبیت دامنه", "انجام‌شده"),
    ("فصل ۲: جمع‌بندی اهداف", "ارشیا احمدی", "محمد نعیم کریم‌زاده", "متن فصل و جدول اقدامات", "انجام‌شده"),
    ("فصل ۳: تعاریف و سرنام‌ها", "ارشیا احمدی", "معین نوری", "متن فصل و فایل Excel واژه‌نامه", "انجام‌شده"),
    ("فصل ۴: مراجع", "معین نوری", "محمد سجاد حسین جعفرپور", "فهرست IEEE و فایل Excel مراجع", "انجام‌شده"),
    ("فصل ۵: بررسی بازار", "معین نوری", "محمد سجاد حسین جعفرپور", "متن فصل و جدول‌های بازار", "انجام‌شده"),
    ("فصل ۶: تحلیل رقبا", "محمد سجاد حسین جعفرپور", "معین نوری", "ماتریس مقایسه و جایگاه‌یابی", "انجام‌شده"),
    ("فصل ۷: نیازهای بازار", "معین نوری", "محمد سجاد حسین جعفرپور", "نیازهای RN/PN/TN/ON و MoSCoW", "انجام‌شده"),
    ("فصل ۸: فرصت‌ها، چالش‌ها و ریسک", "امیررضا زارع", "محمد نعیم کریم‌زاده", "ثبت ۱۵ ریسک و برنامۀ پاسخ", "انجام‌شده"),
    ("فصل ۹: نیازمندی‌های کارکردی", "محمد سجاد حسین جعفرپور", "همه اعضا (پیش‌نویس FR)", "۵۸ FR با شناسه و معیار پذیرش", "انجام‌شده"),
    ("فصل ۱۰: تکنولوژی‌ها", "امیرحسین ترک", "محمد سجاد حسین جعفرپور", "متن فصل و جدول نسخه‌ها", "انجام‌شده"),
    ("فصل ۱۱: MSP و RACI", "امیررضا زارع", "محمد نعیم کریم‌زاده", "WBS، زمان‌بندی، RACI و فایل MSP", "انجام‌شده"),
    ("یکپارچه‌سازی و صفحه‌آرایی", "محمد نعیم کریم‌زاده", "ارشیا احمدی", "نسخۀ Word یکپارچه", "انجام‌شده"),
    ("کنترل کیفیت محتوا و فنی", "محمد سجاد حسین جعفرپور", "امیرحسین ترک", "گزارش QA و رفع ایرادها", "انجام‌شده"),
    ("اسلاید ارائه", "محمد نعیم کریم‌زاده", "ارشیا احمدی", "اسلاید ۱۲ بخشی", "باقی‌مانده"),
    ("تمرین ارائه", "همه اعضا", "محمد نعیم کریم‌زاده", "اجرای آزمایشی و اصلاح", "باقی‌مانده"),
    ("ارائه نهایی", "همه اعضا", "محمد نعیم کریم‌زاده", "ارائه در ۵ آبان ۱۴۰۵", "باقی‌مانده"),
]

# (مرحله, مسئول اصلی, همکار, بازه, خروجی, وضعیت)
SURVEY = [
    ("تثبیت پرسش‌نامه و فرم برخط", "معین نوری", "امیرحسین ترک", "۲۶/۰۷", "فایل HTML و قالب Excel", "ابزار آماده"),
    ("پایلوت ۱۰ نفره و اصلاح گویه‌ها", "ارشیا احمدی", "امیررضا زارع", "۲۶ تا ۲۷/۰۷", "گزارش پایلوت و نسخۀ اصلاح‌شده", "باقی‌مانده"),
    ("گردآوری سمت تقاضا (دانشجویان و کانال عمومی)", "محمد سجاد حسین جعفرپور", "ارشیا احمدی", "۲۷ تا ۲۹/۰۷", "پاسخ‌های ثبت‌شده در فرم", "باقی‌مانده"),
    ("گردآوری سمت عرضه (مالکان و ارائه‌دهندگان)", "امیررضا زارع", "امیرحسین ترک", "۲۷ تا ۲۹/۰۷", "حداقل سهمیۀ عرضه در نمونه", "باقی‌مانده"),
    ("پیگیری روزانۀ پاسخ‌ها و کنترل سهمیه", "معین نوری", "محمد نعیم کریم‌زاده", "۲۷ تا ۲۹/۰۷", "گزارش پیشرفت روزانه", "باقی‌مانده"),
    ("پاک‌سازی، کدگذاری و ورود داده", "محمد سجاد حسین جعفرپور", "معین نوری", "۲۹ تا ۳۰/۰۷", "فایل پاسخ‌های پاک‌شده", "باقی‌مانده"),
    ("بازبینی کیفیت و اخلاق داده", "امیرحسین ترک", "محمد نعیم کریم‌زاده", "۳۰/۰۷", "چک‌لیست کیفیت داده", "باقی‌مانده"),
    ("تحلیل آماری (توصیفی، پایایی، مقایسۀ گروه‌ها)", "معین نوری", "محمد سجاد حسین جعفرپور", "۳۰/۰۷", "جدول‌ها و نمودارهای تحلیل", "باقی‌مانده"),
    ("جمع‌بندی یافته‌ها و به‌روزرسانی فصل ۷", "معین نوری", "محمد نعیم کریم‌زاده", "۰۱/۰۸", "متن یافته‌ها و اصلاح فصل ۷", "مشروط به گردآوری"),
    ("آرشیو داده خام و حذف شناسه‌ها", "امیرحسین ترک", "معین نوری", "۰۱/۰۸", "فایل رمزدار و یادداشت حذف", "باقی‌مانده"),
]

# (کار, مسئول, مهلت, وضعیت)
REMAINING = [
    ("تکمیل نام استاد در صفحۀ عنوان", "محمد نعیم کریم‌زاده", "۰۳/۰۸", "باقی‌مانده"),
    ("به‌روزرسانی فهرست مطالب و شمارۀ صفحات در Word", "ارشیا احمدی", "۰۳/۰۸", "باقی‌مانده"),
    ("بازبینی چشمی جدول‌های عریض (ریسک و RACI)", "ارشیا احمدی", "۰۳/۰۸", "باقی‌مانده"),
    ("نصب فونت B Nazanin روی رایانۀ ارائه", "امیرحسین ترک", "۰۳/۰۸", "باقی‌مانده"),
    ("اجرای پرسش‌نامه و تکمیل جدول نیازسنجی", "همه اعضا", "۰۱/۰۸", "باقی‌مانده"),
    ("گرفتن خروجی PDF از داخل Word", "محمد نعیم کریم‌زاده", "۰۴/۰۸", "باقی‌مانده"),
    ("تمرین نهایی ارائه", "همه اعضا", "۰۴/۰۸", "باقی‌مانده"),
    ("تحویل و ارائه", "همه اعضا", "۰۵/۰۸", "باقی‌مانده"),
]

# RACI for the survey workstream
RACI = [
    ["فعالیت", *MEMBERS],
    ["طراحی ابزار نیازسنجی", "A", "R", "C", "C", "C", "C"],
    ["فرم برخط و زیرساخت", "A", "C", "I", "R", "I", "I"],
    ["پایلوت و اصلاح گویه‌ها", "A", "R", "C", "C", "C", "C"],
    ["گردآوری داده تقاضا", "A", "C", "R", "I", "C", "R"],
    ["گردآوری داده عرضه", "A", "C", "I", "C", "R", "C"],
    ["پاک‌سازی و کدگذاری", "A", "R", "R", "C", "I", "I"],
    ["تحلیل داده", "A", "R", "C", "I", "C", "I"],
    ["جمع‌بندی یافته‌ها", "A/R", "C", "C", "I", "C", "C"],
]


def style_header(ws, widths, freeze="A2"):
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


def add_status_colors(ws, col):
    fills = {
        "انجام‌شده": PatternFill("solid", fgColor="E2EFDA"),
        "ابزار آماده": PatternFill("solid", fgColor="DDEBF7"),
        "باقی‌مانده": PatternFill("solid", fgColor="FCE4D6"),
        "مشروط به گردآوری": PatternFill("solid", fgColor="FFF2CC"),
    }
    for row in ws.iter_rows(min_row=2, min_col=col, max_col=col):
        cell = row[0]
        if cell.value in fills:
            cell.fill = fills[cell.value]


def build() -> None:
    wb = Workbook()

    ws = wb.active
    ws.title = "وظایف گزارش"
    ws.append(["#", "بخش", "مسئول اصلی", "همکار", "خروجی", "وضعیت"])
    for idx, row in enumerate(REPORT, start=1):
        ws.append([idx, *row])
    style_header(ws, [5, 34, 26, 28, 38, 14])
    add_status_colors(ws, 6)

    ws = wb.create_sheet("نیازسنجی")
    ws.append(["#", "مرحله", "مسئول اصلی", "همکار", "بازه", "خروجی", "وضعیت"])
    for idx, row in enumerate(SURVEY, start=1):
        ws.append([idx, *row])
    style_header(ws, [5, 42, 26, 24, 14, 34, 16])
    add_status_colors(ws, 7)

    ws = wb.create_sheet("کارهای باقی‌مانده")
    ws.append(["#", "کار", "مسئول", "مهلت", "وضعیت"])
    for idx, row in enumerate(REMAINING, start=1):
        ws.append([idx, *row])
    style_header(ws, [5, 52, 28, 12, 14])
    add_status_colors(ws, 5)

    ws = wb.create_sheet("RACI نیازسنجی")
    for row in RACI:
        ws.append(row)
    style_header(ws, [30, 20, 14, 20, 16, 16, 16])
    for row in ws.iter_rows(min_row=2):
        for cell in row[1:]:
            cell.alignment = CENTER

    ws = wb.create_sheet("بار کاری")
    ws.append(["عضو", "نقش", "وظیفۀ اصلی گزارش", "وظیفۀ اصلی نیازسنجی", "همکاری", "جمع ردیف‌های مرتبط"])
    for member in MEMBERS:
        main_report = sum(1 for r in REPORT if r[1] == member)
        main_survey = sum(1 for r in SURVEY if r[1] == member)
        collab = sum(1 for r in REPORT + SURVEY if r[2] == member)
        collab += sum(1 for r in REMAINING if r[1] == member)
        ws.append([member, ROLES[member], main_report, main_survey, collab, main_report + main_survey + collab])
    style_header(ws, [28, 40, 16, 18, 12, 18])
    for row in ws.iter_rows(min_row=2, min_col=3, max_col=6):
        for cell in row:
            cell.alignment = CENTER

    wb.save(OUT)
    print(f"Wrote {OUT.name} ({OUT.stat().st_size:,} bytes)")
    print(f"report rows: {len(REPORT)} | survey rows: {len(SURVEY)} | remaining: {len(REMAINING)}")


if __name__ == "__main__":
    build()
