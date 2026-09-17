#!/usr/bin/env node
// Refuse test code that deletes more than it created.
//
// On 2026-07-28 `Body/S/S0/epi-cli/tests/graph_seed.rs` opened with
// `MATCH (n:Bimba) DETACH DELETE n` as a "clean slate" and destroyed the live
// Bimba ontology. `#[ignore]` was the only thing in front of it, and
// `cargo test -- --ignored` runs ignored tests.
//
// The rule this enforces: a test may delete ONLY what it created. Concretely, a
// DELETE in test code must be scoped by an identity the test owns — a parameter
// binding (`{coordinate: $coord}`, `WHERE n.id IN $ids`), or a test-owned label
// (`test_*`, or one interpolated from a per-run workspace variable). A DELETE
// whose MATCH names only a label, or nothing at all, is a sweep and is refused.
//
// Scope: test files only. Production code deleting by label is a different
// question with different review (see `cypher.rs`'s write-mode guard).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const REPO_ROOT = process.cwd();
const SKIP_DIRS = new Set([
  "node_modules", "target", ".git", "dist", "build", ".venv", "venv",
  "__pycache__", ".next", "vendor", "vendors", ".gitnexus",
]);

// Lines that ASSERT a delete is rejected are the guard working, not a sweep.
const NEGATIVE_ASSERTION = /toThrow|not\.toThrow|should_?reject|expect_?err|assert!\(|assert_eq!\(|denied|Denied/;
const TEST_EXT = /\.(rs|mjs|cjs|js|ts|tsx|py)$/;

/** A file is test code if it lives in a tests dir or is named like a test. */
function isTestFile(path) {
  const parts = path.split(sep);
  if (parts.some((p) => p === "tests" || p === "test" || p === "e2e")) return true;
  const base = parts[parts.length - 1];
  return /(^test_|_test\.|\.test\.|\.spec\.)/.test(base);
}

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) yield* walk(full);
    else if (TEST_EXT.test(entry)) yield full;
  }
}

const DELETE_RE = /\b(DETACH\s+DELETE|DELETE)\b/i;

/**
 * Is this Cypher scoped to something the test owns?
 * Returns null when safe, or a reason string when it is a sweep.
 */
export function classify(statement) {
  if (!DELETE_RE.test(statement)) return null;
  const s = statement.replace(/\s+/g, " ");

  // Only inspect the MATCH that feeds the DELETE.
  // Require a real Cypher node pattern: MATCH ( ... ). This keeps `matches!`
  // and prose containing the word "match" out of the results.
  const match = /\bMATCH\s*(\(.*?)(?:DETACH\s+DELETE|DELETE)/i.exec(s);
  if (!match) return null; // DELETE without MATCH in this fragment: nothing to judge
  const pattern = match[1];

  // Parameter-scoped: {coordinate: $c}, WHERE n.id IN $ids, id(n) = $id
  if (/\$\w+/.test(pattern)) return null;
  // Interpolated per-run workspace/label variable: `{label}`, {TEST_WS}, ${ws}
  if (/[`'"]?\{\s*\w+\s*\}|\$\{\w+\}/.test(pattern)) return null;
  // A label the test itself owns.
  if (/:\s*`?(test_|Test)\w*/.test(pattern)) return null;
  // Literal identity predicate: {entity_id: 'xns_test_1'}
  if (/\{[^}]*:[^}]*\}/.test(pattern)) return null;

  return `unscoped delete — MATCH ${pattern.trim() || "(nothing)"} deletes by label or by nothing`;
}

const findings = [];
for (const file of walk(REPO_ROOT)) {
  const rel = relative(REPO_ROOT, file);
  if (!isTestFile(rel)) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!DELETE_RE.test(text)) continue;

  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!DELETE_RE.test(line)) continue;
    // Comments and doc-comments describe; they do not execute.
    const trimmed = line.trim();
    if (/^(\/\/|#|\*|\/\*)/.test(trimmed)) continue;
    if (NEGATIVE_ASSERTION.test(line)) continue;
    // Join with the previous line so a MATCH split across lines is still seen.
    const context = `${lines[i - 1] ?? ""} ${line}`;
    const reason = classify(context);
    if (reason) findings.push({ file: rel, line: i + 1, text: trimmed.slice(0, 140), reason });
  }
}

if (findings.length === 0) {
  console.log("[lint-test-deletes] PASS — no test deletes more than it creates");
  process.exit(0);
}

console.error("[lint-test-deletes] FAIL — tests may delete only what they created\n");
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}`);
  console.error(`    ${f.text}`);
  console.error(`    ${f.reason}\n`);
}
console.error(
  "Scope the delete to an identity the test owns: a $parameter, a per-run label,\n" +
    "or an explicit property predicate. A label-wide sweep is never a test teardown.",
);
process.exit(1);
