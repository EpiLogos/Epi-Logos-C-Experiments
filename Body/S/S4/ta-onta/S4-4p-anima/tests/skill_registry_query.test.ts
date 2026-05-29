import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { findSkillsForVak, type CapabilityMatrix } from "../modules/skill-registry.ts";

const FAKE_MATRIX = {
  skills: [
    { name: "alpha", vak_profile: { operates_at_cf: ["(0/1)"], serves_ct: ["CT1"], ranges_cp: ["CP4.1"] } },
    { name: "beta", vak_profile: { operates_at_cf: ["(0/1/2)"], serves_ct: ["CT2"], ranges_cp: ["CP4.2"] } },
    { name: "gamma", vak_profile: { operates_at_cf: ["(0/1)", "(0/1/2)"], serves_ct: ["CT1", "CT2"], ranges_cp: ["CP4.1", "CP4.2"] } },
    { name: "delta", vak_profile: { operates_at_cf: ["(4.0/1-4.4/5)"], serves_ct: ["CT4a", "CT4b"], ranges_cp: ["CP4.4"] } },
  ],
};

describe("skill registry query", () => {
  it("finds skills matching CF + CT + CP", () => {
    const matches = findSkillsForVak(FAKE_MATRIX as any, {
      cf: "(0/1)",
      ct: ["CT1"],
      cp: "CP4.1",
    } as any);
    const names = matches.map((s) => s.name).sort();
    assert.deepEqual(names, ["alpha", "gamma"]);
  });

  it("excludes skills when CF does not match", () => {
    const matches = findSkillsForVak(FAKE_MATRIX as any, {
      cf: "(4.0/1-4.4/5)",
      ct: ["CT1"],
      cp: "CP4.1",
    } as any);
    assert.deepEqual(matches.map((s) => s.name), []);
  });

  it("returns empty array when no skill serves any of vak.ct", () => {
    const matches = findSkillsForVak(FAKE_MATRIX as any, {
      cf: "(0/1)",
      ct: ["CT5"],  // no skill serves CT5
      cp: "CP4.1",
    } as any);
    assert.deepEqual(matches, []);
  });

  it("matches when ANY of vak.ct overlaps serves_ct (OR semantics on CT)", () => {
    const matches = findSkillsForVak(FAKE_MATRIX as any, {
      cf: "(4.0/1-4.4/5)",
      ct: ["CT5", "CT4a"],  // CT5 doesn't match, CT4a does
      cp: "CP4.4",
    } as any);
    assert.deepEqual(matches.map((s) => s.name), ["delta"]);
  });

  it("returns empty for empty matrix", () => {
    const matches = findSkillsForVak({ skills: [] } as any, {
      cf: "(0/1)",
      ct: ["CT1"],
      cp: "CP4.1",
    } as any);
    assert.deepEqual(matches, []);
  });

  it("queries the real pleroma capability matrix (anima-orchestration surfaces for CT4 + CF (4.0/1-4.4/5) + CP4.4)", () => {
    // Smoke test against the actual shipped matrix to catch import-path /
    // schema drift between E1 (matrix shape) and E2 (query). Uses CT codes
    // that match the matrix's own vocabulary (CT4, not CT4a/CT4b — see
    // matrix file). If E1's matrix vocabulary changes, this test signals it.
    const here = dirname(fileURLToPath(import.meta.url));
    const matrixPath = resolve(here, "../../../plugins/pleroma/capability-matrix.json");
    const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as CapabilityMatrix;
    const matches = findSkillsForVak(matrix, {
      cf: "(4.0/1-4.4/5)",
      ct: ["CT4"],
      cp: "CP4.4",
    } as any);
    const names = matches.map((s) => s.name);
    assert.ok(names.includes("anima-orchestration"),
      `expected anima-orchestration in matches, got: ${names.join(", ")}`);
  });
});
