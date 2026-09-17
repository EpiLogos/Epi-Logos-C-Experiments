/**
 * Coordinate: #0/S0 (ops harness test — Track 54 T54.05)
 * Residency: .codex/scripts/__tests__/neo4j-volume-backup.test.mjs
 * Actualises: the safety contract of `.codex/scripts/neo4j-volume-backup.sh`.
 *   The 2026-07-28 incident had TWO causes: an unscoped destructive command,
 *   and a 97%-full disk that ate the only snapshot. A scheduled backup script
 *   is a new instance of BOTH risks — it deletes files and it writes to a full
 *   disk. These tests pin the three refusals that keep it from becoming the
 *   next incident:
 *     (1) it refuses to write when free space is below the floor;
 *     (2) retention only ever deletes files matching its OWN naming pattern,
 *         and never the newest snapshot;
 *     (3) two runs cannot interleave (atomic-mkdir lock).
 * Does NOT own: the docker/tar mechanics (proved live by the restore in the
 *   T54.05 receipt — a backup never restored is not a backup).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SCRIPT = resolve(SCRIPT_DIR, "..", "neo4j-volume-backup.sh");

/** Run the script with an isolated backup dir and no reachable docker. */
function run(args, { dir, env = {} } = {}) {
  return spawnSync("bash", [SCRIPT, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      EPI_BACKUP_DIR: dir,
      EPI_BACKUP_VOLUME: "epi-test-volume-does-not-exist",
      ...env,
    },
  });
}

function freshDir() {
  const d = mkdtempSync(join(tmpdir(), "epi-backup-test-"));
  return d;
}

/** A file with the script's exact naming shape, aged `days` days. */
function makeSnapshot(dir, stamp, days) {
  const name = `epi-neo4j-data-${stamp}.tar.gz`;
  const p = join(dir, name);
  writeFileSync(p, "not-a-real-archive");
  writeFileSync(`${p}.sha256`, `deadbeef  ${name}\n`);
  if (days) {
    const t = new Date(Date.now() - days * 86400_000);
    const stampArg =
      String(t.getFullYear()) +
      String(t.getMonth() + 1).padStart(2, "0") +
      String(t.getDate()).padStart(2, "0") +
      String(t.getHours()).padStart(2, "0") +
      String(t.getMinutes()).padStart(2, "0");
    const r = spawnSync("touch", ["-t", stampArg, p, `${p}.sha256`], { encoding: "utf8" });
    assert.equal(r.status, 0, `touch failed: ${r.stderr}`);
  }
  return p;
}

test("check refuses when free space is below the floor", () => {
  const dir = freshDir();
  try {
    // A floor no filesystem can satisfy exercises the REAL df path — no
    // test-only backdoor into the space check.
    const r = run(["check"], { dir, env: { EPI_BACKUP_MIN_FREE_GIB: "9999999" } });
    assert.equal(r.status, 2, `expected exit 2, got ${r.status}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /REFUSED: insufficient free space/);
    assert.match(r.stderr, /NO snapshot taken/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check reports free space and passes the floor at 1GiB", () => {
  const dir = freshDir();
  try {
    const r = run(["check"], { dir, env: { EPI_BACKUP_MIN_FREE_GIB: "1" } });
    // docker volume is absent by design -> exit 4, but the space check ran first.
    assert.match(r.stdout, /free space: \d+MiB available · floor 1GiB/);
    assert.equal(r.status, 4, `expected the docker refusal after the space check, got ${r.status}`);
    assert.match(r.stderr, /docker volume 'epi-test-volume-does-not-exist' not found/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the projected-after check refuses even when current free space clears the floor", () => {
  const dir = freshDir();
  try {
    // No prior snapshot -> the estimate is the fallback. Make the fallback
    // enormous so `free - est` lands under an otherwise-satisfiable floor.
    const r = run(["check"], {
      dir,
      env: { EPI_BACKUP_MIN_FREE_GIB: "1", EPI_BACKUP_EST_FALLBACK_KIB: String(500 * 1024 * 1024) },
    });
    assert.equal(r.status, 2, `expected exit 2, got ${r.status}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /would leave .* below the 1GiB floor/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("prune deletes only aged files matching the script's own pattern", () => {
  const dir = freshDir();
  try {
    makeSnapshot(dir, "20260701T031500Z", 28);
    makeSnapshot(dir, "20260710T031500Z", 19);
    makeSnapshot(dir, "20260729T031500Z", 0);

    // Decoys the script must NEVER touch: not its pattern, not its business.
    const decoys = [
      "neo4j-data-forensic-20260728.tar.gz", // hand-curated forensic evidence
      "epi-neo4j-data-manual.tar.gz", // right prefix, wrong stamp shape
      "epi-neo4j-data-20260101.tar.gz", // truncated stamp
      "RESTORE-RUNBOOK.md",
      "backup.log",
    ];
    for (const name of decoys) {
      const p = join(dir, name);
      writeFileSync(p, "decoy");
      spawnSync("touch", ["-t", "202001010000", p]);
    }

    const r = run(["prune"], { dir, env: { EPI_BACKUP_RETAIN_DAYS: "7" } });
    assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);

    assert.ok(!existsSync(join(dir, "epi-neo4j-data-20260701T031500Z.tar.gz")), "aged snapshot survived");
    assert.ok(!existsSync(join(dir, "epi-neo4j-data-20260701T031500Z.tar.gz.sha256")), "orphan sidecar survived");
    assert.ok(!existsSync(join(dir, "epi-neo4j-data-20260710T031500Z.tar.gz")), "aged snapshot survived");
    assert.ok(existsSync(join(dir, "epi-neo4j-data-20260729T031500Z.tar.gz")), "current snapshot was deleted");

    for (const name of decoys) {
      assert.ok(existsSync(join(dir, name)), `prune deleted a file it does not own: ${name}`);
    }
    assert.match(r.stdout, /retention 7d enforced — 2 deleted/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("prune never deletes the newest snapshot, however old", () => {
  const dir = freshDir();
  try {
    makeSnapshot(dir, "20250101T031500Z", 400);
    makeSnapshot(dir, "20250601T031500Z", 300);
    const r = run(["prune"], { dir, env: { EPI_BACKUP_RETAIN_DAYS: "7" } });
    assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
    assert.ok(!existsSync(join(dir, "epi-neo4j-data-20250101T031500Z.tar.gz")));
    assert.ok(
      existsSync(join(dir, "epi-neo4j-data-20250601T031500Z.tar.gz")),
      "retention left ZERO backups — the failure mode the whole tranche exists to prevent",
    );
    assert.match(r.stdout, /keeping newest .* \(age-exempt\)/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a live lock holder makes the next tick skip rather than interleave", () => {
  const dir = freshDir();
  try {
    const lock = join(dir, ".lock");
    mkdirSync(lock, { recursive: true });
    writeFileSync(join(lock, "pid"), String(process.pid)); // demonstrably alive
    const r = run(["prune"], { dir });
    assert.equal(r.status, 3, `expected exit 3, got ${r.status}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /another run holds .*\.lock/);
    assert.match(r.stderr, /this tick is skipped/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a stale lock owned by a dead pid is reclaimed, not honoured forever", () => {
  const dir = freshDir();
  try {
    const lock = join(dir, ".lock");
    mkdirSync(lock, { recursive: true });
    writeFileSync(join(lock, "pid"), "999999"); // not running
    spawnSync("touch", ["-t", "202001010000", lock]);
    const r = run(["prune"], { dir, env: { EPI_BACKUP_LOCK_STALE_MIN: "120" } });
    assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /reclaiming stale lock/);
    assert.ok(!existsSync(lock), "the lock was not released on exit");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a fresh lock with a dead pid is still honoured (no eager stealing)", () => {
  const dir = freshDir();
  try {
    const lock = join(dir, ".lock");
    mkdirSync(lock, { recursive: true });
    writeFileSync(join(lock, "pid"), "999999");
    const r = run(["prune"], { dir, env: { EPI_BACKUP_LOCK_STALE_MIN: "120" } });
    assert.equal(r.status, 3, `expected exit 3, got ${r.status}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /stale threshold 120m/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("dry run names a UTC-stamped archive and writes nothing", () => {
  const dir = freshDir();
  try {
    const r = run(["snapshot", "--dry-run"], { dir, env: { EPI_BACKUP_MIN_FREE_GIB: "1" } });
    assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
    assert.match(
      r.stdout,
      /would snapshot volume 'epi-test-volume-does-not-exist' to .*\/epi-neo4j-data-\d{8}T\d{6}Z\.tar\.gz/,
    );
    assert.match(r.stdout, /nothing deleted/);
    assert.deepEqual(readdirSync(dir), [], "dry run left files behind");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the deployed launchd copy has not drifted from the repo copy", () => {
  // macOS TCC denies launchd agents access to ~/Documents, so the scheduled
  // job runs a COPY at ~/epi-backups/neo4j-volume-backup.sh (verified live on
  // 2026-07-29: pointing the plist into the repo dies with "Operation not
  // permitted"). That copy is the thing that actually runs at 03:15, so it
  // must not silently fall behind this file. Absent copy = not deployed here.
  const deployed = join(process.env.HOME ?? "", "epi-backups", "neo4j-volume-backup.sh");
  if (!existsSync(deployed)) {
    // Nothing deployed on this host; the schedule is not installed.
    return;
  }
  const sha = (p) => spawnSync("shasum", ["-a", "256", p], { encoding: "utf8" }).stdout.split(" ")[0];
  assert.equal(
    sha(deployed),
    sha(SCRIPT),
    `deployed backup script has drifted from the repo copy — re-run:\n  cp "${SCRIPT}" "${deployed}"`,
  );
});

test("an unknown subcommand is refused, not guessed", () => {
  const dir = freshDir();
  try {
    const r = run(["nuke"], { dir });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /unknown subcommand 'nuke'/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
