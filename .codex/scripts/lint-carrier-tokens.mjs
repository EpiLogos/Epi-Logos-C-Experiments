#!/usr/bin/env node
/**
 * Coordinate: #5/S0 (carrier consumption lint — Track 00 hardening T18b / Track 30 law)
 * Residency: .codex/scripts/lint-carrier-tokens.mjs
 * Position (#n): #5 — Integration; mechanical enforcement of the carrier token discipline
 * Actualises: [[00-verification-harness-hardening]] T18 (b) — consumption lint
 *   for the M' carrier (Body/M/pratibimba-app/src): raw hex colors, raw
 *   font-size px values, and raw ms durations are permitted ONLY in the token
 *   sources — src/styles.css (CSS custom properties) and src/ui/tokens.ts
 *   (JS-side named tokens for canvas/Three.js/force-graph consumers); every
 *   other src file consuming them is a finding.
 *   T30.1 tightening: the type scale landed as the `--type-*` vocabulary, so
 *   raw font-size VALUES are findings even in styles.css — sizes enter the
 *   carrier only as `--type-*` custom-property definitions (which carry no
 *   `font-size:` prefix and so never match the rule); every `font-size:`
 *   declaration must consume a var(). ui/tokens.ts keeps the full exemption
 *   (canvas/Three.js consumers may need named numeric sizes there).
 * Public surface: RULES, TOKEN_SOURCES, TOKEN_SOURCE_ALLOWED_KINDS,
 *   TEST_FILE_RE, stripComments, scanSource, scanTree, main;
 *   CLI: node .codex/scripts/lint-carrier-tokens.mjs [--src <dir>] [--json]
 * Does NOT own: the token vocabulary itself (styles.css + ui/tokens.ts are
 *   the token sources); the boundary/header lint (lint-boundaries.mjs, T18a);
 *   suite orchestration (verify-all.mjs).
 * Contract: findings exit 1 with the exact file:line list — never a summary
 *   without the list. Comments are stripped before scanning (prose about a
 *   duration is not a consumed duration). Test files (*.test.*, *.spec.*)
 *   are EXEMPT: tests are not rendering surfaces — they assert values the
 *   system produces (e.g. a backoff message containing "1500ms", or the
 *   css string derived from a kernel scene colour); tokenising those
 *   assertions would make them tautological, not disciplined.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");
export const DEFAULT_SRC_ROOT = join(REPO_ROOT, "Body", "M", "pratibimba-app", "src");
/** The files allowed to define raw values — the token sources (srcRoot-relative,
 *  posix form): the CSS custom-property source and the JS-side token module. */
export const TOKEN_SOURCES = ["styles.css", "ui/tokens.ts"];
/** Which raw kinds each token source may still DEFINE. styles.css lost its
 *  font-size exemption when the `--type-*` scale landed (T30.1): a raw
 *  `font-size: <n>` there is drift re-entering, not a definition. */
export const TOKEN_SOURCE_ALLOWED_KINDS = {
  "styles.css": new Set(["raw-hex-color", "raw-ms-duration"]),
  "ui/tokens.ts": new Set(["raw-hex-color", "raw-ms-duration", "raw-font-size-px"]),
};
/** Test files are exempt from the consumption lint (see header Contract). */
export const TEST_FILE_RE = /\.(test|spec)\.[^./]+$/;

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"]);

/**
 * The Track-30 raw-token rules. Each match outside the token source is a
 * finding — components must consume CSS variables, not literals.
 */
export const RULES = [
  {
    kind: "raw-hex-color",
    re: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g,
  },
  {
    // CSS `font-size: 12px`, inline-style "fontSize: '12px'" and React
    // numeric `fontSize: 12` (numeric style props are implicit px).
    kind: "raw-font-size-px",
    re: /\bfont-?[sS]ize\s*:\s*["'`]?\d+(?:\.\d+)?(?:\s*px)?/g,
  },
  {
    kind: "raw-ms-duration",
    re: /\b\d+(?:\.\d+)?ms\b/g,
  },
];

/**
 * Blank out `//` line comments and `/* ... *​/` block comments while
 * preserving line structure (findings stay line-accurate). String-literal
 * bodies are kept — a hex color consumed via a string IS a finding.
 * Protocol-ish `://` sequences are not treated as comments.
 */
export function stripComments(text) {
  let out = "";
  let i = 0;
  let mode = "code"; // code | line | block | s-quote | d-quote | template
  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];
    if (mode === "code") {
      if (ch === "/" && next === "/" && text[i - 1] !== ":") {
        mode = "line";
        out += "  ";
        i += 2;
        continue;
      }
      if (ch === "/" && next === "*") {
        mode = "block";
        out += "  ";
        i += 2;
        continue;
      }
      if (ch === "'") mode = "s-quote";
      else if (ch === '"') mode = "d-quote";
      else if (ch === "`") mode = "template";
      out += ch;
      i += 1;
      continue;
    }
    if (mode === "line") {
      if (ch === "\n") {
        mode = "code";
        out += "\n";
      } else {
        out += " ";
      }
      i += 1;
      continue;
    }
    if (mode === "block") {
      if (ch === "*" && next === "/") {
        mode = "code";
        out += "  ";
        i += 2;
        continue;
      }
      out += ch === "\n" ? "\n" : " ";
      i += 1;
      continue;
    }
    // string modes — copy verbatim, honour escapes, fall back to code on close
    if (ch === "\\") {
      out += ch + (next ?? "");
      i += 2;
      continue;
    }
    if (
      (mode === "s-quote" && (ch === "'" || ch === "\n")) ||
      (mode === "d-quote" && (ch === '"' || ch === "\n")) ||
      (mode === "template" && ch === "`")
    ) {
      mode = "code";
    }
    out += ch;
    i += 1;
  }
  return out;
}

/** Scan one file's text; returns findings [{ file, line, kind, excerpt }]. */
export function scanSource(text, relPath) {
  const findings = [];
  const lines = stripComments(text).split("\n");
  lines.forEach((line, index) => {
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      for (const match of line.matchAll(rule.re)) {
        findings.push({
          file: relPath,
          line: index + 1,
          kind: rule.kind,
          excerpt: match[0],
        });
      }
    }
  });
  return findings;
}

/** Walk srcRoot; every scannable file except test files is linted. Token
 *  sources are scanned too, filtered to the kinds they may not define
 *  (TOKEN_SOURCE_ALLOWED_KINDS) — a source with no entry is fully exempt. */
export function scanTree(srcRoot, { tokenSources = TOKEN_SOURCES } = {}) {
  const findings = [];
  const permitted = new Set(tokenSources);
  const walk = (dir) => {
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      const stats = statSync(full);
      if (stats.isDirectory()) {
        if (entry === "node_modules") continue;
        walk(full);
        continue;
      }
      const rel = relative(srcRoot, full);
      const relPosix = rel.split(sep).join("/");
      if (TEST_FILE_RE.test(entry)) continue; // tests assert values, they don't render
      const ext = entry.slice(entry.lastIndexOf("."));
      if (!SCAN_EXTENSIONS.has(ext)) continue;
      let fileFindings = scanSource(readFileSync(full, "utf8"), rel);
      if (permitted.has(relPosix)) {
        const allowed = TOKEN_SOURCE_ALLOWED_KINDS[relPosix];
        if (!allowed) continue; // fully exempt definition site
        fileFindings = fileFindings.filter((f) => !allowed.has(f.kind));
      }
      findings.push(...fileFindings);
    }
  };
  walk(srcRoot);
  return findings;
}

function parseArgs(argv) {
  const opts = { srcRoot: DEFAULT_SRC_ROOT, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--src") opts.srcRoot = resolve(argv[(i += 1)]);
    else if (argv[i] === "--json") opts.json = true;
    else throw new Error(`unknown argument '${argv[i]}'`);
  }
  return opts;
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`[lint-carrier-tokens] ${err.message}`);
    process.exit(2);
  }
  const findings = scanTree(opts.srcRoot);
  if (opts.json) {
    console.log(JSON.stringify({ srcRoot: opts.srcRoot, findings }, null, 1));
  } else {
    for (const f of findings) {
      console.log(`[lint-carrier-tokens] ${f.file}:${f.line} ${f.kind} '${f.excerpt}'`);
    }
  }
  if (findings.length > 0) {
    console.error(
      `[lint-carrier-tokens] RED — ${findings.length} raw token(s) outside their definition sites ` +
        `(Track 30: raw hex/ms live ONLY in ${TOKEN_SOURCES.join(" + ")}; ` +
        `font-size enters ONLY as --type-* definitions per T30.1)`,
    );
    process.exit(1);
  }
  console.log(`[lint-carrier-tokens] GREEN — carrier consumes tokens only (token sources: ${TOKEN_SOURCES.join(" + ")})`);
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
