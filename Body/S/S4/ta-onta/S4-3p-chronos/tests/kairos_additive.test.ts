import { describe, it, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { fetchKairosData } from "../S3'/kairos-python-adapter.ts";

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
  afterEach(() => {
    if (prior === undefined) delete process.env.KAIROS_ENABLED;
    else process.env.KAIROS_ENABLED = prior;
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
});
