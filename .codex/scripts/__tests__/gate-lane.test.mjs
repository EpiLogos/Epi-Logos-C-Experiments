/**
 * Coordinate: #5/S0 (gate-lane harness tests — Track 00)
 * Residency: .codex/scripts/__tests__/gate-lane.test.mjs
 * Actualises: the four claims the lane has to earn — it EXCLUDES (a separate
 *   process queues), it is RE-ENTRANT (a nested run passes through instead of
 *   deadlocking the gate against its own child), it STEALS a lock whose holder
 *   pid is dead, and it RELEASES on exit so the next agent is not left waiting.
 *   Run against the real lock directory through the real module, not a mock.
 * Does NOT own: the suites that run inside the lane, or the port list.
 */

import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// A TEMP lane. This suite runs inside verify-all's harness-selftest, which now
// holds the real lane — clearing the real directory here would unlock the gate
// underneath its own run and let a concurrent agent in mid-gate.
const LANE_DIR = mkdtempSync(join(tmpdir(), "gate-lane-"));
const LANE_OPTS = { lockDir: LANE_DIR };

import {
  LANE_ENV,
  acquireGateLane,
  laneHeld,
  releaseGateLane,
} from "../gate-lane.mjs";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "gate-lane.mjs");

function clearLane() {
  rmSync(LANE_DIR, { recursive: true, force: true });
  delete process.env[LANE_ENV];
}

function writeHolder(pid, owner) {
  mkdirSync(LANE_DIR, { recursive: true });
  writeFileSync(
    join(LANE_DIR, "holder.json"),
    JSON.stringify({ pid, owner, at: new Date().toISOString() }),
  );
}

function runCli(args, env, timeout = 15_000) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    timeout,
    env: { ...process.env, EPI_GATE_LANE_DIR: LANE_DIR, ...env },
  });
}

test("acquires when free and marks the environment for children", async () => {
  clearLane();
  assert.equal(await acquireGateLane("first", LANE_OPTS), "acquired");
  assert.equal(existsSync(LANE_DIR), true);
  assert.equal(laneHeld(), true);
  releaseGateLane(LANE_OPTS);
  assert.equal(existsSync(LANE_DIR), false);
  assert.equal(laneHeld(), false);
  clearLane();
});

test("a SEPARATE process waits while the lane is held by a live pid", () => {
  clearLane();
  // Detached with stdio ignored: a backgrounded child that inherits stdout
  // holds the pipe open, which makes spawnSync block until it exits — the
  // first cut of this test did that and then measured a dead pid.
  const holder = spawn("sleep", ["30"], { detached: true, stdio: "ignore" });
  holder.unref();
  writeHolder(holder.pid, "other-agent");

  // The "waiting" line is logged on the FIRST failed acquire, before any
  // sleep, so a short timeout proves the queueing without costing the harness
  // a full wait interval.
  const child = runCli(["--owner", "queued", "--no-reap", "--", "echo", "RAN"], {
    [LANE_ENV]: undefined,
  }, 3_000);
  assert.ok(!(child.stdout ?? "").includes("RAN"), "queued run must not execute the command");
  assert.ok((child.stdout ?? "").includes("waiting"), "queued run must report waiting");

  try {
    process.kill(holder.pid, "SIGKILL");
  } catch {
    /* already gone */
  }
  clearLane();
});

test("is re-entrant in-process — a nested acquire never blocks", async () => {
  clearLane();
  assert.equal(await acquireGateLane("outer", LANE_OPTS), "acquired");
  assert.equal(await acquireGateLane("inner", LANE_OPTS), "reentrant");
  releaseGateLane(LANE_OPTS);
  clearLane();
});

test("is re-entrant across processes — the gate does not deadlock on its own child", () => {
  // This is the verify-tranche -> verify-all -> `pnpm test:e2e` shape. Without
  // re-entrancy the child waits on a lock its own parent holds, forever.
  clearLane();
  writeHolder(process.pid, "verify-tranche");
  const child = runCli(["--owner", "nested", "--no-reap", "--", "echo", "RAN"], {
    [LANE_ENV]: "1",
  });
  assert.equal(child.status, 0);
  assert.ok(child.stdout.includes("RAN"));
  assert.ok(child.stdout.includes("passing through"));
  // …and it left the parent's lock alone.
  assert.equal(existsSync(LANE_DIR), true);
  clearLane();
});

test("steals a lock whose holder pid is dead", async () => {
  clearLane();
  const dead = Number(
    execFileSync("sh", ["-c", 'sh -c "exit 0" >/dev/null 2>&1 & echo $!; wait'], {
      encoding: "utf8",
    }).trim(),
  );
  writeHolder(dead, "killed-agent");
  const messages = [];
  assert.equal(
    await acquireGateLane("recovering", { ...LANE_OPTS, waitMs: 10, log: (m) => messages.push(m) }),
    "acquired",
  );
  assert.ok(messages.join(" ").includes("stole stale lane"));
  releaseGateLane(LANE_OPTS);
  clearLane();
});

test("releases through the CLI so the next run is not blocked", () => {
  clearLane();
  const child = runCli(["--owner", "cli", "--no-reap", "--", "echo", "RAN"], {
    [LANE_ENV]: undefined,
  });
  assert.equal(child.status, 0);
  assert.ok(child.stdout.includes("RAN"));
  assert.ok(child.stdout.includes("released"));
  assert.equal(existsSync(LANE_DIR), false);
  clearLane();
});

test("propagates the command exit code rather than swallowing a failure", () => {
  clearLane();
  const child = runCli(["--owner", "cli", "--no-reap", "--", "sh", "-c", "exit 3"], {
    [LANE_ENV]: undefined,
  });
  assert.equal(child.status, 3);
  assert.equal(existsSync(LANE_DIR), false);
  clearLane();
});
