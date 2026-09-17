import { describe, it, beforeEach, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { stampNowKleinWeightingFrontmatter, upsertNowKleinWeightingFrontmatter } from "../modules/now-klein-weighting.ts";

const TEMPLATE_NOW = [
  "---",
  'coordinate: "M4-session"',
  'artifact_role: "now"',
  'c_3_created_at: "2026-07-14T12:00:00Z"',
  "c_3_klein_weighting:",
  "  prospective: 0.5",
  "  retrospective: 0.5",
  "c_0_source_coordinates: []",
  "---",
  "",
  "# NOW",
  "",
].join("\n");

describe("NOW Klein-weighting stamping (Janus computes, Khora writes — 12.18)", () => {
  let workDir: string;
  let savedNaraHome: string | undefined;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "khora-now-klein-"));
    savedNaraHome = process.env.EPI_NARA_HOME;
    process.env.EPI_NARA_HOME = join(workDir, "nara");
    mkdirSync(join(process.env.EPI_NARA_HOME, "kairos"), { recursive: true });
  });

  afterEach(() => {
    if (savedNaraHome === undefined) delete process.env.EPI_NARA_HOME;
    else process.env.EPI_NARA_HOME = savedNaraHome;
    rmSync(workDir, { recursive: true, force: true });
  });

  function writeNow(): string {
    const nowPath = join(workDir, "now.md");
    writeFileSync(nowPath, TEMPLATE_NOW, "utf8");
    return nowPath;
  }

  it("overwrites the template 0.5/0.5 default with the kairos-computed weighting (Saturn return + New Moon fixture)", () => {
    const nowPath = writeNow();
    writeFileSync(
      join(process.env.EPI_NARA_HOME!, "kairos", "current.json"),
      JSON.stringify({
        M4_Temporal_Now: {
          natal: { planet_degrees: [100, 0, 0, 0, 0, 0, 201, 0, 0, 0] },
          realtime: { planet_degrees: [10, 12, 302.4, 112.7, 88.5, 177.3, 200.2, 44.8, 269.9, 11.1] },
          kairotic_active: false,
        },
      }),
      "utf8",
    );

    const result = stampNowKleinWeightingFrontmatter(nowPath, "20260714-120000-abc123");
    // Saturn return (transit 200.2 within 2° of natal 201): retrospective +0.5;
    // New Moon (sun 10 within 6° of moon 12): prospective +0.3 → 0.5 - 0.5 + 0.3 = 0.3
    assert.deepEqual(result?.c_3_klein_weighting, { prospective: 0.3, retrospective: 0.7 });
    assert.ok(result?.basis.some((b) => /Saturn return/.test(b)));

    const content = readFileSync(nowPath, "utf8");
    assert.match(content, /^c_3_klein_weighting:\n {2}prospective: 0\.3\n {2}retrospective: 0\.7$/m);
    // no duplicate key left behind
    assert.equal(content.match(/^c_3_klein_weighting:/gm)?.length, 1);
  });

  it("stamps the balanced default with an honest basis when kairos carries no skewing aspects", () => {
    const nowPath = writeNow();
    writeFileSync(
      join(process.env.EPI_NARA_HOME!, "kairos", "current.json"),
      JSON.stringify({
        M4_Temporal_Now: {
          realtime: { planet_degrees: [10, 90, 302.4, 112.7, 88.5, 177.3, 200.2, 44.8, 269.9, 11.1] },
          kairotic_active: false,
        },
      }),
      "utf8",
    );

    const result = stampNowKleinWeightingFrontmatter(nowPath, "s");
    assert.deepEqual(result?.c_3_klein_weighting, { prospective: 0.5, retrospective: 0.5 });
    assert.deepEqual(result?.basis, ["balanced kairos"]);
  });

  it("degrades honestly: no kairos cache → no stamp, NOW untouched (pending-weighting stays truthful)", () => {
    const nowPath = writeNow();
    const before = readFileSync(nowPath, "utf8");
    const result = stampNowKleinWeightingFrontmatter(nowPath, "s");
    assert.equal(result, null);
    assert.equal(readFileSync(nowPath, "utf8"), before);
  });

  it("degrades honestly on a malformed cache (short degree array) — never fabricates a split", () => {
    const nowPath = writeNow();
    writeFileSync(
      join(process.env.EPI_NARA_HOME!, "kairos", "current.json"),
      JSON.stringify({ M4_Temporal_Now: { realtime: { planet_degrees: [10, 20, 30] } } }),
      "utf8",
    );
    const before = readFileSync(nowPath, "utf8");
    assert.equal(stampNowKleinWeightingFrontmatter(nowPath, "s"), null);
    assert.equal(readFileSync(nowPath, "utf8"), before);
  });

  it("upsert inserts the nested block after the anchor when the key is absent", () => {
    const content = [
      "---",
      'coordinate: "M4-session"',
      'c_3_created_at: "2026-07-14T12:00:00Z"',
      "---",
      "",
      "# NOW",
      "",
    ].join("\n");
    const next = upsertNowKleinWeightingFrontmatter(content, { prospective: 0.8, retrospective: 0.2 });
    assert.match(next, /^c_3_klein_weighting:\n {2}prospective: 0\.8\n {2}retrospective: 0\.2$/m);
    assert.equal(next.match(/^c_3_klein_weighting:/gm)?.length, 1);
  });
});
