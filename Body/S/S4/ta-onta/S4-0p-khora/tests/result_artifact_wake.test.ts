import { afterEach, beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createKhoraFlowWatcher,
  RESULT_ARTIFACT_WAKE,
  type KhoraFlowEvent,
  type KhoraFlowWatcher,
} from "../modules/flow-watcher.ts";

describe("Khora result artifact wake", () => {
  let root: string;
  let watcher: KhoraFlowWatcher | null;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "khora-result-wake-"));
    watcher = null;
  });

  afterEach(() => {
    watcher?.stop();
    rmSync(root, { recursive: true, force: true });
  });

  it("wakes when a sub-session result artifact lands in the parent NOW folder", async () => {
    const nowDir = join(root, "19-06-2026", "20260619-120000-parent");
    const dayDir = join(root, "19-06-2026");
    mkdirSync(nowDir, { recursive: true });

    const eventPromise = nextWake((onEvent) => {
      watcher = createKhoraFlowWatcher({
        sessionId: "20260619-120000-parent",
        dayId: "19-06-2026",
        resultDropNowDir: nowDir,
        resultDropDayDir: dayDir,
        debounceMs: 20,
        quietDurationMs: 60_000,
        onEvent,
      });
      watcher.start();
    });
    await armed();

    writeFileSync(
      join(nowDir, "implement.result.md"),
      "---\nc_4_purpose: implement\nc_4_artifact_role: async-result\n---\n[[Khora]] diff handle + verification report\n",
      "utf8",
    );

    const event = await eventPromise;
    assert.equal(event.kind, RESULT_ARTIFACT_WAKE);
    assert.equal(event.directory_scope, "now");
    assert.equal(event.purpose, "implement");
    assert.match(event.path, /implement\.result\.md$/);
    assert.equal(event.source, "artifact-created");
    assert.ok(watcher?.watchedPaths().includes(nowDir));
  });

  it("wakes when a cross-session result artifact lands in the day folder", async () => {
    const nowDir = join(root, "19-06-2026", "20260619-120000-parent");
    const dayDir = join(root, "19-06-2026");
    mkdirSync(nowDir, { recursive: true });

    const eventPromise = nextWake((onEvent) => {
      watcher = createKhoraFlowWatcher({
        sessionId: "20260619-120000-parent",
        dayId: "19-06-2026",
        resultDropNowDir: nowDir,
        resultDropDayDir: dayDir,
        debounceMs: 20,
        quietDurationMs: 60_000,
        onEvent,
      });
      watcher.start();
    });
    await armed();

    writeFileSync(
      join(dayDir, "review.result.md"),
      "---\nc_4_purpose: review\nc_4_artifact_role: async-result\n---\n[[Anima]] blocking/non-blocking review lines\n",
      "utf8",
    );

    const event = await eventPromise;
    assert.equal(event.kind, RESULT_ARTIFACT_WAKE);
    assert.equal(event.directory_scope, "day");
    assert.equal(event.purpose, "review");
    assert.match(event.path, /review\.result\.md$/);
    assert.equal(event.source, "artifact-created");
    assert.ok(watcher?.watchedPaths().includes(dayDir));
  });
});

/** Let the fs watcher arm before the artifact write — under full-gate load
 * the create can land inside the arming window and the wake is then racing
 * a wall-clock timer, not the behavior under test. */
function armed(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 100));
}

function nextWake(start: (onEvent: (event: KhoraFlowEvent) => void) => void): Promise<Extract<KhoraFlowEvent, { kind: typeof RESULT_ARTIFACT_WAKE }>> {
  return new Promise((resolve, reject) => {
    // Generous bound: the law is "the wake ARRIVES", not "arrives within 2s
    // on an idle box" — a loaded verify-all run must not turn latency into
    // a false red (observed: 2012ms timeout under the 23-suite gate).
    const timer = setTimeout(() => reject(new Error("timed out waiting for result artifact wake")), 15_000);
    start((event) => {
      if (event.kind !== RESULT_ARTIFACT_WAKE) return;
      clearTimeout(timer);
      resolve(event);
    });
  });
}
