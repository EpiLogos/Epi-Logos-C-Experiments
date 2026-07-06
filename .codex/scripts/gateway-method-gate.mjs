#!/usr/bin/env node
/**
 * Coordinate: #5/S0 (gateway-method gate — Track 00 hardening T11)
 * Residency: .codex/scripts/gateway-method-gate.mjs
 * Position (#n): #5 — Integration; recon-before-build promoted into the gate
 * Actualises: [[00-verification-harness-hardening]] T11 — runs the T5 probe
 *   (pratibimba-app scripts/gateway-method-audit.mjs) against a REAL spawned
 *   gateway, regenerates plan.runs/gateway-method-audit.json, then holds the
 *   fresh table against the expected-present ratchet
 *   (plan.runs/gateway-method-expected-present.json): a method a track has
 *   marked done may never be absent. Newly-present methods not yet ratcheted
 *   are WARNED so the landing track registers its claim.
 * Public surface: evaluateRatchet, main;
 *   CLI: node .codex/scripts/gateway-method-gate.mjs [--skip-probe]
 * Does NOT own: the probe itself (T5 script), the method inventory law
 *   (gateway-contract METHOD_NAMES), dispatch behavior (epi-cli gate/).
 * Contract: a ratcheted method observed absent/timeout FAILS the stage; the
 *   ratchet only grows via explicit entries carrying claimedBy.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");
const APP_ROOT = join(REPO_ROOT, "Body", "M", "pratibimba-app");
const PLAN_RUNS = join(
  REPO_ROOT,
  "Idea", "Bimba", "Seeds", "M", "Legacy", "plans",
  "2026-07-03-m-prime-cycle-3-full-rerun", "plan.runs",
);
const TABLE_PATH = join(PLAN_RUNS, "gateway-method-audit.json");
const RATCHET_PATH = join(PLAN_RUNS, "gateway-method-expected-present.json");

/**
 * Hold a fresh probe table against the expected-present ratchet.
 * Returns { ok, missing, unratcheted } — missing = ratcheted methods the
 * live gateway no longer answers (FAIL); unratcheted = present methods no
 * track has claimed yet (WARN, the landing track should register them).
 */
export function evaluateRatchet(table, ratchet) {
  const present = new Set(
    (table.methods ?? []).filter((row) => row.exists === true).map((row) => row.method),
  );
  const expected = ratchet.expectedPresent ?? [];
  const missing = expected.filter((entry) => !present.has(entry.method));
  const claimed = new Set(expected.map((entry) => entry.method));
  const unratcheted = [...present].filter((method) => !claimed.has(method)).sort();
  return { ok: missing.length === 0, missing, unratcheted };
}

async function main() {
  const skipProbe = process.argv.includes("--skip-probe");
  if (!skipProbe) {
    const probe = spawnSync(
      "node",
      [join(APP_ROOT, "scripts", "gateway-method-audit.mjs")],
      { cwd: APP_ROOT, stdio: "inherit", env: process.env },
    );
    if (probe.status !== 0) {
      console.error("[gateway-method-gate] FAIL — probe did not complete (real gateway required; a probe that cannot run is a FAIL, never a skip)");
      process.exit(1);
    }
  }
  if (!existsSync(TABLE_PATH) || !existsSync(RATCHET_PATH)) {
    console.error(`[gateway-method-gate] FAIL — missing ${existsSync(TABLE_PATH) ? RATCHET_PATH : TABLE_PATH}`);
    process.exit(1);
  }
  const table = JSON.parse(readFileSync(TABLE_PATH, "utf8"));
  const ratchet = JSON.parse(readFileSync(RATCHET_PATH, "utf8"));
  const { ok, missing, unratcheted } = evaluateRatchet(table, ratchet);
  for (const entry of missing) {
    console.error(
      `[gateway-method-gate] FAIL ${entry.method} — ratcheted (claimedBy ${entry.claimedBy}) but absent from the live gateway`,
    );
  }
  for (const method of unratcheted) {
    console.warn(
      `[gateway-method-gate] WARN ${method} present but unratcheted — the landing track should add it to gateway-method-expected-present.json`,
    );
  }
  console.log(
    `[gateway-method-gate] ${table.summary.probed} probed · ${table.summary.present} present · ` +
      `${ratchet.expectedPresent.length} ratcheted · ${missing.length} missing · ${unratcheted.length} unratcheted`,
  );
  console.log(`[gateway-method-gate] ${ok ? "GREEN" : "RED"}`);
  process.exit(ok ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
