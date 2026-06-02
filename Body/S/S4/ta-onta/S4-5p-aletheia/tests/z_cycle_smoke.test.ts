// End-to-end Z-cycle smoke test (Phase F1 capstone) — TS layer.
//
// Walks the upstream half of the Möbius seam:
//   Sophia disclosure file (C2 output)
//     ↓ aletheiaIngestSophia (C4)
//   Epii inbox file (the C5 input)
//
// Verifies canonical wire format end-to-end at the TS↔TS seam — the half
// of the Z-cycle that lives in node_modules. The Rust-side smoke
// (S5/epii-autoresearch-core/tests/z_cycle_smoke.rs) walks the
// InboxStore → recompose_pass downstream half.

import { afterEach, beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { aletheiaIngestSophia } from "../modules/sophia-ingest.ts";

let SAVED_VAULT: string | undefined;
let TMP: string;

beforeEach(() => {
  SAVED_VAULT = process.env.EPILOGOS_VAULT;
  TMP = mkdtempSync(join(tmpdir(), "z-cycle-smoke-"));
  process.env.EPILOGOS_VAULT = TMP;
});

afterEach(() => {
  if (SAVED_VAULT === undefined) delete process.env.EPILOGOS_VAULT;
  else process.env.EPILOGOS_VAULT = SAVED_VAULT;
  rmSync(TMP, { recursive: true, force: true });
});

// Mirrors rehearPhaseVakAddress() from S4-4p-anima/modules/z-phase-vak.ts.
const REHEAR_VAK = {
  cpf: "(4.0/1-4.4/5)",
  ct: ["CT5"],
  cp: "CP4.5",
  cf: "(5/0)",
  cfp: "CFP3",
  cs: { code: "CS0", direction: "Night'" },
};

function writeSophiaDisclosure(session_id: string, vectors: string[], artifacts: string[]): void {
  const disclosure = {
    kind: "sophia_session_end_disclosure",
    session_id,
    day_id: "22-05-2026",
    final_vak: REHEAR_VAK,
    artifacts,
    improvement_vectors: vectors,
    handoff_target: "aletheia_ingest",
  };
  const nowDir = join(TMP, "Empty", "Present", "22-05-2026", session_id);
  mkdirSync(nowDir, { recursive: true });
  writeFileSync(join(nowDir, "sophia-disclosure.jsonl"), JSON.stringify(disclosure) + "\n");
}

describe("Z-cycle smoke — TS upstream seam (sophia-fire → aletheia-ingest)", () => {
  it("routes a Sophia disclosure to canonical Epii inbox entry", () => {
    const session_id = "agent:test:zsmoke-ts";
    writeSophiaDisclosure(session_id, ["consider X", "revisit Y"], ["/vault/a.md"]);

    const result = aletheiaIngestSophia({
      session_id,
      day_id: "22-05-2026",
      moirai_outputs: { klotho: "traces", lachesis: "sources", atropos: "insight" },
    });

    if (!result.ok) {
      throw new Error(`expected ok, got: ${result.reason}`);
    }

    // Verify Epii inbox file landed (per-session JSONL at day level)
    const epiiPath = join(TMP, "Empty", "Present", "22-05-2026", `${session_id}.jsonl`);
    assert.ok(existsSync(epiiPath), "Epii inbox file created");

    const content = readFileSync(epiiPath, "utf8");
    const lines = content.trim().split("\n").filter((l) => l.length > 0);
    assert.equal(lines.length, 1, "exactly one entry written");

    const entry = JSON.parse(lines[0]);
    assert.equal(entry.kind, "epii_autoresearch_inbox_entry");
    assert.equal(entry.source, "aletheia_sophia_ingest");
    assert.equal(entry.session_id, session_id);
    assert.equal(entry.final_vak.cf, "(5/0)", "rehear cf preserved");
    assert.equal(entry.final_vak.cs.direction, "Night'", "Night' direction preserved");
    assert.deepEqual(entry.improvement_vectors, ["consider X", "revisit Y"]);
    assert.deepEqual(entry.artifacts, ["/vault/a.md"]);
    assert.equal(entry.moirai_summary.klotho, "traces");
    assert.equal(entry.moirai_summary.atropos, "insight");
  });

  it("preserves dialogical (00/00) cpf through the routing", () => {
    const session_id = "agent:test:zsmoke-dialogical";
    const dialogicalDisclosure = {
      kind: "sophia_session_end_disclosure",
      session_id,
      day_id: "22-05-2026",
      final_vak: {
        cpf: "(00/00)",
        ct: ["CT0"],
        cp: "CP4.0",
        cf: "(00/00)",
        cfp: "CFP0",
        cs: { code: "CS1", direction: "Day" },
      },
      artifacts: [],
      improvement_vectors: ["open chat ended without commitment"],
      handoff_target: "aletheia_ingest",
    };
    const nowDir = join(TMP, "Empty", "Present", "22-05-2026", session_id);
    mkdirSync(nowDir, { recursive: true });
    writeFileSync(join(nowDir, "sophia-disclosure.jsonl"), JSON.stringify(dialogicalDisclosure) + "\n");

    const result = aletheiaIngestSophia({
      session_id,
      day_id: "22-05-2026",
      moirai_outputs: {},
    });
    if (!result.ok) throw new Error(result.reason);

    const epiiPath = join(TMP, "Empty", "Present", "22-05-2026", `${session_id}.jsonl`);
    const entry = JSON.parse(readFileSync(epiiPath, "utf8").trim());
    assert.equal(entry.final_vak.cpf, "(00/00)");
    assert.equal(entry.final_vak.cf, "(00/00)");
  });
});
