// Coordinate: S4-0' / S0 flow completion detection
// Residency: Body/S/S4/ta-onta/S4-0p-khora/tests
// Position (#n): #0 watcher acceptance
// Actualises: [[S0-SPEC]] Khora flow-mode selection and completion emission
// Public surface: node:test acceptance coverage for createKhoraFlowWatcher
// Does NOT own: Chronos scheduling or retrospective composition
// Contract: ../CONTRACT.md

import { strict as assert } from "node:assert";
import { appendFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import {
  createKhoraFlowWatcher,
  TRANCHE_COMPLETE_EXPLICIT,
  TRANCHE_COMPLETE_QUIET,
  TRANCHE_COMPLETE_RHYTHM,
  type TrancheCompleteEvent,
} from "../modules/flow-watcher.ts";

const roots: string[] = [];

function note(mode: string, body = "Working body\n"): { root: string; path: string } {
  const root = mkdtempSync(join(tmpdir(), "khora-flow-watcher-"));
  roots.push(root);
  const path = join(root, "now.md");
  writeFileSync(path, `---\nc_3_tranche_mode: ${mode}\n---\n${body}`, "utf8");
  return { root, path };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("Khora flow watcher tranche modes", () => {
  it("emits explicit completion once on marker transition and ignores unrelated edits", async () => {
    const { path } = note("explicit");
    const events: TrancheCompleteEvent[] = [];
    const watcher = createKhoraFlowWatcher({
      sessionId: "session-explicit",
      dayId: "14-07-2026",
      nowPath: path,
      debounceMs: 10,
      onEvent: (event) => {
        if (event.kind !== "khora.result.wake") events.push(event);
      },
    });

    watcher.start();
    appendFileSync(path, "\n///\n", "utf8");
    await sleep(80);
    appendFileSync(path, "unrelated edit\n", "utf8");
    await sleep(80);
    watcher.stop();

    assert.deepEqual(events.map((event) => event.kind), [TRANCHE_COMPLETE_EXPLICIT]);
    assert.equal(events[0].source, "content-change");
  });

  it("reads quiet duration at start and resets the timer on a real keystroke", async () => {
    const { path } = note("quiet:60ms");
    const events: TrancheCompleteEvent[] = [];
    const watcher = createKhoraFlowWatcher({
      sessionId: "session-quiet",
      dayId: "14-07-2026",
      nowPath: path,
      debounceMs: 10,
      onEvent: (event) => {
        if (event.kind !== "khora.result.wake") events.push(event);
      },
    });

    watcher.start();
    await sleep(35);
    watcher.recordKeystroke(path);
    await sleep(35);
    assert.equal(events.length, 0, "keystroke must postpone quiet completion");
    await sleep(45);
    watcher.stop();

    assert.deepEqual(events.map((event) => event.kind), [TRANCHE_COMPLETE_QUIET]);
    assert.equal(events[0].quiet_duration_ms, 60);
  });

  it("emits rhythm only for a rhythm note reopened through the activity seam", async () => {
    const { path } = note("rhythm", "///\n");
    const events: TrancheCompleteEvent[] = [];
    const watcher = createKhoraFlowWatcher({
      sessionId: "session-rhythm",
      dayId: "14-07-2026",
      nowPath: path,
      debounceMs: 10,
      onEvent: (event) => {
        if (event.kind !== "khora.result.wake") events.push(event);
      },
    });

    watcher.start();
    appendFileSync(path, "changed while away\n", "utf8");
    await sleep(50);
    watcher.handleFileOpened(path);
    watcher.stop();

    assert.deepEqual(events.map((event) => event.kind), [TRANCHE_COMPLETE_RHYTHM]);
    assert.equal(events[0].source, "file-reentry");
  });
});
