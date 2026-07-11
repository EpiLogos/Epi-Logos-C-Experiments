/**
 * Coordinate: S4-0' Khora (sync-queue flush tests — CCT-16 ii)
 * Actualises: the real flush path as behavior — events batch by path and
 *   drive one `epi graph sync` per batch, flushed events land in the
 *   append-only audit companion and are idempotently skipped on re-flush,
 *   failed batches stay queued for retry, and a queue older than 60
 *   minutes raises the Janus staleness warning.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { appendFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  flushSyncQueue,
  flushedPath,
  queuePath,
  STALE_QUEUE_MINUTES,
} from "../modules/sync-queue-flush.ts";

describe("Khora sync_queue_flush (CCT-16 ii)", () => {
  let repoRoot: string;
  const NOW = Date.parse("2026-07-11T12:00:00Z");

  const enqueue = (path: string, ts: string) => {
    appendFileSync(
      queuePath(repoRoot),
      JSON.stringify({ path, coordinate: "S3", action: "write", ts }) + "\n",
      "utf8",
    );
  };

  beforeEach(() => {
    repoRoot = mkdtempSync(join(tmpdir(), "khora-sync-flush-"));
  });

  afterEach(() => {
    rmSync(repoRoot, { recursive: true, force: true });
  });

  it("sync_queue_flush batches by path, audits flushed events, and is idempotent on re-flush", () => {
    enqueue("Idea/Bimba/World/A.md", "2026-07-11T11:50:00Z");
    enqueue("Idea/Bimba/World/A.md", "2026-07-11T11:51:00Z");
    enqueue("Idea/Bimba/World/B.md", "2026-07-11T11:52:00Z");

    const synced: string[] = [];
    const report = flushSyncQueue(
      repoRoot,
      (path) => {
        synced.push(path);
        return { ok: true, output: "synced" };
      },
      NOW,
    );

    assert.equal(report.processed, 3);
    assert.equal(report.batches, 2, "two paths → two `epi graph sync` runs");
    assert.deepEqual(synced.sort(), ["Idea/Bimba/World/A.md", "Idea/Bimba/World/B.md"]);
    assert.equal(report.failures.length, 0);
    assert.equal(report.staleWarning, null);

    const audit = readFileSync(flushedPath(repoRoot), "utf8").trim().split("\n");
    assert.equal(audit.length, 3, "append-only audit trail carries every flushed event");
    assert.ok(audit.every((line) => JSON.parse(line).flushedAt));

    // Re-flush: idempotency on (path, ts) — nothing double-syncs.
    const again = flushSyncQueue(repoRoot, () => {
      throw new Error("must not re-sync already-flushed events");
    }, NOW);
    assert.equal(again.processed, 0);
    assert.equal(again.skippedAlreadyFlushed, 3);
  });

  it("sync_queue_flush keeps failed batches queued for retry", () => {
    enqueue("Idea/Bimba/World/A.md", "2026-07-11T11:50:00Z");
    enqueue("Idea/Bimba/World/B.md", "2026-07-11T11:51:00Z");

    const report = flushSyncQueue(
      repoRoot,
      (path) =>
        path.endsWith("A.md")
          ? { ok: false, output: "neo4j unreachable" }
          : { ok: true, output: "synced" },
      NOW,
    );
    assert.equal(report.processed, 1);
    assert.equal(report.failures.length, 1);
    assert.equal(report.failures[0].path, "Idea/Bimba/World/A.md");

    // The failed event is still unflushed → retried (and succeeds) next run.
    const retry = flushSyncQueue(repoRoot, () => ({ ok: true, output: "synced" }), NOW);
    assert.equal(retry.processed, 1);
    assert.equal(retry.skippedAlreadyFlushed, 1);
  });

  it("sync_queue_flush raises the Janus warning when the queue is stale", () => {
    const staleTs = new Date(NOW - (STALE_QUEUE_MINUTES + 5) * 60_000).toISOString();
    enqueue("Idea/Bimba/World/Old.md", staleTs);

    const report = flushSyncQueue(repoRoot, () => ({ ok: false, output: "down" }), NOW);
    assert.ok(report.staleWarning, "stale queue must raise the Janus warning");
    assert.match(report.staleWarning!, /janus-warning/);
  });
});
