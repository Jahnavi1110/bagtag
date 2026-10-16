/**
 * Builds report/AAT1_Report.docx following the AAT-1 template
 * ("AAT-1 Portfolio-Driven Development Report.pdf"): same section order,
 * headings, cover fields, table layout and grey section rules.
 *
 * Code snippets, package versions and the commit list are read from the
 * repository at build time, so the report always matches the code.
 *
 * Run: node report/build-report.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const {
  AlignmentType, BorderStyle, Document, Footer, ImageRun, LevelFormat, Packer, PageNumber,
  Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} = require("docx");

const ROOT = path.join(__dirname, "..");
const SHOTS = path.join(ROOT, "docs", "screenshots");
const OUT = path.join(__dirname, "AAT1_Report.docx");

// ---------- Cover details ----------
const COVER = {
  studentName: "____________________",
  usn: "____________________",
  semesterSection: "____________________",
  subject: "____________________",
  academicYear: "2026–27",
  projectTitle: "Tagback: Privacy-Preserving QR Bag Tags for Lost-Item Recovery",
  github: "https://github.com/Jahnavi1110/bagtag",
};

// ---------- Template typography (Letter page, ~1.08" side margins) ----------
const FONT = "Segoe UI"; // closest installed match to the template's humanist sans (Noto Sans)
const MONO = "Consolas";
const BODY = 21; // half-points → 10.5 pt
const RULE = { style: BorderStyle.SINGLE, size: 6, color: "BFBFBF", space: 8 };
const CONTENT_PX = 560; // usable width at 96 DPI (6.34 in)

// ---------- Helpers ----------
const run = (text, opts = {}) => new TextRun({ text, font: FONT, size: BODY, ...opts });
const p = (children, opts = {}) =>
  new Paragraph({ spacing: { after: 160, line: 276 }, ...opts, children: typeof children === "string" ? [run(children)] : children });
const bold = (t, opts = {}) => run(t, { bold: true, ...opts });

const title = (t, size, after = 200) => new Paragraph({ spacing: { before: 0, after }, children: [bold(t, { size })] });
const h1 = (t) => new Paragraph({ spacing: { before: 360, after: 200 }, keepNext: true, children: [bold(t, { size: 30 })] });
const h2 = (t) => new Paragraph({ spacing: { before: 240, after: 160 }, keepNext: true, children: [bold(t, { size: 24 })] });
const label = (l, value, opts = {}) =>
  new Paragraph({ spacing: { after: opts.after ?? 0 }, keepNext: opts.keepNext, children: [bold(`${l}:`, { italics: opts.italics }), run(value ? ` ${value}` : "")] });
const rule = () => new Paragraph({ spacing: { before: 120, after: 120 }, border: { bottom: RULE }, children: [] });

let listInstance = 0;
const numbered = (items) => {
  listInstance++;
  return items.map(
    (t) =>
      new Paragraph({
        numbering: { reference: "numbers", level: 0, instance: listInstance },
        spacing: { after: 100, line: 276 },
        children: Array.isArray(t) ? t : [run(t)],
      }),
  );
};

/** Lines of `file` from the first line containing `start` to the next line containing `end` (inclusive). */
function extract(file, start, end) {
  const lines = fs.readFileSync(path.join(ROOT, file), "utf8").split(/\r?\n/);
  const s = lines.findIndex((l) => l.includes(start));
  if (s < 0) throw new Error(`Snippet start not found in ${file}: ${start}`);
  const e = lines.findIndex((l, i) => i >= s && l.includes(end));
  if (e < 0) throw new Error(`Snippet end not found in ${file}: ${end}`);
  return lines.slice(s, e + 1);
}

/** A top-level function from its signature line to its closing brace at column 0. */
function functionBody(file, signature) {
  const lines = fs.readFileSync(path.join(ROOT, file), "utf8").split(/\r?\n/);
  const s = lines.findIndex((l) => l.startsWith(signature));
  const e = lines.findIndex((l, i) => i > s && l === "}");
  if (s < 0 || e < 0) throw new Error(`Function not found in ${file}: ${signature}`);
  return lines.slice(s, e + 1);
}

function codeBlock(fileLabel, lines) {
  const shade = { type: ShadingType.CLEAR, color: "auto", fill: "F3F4F6" };
  const border = { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB", space: 4 };
  return [
    new Paragraph({ spacing: { before: 60, after: 60 }, keepNext: true, children: [run(fileLabel, { italics: true, size: 18, color: "555555" })] }),
    ...lines.map(
      (l, i) =>
        new Paragraph({
          shading: shade,
          keepLines: true,
          keepNext: i < lines.length - 1, // keep each snippet on one page
          border: { left: border, right: border, ...(i === 0 ? { top: border } : {}), ...(i === lines.length - 1 ? { bottom: border } : {}) },
          spacing: { after: 0, line: 240 },
          children: [new TextRun({ text: l.length ? l : " ", font: MONO, size: 15 })],
        }),
    ),
  ];
}

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

/** Embeds a PNG sized from its pixel dimensions at 96 DPI, scaled down to fit the page width (and maxH). */
function image(file, { maxW = CONTENT_PX, maxH = 760, deviceScale = 1 } = {}) {
  const full = path.join(SHOTS, file);
  if (!fs.existsSync(full)) return p([run(`[Screenshot ${file} not found]`, { italics: true, color: "C00000" })]);
  let { w, h } = pngSize(full);
  w /= deviceScale;
  h /= deviceScale;
  const k = Math.min(1, maxW / w, maxH / h);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [
      new ImageRun({
        type: "png",
        data: fs.readFileSync(full),
        transformation: { width: Math.round(w * k), height: Math.round(h * k) },
        altText: { title: file, description: file, name: file },
      }),
    ],
  });
}

const figures = [];
function figure(caption, file, opts) {
  figures.push(caption);
  return [new Paragraph({ spacing: { before: 120, after: 80 }, keepNext: true, children: [bold(`Figure ${figures.length}: ${caption}`)] }), image(file, opts)];
}

function version(pkg) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "node_modules", pkg, "package.json"), "utf8")).version;
  } catch {
    return "";
  }
}

// Template table: rule under the header, light rules between rows, no vertical lines.
function techTable(rows) {
  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const thin = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
  const dark = { style: BorderStyle.SINGLE, size: 8, color: "000000" };
  const widths = [1000, 2700, 5440];
  const cell = (text, i, isHeader) =>
    new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      borders: { top: none, left: none, right: none, bottom: isHeader ? dark : thin },
      children: [new Paragraph({ children: [run(text, { size: 20 })] })],
    });
  return new Table({
    width: { size: 9140, type: WidthType.DXA },
    columnWidths: widths,
    borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
    rows: [
      new TableRow({ tableHeader: true, children: ["Sl. No.", "Technology / Tool", "Purpose"].map((t, i) => cell(t, i, true)) }),
      ...rows.map((r, n) => new TableRow({ cantSplit: true, children: [String(n + 1), r[0], r[1]].map((t, i) => cell(t, i, false)) })),
    ],
  });
}

// ---------- Data from the repository ----------
const commits = execSync("git log --reverse --format=%s", { cwd: ROOT, encoding: "utf8" }).trim().split("\n");
const v = (pkg) => (version(pkg) ? ` ${version(pkg)}` : "");

const TECH = [
  [`Next.js${v("next")} (App Router)`, "Full-stack React framework: pages, server actions for owner operations, route handlers for finder APIs and middleware for route protection."],
  [`React${v("react")}`, "Component-based user interface, including the live tag preview and forms."],
  [`TypeScript${v("typescript")}`, "Static typing shared by client and server code (e.g. the PublicTag type that limits what finders can see)."],
  [`Tailwind CSS${v("tailwindcss")}`, "Utility-first styling kept inside small, replaceable components."],
  [`SQLite (better-sqlite3${v("better-sqlite3")})`, "Embedded relational database stored in ./data/tagback.db, with foreign keys, CHECK constraints and indexes."],
  [`bcryptjs${v("bcryptjs")}`, "One-way hashing of owner passwords (cost factor 12)."],
  [`jose${v("jose")}`, "Signing and verifying the HS256 session JWT stored in an httpOnly cookie."],
  [`zod${v("zod")}`, "Schema validation of every form and API input (lengths, honeypot, coordinates, design)."],
  [`nanoid${v("nanoid")}`, "Random 8-character tag codes (unambiguous alphabet) and 32-character finder tokens."],
  [`qrcode${v("qrcode")}`, "Generation of the QR code that links each tag to its public page."],
  [`html-to-image${v("html-to-image")} and jsPDF${v("jspdf")}`, "Export of a tag as a 3× PNG and as a real-size PDF; A4 print sheet."],
  [`Vitest${v("vitest")}`, "Unit tests for codes, tokens, validation, rate limiting, status rules and access control."],
  [`Playwright${v("@playwright/test")} (Chromium)`, "End-to-end smoke test and automated screenshot capture."],
  ["Git and GitHub", "Version control with conventional commits; public repository hosting."],
  ["Claude Code (Anthropic)", "AI-assisted development tool used to plan, generate, test and document the project under the student's direction."],
];

// ---------- Code snippets (read from source) ----------
const SNIPPETS = [
  {
    file: "lib/auth/requireOwner.ts",
    lines: [
      "/**",
      ...extract("lib/auth/requireOwner.ts", "* ACCESS CONTROL", "return ownerScope(user.id);"),
      "}",
      "",
      "export function ownerScope(ownerId: string) {",
      "  // ...",
      ...extract("lib/auth/requireOwner.ts", "getTag(tagId: string) {", "return row ? toTag(row) : null;"),
      "    },",
      "  // ...",
      ...extract("lib/auth/requireOwner.ts", "reply(conversationId: string, body: string) {", "if (!conv) return null;"),
      "      // insert the owner's message ...",
    ],
    explanation:
      "This helper replaces database Row Level Security. requireOwner() reads the signed session cookie and redirects anonymous users to the login page. It then returns ownerScope(userId), an object whose methods are the only way owner code can touch the tags, conversations and messages tables. Every query is bound to the signed-in user's id: tags are filtered with owner_id = ?, and a conversation is reached only through a join on a tag the user owns. Because pages and server actions never write SQL themselves, a guessed tag or conversation id from another account simply returns nothing. A Vitest test creates two users and confirms that the second cannot read, reply to, change the status of or delete the first user's data.",
  },
  {
    file: "lib/tokens.ts and lib/finder.ts",
    lines: [
      ...extract("lib/tokens.ts", "export function createFinderToken", "return createHash"),
      "}",
      "",
      ...extract("lib/finder.ts", "export function startConversation", "const { token, hash } = createFinderToken();"),
      "  // ... insert conversation (finder_token_hash = hash) and the first message in one transaction",
      "  return token;",
      "}",
    ],
    explanation:
      "When a finder sends their first message, the server generates a 32-character random token with nanoid (about 190 bits of entropy). Only the SHA-256 hash of the token is written to the conversations table. The raw token is returned once, inside the private link /chat/<token>, which becomes the finder's only way back to the conversation. Later requests hash the presented token and look up the hash, so even someone holding a copy of the database cannot open a finder's chat. No name, email or IP address of the finder is stored. A unit test scans the SQLite file to confirm that the raw token never appears in it.",
  },
  {
    file: "app/api/finder/messages/route.ts",
    lines: functionBody("app/api/finder/messages/route.ts", "export async function POST"),
    explanation:
      "This route handler receives the finder's first message. The JSON body is parsed with a zod schema that enforces a 1–1000 character message, upper-cases the tag code, checks that latitude and longitude are both present and in range, and requires the hidden honeypot field 'website' to be empty (spam bots tend to fill every field). The request is then rate-limited by IP address and tag code, at 5 messages per 10 minutes, using an in-memory sliding window; a production deployment would use a shared store such as Redis. Over the limit, the handler responds with HTTP 429 and a Retry-After header. Finally it creates the conversation and returns only the private chat path; nothing about the owner is ever included in the response.",
  },
  {
    file: "lib/exportTag.ts",
    lines: [
      ...functionBody("lib/exportTag.ts", "export function tagToPng"),
      "",
      ...functionBody("lib/exportTag.ts", "export async function downloadPdf"),
    ],
    explanation:
      "Each template is drawn in the browser at 4 pixels per millimetre, so the preview has the real proportions of the printed tag. tagToPng() rasterises the preview's DOM node with html-to-image at a 3× pixel ratio, which is about 305 DPI and prints sharply. downloadPdf() creates a jsPDF document whose page size equals the template's physical size in millimetres (for example 100 × 55 mm for the luggage tag) and places the image over the whole page. Printed at 100 % scale, the result has the correct size and a scannable QR code. The orientation is set explicitly because jsPDF otherwise treats custom formats as portrait. The same function is reused to place several tags on an A4 print sheet.",
  },
];

// ---------- Document ----------
const children = [
  // Cover block
  title("ALTERNATIVE ASSESSMENT TEST – 1", 40, 280),
  title("PORTFOLIO-DRIVEN DEVELOPMENT", 30, 240),
  title("PROJECT REPORT", 24, 240),
  label("Student Name", COVER.studentName),
  label("USN", COVER.usn),
  label("Semester / Section", COVER.semesterSection, { italics: true }),
  label("Subject", COVER.subject),
  label("Academic Year", COVER.academicYear, { after: 240 }),
  label("Project Title", COVER.projectTitle, { after: 240 }),
  label("GitHub Repository Link", COVER.github),
  rule(),

  // 1
  h1("1. PROJECT TITLE"),
  label("Project Name", COVER.projectTitle, { after: 120 }),
  rule(),

  // 2
  h1("2. PROBLEM STATEMENT AND OBJECTIVES"),
  h2("Problem Statement"),
  p(
    "Personal belongings such as luggage, school bags, laptops and keys are frequently lost in airports, campuses and public transport. They are often found by honest people who have no way of contacting the owner. The common workaround, writing a phone number or email address on a tag, exposes personal data to every person who handles the item, which invites spam, fraud and, in the case of children's bags, safety risks. Commercial tracking tags depend on proprietary hardware or reveal the owner's contact details once scanned.",
  ),
  p(
    "The problem addressed by this project is therefore to provide a free and simple way for a finder to contact the owner of a lost item, and for the two to coordinate its return, without either party revealing their identity or contact details.",
  ),
  h2("Objectives"),
  ...numbered([
    "To build a web application in which owners design printable QR tags in five real-world formats (luggage tag, round sticker, keychain, school-bag label and laptop sticker) and export them as PNG and real-size PDF files.",
    "To provide a public finder page, reached by scanning the QR code, through which a finder can message the owner anonymously and optionally share their location.",
    "To relay conversations in both directions while keeping the owner's email and phone and the finder's identity hidden, using hashed one-time chat tokens and strict server-side access control.",
    "To secure and verify the system through input validation, rate limiting, spam protection and password hashing, together with automated unit and end-to-end tests.",
  ]),
  rule(),

  // 3
  h1("3. TECHNOLOGIES / TOOLS USED"),
  techTable(TECH),
  rule(),

  // 4
  h1("4. PROJECT DESCRIPTION"),
  p(
    "Tagback is a full-stack web application for privacy-preserving lost-item recovery. An owner creates an account, describes an item (name, optional photo and an optional note such as a reward), and designs a tag by choosing one of five templates, a colour and a custom text line. A live preview shows the tag at its real printed proportions with a QR code that points to the item's public page, /t/<code>, where the code is an 8-character identifier drawn from an alphabet without ambiguous characters. The tag can be downloaded as a high-resolution PNG, as a print-ready PDF at its exact size in millimetres, or together with other tags on a single A4 print sheet.",
  ),
  p(
    "When someone finds the item and scans the QR code, the public page shows only the item name, photo, note and status, with the message \"This item belongs to someone. Help return it!\". If the owner has marked the item as Lost, a prominent alert banner is shown. The finder writes a message and may opt in to sharing their browser location, which the owner sees as an OpenStreetMap link. The finder then receives a private chat link, /chat/<token>, which is the only way back to the conversation. The owner sees the message on the dashboard, where each tag shows its status badge, scan count and unread-message count, and replies from the tag's management page. At no point is the owner's email or phone shown to the finder, and the owner learns nothing about the finder beyond what the finder chooses to write.",
  ),
  p(
    "The application runs entirely on the local machine: data is stored in a SQLite database and uploaded photos in a local folder, and no external accounts or cloud services are required. The expected outcome is a working, tested prototype showing that anonymous two-way communication between owner and finder can be achieved with standard web technologies and a carefully designed data-access layer.",
  ),
  rule(),

  // 5
  h1("5. IMPLEMENTATION / METHODOLOGY"),
  p("The project was developed in five phases, each recorded as one or more conventional commits in the Git history."),
  label("Step 1", "", { keepNext: true }),
  p(
    "Project setup and authentication. A Next.js App Router project was configured with TypeScript, Tailwind CSS, ESLint and Vitest. A users table stores email addresses and bcrypt password hashes (cost 12). Sign-up, login and logout are implemented as server actions. On login, a JWT signed with HS256 by jose is stored in an httpOnly, SameSite=Lax cookie. A session secret is generated automatically into .env.local before the first run. Next.js middleware verifies the cookie and redirects signed-out visitors away from /dashboard and /tags/*. Login compares against a dummy hash for unknown emails, so response time does not reveal which emails are registered, and post-login redirects are restricted to same-site paths.",
  ),
  label("Step 2", "", { keepNext: true }),
  p(
    "Database and access control. The SQLite schema (users, tags, conversations and messages) is created automatically on first start with idempotent 'create … if not exists' statements, foreign keys with cascading deletes, CHECK constraints mirroring the validation rules, and indexes on (owner_id, created_at) and (conversation_id, created_at). In place of database Row Level Security, all owner queries were concentrated in a single helper, ownerScope(), which binds every statement to the signed-in user's id. All input is validated with zod schemas. Photo uploads are limited to 2 MB, identified by their magic bytes rather than file name, stored under random names and served through a route handler that rejects any other file name.",
  ),
  label("Step 3", "", { keepNext: true }),
  p(
    "Tag maker and export. Five template components were built at a fixed scale of 4 px per millimetre, each embedding a QR code generated by the qrcode library (error-correction level M, always black on white with a quiet zone, at least 25 mm wide). The tag-maker form updates the preview live. Export uses html-to-image at a 3× pixel ratio for PNG files and jsPDF for PDFs whose page size equals the template's physical size. A print-sheet page lays several selected tags out on A4 pages at real size with light cut lines.",
  ),
  label("Step 4", "", { keepNext: true }),
  p(
    "Finder page and anonymous relay. The public page /t/[code] reads only public columns and increments the tag's scan counter on every view. The first message is posted to /api/finder/messages, which validates the input, checks a honeypot field, applies a rate limit of 5 messages per 10 minutes per IP and tag, creates a conversation keyed by the SHA-256 hash of a fresh random token, and returns the private chat link. The finder's chat page /chat/[token] and the follow-up endpoint /api/finder/reply find the conversation by hashing the presented token. Owners reply through a server action that checks ownership, and unread counts are tracked per conversation. A global Referrer-Policy of no-referrer prevents the token from leaking to other sites.",
  ),
  label("Step 5", "", { keepNext: true }),
  p(
    "Testing, screenshots and delivery. Twenty-five Vitest unit tests cover code generation (including uniqueness over 10,000 codes), token hashing, zod schemas, the rate limiter, status transitions and owner access control on a temporary database. A Playwright smoke test logs in as the seeded demo user, creates a tag, downloads its PDF, sends a message from an anonymous browser context, replies as the owner and confirms that the reply appears in the finder's chat. An idempotent seed script creates clearly marked demo data. A screenshot script builds the app, starts it on a free port and captures every page used in this report. The README documents setup, architecture, the privacy model and design decisions. The project was originally planned around a hosted database and cloud deployment, but was deliberately changed to run fully on localhost, so deployment is listed as future work.",
  ),
  rule(),

  // 6
  h1("6. IMPORTANT CODE SNIPPETS"),
  p("The following snippets are taken directly from the repository and show the core privacy, security and export mechanisms."),
  ...SNIPPETS.flatMap((s, i) => [
    new Paragraph({ spacing: { before: 240, after: 60 }, keepNext: true, children: [bold(`Code Snippet ${i + 1}:`), run(` ${["Owner access-control helper (replaces RLS)", "Finder token creation and hashing", "Message route handler with validation and rate limiting", "Tag export function"][i]}`)] }),
    ...codeBlock(s.file, s.lines),
    new Paragraph({ spacing: { before: 160, after: 60 }, keepNext: true, children: [bold("Explanation:")] }),
    p(s.explanation),
  ]),
  rule(),

  // 7
  h1("7. OUTPUT SCREENSHOTS"),
  p("The following screenshots were captured automatically from the running application with Playwright, using the seeded demo account."),
  ...figure("Main Output: Owner dashboard listing tags with status badges, scan counts and unread messages", "dashboard.png"),
  ...figure("Tag maker with live real-scale preview (school-bag label template)", "tag-maker.png"),
  ...figure("Exported PNG of a luggage tag (3× resolution) with the embedded QR code", "tag-export.png", { maxW: 420 }),
  ...figure("Tag management page: export options, status controls and anonymous conversation with a finder", "owner-chat.png"),
  ...figure("Public finder page shown after scanning a tag", "finder-page.png"),
  ...figure("Finder page for an item reported as Lost, with the alert banner", "finder-lost.png"),
  ...figure("Finder page on a mobile phone (390 × 844)", "finder-mobile.png", { deviceScale: 2, maxH: 460 }),
  ...figure("A4 print sheet with several tags at real size", "print-sheet.png"),
  ...figure("Landing page", "landing.png"),
  ...figure("Login page", "login.png"),
  rule(),

  // 8
  h1("8. GITHUB REPOSITORY SCREENSHOT AND LINK"),
  label("GitHub Repository Link", COVER.github, { after: 120 }),
  rule(),
  new Paragraph({ spacing: { before: 120, after: 80 }, keepNext: true, children: [bold("Repository Screenshot:")] }),
  fs.existsSync(path.join(SHOTS, "github-repo.png"))
    ? image("github-repo.png", { maxW: 500 })
    : p([run("[Insert screenshot]", { italics: true })]),
  p(
    "The repository follows the standard Next.js App Router layout. The app/ folder contains only thin route files: owner pages (/dashboard and /tags/*), public pages (/t/[code] and /chat/[token]) and the finder API route handlers under app/api/. User-interface code lives in components/, with the five tag designs in components/templates/ and all forms in components/forms/. Business logic is in lib/: the database connection and schema (lib/db), authentication and the owner access-control helper (lib/auth), server actions (lib/actions), the finder service (lib/finder.ts) and small single-purpose modules for codes, tokens, rate limiting, validation and export. scripts/ holds the seed, database-reset, environment bootstrap and screenshot scripts; tests/ holds the Vitest unit tests and the Playwright smoke test; docs/screenshots/ holds the generated screenshots; and report/ holds the generator for this report.",
  ),
  p(
    "The README.md file describes the project and its problem statement, objectives and features. It includes a technology table, a Mermaid architecture diagram, the database schema, a detailed privacy model, an API route table, the project structure, setup steps (npm install, npm run seed, npm run dev), testing instructions, screenshots, design decisions, challenges, known limitations, future work and the MIT licence. It also states that the project was built with Claude Code. " +
      `The Git history uses conventional commits that follow the build phases (${[...new Set(commits.map((c) => c.split(":")[0]))].join(", ")}), starting with "${commits[0]}".`,
  ),
  rule(),

  // 9
  h1("9. CHALLENGES FACED"),
  p("The major challenges encountered during development, and how they were addressed, were as follows:"),
  ...numbered([
    [bold("Keeping the finder anonymous without database RLS. "), run("With a local SQLite database there is no row-level security. The solution was to separate the two data paths completely: owners can reach data only through ownerScope(), which binds every query to their user id, while finders use lib/finder.ts, which selects only the public fields defined by the PublicTag type. Unit tests check both boundaries, and the end-to-end test asserts that the owner's email never appears on finder pages.")],
    [bold("Exporting HTML to a print-accurate PDF. "), run("Screen pixels have no fixed physical size. Templates were therefore drawn at a fixed 4 px per millimetre, rasterised at a 3× pixel ratio (about 305 DPI) and placed on a jsPDF page whose dimensions equal the template's size in millimetres, with the orientation set explicitly so that jsPDF does not swap the custom page dimensions.")],
    [bold("QR scannability on small templates. "), run("The QR code had to stay large enough to scan on a 35 × 55 mm keychain and a 50 mm round sticker while leaving room for text. The QR is always rendered black on white with a quiet zone and error-correction level M, and is never smaller than 25 mm. In the first screenshots, the 38 mm QR on the luggage tag squeezed the text column so that the tag code wrapped onto two lines; the QR was reduced to 34 mm and the code line set to no-wrap, after which the screenshots were recaptured.")],
    [bold("Toolchain errors during the build. "), run("TypeScript 6 rejected the side-effect import of globals.css, which was fixed with a module declaration for *.css files. The jose library caused 'CompressionStream is not supported in the Edge Runtime' warnings in middleware, which was fixed by running the middleware on the Node.js runtime. npm 11 blocked the install scripts of native packages such as better-sqlite3, which were explicitly approved in package.json.")],
    [bold("Repository and test configuration. "), run("The .gitignore pattern 'uploads/' unintentionally excluded the route folder app/api/uploads, which was noticed when a commit failed and was fixed by anchoring the patterns to the repository root. The 'server-only' guard package throws outside Next.js, which broke the Vitest tests and the seed script. The database module was kept free of it and Vitest was configured to replace it with an empty stub.")],
  ]),
  rule(),

  // 10
  h1("10. LEARNING OUTCOMES AND CONCLUSION"),
  h2("Learning Outcomes"),
  p("After completing this project, I learned:"),
  ...numbered([
    "How to design privacy into a system from the start: separating public and private data paths, storing only hashes of secret tokens, and limiting exactly which fields each type of user can see.",
    "How to implement authentication and authorisation without a hosted service, using bcrypt password hashing, signed JWT session cookies, route-protecting middleware and a single owner-scoped data-access helper in place of row-level security.",
    "How to build and export print-accurate graphics in the browser by working in physical units, generating QR codes that remain scannable at small sizes, and converting HTML to PNG and real-size PDF files.",
    "How to verify a full-stack application with unit tests and an end-to-end browser test, automate screenshots, and use an AI-assisted development tool (Claude Code) effectively while reviewing and understanding the code it produced.",
  ]),
  h2("Conclusion"),
  p(
    "The project produced Tagback, a working full-stack web application that lets owners create printable QR tags in five formats and lets finders contact them through an anonymous, two-way relay. All core features were implemented and tested: authentication, the dashboard, the tag maker with live preview, PNG, PDF and A4 export, status management, the public finder page with a Lost alert and opt-in location, and the private finder chat. Neither party's identity is exposed: owners' contact details are never sent to finders, and finders are identified only by the hash of a random token. The 25 unit tests and the end-to-end smoke test pass against the local database. Planned extensions include email notifications, real-time chat and deployment to a hosted environment.",
  ),
  rule(),

  // Declaration
  h1("STUDENT DECLARATION"),
  p("I hereby declare that the project submitted as part of AAT-1 is my work and that I understand the implementation and contents of the project.", { keepNext: true }),
  label("Student Name", "____________________", { after: 280, keepNext: true }),
  label("Signature", "____________________", { after: 280, keepNext: true }),
  label("Date", "____________________"),
];

const doc = new Document({
  creator: "Tagback",
  title: "AAT-1 Project Report: Tagback",
  styles: { default: { document: { run: { font: FONT, size: BODY } } } },
  numbering: {
    config: [
      {
        reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter, as in the template
          margin: { top: 1440, bottom: 1440, left: 1560, right: 1560, footer: 708 },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: "808080" })] })],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${figures.length} figures, ${SNIPPETS.length} code snippets, ${commits.length} commits referenced)`);
});
