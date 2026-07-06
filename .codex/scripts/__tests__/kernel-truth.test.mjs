import assert from "node:assert/strict";
import test from "node:test";

import { parseCargoTestResults, evaluateAgainstManifest } from "../kernel-truth.mjs";

const SAMPLE_OUTPUT = `
running 3 tests
test m3_charges_sum_pp_360_boot_assert ... FAILED
test m1_ananda_12x12_raw_fidelity_vs_vortex_modulae_csv ... FAILED
test kernel_energy_carries_e5_e6_with_456_weighting ... ok

failures:
    m3_charges_sum_pp_360_boot_assert

test result: FAILED. 1 passed; 2 failed; 0 ignored; 0 measured; 4 filtered out; finished in 0.01s
`;

test("parseCargoTestResults reads per-test verdicts", () => {
  const results = parseCargoTestResults(SAMPLE_OUTPUT);
  assert.equal(results.get("m3_charges_sum_pp_360_boot_assert"), "FAILED");
  assert.equal(results.get("kernel_energy_carries_e5_e6_with_456_weighting"), "ok");
  assert.equal(results.size, 3);
});

const MANIFEST = [
  { test: "m3_charges_sum_pp_360_boot_assert", suite: "portal-core", owningTrack: "33/4.13" },
  { test: "m1_ananda_12x12_raw_fidelity_vs_vortex_modulae_csv", suite: "portal-core", owningTrack: "10.10" },
  { test: "kernel_energy_carries_e5_e6_with_456_weighting", suite: "portal-core", owningTrack: "33" },
];

test("an expected-red test that FAILS keeps the stage green (red is the work order)", () => {
  const results = new Map([
    ["m3_charges_sum_pp_360_boot_assert", "FAILED"],
    ["m1_ananda_12x12_raw_fidelity_vs_vortex_modulae_csv", "FAILED"],
    ["kernel_energy_carries_e5_e6_with_456_weighting", "FAILED"],
  ]);
  const { ok, rows } = evaluateAgainstManifest(results, MANIFEST, "portal-core");
  assert.equal(ok, true);
  assert.ok(rows.every((r) => r.verdict === "RED-STANDS"));
});

test("an unexpectedly-green expected-red fails the stage for investigation", () => {
  const results = new Map([
    ["m3_charges_sum_pp_360_boot_assert", "ok"],
    ["m1_ananda_12x12_raw_fidelity_vs_vortex_modulae_csv", "FAILED"],
    ["kernel_energy_carries_e5_e6_with_456_weighting", "FAILED"],
  ]);
  const { ok, rows } = evaluateAgainstManifest(results, MANIFEST, "portal-core");
  assert.equal(ok, false);
  assert.equal(rows.find((r) => r.test.startsWith("m3_charges")).verdict, "UNEXPECTED-GREEN");
});

test("a failing test missing from the manifest fails the stage", () => {
  const results = new Map([["surprise_new_red", "FAILED"]]);
  const { ok, rows } = evaluateAgainstManifest(results, [], "portal-core");
  assert.equal(ok, false);
  assert.equal(rows[0].verdict, "UNMANIFESTED-RED");
});

test("a manifest entry whose test never ran fails the stage", () => {
  const { ok, rows } = evaluateAgainstManifest(new Map(), MANIFEST, "portal-core");
  assert.equal(ok, false);
  assert.ok(rows.every((r) => r.verdict === "NOT-RUN"));
});
