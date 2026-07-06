#!/usr/bin/env node
/**
 * Coordinate: #5/S0 (kernel truth stage — Track 00.T4, cycle-3 full rerun)
 * Residency: .codex/scripts/kernel-truth.mjs
 * Position (#n): #5 — Integration; red-as-work-order made mechanical
 * Actualises: [[00-verification-harness]] T4 — runs the expected-red kernel
 *   truth tests (`#[ignore = "expected-red: …"]` in portal-core kernel_truth
 *   + epi-cli kernel_truth_oracle / portal_clock_state) and holds them
 *   against plan.runs/kernel-truth-expected-failures.json: a standing red is
 *   the work order for its owning track; an unexpectedly-green entry or an
 *   unmanifested red fails the stage until investigated and re-recorded.
 * Public surface: parseCargoTestResults, evaluateAgainstManifest, SUITES,
 *   main; CLI: node .codex/scripts/kernel-truth.mjs
 * Does NOT own: the tests themselves (portal-core/epi-cli test files) or the
 *   fixes (owning rerun tracks named in the manifest).
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");
const MANIFEST_PATH = join(
  REPO_ROOT,
  "Idea", "Bimba", "Seeds", "M", "Legacy", "plans",
  "2026-07-03-m-prime-cycle-3-full-rerun", "plan.runs",
  "kernel-truth-expected-failures.json",
);

export const SUITES = [
  {
    id: "portal-core",
    cwd: join(REPO_ROOT, "Body", "S", "S0", "portal-core"),
    command: ["cargo", "test", "--test", "kernel_truth", "--", "--ignored"],
  },
  {
    id: "epi-cli-oracle",
    cwd: join(REPO_ROOT, "Body", "S", "S0", "epi-cli"),
    command: ["cargo", "test", "--test", "kernel_truth_oracle", "--", "--ignored"],
  },
  {
    id: "epi-cli-clock",
    cwd: join(REPO_ROOT, "Body", "S", "S0", "epi-cli"),
    command: ["cargo", "test", "--test", "portal_clock_state", "--", "--ignored"],
  },
];

/** Parse `test NAME ... ok|FAILED` lines from cargo test output. */
export function parseCargoTestResults(output) {
  const results = new Map();
  for (const match of output.matchAll(/^test (\S+) \.\.\. (ok|FAILED|ignored)$/gm)) {
    results.set(match[1], match[2]);
  }
  return results;
}

/**
 * Hold observed results against the expected-failures manifest for one suite.
 * RED-STANDS (expected red, still red) keeps the stage green; anything else
 * red-flags: UNEXPECTED-GREEN, UNMANIFESTED-RED, NOT-RUN.
 */
export function evaluateAgainstManifest(results, manifest, suiteId) {
  const rows = [];
  const expected = manifest.filter((entry) => entry.suite === suiteId);
  for (const entry of expected) {
    const observed = results.get(entry.test) ?? null;
    let verdict;
    if (observed === "FAILED") verdict = "RED-STANDS";
    else if (observed === "ok") verdict = "UNEXPECTED-GREEN";
    else verdict = "NOT-RUN";
    rows.push({ test: entry.test, owningTrack: entry.owningTrack, observed, verdict });
  }
  const known = new Set(expected.map((entry) => entry.test));
  for (const [testName, observed] of results) {
    if (observed === "FAILED" && !known.has(testName)) {
      rows.push({ test: testName, owningTrack: "?", observed, verdict: "UNMANIFESTED-RED" });
    }
  }
  const ok = rows.every((row) => row.verdict === "RED-STANDS");
  return { ok, rows };
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")).expectedFailures;
  let allOk = true;
  for (const suite of SUITES) {
    const run = spawnSync(suite.command[0], suite.command.slice(1), {
      cwd: suite.cwd,
      encoding: "utf8",
      env: process.env,
    });
    const output = `${run.stdout ?? ""}${run.stderr ?? ""}`;
    const results = parseCargoTestResults(output);
    const { ok, rows } = evaluateAgainstManifest(results, manifest, suite.id);
    for (const row of rows) {
      const mark = row.verdict === "RED-STANDS" ? "ok  " : "FAIL";
      console.log(
        `[kernel-truth] ${mark} ${suite.id} :: ${row.test} — ${row.verdict}` +
          ` (owning track ${row.owningTrack}, observed ${row.observed ?? "absent"})`,
      );
    }
    if (!ok) allOk = false;
  }
  console.log(
    `[kernel-truth] ${allOk ? "GREEN — every expected red stands as its track's work order" : "RED — investigate the flagged rows and re-record the manifest"}`,
  );
  process.exit(allOk ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
