import { describe, it, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtemp, writeFile, chmod, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fetchKairosData, mercurius_kairos_now } from "../S3'/kairos-python-adapter.ts";

// Per S4-3'-SPEC §"Test Obligations": "Kairos tests should prove
// feature-flag/additive behavior and no hard dependency when data is absent."
// §"Build Contract": "Kairos is additive. Missing natal/realtime/kairotic data
// must degrade gracefully and never block ordinary S4 operation."
//
// The KAIROS_ENABLED=false gate is the real feature flag: when set, the carrier
// short-circuits BEFORE spawning any subprocess. This is exercised for real — no
// mock — by toggling the env var the production code actually reads.

const PARAMS = {
  birth_date: "1997-01-01",
  birth_location: "London, UK",
  vault_root: "/tmp/does-not-matter",
  chart_output_path: "Empty/Present/chart.json",
};

describe("Chronos Kairos — additive feature flag", () => {
  const prior = process.env.KAIROS_ENABLED;
  const priorPath = process.env.PATH;
  const priorChartPath = process.env.KAIROS_TEST_CHART_PATH;
  afterEach(() => {
    if (prior === undefined) delete process.env.KAIROS_ENABLED;
    else process.env.KAIROS_ENABLED = prior;
    if (priorPath === undefined) delete process.env.PATH;
    else process.env.PATH = priorPath;
    if (priorChartPath === undefined) delete process.env.KAIROS_TEST_CHART_PATH;
    else process.env.KAIROS_TEST_CHART_PATH = priorChartPath;
  });

  it("KAIROS_ENABLED=false short-circuits with the disabled error (no subprocess)", async () => {
    process.env.KAIROS_ENABLED = "false";
    await assert.rejects(
      () => fetchKairosData(PARAMS),
      /KAIROS_ENABLED=false — kairos enrichment is disabled by environment/,
    );
  });

  it("the flag gate is checked before any vault path is touched", async () => {
    // vault_root points nowhere real; with the flag off we must fail on the flag,
    // not on a missing chart file — proving the additive gate runs first.
    process.env.KAIROS_ENABLED = "false";
    await assert.rejects(() => fetchKairosData(PARAMS), (err: Error) => {
      assert.match(err.message, /disabled by environment/);
      assert.doesNotMatch(err.message, /ENOENT|no such file|chart/i);
      return true;
    });
  });

  it("mercurius_kairos_now returns M4_Temporal_Now with a realtime KairosFrame", async () => {
    const root = await mkdtemp(join(tmpdir(), "kairos-mercurius-"));
    try {
      const chartOutputPath = "Pratibimba/Self/natal-chart.json";
      const chartPath = join(root, chartOutputPath);
      await mkdir(join(root, "Pratibimba", "Self"), { recursive: true });

      const bin = join(root, "bin");
      await mkdir(bin);
      const epiPath = join(bin, "epi");
      const chart = {
        sun_degree: 11,
        moon_degree: 22,
        planet_degrees: [11, 22, 33, 44, 55, 66, 77, 88, 99, 111],
        planet_valid: 0x03ff,
      };
      await writeFile(
        epiPath,
        `#!/bin/sh\nprintf '%s' '${JSON.stringify(chart)}' > "$KAIROS_TEST_CHART_PATH"\n`,
      );
      await chmod(epiPath, 0o755);

      process.env.KAIROS_TEST_CHART_PATH = chartPath;
      process.env.PATH = `${bin}:${priorPath ?? ""}`;

      const now = await mercurius_kairos_now({
        ...PARAMS,
        vault_root: root,
        chart_output_path: chartOutputPath,
        chronos_epoch: 1780000000,
      });

      assert.equal(now.degree, 11);
      assert.equal(now.chronos_epoch, 1780000000);
      assert.equal(now.realtime.kind, "REALTIME");
      assert.equal(now.realtime.captured_at_ns, 1780000000 * 1_000_000_000);
      assert.deepEqual(now.realtime.planet_degrees, [11, 22, 33, 44, 55, 66, 77, 88, 99, 111]);
      assert.equal(now.kairotic_active, false);
      assert.equal(now.planet_valid, 0x03ff);
      assert.equal(now.realtime.planet_degrees.length, 10);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
