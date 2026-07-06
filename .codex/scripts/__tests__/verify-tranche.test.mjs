import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  extractVerifyCommands,
  resolveTaskVerify,
  runVerification,
} from "../verify-tranche.mjs";

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
