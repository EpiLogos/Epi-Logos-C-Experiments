// End-to-end wiring tests for Sophia disclosure (C2 / Z-cycle rehear).
//
// These tests exercise `fireSophiaDisclosure` against a real tmpdir vault and
// assert the single-writer invariant introduced by the I1 fix: even if the
// tool surface records pending state multiple times, only one JSONL line is
// produced per session_id when the lifecycle handler fires once.

import { describe, it, beforeEach, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  fireSophiaDisclosure,
  recordPendingSophia,
  consumePendingSophia,
  clearAllPendingSophia,
  peekPendingSophia,
} from "../modules/sophia-fire.ts";
import { rehearPhaseVakAddress } from "../modules/z-phase-vak.ts";

describe("Sophia disclosure wiring (end-to-end)", () => {
  let workDir: string;
  let savedVault: string | undefined;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "sophia-wire-"));
    savedVault = process.env.EPILOGOS_VAULT;
    process.env.EPILOGOS_VAULT = workDir;
    clearAllPendingSophia();
  });

  afterEach(() => {
    if (savedVault === undefined) delete process.env.EPILOGOS_VAULT;
    else process.env.EPILOGOS_VAULT = savedVault;
    rmSync(workDir, { recursive: true, force: true });
    clearAllPendingSophia();
  });

  it("writes one canonical JSONL line with rehear-phase VAK + Night' direction", () => {
    const session_id = "agent:wire-test:main";
    const day_id = "29-05-2026";

    const result = fireSophiaDisclosure({
      session_id,
      day_id,
      artifacts: ["/vault/Idea/note.md"],
      improvement_vectors: ["load CT4 templates earlier"],
    });

    assert.equal(result.ok, true, `fire should succeed: ${JSON.stringify(result)}`);
    if (!result.ok) return; // narrow
    assert.ok(existsSync(result.path), "JSONL file should exist on disk");

    const raw = readFileSync(result.path, "utf8");
    const lines = raw.trim().split("\n");
    assert.equal(lines.length, 1, "exactly one JSONL line");

    const parsed = JSON.parse(lines[0]);
    assert.equal(parsed.kind, "sophia_session_end_disclosure");
    assert.equal(parsed.handoff_target, "aletheia_ingest");
    assert.equal(parsed.session_id, session_id);
    assert.equal(parsed.day_id, day_id);
    assert.deepEqual(parsed.final_vak, rehearPhaseVakAddress());
    assert.equal(parsed.final_vak.cs.direction, "Night'", "Night' direction survives JSON roundtrip");
    assert.deepEqual(parsed.artifacts, ["/vault/Idea/note.md"]);
    assert.deepEqual(parsed.improvement_vectors, ["load CT4 templates earlier"]);
  });

  it("returns ok:false with reason when EPILOGOS_VAULT is unset", () => {
    delete process.env.EPILOGOS_VAULT;
    const result = fireSophiaDisclosure({
      session_id: "agent:no-vault:main",
      day_id: "29-05-2026",
      artifacts: [],
      improvement_vectors: [],
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.reason, /EPILOGOS_VAULT/);
  });

  it("returns ok:false when session_id or day_id is missing", () => {
    const r1 = fireSophiaDisclosure({
      session_id: null,
      day_id: "29-05-2026",
      artifacts: [],
      improvement_vectors: [],
    });
    assert.equal(r1.ok, false);
    const r2 = fireSophiaDisclosure({
      session_id: "agent:x:main",
      day_id: null,
      artifacts: [],
      improvement_vectors: [],
    });
    assert.equal(r2.ok, false);
  });

  // ── I1 invariant: single-writer / no dual-fire ──────────────────────
  it("single-writer invariant: recordPendingSophia twice + fire once → ONE JSONL line", () => {
    const session_id = "agent:idempotent:main";
    const day_id = "29-05-2026";

    // Simulate tool calling khora_session_close twice (last writer wins).
    recordPendingSophia(session_id, ["/a.md"], ["v1"]);
    recordPendingSophia(session_id, ["/a.md", "/b.md"], ["v2"]);

    // Simulate lifecycle handler reading + clearing the pending state.
    const pending = consumePendingSophia(session_id);
    assert.deepEqual(pending.artifacts, ["/a.md", "/b.md"], "last writer wins");
    assert.deepEqual(pending.improvement_vectors, ["v2"]);
    assert.equal(peekPendingSophia(session_id), undefined, "pending cleared after consume");

    const result = fireSophiaDisclosure({
      session_id,
      day_id,
      artifacts: pending.artifacts,
      improvement_vectors: pending.improvement_vectors,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const lines = readFileSync(result.path, "utf8").trim().split("\n");
    assert.equal(lines.length, 1, "exactly ONE JSONL line — no dual-fire");
    const parsed = JSON.parse(lines[0]);
    assert.deepEqual(parsed.artifacts, ["/a.md", "/b.md"]);
    assert.deepEqual(parsed.improvement_vectors, ["v2"]);
  });

  it("consumePendingSophia returns empty defaults when nothing was recorded", () => {
    const pending = consumePendingSophia("agent:never-recorded:main");
    assert.deepEqual(pending, { artifacts: [], improvement_vectors: [] });
  });

  it("rehear VAK is used even if EPI_SESSION_VAK_ADDRESS holds a compose-phase VAK (I2)", () => {
    const session_id = "agent:env-shadow:main";
    const day_id = "29-05-2026";
    const savedEnvVak = process.env.EPI_SESSION_VAK_ADDRESS;
    process.env.EPI_SESSION_VAK_ADDRESS = JSON.stringify({
      cpf: "(00/00)",
      ct: ["CT0"],
      cp: "CP4.0",
      cf: "(00/00)",
      cfp: "CFP0",
      cs: { code: "CS1", direction: "Day" },
    });
    try {
      const result = fireSophiaDisclosure({
        session_id,
        day_id,
        artifacts: [],
        improvement_vectors: [],
      });
      assert.equal(result.ok, true);
      if (!result.ok) return;
      const parsed = JSON.parse(readFileSync(result.path, "utf8").trim());
      assert.deepEqual(parsed.final_vak, rehearPhaseVakAddress(),
        "env-VAK heuristic is dropped: rehear factory is the contract");
      assert.equal(parsed.final_vak.cf, "(5/0)");
    } finally {
      if (savedEnvVak === undefined) delete process.env.EPI_SESSION_VAK_ADDRESS;
      else process.env.EPI_SESSION_VAK_ADDRESS = savedEnvVak;
    }
  });
});
