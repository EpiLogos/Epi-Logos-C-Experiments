#!/usr/bin/env node
/**
 * Coordinate: #5/S0 (anti-fraud test lint — Track 00.T3, cycle-3 full rerun)
 * Residency: .codex/scripts/lint-test-honesty.mjs
 * Position (#n): #5 — Integration; the mechanical enforcement of "behavioral proof only"
 * Actualises: [[00-verification-harness]] T3 + charter Verification-law §3 —
 *   cycle 3 died of tests that asserted contract strings instead of running
 *   systems; this lint REJECTS test blocks whose only assertions are
 *   source-greps, file-existence, manifest/JSON-literal matches, or
 *   test-counts, and REJECTS ledger evidence carrying the banned classes
 *   ("design only", "deferred", "direct close", file-existence);
 *   [[00-verification-harness-hardening]] T16 — language-aware reach: Rust
 *   (assert!(true), self-equal assert_eq!, blanket #[ignore] without a
 *   reason), Python (bare `assert True`, skip without reason), and C
 *   (literal-true assert) across the backend + gnostic + epi-lib trees.
 * Public surface: classifyTestBlocks, lintTestFile, lintEvidenceString,
 *   lintPlanEvidence, BANNED_EVIDENCE_PATTERNS, collectTestFiles,
 *   lintRustSource, lintPythonSource, lintCSource, collectPolyglotFiles,
 *   POLYGLOT_ROOTS, main;
 *   CLI: node .codex/scripts/lint-test-honesty.mjs [--evidence-only|--tests-only]
 * Does NOT own: what counts as a suite (verify-all.mjs); the plan ledger
 *   write path (m-dev-plan-assess.mjs).
 * Contract: allowlisted structural checks live in
 *   .codex/scripts/test-honesty-allowlist.json — every entry MUST carry a
 *   justification line; an unjustified entry is itself a lint failure.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");
const ALLOWLIST_PATH = join(SCRIPT_DIR, "test-honesty-allowlist.json");
const PLAN_STATE_PATH = join(
  REPO_ROOT,
  "Idea", "Bimba", "Seeds", "M", "Legacy", "plans",
  "2026-07-03-m-prime-cycle-3-full-rerun", "plan.state.json",
);

/** Test roots the lint sweeps: the app corpus + every rerun-added test tree. */
export const TEST_ROOTS = [
  join(REPO_ROOT, "Body", "M", "pratibimba-app", "src"),
  join(REPO_ROOT, "Body", "M", "pratibimba-app", "scripts"),
  join(REPO_ROOT, "Body", "M", "pratibimba-app", "tests"),
  join(SCRIPT_DIR, "__tests__"),
];

const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx|mjs|js)$/;

// --- evidence lint -----------------------------------------------------------

/** The charter's banned evidence classes (Verification law §3). */
export const BANNED_EVIDENCE_PATTERNS = [
  /\bdesign[- ]only\b/i,
  /\bdeferred\b/i,
  /\bdirect[- ]close\b/i,
  /\bfile[- ]exist(s|ence)\b/i,
  /\bgrep (shows|proves|confirms)\b/i,
  /\bmanifest (string|text) (is )?present\b/i,
  /\bno verification needed\b/i,
];

export function lintEvidenceString(evidence) {
  const text = String(evidence ?? "");
  for (const pattern of BANNED_EVIDENCE_PATTERNS) {
    if (pattern.test(text)) {
      return { ok: false, reason: `banned evidence class ${pattern}` };
    }
  }
  return { ok: true, reason: null };
}

export function lintPlanEvidence(statePath = PLAN_STATE_PATH) {
  if (!existsSync(statePath)) return [];
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  const findings = [];
  for (const [taskId, task] of Object.entries(state.tasks ?? {})) {
    if (task.status !== "done") continue;
    for (const entry of task.evidence ?? []) {
      const text = typeof entry === "string" ? entry : JSON.stringify(entry);
      const verdict = lintEvidenceString(text);
      if (!verdict.ok) {
        findings.push({ taskId, evidence: text, reason: verdict.reason });
      }
    }
  }
  return findings;
}

// --- test-file lint ----------------------------------------------------------

const TEST_OPEN_RE = /\b(?:it|test)(?:\.(?:each|only|skip|concurrent)(?:\([^)]*\))?)?\s*\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g;

/** Split a test source file into named test blocks (vitest + node:test). */
export function classifyTestBlocks(source) {
  const blocks = [];
  const matches = [...source.matchAll(TEST_OPEN_RE)];
  matches.forEach((match, index) => {
    const start = match.index;
    const end = index + 1 < matches.length ? matches[index + 1].index : source.length;
    blocks.push({ name: match[2], body: source.slice(start, end) });
  });
  return blocks;
}

/** Identifiers assigned from fs-content reads inside a block. */
function fsDerivedIdentifiers(body) {
  const names = new Set();
  for (const match of body.matchAll(
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:await\s+)?(?:fs\.)?(?:readFileSync|readFile|readdirSync|readdir)\s*\(/g,
  )) {
    names.add(match[1]);
  }
  return names;
}

const ASSERTION_LINE_RE = /\bexpect\s*\(|\bassert(?:\.\w+)?\s*\(/;

function classifyAssertionLine(line, fsVars) {
  if (/\bexistsSync\s*\(|\bexists\s*\(\s*['"`]/.test(line)) {
    return "file-existence assertion";
  }
  const referencesFsContent =
    /\breadFileSync|\breaddirSync\b/.test(line) ||
    [...fsVars].some((name) => new RegExp(`\\b${name}\\b`).test(line));
  if (referencesFsContent) {
    if (/\.length\s*\)|\.length\s*[,)=<>]/.test(line)) {
      return "test-count/file-count assertion";
    }
    if (/toContain|toMatch|includes\s*\(|toEqual|toBe\b|match\s*\(/.test(line)) {
      return "source-grep/file-content assertion";
    }
  }
  return null;
}

function loadAllowlist(path = ALLOWLIST_PATH) {
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf8"));
}

function allowlisted(allowlist, file, testName) {
  const entry = allowlist.find(
    (candidate) =>
      (file.endsWith(candidate.file) || candidate.file === file) &&
      candidate.test === testName,
  );
  if (!entry) return false;
  if (!entry.justification || !String(entry.justification).trim()) {
    throw new Error(
      `allowlist entry for '${testName}' (${entry.file}) has no justification — every structural exemption must say why`,
    );
  }
  return true;
}

/**
 * Lint one test file: a test block is rejected when it contains at least one
 * assertion and ALL of its assertions are of the banned structural classes.
 */
export function lintTestFile(file, { allowlist = loadAllowlist() } = {}) {
  const source = readFileSync(file, "utf8");
  const findings = [];
  for (const block of classifyTestBlocks(source)) {
    const fsVars = fsDerivedIdentifiers(block.body);
    const assertionLines = block.body
      .split("\n")
      .filter((line) => ASSERTION_LINE_RE.test(line));
    if (assertionLines.length === 0) continue;
    const classifications = assertionLines.map((line) =>
      classifyAssertionLine(line, fsVars),
    );
    const allBanned = classifications.every((c) => c !== null);
    if (allBanned) {
      if (allowlisted(allowlist, file, block.name)) continue;
      findings.push({
        file,
        test: block.name,
        reason: [...new Set(classifications)].join(" + "),
      });
    }
  }
  return findings;
}

// --- polyglot lint (hardening T16) ------------------------------------------

/** Language roots the polyglot lint sweeps (backend Rust, gnostic Python, epi-lib C). */
export const POLYGLOT_ROOTS = {
  rust: [join(REPO_ROOT, "Body", "S")],
  python: [join(REPO_ROOT, "Body", "S", "S5", "epi-gnostic")],
  c: [join(REPO_ROOT, "Body", "S", "S0", "epi-lib", "test")],
};

const POLYGLOT_SKIP_DIRS = new Set([
  "node_modules", "target", "vendor", "__pycache__", ".venv", "venv",
  "__fixtures__", ".git", "bin",
]);

/** Normalize one macro argument for the self-equal comparison. */
const normalizeArg = (text) => text.replace(/\s+/g, "");

/**
 * Rust dishonesty: trivially-true assert!, self-equal assert_eq!/assert_ne!,
 * blanket #[ignore] with no reason (a fence must say WHY — live-infra or
 * expected-red — or it is an unaccountable silent skip).
 */
export function lintRustSource(file, source) {
  const findings = [];
  source.split("\n").forEach((line, index) => {
    const at = `${file}:${index + 1}`;
    if (/^\s*#\[ignore\]\s*$/.test(line)) {
      findings.push({ file: at, reason: "blanket #[ignore] without a reason string" });
    }
    if (/\bassert!\(\s*true\s*[,)]/.test(line)) {
      findings.push({ file: at, reason: "trivially-true assert!(true)" });
    }
    // Self-equal CONSTANT comparison is vacuous (X == X proves nothing).
    // A self-equal CALL (f(x) == f(x)) is excluded: it is the standard
    // determinism assertion and executes the behavior under test twice.
    const eq = line.match(/\bassert_(?:eq|ne)!\(\s*([^,()]+)\s*,\s*([^,()]+)\s*[,)]/);
    if (eq && normalizeArg(eq[1]) === normalizeArg(eq[2])) {
      findings.push({ file: at, reason: `self-equal assertion (${eq[1].trim()} vs itself)` });
    }
  });
  return findings;
}

/** Python dishonesty: bare `assert True`, pytest skip without a reason. */
export function lintPythonSource(file, source) {
  const findings = [];
  source.split("\n").forEach((line, index) => {
    const at = `${file}:${index + 1}`;
    if (/^\s*assert\s+True\s*(#.*)?$/.test(line)) {
      findings.push({ file: at, reason: "trivially-true `assert True`" });
    }
    if (/pytest\.mark\.skip\s*\(\s*\)/.test(line) || /@pytest\.mark\.skip\s*$/.test(line)) {
      findings.push({ file: at, reason: "pytest skip without a reason" });
    }
  });
  return findings;
}

/** C dishonesty: literal-true asserts. */
export function lintCSource(file, source) {
  const findings = [];
  source.split("\n").forEach((line, index) => {
    if (/\bassert\(\s*(1|true)\s*\)/.test(line) || /\bTEST_ASSERT\(\s*(1|true)\s*[,)]/.test(line)) {
      findings.push({ file: `${file}:${index + 1}`, reason: "trivially-true C assert" });
    }
  });
  return findings;
}

const POLYGLOT_LINTERS = {
  rust: { extension: /\.rs$/, lint: lintRustSource },
  python: { extension: /\.py$/, lint: lintPythonSource },
  c: { extension: /\.c$/, lint: lintCSource },
};

export function collectPolyglotFiles(roots = POLYGLOT_ROOTS) {
  const byLanguage = { rust: [], python: [], c: [] };
  for (const [language, languageRoots] of Object.entries(roots)) {
    const { extension } = POLYGLOT_LINTERS[language];
    const walk = (dir) => {
      if (!existsSync(dir)) return;
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const stats = statSync(full);
        if (stats.isDirectory()) {
          if (POLYGLOT_SKIP_DIRS.has(entry)) continue;
          walk(full);
        } else if (extension.test(entry)) {
          byLanguage[language].push(full);
        }
      }
    };
    for (const root of languageRoots) walk(root);
  }
  return byLanguage;
}

export function collectTestFiles(roots = TEST_ROOTS) {
  const files = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stats = statSync(full);
      if (stats.isDirectory()) {
        if (entry === "node_modules" || entry === "__fixtures__") continue;
        walk(full);
      } else if (TEST_FILE_PATTERN.test(entry)) {
        files.push(full);
      }
    }
  };
  for (const root of roots) walk(root);
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  const testsOnly = args.includes("--tests-only");
  const evidenceOnly = args.includes("--evidence-only");
  let failed = false;

  if (!evidenceOnly) {
    const files = collectTestFiles();
    let findings = [];
    for (const file of files) {
      findings = findings.concat(lintTestFile(file));
    }
    for (const finding of findings) {
      console.error(
        `[lint-test-honesty] REJECT ${finding.file} :: '${finding.test}' — ${finding.reason} is its only assertion class`,
      );
    }
    console.log(
      `[lint-test-honesty] scanned ${files.length} test files — ${findings.length} dishonest test block(s)`,
    );
    if (findings.length > 0) failed = true;
  }

  if (!evidenceOnly) {
    const byLanguage = collectPolyglotFiles();
    let findings = [];
    let scanned = 0;
    for (const [language, files] of Object.entries(byLanguage)) {
      const { lint } = POLYGLOT_LINTERS[language];
      for (const file of files) {
        scanned += 1;
        findings = findings.concat(lint(file, readFileSync(file, "utf8")));
      }
    }
    for (const finding of findings) {
      console.error(`[lint-test-honesty] REJECT ${finding.file} — ${finding.reason}`);
    }
    console.log(
      `[lint-test-honesty] polyglot scan (rust/python/c) — ${scanned} files, ${findings.length} dishonest pattern(s)`,
    );
    if (findings.length > 0) failed = true;
  }

  if (!testsOnly) {
    const findings = lintPlanEvidence();
    for (const finding of findings) {
      console.error(
        `[lint-test-honesty] REJECT ledger ${finding.taskId} evidence '${finding.evidence.slice(0, 80)}' — ${finding.reason}`,
      );
    }
    console.log(
      `[lint-test-honesty] ledger evidence scan — ${findings.length} banned evidence string(s)`,
    );
    if (findings.length > 0) failed = true;
  }

  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
