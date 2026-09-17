// Coordinate: S4-3' / S3 temporal control plane
// Residency: Body/S/S4/ta-onta/S4-3p-chronos/tests
// Position (#n): #3 orbit and re-entry acceptance
// Actualises: [[S4-3'-SPEC]] response scheduling and retrospective return
// Public surface: real filesystem + real epi cron round-trip for 19.T19.11
// Does NOT own: gateway cron storage law, Hen write authority, or Janus state law
// Contract: ../CONTRACT.md

import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import { khora_write_highlighted_inscription } from "../../S4-0p-khora/modules/highlighted-inscription.ts";
import {
  chronos_reentry,
  chronos_response_orbit,
} from "../modules/temporal-control-plane.ts";

const roots: string[] = [];
const previousEnv = new Map<string, string | undefined>();

function setEnv(name: string, value: string): void {
  if (!previousEnv.has(name)) previousEnv.set(name, process.env[name]);
  process.env[name] = value;
}

afterEach(() => {
  for (const [name, value] of previousEnv) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  previousEnv.clear();
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("Chronos temporal control plane", () => {
  it("schedules next-morning in the real cron store and re-enters through Hen, Janus, Mercurius, and Khora", async () => {
    const repoRoot = process.cwd();
    const epiBin = join(repoRoot, "target", "debug", "epi");
    assert.equal(existsSync(epiBin), true, `real epi binary missing at ${epiBin}`);

    const root = mkdtempSync(join(tmpdir(), "chronos-control-plane-"));
    roots.push(root);
    const gateRoot = join(root, "gate");
    const nowPath = join(root, "now.md");
    setEnv("EPI_BIN", epiBin);
    setEnv("EPI_REPO_ROOT", root);
    setEnv("EPI_GATE_STATE_ROOT", gateRoot);
    setEnv("EPI_CHRONOS_ORBIT_LEDGER", join(root, "chronos-orbits.jsonl"));
    setEnv("TZ", "Europe/London");

    writeFileSync(nowPath, [
      "---",
      "c_3_tranche_mode: quiet:60ms",
      "c_3_response_orbit: next-morning",
      "---",
      "The first tranche settles here.",
      "",
    ].join("\n"), "utf8");

    const trigger = {
      kind: "tranche.complete.quiet",
      session_id: "session-roundtrip",
      day_id: "14-07-2026",
      path: nowPath,
      source: "quiet-timer",
      detected_at: "2026-07-14T20:00:00.000Z",
      quiet_duration_ms: 60,
    } as const;
    const now = new Date("2026-07-14T20:00:00.000Z");
    const orbit = chronos_response_orbit({
      session_id: trigger.session_id,
      trigger_event: trigger,
      orbit: "next-morning",
    }, now);

    assert.equal(orbit.scheduled_at, "2026-07-15T05:00:00.000Z");
    assert.match(orbit.response_token, /^chronos_session-roundtrip_tranche_complete_quiet_/);

    const listed = spawnSync(epiBin, ["--json", "gate", "cron", "list"], {
      encoding: "utf8",
      env: process.env,
    });
    assert.equal(listed.status, 0, listed.stderr || listed.stdout);
    const jobs = (JSON.parse(listed.stdout) as { jobs: Array<Record<string, unknown>> }).jobs;
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0].wakeMode, "next-heartbeat");
    assert.deepEqual(jobs[0].schedule, {
      kind: "at",
      atMs: new Date("2026-07-15T05:00:00.000Z").getTime(),
    });

    await khora_write_highlighted_inscription({
      path: nowPath,
      category: "recognition",
      position: "top",
      content: "The first tranche was met.",
      response_token: orbit.response_token,
    });
    appendFileSync(nowPath, [
      "",
      "User addition after the orbit: the threshold is newly visible.",
      "live-spread: Mercury speech remains alive.",
      "gone mute: the earlier timing question is resolved.",
      "",
    ].join("\n"), "utf8");

    const result = await chronos_reentry({
      session_id: trigger.session_id,
      path: nowPath,
      response_token: orbit.response_token,
      since: trigger.detected_at,
    });
    assert.equal(result.response_token, orbit.response_token);
    assert.equal(result.category, "retrospective-surfacing");

    const written = readFileSync(nowPath, "utf8");
    assert.match(written, /^<mark class="m4-nara-highlight m4-nara-highlight-retrospective-surfacing"/);
    assert.match(written, new RegExp(`data-highlight-label="${orbit.response_token}"`));
    assert.match(written, /what is new: User addition after the orbit/);
    assert.match(written, /what is still alive: .*Mercury speech remains alive/);
    assert.match(written, /what has gone mute: .*timing question is resolved/);
    assert.match(written, /what kairos has activated: (?!Kairos unavailable)/);
  });
});
