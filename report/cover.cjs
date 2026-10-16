/**
 * First page: the college's AAT-1 cover sheet, recreated from
 * DOC-20261015-WA0000.docx (logo, department, semester/course row,
 * topic box, USN / name / marks table, faculty signature).
 * Same grid, row heights, Cambria bold 12 pt and shading as the original.
 */
const fs = require("node:fs");
const path = require("node:path");
const {
  AlignmentType, BorderStyle, HeightRule, ImageRun, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun,
  VerticalAlign, WidthType,
} = require("docx");

const FONT = "Cambria";
const SIZE = 24; // 12 pt
const BLUE_FILL = "D3DFEE";
const BLUE_LINE = "4472C4";

// Column boundaries taken from the template's table grid (twips); total 10279.
const COLS = [977, 1019, 1002, 1030, 2287, 1530, 2434];
const span = (from, n) => COLS.slice(from, from + n).reduce((a, b) => a + b, 0);

const black = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
const blue = { style: BorderStyle.SINGLE, size: 12, color: BLUE_LINE };
const box = (b) => ({ top: b, bottom: b, left: b, right: b });

const run = (text, opts = {}) => new TextRun({ text, font: FONT, size: SIZE, bold: true, ...opts });
const para = (children, opts = {}) => new Paragraph({ children: Array.isArray(children) ? children : [run(children)], ...opts });

function cell(paragraphs, { from, n = 1, fill, align = AlignmentType.LEFT, borders = box(black) }) {
  return new TableCell({
    columnSpan: n,
    width: { size: span(from, n), type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { left: 115, right: 115, top: 0, bottom: 0 },
    shading: fill ? { type: ShadingType.CLEAR, color: "auto", fill } : undefined,
    borders,
    children: (Array.isArray(paragraphs) ? paragraphs : [paragraphs]).map((p) =>
      p instanceof Paragraph ? p : para(p, { alignment: align }),
    ),
  });
}

const row = (height, cells) => new TableRow({ height: { value: height, rule: HeightRule.EXACT }, cantSplit: true, children: cells });

/** @param {{ topic: string, logoPath: string, usn?: string, studentName?: string }} opts */
function coverPage({ topic, logoPath, usn = "", studentName = "" }) {
  const logo = new ImageRun({
    type: "jpg",
    data: fs.readFileSync(logoPath),
    transformation: { width: 590, height: 67 }, // same extent as the template (5624403 × 639971 EMU)
    altText: { title: "College logo", description: "College logo", name: path.basename(logoPath) },
  });

  const table = new Table({
    width: { size: span(0, 7), type: WidthType.DXA },
    columnWidths: COLS,
    rows: [
      row(1296, [cell(para([logo], { alignment: AlignmentType.CENTER }), { from: 0, n: 7 })]),
      row(948, [cell("Department: Computer Science and Engineering", { from: 0, n: 7 })]),
      row(1321, [cell("Academic Semester: Aug 2026– Dec 2026", { from: 0, n: 7 })]),
      row(1423, [
        cell(para([run("Semester: 7"), run("th", { superScript: true })]), { from: 0, n: 2, fill: BLUE_FILL }),
        cell("Section: B", { from: 2, n: 2, fill: BLUE_FILL }),
        cell("Course Code: 22CSE71", { from: 4, fill: BLUE_FILL }),
        cell("Course: Full Stack Technologies", { from: 5, n: 2, fill: BLUE_FILL }),
      ]),
      row(2485, [
        cell(
          [
            para("AAT1: PORTFOLIO-DRIVEN", { spacing: { after: 200 } }),
            para([run("Topic: "), run(topic, { bold: false })]),
          ],
          { from: 0, n: 7, borders: box(blue) },
        ),
      ]),
      row(1057, [
        cell("Sl. No.", { from: 0, fill: BLUE_FILL, align: AlignmentType.CENTER }),
        cell("USN", { from: 1, n: 2, fill: BLUE_FILL, align: AlignmentType.CENTER }),
        cell("Student Name", { from: 3, n: 3, fill: BLUE_FILL, align: AlignmentType.CENTER }),
        cell([para("Total", { alignment: AlignmentType.CENTER }), para("(15 marks)", { alignment: AlignmentType.CENTER })], { from: 6, fill: BLUE_FILL }),
      ]),
      row(1296, [
        cell("1.", { from: 0, align: AlignmentType.CENTER }),
        cell(usn, { from: 1, n: 2, align: AlignmentType.CENTER }),
        cell(studentName, { from: 3, n: 3, align: AlignmentType.CENTER }),
        cell("", { from: 6 }),
      ]),
    ],
  });

  return [
    table,
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 2000 },
      indent: { right: 400 },
      children: [run("Signature of Faculty", { size: 28 })],
    }),
  ];
}

module.exports = { coverPage };
