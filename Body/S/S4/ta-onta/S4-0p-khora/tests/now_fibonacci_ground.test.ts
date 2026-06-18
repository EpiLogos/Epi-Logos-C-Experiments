import { describe, it, beforeEach, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { stampNowFibonacciGroundFrontmatter } from "../modules/now-fibonacci-ground.ts";

describe("NOW Fibonacci Ground stamping", () => {
  let workDir: string;
  let savedNaraHome: string | undefined;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "khora-now-fib-"));
    savedNaraHome = process.env.EPI_NARA_HOME;
    process.env.EPI_NARA_HOME = join(workDir, "nara");
    mkdirSync(join(process.env.EPI_NARA_HOME, "kairos"), { recursive: true });
  });

  afterEach(() => {
    if (savedNaraHome === undefined) delete process.env.EPI_NARA_HOME;
    else process.env.EPI_NARA_HOME = savedNaraHome;
    rmSync(workDir, { recursive: true, force: true });
  });

  it("writes non-zero Fibonacci Ground coordinates from a real kairos Sun degree cache", () => {
    const nowPath = join(workDir, "now.md");
    writeFileSync(nowPath, [
      "---",
      'coordinate: "M4-session"',
      'artifact_role: "now"',
      'c_3_created_at: "2026-06-17T12:00:00Z"',
      "---",
      "",
      "# NOW",
      "",
    ].join("\n"), "utf8");

    writeFileSync(
      join(process.env.EPI_NARA_HOME!, "kairos", "current.json"),
      JSON.stringify({
        planets: [
          { planet_id: 0, degree: 123.456, degree_anchor: 123, retrograde: false },
          { planet_id: 1, degree: 25.1, degree_anchor: 25, retrograde: false },
        ],
        dominant_sign: 4,
        dominant_element: 2,
        active_decan: 12,
        active_tattva: 0,
      }),
      "utf8",
    );

    const stamp = stampNowFibonacciGroundFrontmatter(nowPath);
    assert.deepEqual(stamp, {
      fibonacciPosition: 20,
      fibonacciDigit: 5,
      tick12: 4,
      backboneIndex: 8,
    });

    const content = readFileSync(nowPath, "utf8");
    assert.match(content, /^c_3_fibonacci_position: 20$/m);
    assert.match(content, /^c_3_fibonacci_digit: 5$/m);
    assert.match(content, /^c_3_tick12: 4$/m);
    assert.match(content, /^c_3_backbone_index: 8$/m);
  });
});
