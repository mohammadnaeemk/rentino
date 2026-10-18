#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the phase-1 presentation deck.

Content is drawn only from Rentino-Phase1-Final.md. Anything the team has not
measured yet is rendered as a visibly empty placeholder frame, never as a
number. Every paragraph is switched to RTL so PowerPoint keeps Persian layout
even on a machine where the document defaults are left-to-right.
"""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

BASE = Path(__file__).resolve().parents[1]
OUT = BASE / "Rentino-Phase1-Slides.pptx"

FONT = "B Nazanin"

NAVY = RGBColor(0x1F, 0x4E, 0x79)
NAVY_DARK = RGBColor(0x14, 0x30, 0x4A)
TEAL = RGBColor(0x2A, 0x7F, 0x7A)
GOLD = RGBColor(0xC4, 0x8A, 0x12)
INK = RGBColor(0x24, 0x2C, 0x33)
GRAY = RGBColor(0x5A, 0x6B, 0x7B)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT = RGBColor(0xEE, 0xF3, 0xF8)
LIGHT_GOLD = RGBColor(0xFD, 0xF6, 0xE3)
GREEN = RGBColor(0x2E, 0x6B, 0x4F)
RED = RGBColor(0xB0, 0x3A, 0x2E)

W = Inches(13.333)
H = Inches(7.5)

SLIDE_NO = [0]
NOTES = []


# ---------------------------------------------------------------------------
# primitives
# ---------------------------------------------------------------------------


def rtl(paragraph, align=PP_ALIGN.RIGHT):
    paragraph.alignment = align
    pPr = paragraph._p.get_or_add_pPr()
    pPr.set("rtl", "1")


def textframe(shape, anchor=MSO_ANCHOR.TOP):
    tf = shape.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = Inches(0.05)
    tf.margin_right = Inches(0.05)
    tf.margin_top = Inches(0.02)
    tf.margin_bottom = Inches(0.02)
    return tf


def para(tf, text, size=18, bold=False, color=INK, first=False,
         align=PP_ALIGN.RIGHT, space_before=0, space_after=6):
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    rtl(p, align)
    p.space_before = Pt(space_before)
    p.space_after = Pt(space_after)
    p.line_spacing = 1.15
    run = p.add_run()
    run.text = text
    run.font.name = FONT
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    return p


def box(slide, x, y, w, h, fill=None, line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE,
        line_w=1.0, radius=0.06, dash=None):
    shp = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        try:
            shp.adjustments[0] = radius
        except IndexError:
            pass
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid()
        shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(line_w)
        if dash is not None:
            shp.line.dash_style = dash
    shp.shadow.inherit = False
    shp.text_frame.word_wrap = True
    return shp


def placeholder(slide, x, y, w, h, label, hint=None):
    """A visibly empty, dashed frame for data the team has not collected yet."""
    shp = box(slide, x, y, w, h, fill=LIGHT_GOLD, line=GOLD, line_w=1.25,
              dash=5)  # 5 = MSO_LINE.DASH
    tf = textframe(shp, MSO_ANCHOR.MIDDLE)
    para(tf, label, size=15, bold=True, color=GOLD, first=True,
         align=PP_ALIGN.CENTER, space_after=4)
    if hint:
        para(tf, hint, size=11, color=GRAY, align=PP_ALIGN.CENTER, space_after=0)
    return shp


def new_slide(prs, title, kicker=None, notes=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    SLIDE_NO[0] += 1

    band = box(slide, 0, 0, 13.333, 0.13, fill=NAVY, shape=MSO_SHAPE.RECTANGLE)
    band.line.fill.background()

    if kicker:
        k = slide.shapes.add_textbox(Inches(8.0), Inches(0.28), Inches(4.9), Inches(0.32))
        tf = textframe(k)
        para(tf, kicker, size=12, color=TEAL, first=True, space_after=0)

    t = slide.shapes.add_textbox(Inches(0.6), Inches(0.55), Inches(12.0), Inches(0.75))
    tf = textframe(t)
    para(tf, title, size=28, bold=True, color=NAVY, first=True, space_after=0)

    rule = box(slide, 0.6, 1.30, 12.13, 0.035,
               fill=RGBColor(0xD5, 0xDF, 0xE8), shape=MSO_SHAPE.RECTANGLE)
    rule.line.fill.background()

    num = slide.shapes.add_textbox(Inches(0.55), Inches(7.02), Inches(0.9), Inches(0.3))
    tf = textframe(num)
    para(tf, str(SLIDE_NO[0]), size=11, color=GRAY, first=True, align=PP_ALIGN.LEFT,
         space_after=0)

    foot = slide.shapes.add_textbox(Inches(8.6), Inches(7.02), Inches(4.2), Inches(0.3))
    tf = textframe(foot)
    para(tf, "رنتینو - گزارش فاز اول", size=11, color=GRAY, first=True, space_after=0)

    if notes:
        slide.notes_slide.notes_text_frame.text = notes
    return slide


def bullets(slide, items, x, y, w, h, size=17, color=INK, gap=10):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = textframe(tb)
    for idx, item in enumerate(items):
        if isinstance(item, tuple):
            text, sz, bold = item
            para(tf, "- " + text, size=sz, bold=bold, color=color, first=idx == 0,
                 space_after=gap)
        else:
            para(tf, "- " + item, size=size, color=color, first=idx == 0, space_after=gap)
    return tb


def card(slide, x, y, w, h, head, lines, fill=LIGHT, accent=NAVY, head_size=17,
         body_size=13, align=PP_ALIGN.RIGHT):
    shp = box(slide, x, y, w, h, fill=fill)
    bar = box(slide, x + w - 0.07, y + 0.14, 0.07, h - 0.28, fill=accent,
              shape=MSO_SHAPE.RECTANGLE)
    bar.line.fill.background()
    tf = textframe(shp)
    para(tf, head, size=head_size, bold=True, color=accent, first=True,
         align=align, space_after=6)
    for line in lines:
        para(tf, line, size=body_size, color=INK, align=align, space_after=4)
    return shp


def table(slide, data, x, y, w, h, widths, font=11, header_font=11,
          header_fill=NAVY, first_col_bold=False, aligns=None, zebra=True):
    rows, cols = len(data), len(data[0])
    frame = slide.shapes.add_table(rows, cols, Inches(x), Inches(y), Inches(w), Inches(h))
    tbl = frame.table
    tbl.first_row = True
    tbl.horz_banding = False
    tbl._tbl.tblPr.set("rtl", "1")

    total = sum(widths)
    for idx, cw in enumerate(widths):
        tbl.columns[idx].width = Emu(int(Inches(w) * cw / total))

    for r, row in enumerate(data):
        for c, value in enumerate(row):
            cell = tbl.cell(r, c)
            cell.margin_left = Inches(0.06)
            cell.margin_right = Inches(0.06)
            cell.margin_top = Inches(0.02)
            cell.margin_bottom = Inches(0.02)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            if r == 0:
                cell.fill.fore_color.rgb = header_fill
            elif zebra and r % 2 == 0:
                cell.fill.fore_color.rgb = RGBColor(0xF4, 0xF7, 0xFA)
            else:
                cell.fill.fore_color.rgb = WHITE

            tf = cell.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            align = PP_ALIGN.CENTER if (aligns is None or c == 0) else aligns[c]
            rtl(p, PP_ALIGN.CENTER if r == 0 else align)
            p.space_after = Pt(0)
            p.space_before = Pt(0)
            run = p.add_run()
            run.text = str(value)
            run.font.name = FONT
            run.font.size = Pt(header_font if r == 0 else font)
            run.font.bold = r == 0 or (first_col_bold and c == 0)
            run.font.color.rgb = WHITE if r == 0 else INK
    return frame


# ---------------------------------------------------------------------------
# slides
# ---------------------------------------------------------------------------


def slide_title(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    SLIDE_NO[0] += 1

    bg = box(s, 0, 0, 13.333, 7.5, fill=WHITE, shape=MSO_SHAPE.RECTANGLE)
    bg.line.fill.background()

    top = box(s, 0, 0, 13.333, 0.22, fill=NAVY, shape=MSO_SHAPE.RECTANGLE)
    top.line.fill.background()
    bottom = box(s, 0, 7.28, 13.333, 0.22, fill=NAVY, shape=MSO_SHAPE.RECTANGLE)
    bottom.line.fill.background()

    side = box(s, 11.55, 1.55, 0.1, 4.2, fill=GOLD, shape=MSO_SHAPE.RECTANGLE)
    side.line.fill.background()

    t = s.shapes.add_textbox(Inches(1.1), Inches(1.45), Inches(10.2), Inches(1.3))
    tf = textframe(t)
    para(tf, "رنتینو", size=66, bold=True, color=NAVY, first=True, space_after=0)

    t = s.shapes.add_textbox(Inches(1.1), Inches(2.75), Inches(10.2), Inches(0.6))
    tf = textframe(t)
    para(tf, "بازارگاه آنلاین اجارۀ کالاهای قابل حمل", size=26, color=TEAL,
         first=True, space_after=0)

    t = s.shapes.add_textbox(Inches(1.1), Inches(3.55), Inches(10.2), Inches(0.5))
    tf = textframe(t)
    para(tf, "گزارش فاز اول پروژۀ درس مهندسی نرم‌افزار", size=20, color=INK,
         first=True, space_after=0)

    t = s.shapes.add_textbox(Inches(1.1), Inches(4.05), Inches(10.2), Inches(0.45))
    tf = textframe(t)
    para(tf, "دانشگاه اصفهان - دانشکدۀ مهندسی کامپیوتر", size=16, color=GRAY,
         first=True, space_after=0)

    rule = box(s, 1.1, 4.65, 10.2, 0.02,
               fill=RGBColor(0xD5, 0xDF, 0xE8), shape=MSO_SHAPE.RECTANGLE)
    rule.line.fill.background()

    t = s.shapes.add_textbox(Inches(1.1), Inches(4.85), Inches(10.2), Inches(0.9))
    tf = textframe(t)
    para(tf, "محمد نعیم کریم‌زاده، معین نوری، محمد سجاد حسین جعفرپور،",
         size=15, color=INK, first=True, space_after=2)
    para(tf, "امیرحسین ترک، امیررضا زارع، ارشیا احمدی", size=15, color=INK,
         space_after=0)

    t = s.shapes.add_textbox(Inches(1.1), Inches(5.85), Inches(10.2), Inches(0.4))
    tf = textframe(t)
    para(tf, "تاریخ تهیه: ۲۶ مهر ۱۴۰۵    |    تاریخ ارائه: ۵ آبان ۱۴۰۵",
         size=14, color=GRAY, first=True, space_after=0)

    s.notes_slide.notes_text_frame.text = (
        "سلام و معرفی کوتاه اعضا. در ۲۰ ثانیه بگویید رنتینو چیست و "
        "ارائه در چهار بخش است: مسئله و بازار، نیازها، راهکار فنی، برنامه و تقسیم کار."
    )
    return s


def slide_agenda(prs):
    s = new_slide(prs, "دستور جلسه", kicker="مقدمه",
                  notes="ترتیب ارائه را تثبیت کنید. اگر زمان کم شد، بخش ۳ و ۴ را "
                        "کوتاه کنید و روی RACI و تقسیم کار وقت بگذارید.")
    items = [
        ("۱", "صورت مسئله و ایدۀ راه‌حل", "۳ دقیقه"),
        ("۲", "اهداف فاز اول", "۲ دقیقه"),
        ("۳", "بازار و رقبا", "۳ دقیقه"),
        ("۴", "نیازهای بازار و روش نیازسنجی", "۳ دقیقه"),
        ("۵", "یافته‌های نیازسنجی", "۳ دقیقه"),
        ("۶", "فرصت‌ها، ریسک‌ها و نیازمندی‌ها", "۳ دقیقه"),
        ("۷", "فناوری و معماری", "۲ دقیقه"),
        ("۸", "زمان‌بندی، RACI و تقسیم کار", "۴ دقیقه"),
    ]
    x0, y0 = 6.85, 1.62
    for idx, (num, head, dur) in enumerate(items):
        col, row = idx % 2, idx // 2
        x = x0 - col * 6.05
        y = y0 + row * 1.22
        shp = box(s, x, y, 5.75, 1.0, fill=LIGHT)
        bar = box(s, x + 5.68, y + 0.12, 0.07, 0.76, fill=TEAL, shape=MSO_SHAPE.RECTANGLE)
        bar.line.fill.background()
        tf = textframe(shp)
        para(tf, f"{num}. {head}", size=16, bold=True, color=NAVY, first=True,
             space_after=2)
        para(tf, dur, size=12, color=GRAY, space_after=0)

    t = s.shapes.add_textbox(Inches(0.7), Inches(6.7), Inches(11.9), Inches(0.35))
    tf = textframe(t)
    para(tf, "مدت کل: حدود ۲۰ تا ۲۵ دقیقه، بدون احتساب پرسش و پاسخ",
         size=13, color=GRAY, first=True, space_after=0)


def slide_problem(prs):
    s = new_slide(prs, "مسئله: هزینۀ مبادله و ریسک اعتماد، نه کمبود عرضه",
                  kicker="بخش ۱-۲ گزارش",
                  notes="تأکید کنید مسئله «نبود کالا» نیست. سه اصطکاک را نام ببرید: "
                        "پراکندگی، مذاکرۀ خارج از پلتفرم، نبود مسیر خسارت.")
    bullets(s, [
        "کالای قابل اجاره و متقاضی هر دو وجود دارند، اما در سایت‌های نیازمندی و شبکه‌های اجتماعی پراکنده‌اند.",
        "قیمت و دسترس‌پذیری دستی مقایسه می‌شود و پرداخت و ودیعه بیرون از پلتفرم انجام می‌گیرد.",
        "در صورت خسارت یا لغو، مسیر رسمی حل اختلاف وجود ندارد و ریسک به دو طرف منتقل می‌شود.",
        "نتیجۀ این وضعیت: نرخ تبدیل پایین، تکرار تماس و مذاکره، و تجربۀ ناخوشایند برای هر دو سمت بازار.",
    ], 6.9, 1.65, 5.9, 3.6, size=16, gap=14)

    placeholder(s, 0.75, 1.75, 5.85, 2.35, "جای آمار: اندازۀ مسئله",
                "پس از گردآوری داده: درصد کاربران آگهی‌گاه برای اجاره،\n"
                "میانگین زمان یافتن کالا، نرخ معاملات خارج از پلتفرم")
    t = s.shapes.add_textbox(Inches(0.75), Inches(4.35), Inches(5.85), Inches(1.1))
    tf = textframe(t)
    para(tf, "این اسلاید عمداً بدون عدد ارائه می‌شود. هر عددی که در آن باشد "
             "باید در فصل ۵ یا فصل ۷ گزارش قابل ردیابی باشد.",
         size=12, color=GRAY, first=True, space_after=0)


def slide_solution(prs):
    s = new_slide(prs, "ایدۀ راه‌حل: یک معاملۀ کامل، نه یک آگهی دیگر",
                  kicker="بخش ۱-۳ گزارش",
                  notes="سه ستون را از راست به چپ توضیح دهید: تقاضا، عرضه، اعتماد. "
                        "بگویید آگهی‌گاه‌ها ستون اول را دارند، ستون دوم را نصفه، "
                        "و ستون سوم را ندارند.")
    cols = [
        ("سمت تقاضا", ["جست‌وجو و فیلتر دسته، شهر و قیمت",
                       "تقویم دسترس‌پذیری واقعی",
                       "رزرو آنلاین با کنترل تداخل",
                       "پرداخت و رسید در یک مسیر"], TEAL),
        ("سمت عرضه", ["ثبت کالا در چند دقیقه",
                      "پنل مدیریت کالا و تقویم",
                      "مدیریت درخواست و سفارش",
                      "مشاهدۀ درآمد و ودیعه"], NAVY),
        ("هستۀ اعتماد", ["احراز هویت پایه",
                         "ودیعه و ثبت وضعیت کالا",
                         "نظرات دوطرفه",
                         "مسیر شکایت و خسارت"], GOLD),
    ]
    for idx, (head, lines, accent) in enumerate(cols):
        x = 9.05 - idx * 4.15
        card(s, x, 1.62, 3.85, 3.55, head,
             ["- " + ln for ln in lines], fill=LIGHT, accent=accent,
             head_size=19, body_size=13)

    note = box(s, 0.75, 5.55, 11.85, 1.05, fill=RGBColor(0xE8, 0xF1, 0xEE))
    tf = textframe(note, MSO_ANCHOR.MIDDLE)
    para(tf, "دامنۀ MVP: چرخۀ کامل معامله از ثبت کالا تا بازگشت. "
             "ودیعۀ واقعی، پرداخت بانکی و تأیید هویت کامل، برنامه‌ریزی‌شده برای فاز بعد هستند.",
         size=14, bold=True, color=GREEN, first=True, space_after=0)


def slide_goals(prs):
    s = new_slide(prs, "اهداف فاز اول", kicker="فصل ۲ گزارش",
                  notes="بگویید فاز اول یک سند تصمیم‌گیری است، نه ادعای محصول کامل. "
                        "ستون وضعیت را صادقانه بخوانید.")
    data = [
        ["هدف", "معیار سنجش", "خروجی"],
        ["تعریف شفاف مسئله و بازار", "سند با منبع معتبر برای هر ادعا", "فصل ۵ و ۶"],
        ["استخراج نیاز بازار", "نیازهای دسته‌بندی‌شده با شناسه و اولویت", "۳۸ نیاز در ۴ دسته"],
        ["تبیین نیازمندی‌ها", "نیازمندی کارکردی با شناسه و معیار پذیرش", "۵۸ FR در ۹ گروه"],
        ["تعیین فناوری و معماری", "پشته و لایه‌ها با دلیل انتخاب", "فصل ۱۰"],
        ["برنامۀ اجرایی", "WBS، مسیر بحرانی، RACI و بافر", "فصل ۱۱"],
    ]
    table(s, data, 0.75, 1.6, 11.85, 3.9, [3.6, 5.0, 3.2], font=13, header_font=13,
          aligns=[PP_ALIGN.RIGHT, PP_ALIGN.RIGHT, PP_ALIGN.CENTER])

    t = s.shapes.add_textbox(Inches(0.75), Inches(5.85), Inches(11.85), Inches(0.9))
    tf = textframe(t)
    para(tf, "معیار موفقیت فاز اول: سند بتواند بدون حضور نویسنده، تصمیم فاز دوم را "
             "پشتیبانی کند. تکمیل محصول، معیار این فاز نیست.",
         size=14, color=GRAY, first=True, space_after=0)


def slide_market(prs):
    s = new_slide(prs, "بازار: زیرساخت آماده است، سه گلوگاه عملیاتی مانده",
                  kicker="فصل ۵ گزارش",
                  notes="هیچ عددی روی اسلاید نیست. اگر استاد عدد خواست، بگویید در "
                        "جدول ۵-۱ گزارش شاخص‌های رسمی آمده و اعداد این سه کارت "
                        "پس از گردآوری پر می‌شود.")
    box(s, 0.75, 1.58, 11.85, 0.6, fill=LIGHT)
    t = s.shapes.add_textbox(Inches(0.85), Inches(1.66), Inches(11.6), Inches(0.45))
    tf = textframe(t)
    para(tf, "سه شاخصی که برای انتخاب شهر اول و دستۀ ورودی لازم است",
         size=14, bold=True, color=NAVY, first=True, space_after=0)

    labels = [
        ("اندازۀ بازار اجارۀ کالا", "منبع پیشنهادی: جدول ۵-۱ و آمار رسمی"),
        ("سهم متقاضیان آنلاین", "منبع پیشنهادی: نتایج پرسش‌نامه"),
        ("میانگین ارزش هر معامله", "منبع پیشنهادی: مصاحبه با ارائه‌دهندگان"),
    ]
    for idx, (label, hint) in enumerate(labels):
        x = 8.7 - idx * 4.0
        placeholder(s, x, 2.35, 3.7, 1.75, label, hint)

    bullets(s, [
        "زیرساخت دیجیتال ایران، تقاضای لازم برای بازارگاه آنلاین را ایجاد کرده است.",
        "پرداخت، احراز هویت و تحویل کالا، سه گلوگاه عملیاتی‌اند که سرعت رشد را تعیین می‌کنند.",
        "دستۀ ورودی باید ارزش کالای بالا، حمل‌ونقل ساده و تقاضای فصلی داشته باشد.",
    ], 0.9, 4.35, 11.6, 1.9, size=15, gap=12)


def slide_competitors(prs):
    s = new_slide(prs, "رقبا: کشف را پوشش می‌دهند، معاملۀ اجاره را نه",
                  kicker="فصل ۶ گزارش",
                  notes="ستون آخر را بخوانید: رنتینو تنها ستونی است که هر سه "
                        "ردیف تقویم، رزرو و پرداخت را با هم دارد. برای صداقت بگویید "
                        "پرداخت در MVP شبیه‌سازی‌شده است.")
    data = [
        ["قابلیت", "دیوار", "شیپور", "Turo", "رنتینو (هدف)"],
        ["آگهی تخصصی اجاره", "جزئی", "جزئی", "بله", "بله"],
        ["تقویم دسترس‌پذیری", "نه", "نه", "بله", "بله"],
        ["رزرو آنلاین", "نه", "نه", "بله", "بله"],
        ["پرداخت آنلاین", "نه", "نه", "بله", "بله"],
        ["ودیعه و بیمۀ خسارت", "نه", "نه", "بله", "برنامه‌ریزی‌شده"],
        ["تحویل و ارسال", "نه", "نه", "بله", "برنامه‌ریزی‌شده"],
        ["نظرات و امتیاز", "نه", "نه", "بله", "بله"],
        ["فارسی و راست‌به‌چپ", "بله", "بله", "نه", "بله"],
    ]
    table(s, data, 0.75, 1.55, 11.85, 4.6, [3.5, 1.9, 1.9, 1.9, 2.65],
          font=12.5, header_font=12.5,
          aligns=[PP_ALIGN.RIGHT, PP_ALIGN.CENTER, PP_ALIGN.CENTER,
                  PP_ALIGN.CENTER, PP_ALIGN.CENTER])
    t = s.shapes.add_textbox(Inches(0.75), Inches(6.28), Inches(11.85), Inches(0.55))
    tf = textframe(t)
    para(tf, "«بله» یعنی قابلیت در محصول عمومی وجود دارد. این جدول قضاوت کیفیت نیست "
             "و باید در فاز دوم با آزمون واقعی محصول به‌روزرسانی شود.",
         size=11, color=GRAY, first=True, space_after=0)


def slide_needs(prs):
    s = new_slide(prs, "نیازهای بازار: ۳۸ نیاز در چهار دسته",
                  kicker="فصل ۷ گزارش",
                  notes="بگویید نیازها از سفر مشتری و شکاف رقبا استنتاج شده‌اند، "
                        "نه از پرسش‌نامه. پرسش‌نامه برای اعتبارسنجی همین نیازهاست.")
    cards = [
        ("تقاضا", "۱۲ نیاز", "RN-01 تا RN-12", "یافتن، مقایسه، رزرو و پرداخت", TEAL),
        ("عرضه", "۱۰ نیاز", "PN-01 تا PN-10", "ثبت کالا، تقویم، درآمد و خسارت", NAVY),
        ("اعتماد و ایمنی", "۸ نیاز", "TN-01 تا TN-08", "احراز هویت، ودیعه، نظرات، شکایت", GOLD),
        ("عملیات پلتفرم", "۸ نیاز", "ON-01 تا ON-08", "جست‌وجو، چرخۀ سفارش، پنل مدیر، فارسی", GREEN),
    ]
    for idx, (head, count, ids, desc, accent) in enumerate(cards):
        col, row = idx % 2, idx // 2
        x = 6.9 - col * 6.15
        y = 1.6 + row * 2.15
        card(s, x, y, 5.7, 1.9, head,
             [count + "   |   " + ids, desc], fill=LIGHT, accent=accent,
             head_size=18, body_size=13)

    t = s.shapes.add_textbox(Inches(0.75), Inches(5.95), Inches(11.85), Inches(0.85))
    tf = textframe(t)
    para(tf, "شش نیاز اول سمت تقاضا و چهار نیاز اول سمت عرضه، حداقل محصول قابل استفاده را "
             "تعریف می‌کنند. بدون تقویم و رزرو آنلاین، رنتینو فقط یک آگهی‌گاه دیگر است.",
         size=13, color=GRAY, first=True, space_after=0)


def slide_method(prs):
    s = new_slide(prs, "روش نیازسنجی: پنج گام تا یافتۀ قابل استناد",
                  kicker="بخش ۷-۱ و فصل پایانی",
                  notes="این اسلاید روش است، نه نتیجه. اگر پرسش‌نامه هنوز اجرا نشده، "
                        "همین را صریح بگویید و به اسلاید بعد بروید.")
    steps = [
        ("۱", "طراحی ابزار", "۳۶ گویه در ۹ سازه\nمقیاس پنج‌گانه لیکرت"),
        ("۲", "پایلوت", "۱۰ پاسخ‌دهندۀ اول\nاصلاح گویه‌های مبهم"),
        ("۳", "گردآوری", "دو مسیر تقاضا و عرضه\nکنترل سهمیه"),
        ("۴", "پاک‌سازی", "حذف پاسخ ناقص\nکدگذاری و ورود داده"),
        ("۵", "تحلیل", "توصیفی، پایایی، مقایسۀ گروه‌ها"),
    ]
    for idx, (num, head, body) in enumerate(steps):
        x = 10.3 - idx * 2.4
        shp = box(s, x, 1.65, 2.15, 2.25, fill=LIGHT)
        tf = textframe(shp)
        para(tf, num, size=22, bold=True, color=GOLD, first=True,
             align=PP_ALIGN.CENTER, space_after=2)
        para(tf, head, size=15, bold=True, color=NAVY, align=PP_ALIGN.CENTER, space_after=4)
        for ln in body.split("\n"):
            para(tf, ln, size=10.5, color=GRAY, align=PP_ALIGN.CENTER, space_after=1)

    placeholder(s, 0.75, 4.3, 11.85, 1.15, "جای آمار: مشخصات نمونه",
                "حجم نمونه، نرخ پاسخ، ترکیب تقاضا/عرضه، بازۀ گردآوری - پس از پایان مرحلۀ سوم")
    t = s.shapes.add_textbox(Inches(0.75), Inches(5.65), Inches(11.85), Inches(0.95))
    tf = textframe(t)
    para(tf, "قاعدۀ تیم: هیچ گویه‌ای پیش از پایلوت حذف نمی‌شود و هیچ عددی پیش از "
             "پاک‌سازی در گزارش یا اسلاید نمی‌آید.",
         size=13, color=GRAY, first=True, space_after=0)


def slide_findings(prs):
    s = new_slide(prs, "یافته‌های نیازسنجی (این اسلاید عمداً خالی است)",
                  kicker="پس از ۳۰ مهر تکمیل می‌شود",
                  notes="صادقانه بگویید داده هنوز گردآوری نشده. سه قاب خالی را نشان "
                        "دهید و بگویید چه چیزی در آن‌ها قرار می‌گیرد. این بهتر از عدد ساختگی است.")
    frames = [
        ("نمودار ۱", "اولویت دسته‌های کالا برای ورود"),
        ("نمودار ۲", "موانع اصلی اجارۀ آنلاین"),
        ("نمودار ۳", "اهمیت ودیعه، بیمه و احراز هویت"),
    ]
    for idx, (head, sub) in enumerate(frames):
        x = 8.9 - idx * 4.05
        placeholder(s, x, 1.62, 3.75, 2.6, head, sub)

    warn = box(s, 0.85, 4.55, 11.65, 1.45, fill=RGBColor(0xFB, 0xF1, 0xE9),
               line=RED, line_w=1.25)
    tf = textframe(warn, MSO_ANCHOR.MIDDLE)
    para(tf, "تا زمان تهیۀ این نسخه هیچ پاسخی گردآوری نشده است.",
         size=17, bold=True, color=RED, first=True, space_after=4)
    para(tf, "این سه ناحیه پس از گردآوری در ۲۹/۰۷ و تحلیل در ۳۰/۰۷ با اعداد واقعی پر می‌شود. "
             "هیچ نمودار تزئینی یا عدد ساختگی جای آن‌ها نمی‌نشیند.",
         size=13, color=INK, space_after=0)

    t = s.shapes.add_textbox(Inches(0.85), Inches(6.2), Inches(11.65), Inches(0.5))
    tf = textframe(t)
    para(tf, "مرجع تکمیل: جدول ت-۲ فایل تقسیم وظایف، مراحل ۵ تا ۹.",
         size=12, color=GRAY, first=True, space_after=0)


def slide_opportunities(prs):
    s = new_slide(prs, "فرصت‌ها و چالش‌ها", kicker="فصل ۸ گزارش",
                  notes="هر فرصت را به یک ریسک وصل کنید. بگویید فرصت بدون پاسخ "
                        "عملیاتی به چالش تبدیل می‌شود.")
    card(s, 6.85, 1.6, 5.75, 4.55, "فرصت‌های کلیدی", [
        "- بازار دوطرفه بدون بازیگر کامل در ایران",
        "- رابط فارسی و راست‌به‌چپ به‌عنوان مزیت بومی",
        "- تقاضای فصلی و کوتاه‌مدت در سفر و رویداد",
        "- داده و رتبه‌بندی به‌عنوان دارایی بلندمدت",
        "- امکان همکاری با فروشگاه‌های محلی برای عرضه",
    ], fill=RGBColor(0xEA, 0xF4, 0xF0), accent=GREEN, body_size=13)

    card(s, 0.75, 1.6, 5.75, 4.55, "چالش‌ها", [
        "- مسئلۀ مرغ و تخم‌مرغ در شروع بازار دوطرفه",
        "- اعتماد و مسئولیت خسارت بین دو غریبه",
        "- عملیات تحویل و بازگشت کالا",
        "- رقابت با آگهی رایگان و بدون کارمزد",
        "- هزینه و پیچیدگی احراز هویت و ودیعه",
    ], fill=RGBColor(0xF7, 0xEE, 0xEC), accent=RED, body_size=13)

    t = s.shapes.add_textbox(Inches(0.75), Inches(6.35), Inches(11.85), Inches(0.5))
    tf = textframe(t)
    para(tf, "راهبرد فاز اول: عمق در یک دسته و یک شهر، نه گستردگی در همه دسته‌ها.",
         size=14, bold=True, color=NAVY, first=True, space_after=0)


def slide_risks(prs):
    s = new_slide(prs, "پنج ریسک اصلی و پاسخ آن‌ها", kicker="جدول ۸-۳ گزارش",
                  notes="R-01 و R-02 بحرانی‌اند. بگویید هر ریسک یک مالک مشخص دارد "
                        "و در جلسۀ هفتگی بررسی می‌شود.")
    data = [
        ["شناسه", "ریسک", "امتیاز", "سطح", "پاسخ کاهنده"],
        ["R-01", "بی‌اعتمادی به تحویل کالا به غریبه", "۲۰", "بحرانی", "احراز هویت، ودیعه، ثبت وضعیت"],
        ["R-02", "عرضۀ ناکافی در شهر اول", "۱۶", "بحرانی", "جذب دستی ۲۰ ارائه‌دهندۀ اولیه"],
        ["R-09", "تأخیر در تحویل بخش‌های مستندات", "۱۶", "بحرانی", "تقویم فشرده، جلسۀ روزانه، مالک مشخص"],
        ["R-03", "خسارت کالا و اختلاف بر مسئولیت", "۱۲", "بالا", "چک‌لیست تحویل و ودیعه"],
        ["R-04", "تقلب در پرداخت یا رزرو جعلی", "۱۲", "بالا", "محدودیت رزرو و پایش رفتار"],
    ]
    table(s, data, 0.75, 1.6, 11.85, 3.65, [1.2, 4.6, 1.1, 1.6, 5.0],
          font=12.5, header_font=12.5,
          aligns=[PP_ALIGN.CENTER, PP_ALIGN.RIGHT, PP_ALIGN.CENTER,
                  PP_ALIGN.CENTER, PP_ALIGN.RIGHT])
    t = s.shapes.add_textbox(Inches(0.75), Inches(5.5), Inches(11.85), Inches(1.1))
    tf = textframe(t)
    para(tf, "امتیاز = احتمال × اثر، در مقیاس ۱ تا ۵. سه ریسک با امتیاز ۱۵ و بالاتر "
             "در جلسۀ هفتگی پروژه بررسی می‌شوند.",
         size=12, color=GRAY, first=True, space_after=6)
    para(tf, "مالک ریسک‌های R-01 و R-03: امیررضا زارع",
         size=13, bold=True, color=NAVY, space_after=0)


def slide_requirements(prs):
    s = new_slide(prs, "نیازمندی‌های کارکردی: ۵۸ نیازمندی در ۹ گروه",
                  kicker="فصل ۹ گزارش",
                  notes="اگر پرسیدند چند مورد پیاده‌سازی شده، عدد دقیق ندهید مگر از "
                        "جدول‌های فصل ۹ خوانده باشید. برچسب وضعیت در گزارش هست.")
    groups = [
        "حساب کاربری", "کشف و جست‌وجو", "مدیریت کالا",
        "رزرو", "پرداخت", "چرخۀ سفارش",
        "نظرات", "مدیریت پلتفرم", "اعلان و پشتیبانی",
    ]
    for idx, name in enumerate(groups):
        col, row = idx % 3, idx // 3
        x = 9.15 - col * 4.0
        y = 1.6 + row * 1.45
        shp = box(s, x, y, 3.75, 1.2, fill=LIGHT)
        tf = textframe(shp, MSO_ANCHOR.MIDDLE)
        para(tf, f"{idx + 1}", size=18, bold=True, color=GOLD, first=True,
             align=PP_ALIGN.CENTER, space_after=0)
        para(tf, name, size=14, bold=True, color=NAVY, align=PP_ALIGN.CENTER,
             space_after=0)

    note = box(s, 0.75, 6.05, 11.85, 0.72, fill=RGBColor(0xE8, 0xF1, 0xEE))
    tf = textframe(note, MSO_ANCHOR.MIDDLE)
    para(tf, "هر نیازمندی شناسۀ FR و معیار پذیرش دارد و به یک نیاز بازار (RN/PN/TN/ON) ردیابی می‌شود.",
         size=13, color=GREEN, first=True, space_after=0)


def slide_tech(prs):
    s = new_slide(prs, "پشته فناوری", kicker="فصل ۱۰ گزارش",
                  notes="نسخه‌ها از فایل قفل و طرح‌واره خوانده شده‌اند. بگویید انتخاب‌ها "
                        "با دلیل در جدول ۱۰-۴ آمده است.")
    cols = [
        ("فرانت‌اند", ["Next.js ۱۶ - App Router", "React ۱۹",
                       "TypeScript ۵.۹", "Tailwind CSS ۴", "shadcn/ui روی Radix",
                       "React Hook Form + Zod"], TEAL),
        ("بک‌اند", ["NestJS ۱۱", "Prisma ۶", "PostgreSQL ۱۷",
                    "JWT و کوکی httpOnly", "Swagger در /docs"], NAVY),
        ("کیفیت", ["Jest برای آزمون واحد", "class-validator برای DTO",
                   "ESLint و TypeScript strict", "بازبینی RTL با اسکریپت پروژه"], GOLD),
    ]
    for idx, (head, lines, accent) in enumerate(cols):
        x = 8.95 - idx * 4.1
        card(s, x, 1.6, 3.8, 3.75, head, ["- " + ln for ln in lines],
             fill=LIGHT, accent=accent, head_size=18, body_size=12.5)

    t = s.shapes.add_textbox(Inches(0.75), Inches(5.65), Inches(11.85), Inches(1.0))
    tf = textframe(t)
    para(tf, "اصل انتخاب: هر فناوری باید یا هزینه نگه‌داری را کم کند یا یک نیاز "
             "کاربری مشخص را پوشش دهد. هیچ فناوری صرفاً برای تنوع انتخاب نشده است.",
         size=13, color=GRAY, first=True, space_after=0)


def slide_architecture(prs):
    s = new_slide(prs, "معماری در سه لایه", kicker="جدول ۱۰-۱ گزارش",
                  notes="از راست به چپ: مرورگر، API، داده. بگویید مرز اعتماد در API است "
                        "و هیچ کلید سروری به کلاینت نمی‌رود.")
    layers = [
        ("مرورگر کاربر", "Next.js ۱۶ با App Router، React ۱۹، Tailwind ۴، shadcn/ui",
         "رندر رابط فارسی و راست‌به‌چپ، تعامل کاربر", TEAL),
        ("API", "NestJS ۱۱ روی /api/v1، احراز هویت JWT، کنترل نقش، Swagger",
         "منطق کسب‌وکار و مرز اعتماد", NAVY),
        ("داده", "Prisma ۶ و PostgreSQL ۱۷، ۹ مدل داده، تراکنش سریال‌پذیر برای رزرو",
         "ذخیره‌سازی و جلوگیری از تداخل تاریخ", GOLD),
    ]
    for idx, (head, tech, role, accent) in enumerate(layers):
        y = 1.65 + idx * 1.55
        shp = box(s, 1.05, y, 11.2, 1.3, fill=LIGHT)
        bar = box(s, 11.9, y + 0.14, 0.09, 1.02, fill=accent, shape=MSO_SHAPE.RECTANGLE)
        bar.line.fill.background()
        tf = textframe(shp, MSO_ANCHOR.MIDDLE)
        para(tf, head, size=16, bold=True, color=accent, first=True, space_after=2)
        para(tf, tech, size=12.5, color=INK, space_after=1)
        para(tf, role, size=11, color=GRAY, space_after=0)

    t = s.shapes.add_textbox(Inches(1.05), Inches(6.35), Inches(11.2), Inches(0.5))
    tf = textframe(t)
    para(tf, "ارتباط مرورگر با API روی HTTPS و کوکی httpOnly؛ ارتباط API با پایگاه داده از طریق Prisma.",
         size=12, color=GRAY, first=True, space_after=0)


def slide_schedule(prs):
    s = new_slide(prs, "زمان‌بندی: ده روز کاری تا ارائه", kicker="فصل ۱۱ گزارش",
                  notes="مسیر بحرانی را نام ببرید: تجمیع نیازمندی‌ها، یکپارچه‌سازی و QA "
                        "هیچ شناوری ندارند. بافر دو روزه آخر را جدی بگیرید.")
    phases = [
        ("۲۵ تا ۲۹ مهر", "پژوهش و نیازها",
         "بازار، رقبا، نیازها، نیازمندی‌ها، فناوری"),
        ("۳۰ مهر تا ۱ آبان", "تدوین و یکپارچه‌سازی",
         "تجمیع، تعاریف و مراجع، کنترل کیفیت، نسخۀ آماده"),
        ("۲ تا ۵ آبان", "اسلاید، تمرین و ارائه",
         "اسلاید، دو تمرین، بافر، ارائه در ۵ آبان"),
    ]
    for idx, (when, head, body) in enumerate(phases):
        x = 8.55 - idx * 3.95
        shp = box(s, x, 1.6, 3.7, 2.5, fill=LIGHT)
        bar = box(s, x + 3.62, 1.72, 0.08, 2.26, fill=TEAL, shape=MSO_SHAPE.RECTANGLE)
        bar.line.fill.background()
        tf = textframe(shp)
        para(tf, when, size=14, bold=True, color=GOLD, first=True, space_after=4)
        para(tf, head, size=16, bold=True, color=NAVY, space_after=4)
        para(tf, body, size=11.5, color=INK, space_after=0)

    for idx, (label, pos) in enumerate([("M1: نسخۀ آمادۀ بازبینی", 8.55),
                                       ("M2: ارائه", 0.65)]):
        marker = box(s, pos + 1.35, 4.35, 1.0, 0.42, fill=NAVY,
                     shape=MSO_SHAPE.ROUNDED_RECTANGLE)
        tf = textframe(marker, MSO_ANCHOR.MIDDLE)
        para(tf, label, size=9.5, bold=True, color=WHITE, first=True,
             align=PP_ALIGN.CENTER, space_after=0)

    t = s.shapes.add_textbox(Inches(0.75), Inches(5.05), Inches(11.85), Inches(1.7))
    tf = textframe(t)
    para(tf, "مسیر بحرانی:", size=14, bold=True, color=NAVY, first=True, space_after=4)
    para(tf, "آغاز پروژه، مرور بازار و رقبا، نیازهای بازار، تجمیع نیازمندی‌ها، "
             "یکپارچه‌سازی، کنترل کیفیت، M1، اسلاید، تمرین، ارائه.",
         size=12.5, color=INK, space_after=6)
    para(tf, "هیچ شناوری برای تجمیع نیازمندی‌ها، یکپارچه‌سازی و کنترل کیفیت وجود ندارد. "
             "تأخیر در هر یک، تاریخ ارائه را جابه‌جا می‌کند.",
         size=12.5, color=RED, space_after=0)


def slide_raci(prs):
    s = new_slide(prs, "ماتریس RACI فاز اول", kicker="جدول ۱۱-۴ گزارش",
                  notes="هر فعالیت دقیقاً یک A دارد. سرگروه پاسخ‌گوی نهایی است اما "
                        "اجرای کارها توزیع شده. روی سطرهای نیازمندی‌ها و یکپارچه‌سازی مکث کنید.")
    data = [
        ["فعالیت", "محمد نعیم", "معین", "سجاد", "امیرحسین", "امیررضا", "ارشیا"],
        ["تثبیت دامنه", "A/R", "C", "C", "C", "C", "C"],
        ["بررسی بازار", "A", "R", "C", "I", "C", "I"],
        ["تحلیل رقبا", "A", "C", "R", "I", "C", "I"],
        ["نیازهای بازار", "A", "R", "C", "I", "C", "I"],
        ["جمع‌بندی اهداف", "A", "I", "I", "I", "C", "R"],
        ["فرصت‌ها و ریسک‌ها", "A", "C", "C", "C", "R", "I"],
        ["نیازمندی‌های کارکردی", "A", "C", "R", "C", "C", "C"],
        ["تکنولوژی‌ها", "A", "I", "C", "R", "C", "I"],
        ["WBS و زمان‌بندی", "A", "C", "I", "C", "R", "I"],
        ["RACI", "A", "C", "I", "I", "R", "C"],
        ["تعاریف و سرنام‌ها", "A", "C", "C", "C", "C", "R"],
        ["مراجع", "A", "R", "C", "C", "C", "C"],
        ["یکپارچه‌سازی", "A/R", "C", "C", "C", "C", "R"],
        ["کنترل کیفیت", "A", "C", "R", "R", "C", "C"],
        ["اسلاید ارائه", "A/R", "C", "C", "C", "C", "R"],
        ["ارائه", "A/R", "R", "R", "R", "R", "R"],
    ]
    table(s, data, 0.75, 1.55, 11.85, 4.95, [3.3, 1.55, 1.15, 1.15, 1.6, 1.5, 1.2],
          font=10.5, header_font=9.5,
          aligns=[PP_ALIGN.RIGHT] + [PP_ALIGN.CENTER] * 6, zebra=True)

    t = s.shapes.add_textbox(Inches(0.75), Inches(6.6), Inches(11.85), Inches(0.45))
    tf = textframe(t)
    para(tf, "R = مجری، A = پاسخ‌گوی نهایی، C = مشورت‌شده، I = مطلع.  نام کامل اعضا در فصل ۱ و جدول ۱۱-۴ آمده است.",
         size=10.5, color=GRAY, first=True, space_after=0)


def slide_tasks(prs):
    s = new_slide(prs, "تقسیم کار گردآوری داده و کارهای باقی‌مانده",
                  kicker="فایل تقسیم وظایف",
                  notes="این اسلاید پاسخ «چه کسی چه کاری می‌کند» است. اگر پرسیدند "
                        "چرا داده ندارید، بگویید گردآوری از ۲۶ مهر آغاز و در ۲۹ مهر بسته می‌شود.")
    data = [
        ["مرحله", "مسئول", "همکار", "بازه"],
        ["تثبیت پرسش‌نامه و فرم برخط", "معین نوری", "امیرحسین ترک", "۲۶/۰۷"],
        ["پایلوت و اصلاح گویه‌ها", "ارشیا احمدی", "امیررضا زارع", "۲۶ تا ۲۷/۰۷"],
        ["گردآوری سمت تقاضا", "محمد سجاد", "ارشیا احمدی", "۲۷ تا ۲۹/۰۷"],
        ["گردآوری سمت عرضه", "امیررضا زارع", "امیرحسین ترک", "۲۷ تا ۲۹/۰۷"],
        ["پیگیری پاسخ‌ها و کنترل سهمیه", "معین نوری", "محمد نعیم", "۲۷ تا ۲۹/۰۷"],
        ["پاک‌سازی و کدگذاری", "محمد سجاد", "معین نوری", "۲۹ تا ۳۰/۰۷"],
        ["تحلیل آماری", "معین نوری", "محمد سجاد", "۳۰/۰۷"],
    ]
    table(s, data, 6.85, 1.6, 5.75, 4.15, [3.1, 1.5, 1.5, 1.15],
          font=10.5, header_font=10.5,
          aligns=[PP_ALIGN.RIGHT, PP_ALIGN.RIGHT, PP_ALIGN.RIGHT, PP_ALIGN.CENTER])

    card(s, 0.75, 1.6, 5.85, 4.15, "کارهای باقی‌مانده تا ارائه", [
        "- نام استاد در صفحۀ عنوان",
        "- به‌روزرسانی فهرست مطالب و شماره صفحه",
        "- بازبینی چشمی جدول‌های عریض",
        "- نصب فونت B Nazanin روی رایانۀ ارائه",
        "- اجرای پرسش‌نامه و تکمیل جدول‌ها",
        "- خروجی PDF، تمرین نهایی و ارائه",
    ], fill=RGBColor(0xFB, 0xF1, 0xE9), accent=RED, body_size=12.5)

    t = s.shapes.add_textbox(Inches(0.75), Inches(5.95), Inches(11.85), Inches(0.85))
    tf = textframe(t)
    para(tf, "هر کار یک مسئول اصلی دارد. کارهای همکار بدون هماهنگی با مسئول اصلی شروع نمی‌شود.",
         size=12.5, color=GRAY, first=True, space_after=0)


def slide_close(prs):
    s = new_slide(prs, "جمع‌بندی", kicker="پایان ارائه",
                  notes="سه پیام را آرام بخوانید، سپس از استاد و کلاس برای پرسش دعوت کنید.")
    points = [
        ("۱", "مسئله، ریسک اعتماد است",
         "بازار عرضه و تقاضا دارد؛ چیزی که ندارد معاملۀ ایمن و کامل است."),
        ("۲", "راه‌حل، یک چرخۀ کامل است",
         "تقویم، رزرو، پرداخت، ودیعه و ثبت وضعیت، یک زنجیره‌اند و نه قابلیت‌های مستقل."),
        ("۳", "فاز اول، مبنای تصمیم است",
         "سند، نیازها و برنامه را تثبیت کرد؛ ادعای تکمیل محصول نمی‌کند."),
    ]
    for idx, (num, head, body) in enumerate(points):
        y = 1.58 + idx * 1.35
        shp = box(s, 0.95, y, 8.3, 1.15, fill=LIGHT)
        badge = box(s, 9.38, y + 0.18, 0.6, 0.79, fill=NAVY)
        tf = textframe(badge, MSO_ANCHOR.MIDDLE)
        para(tf, num, size=18, bold=True, color=WHITE, first=True,
             align=PP_ALIGN.CENTER, space_after=0)
        tf = textframe(shp, MSO_ANCHOR.MIDDLE)
        para(tf, head, size=16, bold=True, color=NAVY, first=True, space_after=2)
        para(tf, body, size=12.5, color=INK, space_after=0)

    t = s.shapes.add_textbox(Inches(0.95), Inches(5.62), Inches(8.1), Inches(0.4))
    tf = textframe(t)
    para(tf, "ممنون از توجه شما - تیم رنتینو", size=15, color=GRAY, first=True,
         space_after=0)

    q = box(s, 0.95, 6.08, 8.1, 0.78, fill=NAVY)
    tf = textframe(q, MSO_ANCHOR.MIDDLE)
    para(tf, "پرسش و پاسخ", size=20, bold=True, color=WHITE, first=True,
         align=PP_ALIGN.CENTER, space_after=0)


# ---------------------------------------------------------------------------


def build() -> None:
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H

    slide_title(prs)
    slide_agenda(prs)
    slide_problem(prs)
    slide_solution(prs)
    slide_goals(prs)
    slide_market(prs)
    slide_competitors(prs)
    slide_needs(prs)
    slide_method(prs)
    slide_findings(prs)
    slide_opportunities(prs)
    slide_risks(prs)
    slide_requirements(prs)
    slide_tech(prs)
    slide_architecture(prs)
    slide_schedule(prs)
    slide_raci(prs)
    slide_tasks(prs)
    slide_close(prs)

    prs.save(OUT)
    print(f"Wrote {OUT.name} ({OUT.stat().st_size:,} bytes)")
    print(f"slides: {len(prs.slides)}")


if __name__ == "__main__":
    build()
