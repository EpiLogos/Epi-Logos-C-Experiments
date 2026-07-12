import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  extractVerifyCommands,
  resolveTaskVerify,
  runVerification,
  scopeForTasks,
} from "../verify-tranche.mjs";

/** Write a minimal verification-classes.json into a fake plan dir. */
function writeClassManifest(manifest) {
  const dir = mkdtempSync(join(tmpdir(), "verify-tranche-classes-"));
  mkdirSync(join(dir, "plan.runs"), { recursive: true });
  writeFileSync(join(dir, "plan.runs", "verification-classes.json"), JSON.stringify(manifest));
  return dir;
}

test("scopeForTasks keeps the base K scope for a non-graph-truth track", () => {
  const dir = writeClassManifest({ classes: { "03": "K" }, graphLiveTracks: ["09", "45"] });
  const scope = scopeForTasks(["03.T3.1"], dir);
  assert.ok(scope.includes("kernel-truth"), "K scope preserved");
  assert.ok(!scope.includes("graph-live"), "non-graph-truth track must not gain graph-live");
});

test("scopeForTasks layers graph-live onto a graph-truth track's base class", () => {
  const dir = writeClassManifest({
    classes: { "09": "W", "45": "K" },
    graphLiveTracks: ["09", "40", "45", "48"],
  });
  const w = scopeForTasks(["09.T9.1"], dir);
  assert.ok(w.includes("live-wire"), "track 09 keeps its base W scope");
  assert.ok(w.includes("graph-live"), "track 09 additionally gates on graph-live");
  const k = scopeForTasks(["45.T45.1"], dir);
  assert.ok(k.includes("kernel-truth"), "track 45 keeps its base K scope");
  assert.ok(k.includes("graph-live"), "track 45 additionally gates on graph-live");
});

test("scopeForTasks resolves a standalone class-G track to the live-graph gate", () => {
  const dir = writeClassManifest({ classes: { "88": "G" }, graphLiveTracks: [] });
  const scope = scopeForTasks(["88.T88.1"], dir);
  assert.ok(scope.includes("graph-live"), "class G resolves to the graph-live gate");
});

test("scopeForTasks falls open to the full gate for an unknown class", () => {
  const dir = writeClassManifest({ classes: { "77": "Z" }, graphLiveTracks: ["77"] });
  assert.equal(scopeForTasks(["77.T77.1"], dir), null);
});

test("extractVerifyCommands pulls backticked commands from Verify lines", () => {
  const body = `1. **T1.4 — GatewayClient.** Port the wire protocol.
   Verify: \`pnpm test src/bridge\` — behavioral: fake socket delivers a frame; also \`pnpm typecheck\`.`;
  assert.deepEqual(extractVerifyCommands(body), ["pnpm test src/bridge", "pnpm typecheck"]);
});

test("extractVerifyCommands returns [] for prose-only Verify lines", () => {
  const body = `1. **T9 — Gate.** Launch and observe.
   Verify: run it on the current basis; record the full table.`;
  assert.deepEqual(extractVerifyCommands(body), []);
});

test("resolveTaskVerify finds a task section in a single-file plan", () => {
  const dir = mkdtempSync(join(tmpdir(), "verify-tranche-"));
  const plan = join(dir, "plan.md");
  writeFileSync(
    plan,
    `# Phase plan
- T1.4 GatewayClient port.
  Verify: \`node -e "process.exit(0)"\` green; fake socket behavioral.
- T1.5 Stores.
  Verify: \`node -e "console.log('stores ok')"\`.
`,
  );
  const resolved = resolveTaskVerify("T1.5", plan);
  assert.match(resolved.verifyText, /stores ok/);
  assert.deepEqual(resolved.commands, [`node -e "console.log('stores ok')"`]);
});

test("runVerification records verbatim output and passes when everything is green", async () => {
  const dir = mkdtempSync(join(tmpdir(), "verify-tranche-run-"));
  const record = await runVerification({
    taskId: "T.TEST",
    commands: ["echo tranche-check-output"],
    gateCommands: [["echo", "gate-green"]],
    cwd: dir,
    outDir: dir,
  });
  assert.equal(record.verdict, "PASS");
  const file = join(dir, "T.TEST.md");
  assert.ok(existsSync(file));
  const written = readFileSync(file, "utf8");
  assert.match(written, /tranche-check-output/);
  assert.match(written, /PASS/);
});

test("runVerification refuses a pass when a tranche command fails", async () => {
  const dir = mkdtempSync(join(tmpdir(), "verify-tranche-fail-"));
  const record = await runVerification({
    taskId: "T.FAIL",
    commands: ["exit 3"],
    gateCommands: [["echo", "gate-green"]],
    cwd: dir,
    outDir: dir,
  });
  assert.equal(record.verdict, "REFUSED");
  const written = readFileSync(join(dir, "T.FAIL.md"), "utf8");
  assert.match(written, /REFUSED/);
});

test("runVerification refuses a pass when the gate is red even if tranche commands pass", async () => {
  const dir = mkdtempSync(join(tmpdir(), "verify-tranche-gate-"));
  const record = await runVerification({
    taskId: "T.GATE",
    commands: ["echo fine"],
    gateCommands: [["sh", "-c", "exit 1"]],
    cwd: dir,
    outDir: dir,
  });
  assert.equal(record.verdict, "REFUSED");
  const written = readFileSync(join(dir, "T.GATE.md"), "utf8");
  assert.match(written, /REFUSED/);
});
