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
      closure_kind: "rehear",
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
    assert.equal(parsed.closure_kind, "rehear");
  });

  it("returns ok:false with reason when EPILOGOS_VAULT is unset", () => {
    delete process.env.EPILOGOS_VAULT;
    const result = fireSophiaDisclosure({
      session_id: "agent:no-vault:main",
      day_id: "29-05-2026",
      artifacts: [],
      improvement_vectors: [],
      closure_kind: "rehear",
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
      closure_kind: "rehear",
    });
    assert.equal(r1.ok, false);
    const r2 = fireSophiaDisclosure({
      session_id: "agent:x:main",
      day_id: null,
      artifacts: [],
      improvement_vectors: [],
      closure_kind: "rehear",
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
    assert.equal(pending.had_pending, true, "had_pending true when recordPendingSophia was called");
    assert.deepEqual(pending.artifacts, ["/a.md", "/b.md"], "last writer wins");
    assert.deepEqual(pending.improvement_vectors, ["v2"]);
    assert.equal(peekPendingSophia(session_id), undefined, "pending cleared after consume");

    const result = fireSophiaDisclosure({
      session_id,
      day_id,
      artifacts: pending.artifacts,
      improvement_vectors: pending.improvement_vectors,
      closure_kind: pending.had_pending ? "rehear" : "force_closed",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const lines = readFileSync(result.path, "utf8").trim().split("\n");
    assert.equal(lines.length, 1, "exactly ONE JSONL line — no dual-fire");
    const parsed = JSON.parse(lines[0]);
    assert.deepEqual(parsed.artifacts, ["/a.md", "/b.md"]);
    assert.deepEqual(parsed.improvement_vectors, ["v2"]);
    assert.equal(parsed.closure_kind, "rehear");
  });

  it("consumePendingSophia distinguishes had_pending false (never recorded) from empty arrays", () => {
    const pending = consumePendingSophia("agent:never-recorded:main");
    assert.deepEqual(pending, { had_pending: false, artifacts: [], improvement_vectors: [] });
  });

  it("consumePendingSophia returns had_pending true even when recorded arrays are empty", () => {
    const session_id = "agent:empty-pending:main";
    recordPendingSophia(session_id, [], []);
    const pending = consumePendingSophia(session_id);
    assert.equal(pending.had_pending, true,
      "tool was called even if it stashed empty arrays — that still signals deliberate close");
    assert.deepEqual(pending.artifacts, []);
    assert.deepEqual(pending.improvement_vectors, []);
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
        closure_kind: "rehear",
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

  // ── closure_kind discriminator (replaces dropped env-VAK heuristic) ─────
  it("tags closure_kind=rehear when khora_session_close was called first (recordPendingSophia)", () => {
    const session_id = "agent:test:rehear-wire";
    const day_id = "29-05-2026";

    // Simulate tool surface — IS the deliberate-close signal.
    recordPendingSophia(session_id, ["/a.md"], ["v1"]);
    const consumed = consumePendingSophia(session_id);

    const result = fireSophiaDisclosure({
      session_id,
      day_id,
      artifacts: consumed.artifacts,
      improvement_vectors: consumed.improvement_vectors,
      closure_kind: consumed.had_pending ? "rehear" : "force_closed",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const parsed = JSON.parse(readFileSync(result.path, "utf8").trim());
    assert.equal(parsed.closure_kind, "rehear");
  });

  it("tags closure_kind=force_closed when lifecycle fires without prior recordPendingSophia", () => {
    const session_id = "agent:test:forced-wire";
    const day_id = "29-05-2026";

    // No recordPendingSophia call — simulates process kill before tool invocation.
    const consumed = consumePendingSophia(session_id);
    assert.equal(consumed.had_pending, false);

    const result = fireSophiaDisclosure({
      session_id,
      day_id,
      artifacts: consumed.artifacts,
      improvement_vectors: consumed.improvement_vectors,
      closure_kind: consumed.had_pending ? "rehear" : "force_closed",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const parsed = JSON.parse(readFileSync(result.path, "utf8").trim());
    assert.equal(parsed.closure_kind, "force_closed");
  });

  it("force_closed fallback uses rehearPhaseVakAddress when gateway read fails", () => {
    // `epi gate sessions get` may exit non-zero (gateway not running, session
    // not found, CLI absent on PATH) — trySafeReadSessionVak swallows it and
    // returns undefined, so final_vak falls back to rehearPhaseVakAddress.
    const session_id = "agent:test:nogateway";
    const day_id = "29-05-2026";

    const result = fireSophiaDisclosure({
      session_id,
      day_id,
      artifacts: [],
      improvement_vectors: [],
      closure_kind: "force_closed",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const parsed = JSON.parse(readFileSync(result.path, "utf8").trim());
    assert.equal(parsed.closure_kind, "force_closed");
    // When gateway read fails we fall through to rehearPhaseVakAddress —
    // cf="(5/0)" is the canonical Möbius shape.
    assert.equal(parsed.final_vak.cf, "(5/0)",
      "force_closed without gateway recovery falls back to rehearPhase shape");
  });
});
