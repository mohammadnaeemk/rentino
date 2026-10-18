#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the empty data-collection workbook for the needs-assessment survey.

The workbook contains a codebook and blank response sheets.  It deliberately
contains no respondent data: the survey has not been fielded yet.
"""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

BASE = Path(__file__).resolve().parents[1]
OUT = BASE / "Rentino-Phase1-Survey-Template.xlsx"

HEADER_FILL = PatternFill("solid", fgColor="1F4E79")
NOTE_FILL = PatternFill("solid", fgColor="F2F2F2")
HEADER_FONT = Font(name="B Nazanin", size=11, bold=True, color="FFFFFF")
BODY_FONT = Font(name="B Nazanin", size=11)
TITLE_FONT = Font(name="B Nazanin", size=13, bold=True)
THIN = Side(style="thin", color="BFBFBF")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="center", horizontal="right")
CENTER = Alignment(wrap_text=True, vertical="center", horizontal="center")

LIKERT5 = "۱ = کاملاً مخالفم تا ۵ = کاملاً موافقم"
IMPORTANCE5 = "۱ = بی‌اهمیت تا ۵ = بسیار مهم"

# (code, section, item text, construct, scale, coding)
ITEMS = [
    ("Q1", "الف", "سن شما در کدام بازه است؟", "-",
     "زیر ۱۸؛ ۱۸ تا ۲۴؛ ۲۵ تا ۳۴؛ ۳۵ تا ۴۴؛ ۴۵ تا ۵۵؛ بالای ۵۵",
     "۱ تا ۶؛ زیر ۱۸ سال پایان پرسش‌نامه"),
    ("Q2", "الف", "جنسیت", "-", "زن؛ مرد؛ ترجیح می‌دهم نگویم", "۱ تا ۳"),
    ("Q3", "الف", "بالاترین سطح تحصیلات", "-",
     "زیر دیپلم؛ دیپلم؛ کاردانی؛ کارشناسی؛ کارشناسی ارشد یا بالاتر", "۱ تا ۵"),
    ("Q4", "الف", "استان محل سکونت", "-", "فهرست سی‌ویک استان", "کد استان ۱ تا ۳۱"),
    ("Q5", "الف", "اندازۀ شهر محل سکونت", "-",
     "کمتر از ۱۰۰ هزار؛ ۱۰۰ تا ۵۰۰ هزار؛ ۵۰۰ هزار تا ۲ میلیون؛ بیش از ۲ میلیون", "۱ تا ۴"),
    ("Q6", "الف", "نقش شما در بازار اجاره", "-",
     "اجاره‌گیرنده؛ مالک؛ هر دو؛ هیچ‌کدام", "۱ تا ۴؛ گزینۀ ۴ پایان پرسش‌نامه"),
    ("Q7", "الف", "درآمد ماهانۀ خانوار", "-",
     "کمتر از ۱۰؛ ۱۰ تا ۲۰؛ ۲۰ تا ۴۰؛ ۴۰ تا ۷۰؛ بیش از ۷۰ میلیون تومان؛ ترجیح می‌دهم نگویم",
     "۱ تا ۶"),
    ("Q8", "ب", "در دوازده ماه گذشته، چند بار کالایی را اجاره کرده‌اید؟", "-",
     "هیچ؛ ۱ تا ۲؛ ۳ تا ۵؛ ۶ تا ۱۰؛ بیش از ۱۰", "۰ تا ۴"),
    ("Q9", "ب", "کدام دسته‌ها را اجاره کرده‌اید؟", "-", "چندگزینه‌ای؛ هشت دسته",
     "هر دسته یک ستون دودویی"),
    ("Q10", "ب", "کالا را از کجا پیدا کرده‌اید؟", "-", "چندگزینه‌ای؛ شش کانال",
     "هر کانال یک ستون دودویی"),
    ("Q11", "ب", "در دوازده ماه گذشته، کالایی را به کسی اجاره داده‌اید؟", "-",
     "بله؛ خیر", "۱ = بله؛ ۰ = خیر"),
    ("Q12", "ب", "مهم‌ترین دلیل اجاره‌نکردن بیشتر چیست؟", "-",
     "هزینه؛ نبود کالای مناسب؛ نگرانی از سالم بودن؛ نبود اطلاعات از مالک؛ دشواری هماهنگی؛ ترجیح خرید",
     "۱ تا ۶"),
    ("Q13", "ب", "برای کالای باارزش خانگی بی‌استفاده چه می‌کنید؟", "-",
     "نگه می‌دارم؛ می‌فروشم؛ قرض می‌دهم؛ اجاره می‌دهم؛ سایر", "۱ تا ۵"),
    ("Q14", "ج", "نگرانم کالای اجاره‌ای سالم یا کامل نباشد.", "C1", LIKERT5, "۱ تا ۵"),
    ("Q15", "ج", "نگرانم در صورت خسارت، مسئولیت و جبران روشن نباشد.", "C1", LIKERT5, "۱ تا ۵"),
    ("Q16", "ج", "نگرانم ودیعه به‌موقع یا کامل بازنگردد.", "C1", LIKERT5, "۱ تا ۵"),
    ("Q17", "ج", "به کسی که نمی‌شناسم کالای باارزشم را اجاره نمی‌دهم.", "C1", LIKERT5, "۱ تا ۵"),
    ("Q18", "ج", "پیدا کردن کالای مناسب در کانال‌های فعلی زمان‌بر است.", "C2", LIKERT5, "۱ تا ۵"),
    ("Q19", "ج", "مقایسۀ قیمت و شرایط چند آگهی دشوار است.", "C2", LIKERT5, "۱ تا ۵"),
    ("Q20", "ج", "معلوم نیست کالا در بازۀ مورد نظر من واقعاً آزاد است.", "C2", LIKERT5, "۱ تا ۵"),
    ("Q21", "ج", "مذاکرۀ تلفنی و توافق شفاهی برایم ناخوشایند است.", "C2", LIKERT5, "۱ تا ۵"),
    ("Q22", "د", "مشاهدۀ قیمت روزانه و هزینۀ کل پیش از رزرو.", "C3", IMPORTANCE5, "۱ تا ۵"),
    ("Q23", "د", "نمایش تقویم آزاد بودن کالا در بازۀ انتخابی.", "C3", IMPORTANCE5, "۱ تا ۵"),
    ("Q24", "د", "رزرو و پرداخت آنلاین بدون تماس تلفنی.", "C3", IMPORTANCE5, "۱ تا ۵"),
    ("Q25", "د", "فیلتر بر اساس دسته، شهر، قیمت و تاریخ.", "C3", IMPORTANCE5, "۱ تا ۵"),
    ("Q26", "د", "احراز هویت و نشان «کاربر تأییدشده».", "C4", IMPORTANCE5, "۱ تا ۵"),
    ("Q27", "د", "ثبت وضعیت کالا با عکس در تحویل و بازگشت.", "C4", IMPORTANCE5, "۱ تا ۵"),
    ("Q28", "د", "نظرات و امتیاز کاربران قبلی.", "C4", IMPORTANCE5, "۱ تا ۵"),
    ("Q29", "د", "پشتیبانی فارسی و مسیر مشخص شکایت.", "C4", IMPORTANCE5, "۱ تا ۵"),
    ("Q30", "ه", "اگر پلتفرمی با ویژگی‌های بالا وجود داشت، از آن استفاده می‌کردم.", "C5", LIKERT5, "۱ تا ۵"),
    ("Q31", "ه", "حاضر بودم کالای خودم را در چنین پلتفرمی برای اجاره ثبت کنم.", "C5", LIKERT5, "۱ تا ۵"),
    ("Q32", "ه", "به دوستانم چنین پلتفرمی را پیشنهاد می‌کردم.", "C5", LIKERT5, "۱ تا ۵"),
    ("Q33", "ه", "حداکثر ودیعۀ قابل قبول برای کالایی به ارزش ۲۰ میلیون تومان", "-",
     "کمتر از ۲؛ ۲ تا ۵؛ ۵ تا ۱۰؛ بیش از ۱۰ میلیون تومان", "۱ تا ۴"),
    ("Q34", "ه", "کارمزد معقول پلتفرم از هر معامله", "-",
     "کمتر از ۵%؛ ۵ تا ۱۰%؛ ۱۰ تا ۱۵%؛ بیش از ۱۵%", "۱ تا ۴"),
    ("Q35", "و", "بزرگ‌ترین نگرانی شما درباره اجارۀ آنلاین چیست؟", "-", "متن آزاد", "متن"),
    ("Q36", "و", "چه ویژگی‌ای را ضروری می‌دانید که در پرسش‌نامه نیامده است؟", "-",
     "متن آزاد", "متن"),
]


def style_header(ws, widths):
    ws.sheet_view.rightToLeft = True
    for idx, width in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(idx)].width = width
    for cell in ws[1]:
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = CENTER
        cell.border = BORDER


def build():
    wb = Workbook()

    # --- راهنما -------------------------------------------------------------
    ws = wb.active
    ws.title = "راهنما"
    ws.sheet_view.rightToLeft = True
    ws.column_dimensions["A"].width = 4
    ws.column_dimensions["B"].width = 110
    rows = [
        ("بستۀ نیازسنجی رنتینو - قالب گردآوری داده", TITLE_FONT),
        ("این فایل قالب خالی است. هیچ پاسخ‌دهنده‌ای ثبت نشده و هیچ عدد پیمایشی در آن نیست.", BODY_FONT),
        ("", BODY_FONT),
        ("۱. پرسش‌نامه را از فایل survey/Rentino-Questionnaire.html توزیع کنید.", BODY_FONT),
        ("۲. پس از پایان هر موج گردآوری، ستون‌های برگۀ «پاسخ‌ها» را پر کنید.", BODY_FONT),
        ("۳. مقدار گمشده را با کد ۹۹ ثبت کنید؛ جایگزینی با میانگین فقط در تحلیل حساسیت مجاز است.", BODY_FONT),
        ("۴. پیش از تحلیل، دامنۀ هر گویه و فراوانی کد ۹۹ را بررسی کنید.", BODY_FONT),
        ("۵. شمارۀ پاسخ‌دهنده را حذف نکنید تا ردیابی رکوردهای حذف‌شده ممکن باشد.", BODY_FONT),
        ("۶. هیچ شناسۀ هویتی، شمارۀ تماس یا نشانی شبکه‌ای در این فایل ثبت نشود.", BODY_FONT),
        ("۷. فایل خام را رمزدار نگه دارید و پس از پایان درس حذف کنید.", BODY_FONT),
        ("", BODY_FONT),
        ("وضعیت: طرح و ابزار آماده؛ اجرای میدانی انجام نشده است.", BODY_FONT),
    ]
    for idx, (text, font) in enumerate(rows, start=1):
        cell = ws.cell(row=idx, column=2, value=text)
        cell.font = font
        cell.alignment = WRAP

    # --- کدنامه -------------------------------------------------------------
    ws = wb.create_sheet("کدنامه")
    header = ["کد", "بخش", "متن گویه", "سازه", "مقیاس", "کدگذاری"]
    ws.append(header)
    for item in ITEMS:
        ws.append(list(item))
    style_header(ws, [8, 8, 60, 8, 42, 34])
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:F{ws.max_row}"
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.font = BODY_FONT
            cell.border = BORDER
            cell.alignment = WRAP

    # --- پاسخ‌ها ------------------------------------------------------------
    ws = wb.create_sheet("پاسخ‌ها")
    ws.sheet_view.rightToLeft = True
    note = ws.cell(row=1, column=1,
                   value="سربرگ خالی است؛ پس از گردآوری، هر ردیف یک پاسخ‌دهنده خواهد بود.")
    note.font = BODY_FONT
    note.alignment = WRAP
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=8)
    cols = ["شناسۀ پاسخ", "تاریخ ثبت", "کانال توزیع", "نقش"]
    cols += [item[0] for item in ITEMS]
    ws.append(cols)
    style_header_row = 2
    for cell in ws[style_header_row]:
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = CENTER
        cell.border = BORDER
    ws.freeze_panes = "E3"
    ws.auto_filter.ref = f"A2:{get_column_letter(len(cols))}2"
    for idx in range(1, len(cols) + 1):
        width = 9 if idx <= 4 else 7
        ws.column_dimensions[get_column_letter(idx)].width = width

    # --- نمونه‌گیری ---------------------------------------------------------
    ws = wb.create_sheet("نمونه‌گیری")
    ws.sheet_view.rightToLeft = True
    ws.append(["پارامتر", "مقدار", "توضیح"])
    data = [
        ("سطح اطمینان", 0.95, "استاندارد پژوهش پیمایشی"),
        ("مقدار z", "=NORM.S.INV((1+B2)/2)", "توزیع نرمال استاندارد"),
        ("p", 0.5, "بیشینۀ ناهمگونی"),
        ("q", "=1-B4", "مکمل p"),
        ("حاشیۀ خطا", 0.05, "پنج درصد"),
        ("n خام", "=ROUNDUP((B3^2*B4*B5)/(B6^2),0)", "فرمول کوکران"),
        ("نرخ عدم پاسخ", 0.2, "فرض محافظه‌کارانه"),
        ("n نهایی", "=ROUNDUP(B7/(1-B8),0)", "حجم نمونه پس از تعدیل"),
        ("حداقل سهم عرضه", "=ROUNDUP(B9*0.19,0)", "حدود یک‌پنجم نمونه؛ مالکان کالا"),
    ]
    for row in data:
        ws.append(list(row))
    for cell in ws[1]:
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = CENTER
        cell.border = BORDER
    ws.column_dimensions["A"].width = 22
    ws.column_dimensions["B"].width = 34
    ws.column_dimensions["C"].width = 52
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.font = BODY_FONT
            cell.border = BORDER
            cell.alignment = WRAP
    ws["B10"].number_format = "0"

    # --- تحلیل --------------------------------------------------------------
    ws = wb.create_sheet("تحلیل")
    ws.append(["#", "تحلیل", "متغیرها", "آزمون", "آستانۀ تصمیم"])
    plan = [
        (1, "توصیف نمونۀ پژوهش", "Q1 تا Q7", "فراوانی و درصد", "-"),
        (2, "نرخ تجربۀ اجاره", "Q8، Q11", "فراوانی و فاصلۀ اطمینان نسبت", "گزارش با فاصلۀ ۹۵%"),
        (3, "اولویت موانع", "Q14 تا Q21", "میانگین رتبه‌ای فریدمن", "p < 0.05"),
        (4, "پایایی سازه‌ها", "C1 تا C5", "آلفای کرونباخ", "α ≥ 0.70"),
        (5, "مقایسۀ تقاضا و عرضه", "C1 تا C5 × نقش", "تی مستقل", "p < 0.05"),
        (6, "تفاوت گروه‌های سنی", "C1 تا C5 × Q1", "تحلیل واریانس یک‌طرفه", "p < 0.05"),
        (7, "رابطۀ اعتماد و قصد استفاده", "C1، C2، C5", "همبستگی اسپیرمن", "p < 0.05"),
        (8, "تحلیل پرسش‌های باز", "Q35، Q36", "کدگذاری موضوعی", "دو کدگذار مستقل"),
    ]
    for row in plan:
        ws.append(list(row))
    for cell in ws[1]:
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = CENTER
        cell.border = BORDER
    for idx, width in enumerate([5, 32, 24, 28, 34], start=1):
        ws.column_dimensions[get_column_letter(idx)].width = width
    ws.sheet_view.rightToLeft = True
    ws.freeze_panes = "A2"
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.font = BODY_FONT
            cell.border = BORDER
            cell.alignment = WRAP

    wb.save(OUT)
    print(f"Wrote {OUT.name} ({OUT.stat().st_size:,} bytes)")
    print(f"items: {len(ITEMS)} | response columns: {4 + len(ITEMS)}")


if __name__ == "__main__":
    build()
