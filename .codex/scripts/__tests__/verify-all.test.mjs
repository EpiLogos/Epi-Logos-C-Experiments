import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  SUITES,
  parseArgs,
  parseTestCount,
  runAll,
  formatTable,
} from "../verify-all.mjs";

// The runner must ship the exact suite inventory the tranches name
// (T1 base suites + T8 offline backend crates — hardening ledger Axis A).
test("suite inventory covers the base suites, live-wire, and the T8 backend crates", () => {
  const ids = SUITES.map((s) => s.id);
  for (const required of [
    "harness-selftest",
    "epi-lib",
    "portal-core",
    "epi-cli",
    "schemas",
    "kernel-contract",
    "s0-settings",
    "gemini-embedding",
    "hen-compiler-core",
    "graph-schema",
    "graph-services",
    "gateway",
    "gateway-contract",
    "redis-context",
    "graphiti-runtime",
    "spacetime",
    "ta-onta",
    "epii-agent-core",
    "epii-review-core",
    "epii-autoresearch-core",
    "gnostic-offline",
    "app-typecheck",
    "app-test",
    "app-build",
    "app-smoke",
    "app-ui-flow",
    "live-wire",
    "gateway-methods",
    "lint-boundaries",
    "carrier-tokens",
    "honesty-lint",
    "kernel-truth",
  ]) {
    assert.ok(ids.includes(required), `missing suite ${required}`);
  }
});

test("parseArgs accepts --only with a comma list of known suites", () => {
  const opts = parseArgs(["--only", "epi-lib,schemas"]);
  assert.deepEqual(opts.only, ["epi-lib", "schemas"]);
});

test("parseArgs rejects unknown suite ids in --only", () => {
  assert.throws(() => parseArgs(["--only", "epi-lib,not-a-suite"]), /unknown suite/i);
});

test("parseTestCount reads vitest, cargo, and C-runner summaries", () => {
  // vitest: prefer the Tests line, never double-count the Test Files line
  assert.equal(
    parseTestCount(" Test Files  23 passed | 1 skipped (24)\n      Tests  110 passed | 1 skipped (111)"),
    110,
  );
  assert.equal(
    parseTestCount(
      "test result: ok. 12 passed; 0 failed\ntest result: ok. 30 passed; 0 failed",
    ),
    42,
  );
  assert.equal(
    parseTestCount(
      "=== Results: 60 passed, 0 failed (of 60) ===\n=== Harmonic Pointer Web36: 12/12 passed ===",
    ),
    72,
  );
  // failing vitest run still reports the Tests line, never double-counts Test Files
  assert.equal(
    parseTestCount(" Test Files  1 failed | 22 passed (23)\n      Tests  1 failed | 110 passed (111)"),
    110,
  );
  // node:test spec + tap reporters (S4 ta-onta suite, harness-selftest)
  assert.equal(parseTestCount("ℹ tests 406\nℹ suites 122\nℹ pass 406\nℹ fail 0"), 406);
  assert.equal(parseTestCount("# tests 10\n# pass 9\n# fail 1"), 9);
  assert.equal(parseTestCount("no counts here"), null);
});

// Behavioral: real subprocesses, no mocks.
function fakeSuite(id, script) {
  const dir = mkdtempSync(join(tmpdir(), `verify-all-${id}-`));
  const file = join(dir, "cmd.mjs");
  writeFileSync(file, script);
  return { id, label: id, cwd: dir, commands: [["node", "cmd.mjs"]] };
}

test("runAll passes when every suite exits 0 and reports per-suite results", async () => {
  const suites = [
    fakeSuite("a", "console.log('Tests  3 passed (3)'); process.exit(0);"),
    fakeSuite("b", "process.exit(0);"),
  ];
  const { results, ok } = await runAll({ suites, only: null, quiet: true });
  assert.equal(ok, true);
  assert.equal(results.length, 2);
  assert.equal(results[0].result, "PASS");
  assert.equal(results[0].tests, 3);
  assert.equal(typeof results[0].seconds, "number");
});

// T10: env-guarded lanes (gnostic-offline) declare their env on the suite —
// the runner must actually apply it to the spawned command.
test("a suite's env block is applied to its spawned commands", async () => {
  const probe = fakeSuite(
    "envy",
    "process.exit(process.env.VERIFY_ALL_ENV_PROBE === 'yes' ? 0 : 1);",
  );
  probe.env = { VERIFY_ALL_ENV_PROBE: "yes" };
  const { results, ok } = await runAll({ suites: [probe], only: null, quiet: true });
  assert.equal(ok, true, results[0].note ?? "env suite should pass");
  const bare = fakeSuite(
    "envless",
    "process.exit(process.env.VERIFY_ALL_ENV_PROBE === 'yes' ? 0 : 1);",
  );
  const bareRun = await runAll({ suites: [bare], only: null, quiet: true });
  assert.equal(bareRun.ok, false, "without the env block the same command must fail");
});

test("runAll fails loud when any suite exits nonzero", async () => {
  const suites = [
    fakeSuite("good", "process.exit(0);"),
    fakeSuite("bad", "console.error('boom'); process.exit(3);"),
  ];
  const { results, ok } = await runAll({ suites, only: null, quiet: true });
  assert.equal(ok, false);
  assert.equal(results.find((r) => r.id === "bad").result, "FAIL");
});

test("a suite that cannot run at all is a FAIL, never a silent skip", async () => {
  const suites = [
    {
      id: "ghost",
      label: "ghost",
      cwd: join(tmpdir(), "verify-all-does-not-exist"),
      commands: [["node", "cmd.mjs"]],
    },
  ];
  const { results, ok } = await runAll({ suites, only: null, quiet: true });
  assert.equal(ok, false);
  assert.equal(results[0].result, "FAIL");
});

test("--only runs the named suites and marks the rest explicitly skipped without failing", async () => {
  const suites = [
    fakeSuite("wanted", "process.exit(0);"),
    fakeSuite("unwanted", "process.exit(1);"),
  ];
  const { results, ok } = await runAll({ suites, only: ["wanted"], quiet: true });
  assert.equal(ok, true);
  assert.equal(results.find((r) => r.id === "wanted").result, "PASS");
  assert.equal(results.find((r) => r.id === "unwanted").result, "SKIP(--only)");
});

test("parseOrphanGateways finds orphaned debug-binary gateways only", async () => {
  const { parseOrphanGateways } = await import("../verify-all.mjs");
  const psOutput = [
    "  PID  PPID COMMAND",
    "44237     1 /repo/Body/S/S0/epi-cli/target/debug/epi --json gate start --port 18832",
    "50001   322 /repo/Body/S/S0/epi-cli/target/debug/epi gate start --port 18999",
    "50002     1 /usr/local/bin/epi gate start --port 18794",
    "50003     1 /repo/Body/S/S0/epi-cli/target/debug/epi agent doctor",
  ].join("\n");
  const orphans = parseOrphanGateways(psOutput, "/repo");
  assert.deepEqual(orphans, [{ pid: 44237, command: "/repo/Body/S/S0/epi-cli/target/debug/epi --json gate start --port 18832" }]);
});

test("formatTable renders one row per suite with result column", () => {
  const table = formatTable([
    { id: "a", label: "a", tests: 3, result: "PASS", seconds: 1.2 },
    { id: "b", label: "b", tests: null, result: "FAIL", seconds: 0.4 },
  ]);
  assert.match(table, /suite/i);
  assert.match(table, /\ba\b.*PASS/s);
  assert.match(table, /\bb\b.*FAIL/s);
});
