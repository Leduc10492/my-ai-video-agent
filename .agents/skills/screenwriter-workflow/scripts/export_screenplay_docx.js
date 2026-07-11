#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const FONT = "Courier New";
const SIZE = 24;

function usage() {
  console.error("Usage: export_screenplay_docx.js <script.md> <out.docx>");
  process.exit(2);
}

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) usage();

let docx;
try {
  docx = require("docx");
} catch (error) {
  console.error("Missing dependency: run `pnpm install` in the repository root before exporting DOCX.");
  process.exit(1);
}

const {
  AlignmentType,
  Document,
  Header,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
} = docx;

const markdown = fs.readFileSync(inputPath, "utf8");
const match = markdown.match(/## Screenplay\s*\n\s*```text\s*\n([\s\S]*?)\n```/);
if (!match) {
  console.error("Could not find a ## Screenplay fenced text block.");
  process.exit(1);
}

const lines = match[1].replace(/\r\n/g, "\n").split("\n");

function run(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: SIZE, ...opts });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: opts.spacing ?? { before: 0, after: 240, line: 240 },
    alignment: opts.alignment,
    indent: opts.indent,
    keepNext: opts.keepNext,
    children: [run(text, opts.run ?? {})],
  });
}

function blank() {
  return new Paragraph({
    spacing: { before: 0, after: 0, line: 240 },
    children: [run("")],
  });
}

function isSceneHeading(line) {
  return /^(INT\.|EXT\.|INT\.\/EXT\.|EXT\.\/INT\.)/.test(line);
}

function isTransition(line) {
  return /^(FADE IN:|FADE OUT\.|CUT TO:|DISSOLVE TO:|SMASH CUT TO:)$/.test(line);
}

function looksLikeCue(line, nextLine) {
  if (!nextLine) return false;
  if (isSceneHeading(line) || isTransition(line)) return false;
  if (/[。？！!?：:]$/.test(line)) return false;
  if (line.length > 24) return false;
  return true;
}

function nextNonBlank(index) {
  for (let i = index + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t) return t;
  }
  return "";
}

const children = [];
let expectDialogue = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) {
    children.push(blank());
    expectDialogue = false;
    continue;
  }

  if (isSceneHeading(line)) {
    children.push(para(line.toUpperCase(), {
      spacing: { before: 360, after: 240, line: 240 },
      keepNext: true,
      run: { bold: true },
    }));
    expectDialogue = false;
    continue;
  }

  if (isTransition(line)) {
    children.push(para(line.toUpperCase(), {
      spacing: { before: 240, after: 240, line: 240 },
      alignment: AlignmentType.RIGHT,
      run: { bold: true },
    }));
    expectDialogue = false;
    continue;
  }

  if (expectDialogue) {
    children.push(para(line, {
      spacing: { before: 0, after: 0, line: 240 },
      indent: { left: 1440, right: 2160 },
    }));
    continue;
  }

  if (looksLikeCue(line, nextNonBlank(i))) {
    children.push(para(line.toUpperCase(), {
      spacing: { before: 240, after: 0, line: 240 },
      indent: { left: 3168 },
      keepNext: true,
    }));
    expectDialogue = true;
    continue;
  }

  children.push(para(line));
  expectDialogue = false;
}

const doc = new Document({
  creator: "screenwriter-workflow",
  title: path.basename(outputPath, ".docx"),
  styles: { default: { document: { run: { font: FONT, size: SIZE } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 2160 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ children: [PageNumber.CURRENT, "."], font: FONT, size: 22 })],
        })],
      }),
    },
    children,
  }],
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
Packer.toBuffer(doc)
  .then((buf) => {
    fs.writeFileSync(outputPath, buf);
    console.log(`wrote ${outputPath}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
