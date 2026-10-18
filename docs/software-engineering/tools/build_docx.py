#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build a Persian RTL DOCX from the Rentino Phase 1 Markdown report."""

import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
from docx.shared import Cm, Pt, RGBColor, Emu

BASE = Path(__file__).resolve().parents[1]
SRC = BASE / "Rentino-Phase1-Report.md"
OUT = BASE / "Rentino-Phase1-Report.docx"

FA_RE = re.compile(r"[\u0600-\u06FF\u200c]")
INLINE_RE = re.compile(r"(\*\*.+?\*\*|\*[^*\n]+?\*|`[^`\n]+?`|\[[^\]]+\]\([^)]+\))")

# WordprocessingML requires the children of w:pPr, w:sectPr and w:tblPr in a
# fixed schema order, and Word silently ignores an element that sits after one
# of its successors. Appending <w:bidi/> at the end (the previous behaviour)
# put it after <w:docGrid/> / <w:tblLook/>, so the RTL flag never took effect
# and headings, tables and the TOC rendered left to right.
PPR_BIDI_SUCCESSORS = (
    "w:adjustRightInd", "w:snapToGrid", "w:spacing", "w:ind",
    "w:contextualSpacing", "w:mirrorIndents", "w:suppressOverlap", "w:jc",
    "w:textDirection", "w:textAlignment", "w:textboxTightWrap",
    "w:outlineLvl", "w:divId", "w:cnfStyle", "w:rPr", "w:sectPr", "w:pPrChange",
)
SECTPR_BIDI_SUCCESSORS = (
    "w:rtlGutter", "w:docGrid", "w:printerSettings", "w:sectPrChange",
)
TBLPR_CELLMAR_SUCCESSORS = (
    "w:tblLook", "w:tblCaption", "w:tblDescription", "w:tblPrChange",
)


def has_fa(text: str) -> bool:
    return bool(FA_RE.search(text))


def insert_ordered(parent, child, successors):
    """Insert ``child`` before the first of ``successors`` present in ``parent``."""
    for tag in successors:
        found = parent.find(qn(tag))
        if found is not None:
            found.addprevious(child)
            return child
    parent.append(child)
    return child


def ensure_bidi(ppr):
    """Add <w:bidi/> to a w:pPr element at its schema-mandated position."""
    if ppr.find(qn("w:bidi")) is None:
        insert_ordered(ppr, parse_xml(f"<w:bidi {nsdecls('w')}/>"),
                       PPR_BIDI_SUCCESSORS)


def set_run_fonts(run, mono=False, size_latin=None, size_cs=None):
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.insert(0, rFonts)
    if mono:
        rFonts.set(qn("w:ascii"), "Consolas")
        rFonts.set(qn("w:hAnsi"), "Consolas")
        rFonts.set(qn("w:cs"), "B Nazanin")
        rFonts.set(qn("w:eastAsia"), "Consolas")
    else:
        rFonts.set(qn("w:ascii"), "Times New Roman")
        rFonts.set(qn("w:hAnsi"), "Times New Roman")
        rFonts.set(qn("w:cs"), "B Nazanin")
        rFonts.set(qn("w:eastAsia"), "Times New Roman")

    latin_pt = size_latin if size_latin is not None else 11
    cs_pt = size_cs if size_cs is not None else 13
    run.font.size = Pt(latin_pt)
    szCs = rPr.find(qn("w:szCs"))
    if szCs is None:
        szCs = OxmlElement("w:szCs")
        rPr.append(szCs)
    szCs.set(qn("w:val"), str(int(cs_pt * 2)))
    if has_fa(run.text):
        run.font.rtl = True


def add_run(paragraph, text, bold=False, italic=False, mono=False,
            size_latin=None, size_cs=None, color=None):
    run = paragraph.add_run(text)
    run.bold = bold
    run.italic = italic
    set_run_fonts(run, mono=mono, size_latin=size_latin, size_cs=size_cs)
    if color is not None:
        run.font.color.rgb = color
    return run


def add_inline(paragraph, text, size_latin=None, size_cs=None, bold_all=False):
    text = text.replace("<br>", "\n").replace("<br/>", "\n").replace("<br />", "\n")
    parts = INLINE_RE.split(text)
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**") and len(part) > 4:
            add_run(paragraph, part[2:-2], bold=True, size_latin=size_latin, size_cs=size_cs)
        elif part.startswith("`") and part.endswith("`") and len(part) > 2:
            add_run(paragraph, part[1:-1], mono=True, size_latin=9, size_cs=10)
        elif part.startswith("*") and part.endswith("*") and len(part) > 2:
            add_run(paragraph, part[1:-1], italic=True, size_latin=size_latin, size_cs=size_cs)
        elif part.startswith("[") and "](" in part and part.endswith(")"):
            label, url = part[1:-1].split("](", 1)
            add_run(paragraph, label, bold=bold_all, size_latin=size_latin, size_cs=size_cs)
            if url and url != label:
                add_run(paragraph, f" ({url})", size_latin=max((size_latin or 11) - 2, 7),
                        size_cs=max((size_cs or 13) - 2, 8), color=RGBColor(0x44, 0x44, 0x44))
        else:
            add_run(paragraph, part, bold=bold_all, size_latin=size_latin, size_cs=size_cs)


def set_para_rtl(p, align="right", bidi=True):
    pPr = p._p.get_or_add_pPr()
    if bidi:
        ensure_bidi(pPr)
    else:
        # Normal carries <w:bidi/>; an explicit val="0" is required to switch
        # it off for the Latin-only code blocks.
        existing = pPr.find(qn("w:bidi"))
        if existing is None:
            el = parse_xml(f'<w:bidi {nsdecls("w")} w:val="0"/>')
            insert_ordered(pPr, el, PPR_BIDI_SUCCESSORS)
    if align == "center":
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif align == "justify":
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    elif align == "left":
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    else:
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT


def set_cell_shading(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="{fill}"/>'))


def set_repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:tblHeader")
    el.set(qn("w:val"), "true")
    trPr.append(el)


def add_toc_field(paragraph):
    run = paragraph.add_run()
    fld = OxmlElement("w:fldChar")
    fld.set(qn("w:fldCharType"), "begin")
    fld.set(qn("w:dirty"), "true")
    run._r.append(fld)

    run2 = paragraph.add_run()
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = ' TOC \\o "1-3" \\h \\z \\u '
    run2._r.append(instr)

    run3 = paragraph.add_run()
    fld2 = OxmlElement("w:fldChar")
    fld2.set(qn("w:fldCharType"), "separate")
    run3._r.append(fld2)

    add_run(paragraph, "برای به‌روزرسانی فهرست، کلید F9 را فشار دهید.", size_latin=11, size_cs=13)

    run5 = paragraph.add_run()
    fld3 = OxmlElement("w:fldChar")
    fld3.set(qn("w:fldCharType"), "end")
    run5._r.append(fld3)


def add_page_field(paragraph):
    run = paragraph.add_run()
    fld = OxmlElement("w:fldChar")
    fld.set(qn("w:fldCharType"), "begin")
    run._r.append(fld)
    run2 = paragraph.add_run()
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    run2._r.append(instr)
    run3 = paragraph.add_run()
    fld2 = OxmlElement("w:fldChar")
    fld2.set(qn("w:fldCharType"), "separate")
    run3._r.append(fld2)
    add_run(paragraph, "1", size_latin=11, size_cs=12)
    run5 = paragraph.add_run()
    fld3 = OxmlElement("w:fldChar")
    fld3.set(qn("w:fldCharType"), "end")
    run5._r.append(fld3)


def add_numpages_field(paragraph):
    run = paragraph.add_run()
    fld = OxmlElement("w:fldChar")
    fld.set(qn("w:fldCharType"), "begin")
    run._r.append(fld)
    run2 = paragraph.add_run()
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " NUMPAGES "
    run2._r.append(instr)
    run3 = paragraph.add_run()
    fld2 = OxmlElement("w:fldChar")
    fld2.set(qn("w:fldCharType"), "separate")
    run3._r.append(fld2)
    add_run(paragraph, "1", size_latin=11, size_cs=12)
    run5 = paragraph.add_run()
    fld3 = OxmlElement("w:fldChar")
    fld3.set(qn("w:fldCharType"), "end")
    run5._r.append(fld3)


def configure_styles(doc):
    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "B Nazanin"
    normal.font.size = Pt(13)
    rPr = normal.element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.insert(0, rFonts)
    rFonts.set(qn("w:ascii"), "Times New Roman")
    rFonts.set(qn("w:hAnsi"), "Times New Roman")
    rFonts.set(qn("w:cs"), "B Nazanin")
    rFonts.set(qn("w:eastAsia"), "Times New Roman")
    szCs = rPr.find(qn("w:szCs"))
    if szCs is None:
        szCs = OxmlElement("w:szCs")
        rPr.append(szCs)
    szCs.set(qn("w:val"), "26")
    lang = rPr.find(qn("w:lang"))
    if lang is None:
        lang = OxmlElement("w:lang")
        rPr.append(lang)
    lang.set(qn("w:val"), "en-US")
    lang.set(qn("w:bidi"), "fa-IR")

    pPr = normal.element.get_or_add_pPr()
    ensure_bidi(pPr)
    # 1.4 keeps the text readable while removing the extra blank space that a
    # 1.5 setting adds to every one of the ~900 paragraphs in this report.
    normal.paragraph_format.line_spacing = 1.4
    normal.paragraph_format.space_after = Pt(3)
    normal.paragraph_format.space_before = Pt(0)

    heading_specs = {
        "Heading 1": (18, 18, 14, 8),
        "Heading 2": (16, 16, 10, 6),
        "Heading 3": (14, 14, 8, 4),
        "Heading 4": (12, 12, 6, 3),
    }
    for name, (sz, sz_cs, before, after) in heading_specs.items():
        st = styles[name]
        st.font.name = "B Nazanin"
        st.font.size = Pt(sz)
        st.font.bold = True
        st.font.color.rgb = RGBColor(0, 0, 0)
        rPr = st.element.get_or_add_rPr()
        rFonts = rPr.find(qn("w:rFonts"))
        if rFonts is None:
            rFonts = OxmlElement("w:rFonts")
            rPr.insert(0, rFonts)
        rFonts.set(qn("w:ascii"), "Times New Roman")
        rFonts.set(qn("w:hAnsi"), "Times New Roman")
        rFonts.set(qn("w:cs"), "B Nazanin")
        rFonts.set(qn("w:eastAsia"), "Times New Roman")
        szCs = rPr.find(qn("w:szCs"))
        if szCs is None:
            szCs = OxmlElement("w:szCs")
            rPr.append(szCs)
        szCs.set(qn("w:val"), str(int(sz_cs * 2)))
        st.paragraph_format.space_before = Pt(before)
        st.paragraph_format.space_after = Pt(after)
        st.paragraph_format.keep_with_next = True
        st.paragraph_format.page_break_before = False
        ensure_bidi(st.element.get_or_add_pPr())
        rPr_h = st.element.get_or_add_rPr()
        if rPr_h.find(qn("w:rtl")) is None:
            rPr_h.append(parse_xml(f"<w:rtl {nsdecls('w')}/>"))

    configure_toc_styles(styles)
    for sname in ("Header", "Footer"):
        try:
            st = styles[sname]
        except KeyError:
            continue
        ensure_bidi(st.element.get_or_add_pPr())


def configure_toc_styles(styles):
    """Define TOC 1-3 with bidi and RTL tab leaders.

    Word rebuilds the table of contents from these styles whenever the field is
    updated.  Without explicit definitions it falls back to its built-in LTR
    styles, which is why the regenerated entries started at the left margin.
    """
    from docx.enum.style import WD_STYLE_TYPE
    from docx.enum.text import WD_TAB_ALIGNMENT, WD_TAB_LEADER

    for level, (sz_cs, indent_cm) in enumerate(((13, 0.0), (12.5, 0.6), (12, 1.2)), start=1):
        name = f"TOC {level}"
        try:
            st = styles[name]
        except KeyError:
            st = styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
            st.base_style = styles["Normal"]
        st.font.name = "B Nazanin"
        st.font.size = Pt(sz_cs)
        st.font.color.rgb = RGBColor(0, 0, 0)
        rPr = st.element.get_or_add_rPr()
        rFonts = rPr.find(qn("w:rFonts"))
        if rFonts is None:
            rFonts = OxmlElement("w:rFonts")
            rPr.insert(0, rFonts)
        rFonts.set(qn("w:ascii"), "Times New Roman")
        rFonts.set(qn("w:hAnsi"), "Times New Roman")
        rFonts.set(qn("w:cs"), "B Nazanin")
        szCs = rPr.find(qn("w:szCs"))
        if szCs is None:
            szCs = OxmlElement("w:szCs")
            rPr.append(szCs)
        szCs.set(qn("w:val"), str(int(sz_cs * 2)))
        if rPr.find(qn("w:rtl")) is None:
            rPr.append(parse_xml(f"<w:rtl {nsdecls('w')}/>"))

        pPr = st.element.get_or_add_pPr()
        ensure_bidi(pPr)
        pf = st.paragraph_format
        pf.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        pf.space_before = Pt(2)
        pf.space_after = Pt(2)
        pf.line_spacing = 1.0
        pf.right_indent = Cm(indent_cm)
        # In a bidi paragraph the tab positions are measured from the right
        # edge, so this places the page number at the left margin.
        pf.tab_stops.add_tab_stop(Cm(15.6), WD_TAB_ALIGNMENT.LEFT,
                                  WD_TAB_LEADER.DOTS)


def configure_section(doc):
    sec = doc.sections[0]
    sec.page_width = Cm(21.0)
    sec.page_height = Cm(29.7)
    sec.top_margin = Cm(3.0)
    sec.bottom_margin = Cm(2.5)
    sec.left_margin = Cm(2.5)
    sec.right_margin = Cm(2.5)
    sec.header_distance = Cm(1.5)
    sec.footer_distance = Cm(1.5)

    sectPr = sec._sectPr
    if sectPr.find(qn("w:bidi")) is None:
        insert_ordered(sectPr, parse_xml(f"<w:bidi {nsdecls('w')}/>"),
                       SECTPR_BIDI_SUCCESSORS)

    header = sec.header
    hp = header.paragraphs[0]
    set_para_rtl(hp, align="right")
    add_run(hp, "رنتینو: گزارش فاز اول پروژهٔ مهندسی نرم‌افزار", size_latin=9, size_cs=10,
            color=RGBColor(0x66, 0x66, 0x66))

    footer = sec.footer
    fp = footer.paragraphs[0]
    set_para_rtl(fp, align="center")
    add_run(fp, "صفحهٔ ", size_latin=10, size_cs=11)
    add_page_field(fp)
    add_run(fp, " از ", size_latin=10, size_cs=11)
    add_numpages_field(fp)


def add_heading(doc, text, level, page_break=False):
    p = doc.add_paragraph(style=f"Heading {level}")
    if page_break:
        p.paragraph_format.page_break_before = True
    set_para_rtl(p, align="right")
    add_run(p, text, bold=True,
            size_latin={1: 18, 2: 16, 3: 14, 4: 12}.get(level, 12),
            size_cs={1: 18, 2: 16, 3: 14, 4: 12}.get(level, 12))
    return p


def add_body(doc, text, align="justify"):
    p = doc.add_paragraph()
    set_para_rtl(p, align=align)
    add_inline(p, text, size_latin=11, size_cs=13)
    return p


def add_bullet(doc, text, level=0):
    p = doc.add_paragraph()
    set_para_rtl(p, align="right")
    p.paragraph_format.right_indent = Cm(0.6 + 0.5 * level)
    p.paragraph_format.first_line_indent = Cm(-0.4)
    # "-" instead of "•": B Nazanin has no bullet glyph (U+2022 is absent),
    # so Word would substitute another font and break the line.
    add_run(p, "- ", size_latin=12, size_cs=13)
    add_inline(p, text, size_latin=11, size_cs=13)
    return p


def add_numbered(doc, text):
    p = doc.add_paragraph()
    set_para_rtl(p, align="right")
    p.paragraph_format.right_indent = Cm(0.6)
    add_inline(p, text, size_latin=11, size_cs=13)
    return p


def add_quote(doc, text):
    p = doc.add_paragraph()
    set_para_rtl(p, align="right")
    p.paragraph_format.right_indent = Cm(0.8)
    p.paragraph_format.left_indent = Cm(0.8)
    add_inline(p, text, size_latin=10, size_cs=12)
    for r in p.runs:
        r.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
        r.italic = True
    return p


def add_caption(doc, text):
    p = doc.add_paragraph()
    set_para_rtl(p, align="center")
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(3)
    add_inline(p, text, size_latin=11, size_cs=12, bold_all=True)
    return p


def tiny_run(paragraph):
    """Add a 2 pt run so an empty spacer paragraph collapses to almost nothing."""
    run = paragraph.add_run("")
    run.font.size = Pt(2)
    rPr = run._element.get_or_add_rPr()
    szCs = OxmlElement("w:szCs")
    szCs.set(qn("w:val"), "4")
    rPr.append(szCs)
    return paragraph


def add_table(doc, rows, title_mode=False):
    if not rows:
        return
    ncols = max(len(r) for r in rows)
    normalized = [r + [""] * (ncols - len(r)) for r in rows]

    table = doc.add_table(rows=len(normalized), cols=ncols)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True

    tblPr = table._tbl.tblPr
    # python-docx inserts bidiVisual in its schema position; appending it used
    # to leave the element after <w:tblLook/>, where Word ignores it and draws
    # the columns in LTR order.
    tblPr.get_or_add_bidiVisual()
    tblW = tblPr.find(qn("w:tblW"))
    if tblW is None:
        tblW = OxmlElement("w:tblW")
        tblPr.append(tblW)
    tblW.set(qn("w:w"), "5000")
    tblW.set(qn("w:type"), "pct")

    # narrow cell padding: the default 108 twips on each side is wasteful in a
    # document that holds 77 tables.
    cell_mar = OxmlElement("w:tblCellMar")
    for side in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{side}")
        el.set(qn("w:w"), "50")
        el.set(qn("w:type"), "dxa")
        cell_mar.append(el)
    insert_ordered(tblPr, cell_mar, TBLPR_CELLMAR_SUCCESSORS)

    for r_idx, row in enumerate(normalized):
        tr = table.rows[r_idx]
        for c_idx, text in enumerate(row):
            cell = tr.cells[c_idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            set_para_rtl(p, align="center" if (r_idx == 0 or title_mode) else "right")
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.line_spacing = 1.0
            add_inline(p, text, size_latin=9, size_cs=10.5, bold_all=(r_idx == 0))
            if r_idx == 0 and not title_mode:
                set_cell_shading(cell, "E7E6E6")
        if r_idx == 0 and not title_mode:
            set_repeat_header(tr)

    # A full-height empty paragraph after each of the 77 tables costs a page or
    # two across the document, so the gap is kept but made as small as possible.
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_after = Pt(0)
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.line_spacing = 1.0
    tiny_run(spacer)


def add_code_block(doc, lines):
    for line in lines:
        p = doc.add_paragraph()
        rtl = has_fa(line)
        set_para_rtl(p, align="right" if rtl else "left", bidi=rtl)
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.right_indent = Cm(0.4)
        p.paragraph_format.left_indent = Cm(0.4)
        add_run(p, line if line else " ", mono=not rtl,
                size_latin=8.5, size_cs=10)
        pPr = p._p.get_or_add_pPr()
        insert_ordered(
            pPr,
            parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="F2F2F2"/>'),
            ("w:tabs", "w:suppressAutoHyphens", "w:kinsoku", "w:wordWrap",
             "w:overflowPunct", "w:topLinePunct", "w:autoSpaceDE",
             "w:autoSpaceDN", "w:bidi") + PPR_BIDI_SUCCESSORS,
        )
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_after = Pt(0)
    tiny_run(spacer)


def parse_md_table(lines):
    rows = []
    for line in lines:
        s = line.strip()
        if not s.startswith("|"):
            continue
        # separator row
        if re.fullmatch(r"\|[\s:\-|]+\|", s):
            continue
        parts = [c.strip() for c in s.strip("|").split("|")]
        rows.append(parts)
    return rows


def main(src=SRC, out=OUT):
    text = src.read_text(encoding="utf-8")
    lines = text.splitlines()

    doc = Document()
    configure_styles(doc)
    configure_section(doc)

    # ensure fields update on open
    settings = doc.settings.element
    update = settings.find(qn("w:updateFields"))
    if update is None:
        update = OxmlElement("w:updateFields")
        settings.append(update)
    update.set(qn("w:val"), "true")

    i = 0
    in_title = True
    first_h1 = True
    title_done = False

    while i < len(lines):
        raw = lines[i]
        line = raw.rstrip()
        stripped = line.strip()

        # HTML scaffolding
        if stripped.startswith("<div") or stripped.startswith("</div"):
            i += 1
            continue
        if stripped == "<br>":
            doc.add_paragraph()
            i += 1
            continue

        # code blocks
        if stripped.startswith("```"):
            i += 1
            code = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code.append(lines[i].rstrip("\n"))
                i += 1
            i += 1
            add_code_block(doc, code)
            continue

        # tables
        if stripped.startswith("|"):
            block = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                block.append(lines[i])
                i += 1
            rows = parse_md_table(block)
            if rows:
                add_table(doc, rows, title_mode=in_title)
            continue

        # title page handling
        if in_title:
            if stripped == "# صفحهٔ عنوان":
                i += 1
                continue
            if stripped.startswith("# چکیده"):
                in_title = False
                doc.add_page_break()
                add_heading(doc, "چکیده", 1)
                first_h1 = False
                i += 1
                continue
            if stripped.startswith("# "):
                p = doc.add_paragraph()
                set_para_rtl(p, align="center")
                p.paragraph_format.space_before = Pt(24)
                p.paragraph_format.space_after = Pt(10)
                add_run(p, stripped[2:], bold=True, size_latin=26, size_cs=28)
                title_done = True
                i += 1
                continue
            if stripped.startswith("## "):
                p = doc.add_paragraph()
                set_para_rtl(p, align="center")
                p.paragraph_format.space_after = Pt(8)
                add_run(p, stripped[3:], bold=True, size_latin=16, size_cs=18)
                i += 1
                continue
            if stripped == "---":
                i += 1
                continue
            if not stripped:
                i += 1
                continue
            # centered title-page line
            p = doc.add_paragraph()
            set_para_rtl(p, align="center")
            p.paragraph_format.space_after = Pt(4)
            add_inline(p, stripped, size_latin=12, size_cs=14, bold_all=True)
            i += 1
            continue

        # headings
        if stripped.startswith("# "):
            if stripped == "# فهرست مطالب":
                add_heading(doc, "فهرست مطالب", 1, page_break=not first_h1)
                first_h1 = False
                toc_p = doc.add_paragraph()
                set_para_rtl(toc_p, align="right")
                add_toc_field(toc_p)
                # skip manual TOC contents until next H1
                i += 1
                while i < len(lines) and not lines[i].startswith("# "):
                    i += 1
                continue
            add_heading(doc, stripped[2:], 1, page_break=not first_h1)
            first_h1 = False
            i += 1
            continue
        if stripped.startswith("## "):
            add_heading(doc, stripped[3:], 2)
            i += 1
            continue
        if stripped.startswith("### "):
            add_heading(doc, stripped[4:], 3)
            i += 1
            continue
        if stripped.startswith("#### "):
            add_heading(doc, stripped[5:], 4)
            i += 1
            continue

        # horizontal rule
        if stripped == "---":
            i += 1
            continue

        # blockquote
        if stripped.startswith(">"):
            add_quote(doc, stripped.lstrip(">").strip())
            i += 1
            continue

        # bullets
        if re.match(r"^[-*]\s+", stripped):
            content = re.sub(r"^[-*]\s+", "", stripped)
            indent = len(raw) - len(raw.lstrip(" "))
            add_bullet(doc, content, level=1 if indent >= 2 else 0)
            i += 1
            continue

        # numbered lists (keep explicit number)
        if re.match(r"^\d+[.)]\s+", stripped):
            add_numbered(doc, stripped)
            i += 1
            continue

        # captions
        if stripped.startswith("**جدول") or stripped.startswith("**شکل"):
            add_caption(doc, stripped)
            i += 1
            continue

        # blank
        if not stripped:
            i += 1
            continue

        # normal paragraph
        add_body(doc, stripped)
        i += 1

    # document core properties
    doc.core_properties.title = "رنتینو: گزارش فاز اول پروژهٔ مهندسی نرم‌افزار"
    doc.core_properties.subject = "بررسی بازار، تحلیل رقبا، نیازمندی‌ها و برنامهٔ پروژه"
    doc.core_properties.author = "تیم رنتینو"
    doc.core_properties.language = "fa-IR"

    out.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(out))
    print(f"Wrote {out} ({out.stat().st_size:,} bytes)")
    validate(out)


# Code points B Nazanin does not define (verified by parsing the font's cmap).
MISSING_IN_FONT = {
    "ٔ": "همزهٔ ترکیبی",
    "٪": "درصد عربی",
    "٫": "ممیز عربی",
    "٬": "جداکنندهٔ هزارگان",
    "–": "خط تیرهٔ کوتاه",
    "—": "خط تیرهٔ بلند",
    "…": "سه‌نقطه",
    "•": "گلوله",
    "→": "فلش راست",
    "↔": "فلش دوسویه",
    "─": "خط جعبه",
    "│": "خط عمودی جعبه",
    "✔": "علامت تیک",
    "▼": "مثلث",
    " ": "فاصلهٔ نشکن",
    "​": "فاصلهٔ صفر",
}


def validate(path):
    """Fail loudly if a glyph the chosen font cannot draw survived into the DOCX."""
    import zipfile

    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf-8")

    text = re.sub(r"<[^>]+>", "", xml)
    found = {}
    for ch, name in MISSING_IN_FONT.items():
        n = text.count(ch)
        if n:
            found[ch] = (name, n)

    if found:
        print("GLYPH CHECK: FAILED")
        for ch, (name, n) in found.items():
            print(f"  U+{ord(ch):04X} {name}: {n}")
        raise SystemExit(3)
    print("glyph check: ok (no character outside the B Nazanin coverage)")


if __name__ == "__main__":
    main()
