import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";
const validatorPath = join(
  repoRoot,
  "Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-t0-validate.mjs"
);

function writeCommand(dir, name, body = "echo ok") {
  const path = join(dir, name);
  writeFileSync(path, `#!/bin/sh\n${body}\n`);
  chmodSync(path, 0o755);
}

function runReadiness(binDir) {
  const result = spawnSync(process.execPath, [validatorPath, "--readiness"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: binDir
    }
  });

  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("readiness reports missing-command when epi and spacetime CLIs are absent", () => {
  const binDir = mkdtempSync(join(tmpdir(), "t10-readiness-"));

  try {
    writeCommand(binDir, "pnpm", "echo 10.0.0");
    writeCommand(binDir, "cargo", "echo cargo 1.0.0");
    writeCommand(binDir, "docker", "echo Docker Compose version v0.0.0");

    const output = runReadiness(binDir);
    const services = new Map(output.readiness.services.map((service) => [service.id, service]));

    assert.equal(services.get("tauri_app")?.status, "ready");
    assert.equal(services.get("s2_neo4j_redis")?.status, "ready");
    assert.equal(services.get("s3_gateway")?.status, "missing-command");
    assert.equal(services.get("s3_gateway")?.command, "epi");
    assert.equal(services.get("spacetimedb_module")?.status, "missing-command");
    assert.equal(services.get("spacetimedb_module")?.command, "spacetime");
  } finally {
    rmSync(binDir, { recursive: true, force: true });
  }
});
