import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { chronos_aeon_fire, type AeonInvocationForm } from "../modules/aeon-scheduling.ts";
import type { VakAddress } from "../../shared/vak_address.ts";
import {
  advanceAeonTaskSource,
  aeonTaskSourceBlock,
  parseRalphPrdTranches,
  type AeonTaskSourceRef,
} from "../modules/aeon-task-source.ts";

const PRD = `# 2026-07-07-assess-improve

## Problem statement
Keep the loop honest.

## Implementation phases
- [x] scaffold the harness
- [ ] wire the verify gate
- [ ] land the eval rubric
* [ ] distil the return insight
`;

function tempRef(): AeonTaskSourceRef {
  const dir = mkdtempSync(join(tmpdir(), "aeon-task-source-"));
  return {
    kind: "ralph-prd",
    prd_path: join(dir, "plans", "2026-07-07-assess-improve.md"),
    checkpoint_path: join(dir, "checkpoints", "assess-improve.json"),
  };
}

function writePrd(ref: AeonTaskSourceRef, content: string) {
  mkdirSync(dirname(ref.prd_path), { recursive: true });
  writeFileSync(ref.prd_path, content);
}

describe("47.4 Aeon task-source binding", () => {
  it("parses Ralph PRD checkboxes into ordered tranches with source-done flags", () => {
    const tranches = parseRalphPrdTranches(PRD);
    assert.deepEqual(tranches.map((t) => [t.id, t.done_in_source]), [
      ["scaffold-the-harness", true],
      ["wire-the-verify-gate", false],
      ["land-the-eval-rubric", false],
      ["distil-the-return-insight", false],
    ]);
  });

  it("advances one tranche per fire, skipping PRD-checked items, and persists the checkpoint across fires", () => {
    const ref = tempRef();
    writePrd(ref, PRD);

    const first = advanceAeonTaskSource(ref, 1000);
    assert.equal(first.exhausted, false);
    assert.equal(first.tranche?.id, "wire-the-verify-gate");
    assert.equal(first.remaining_count, 2);

    // checkpoint persisted to disk — a fresh advance (new fire / new process) reads it
    const persisted = JSON.parse(readFileSync(ref.checkpoint_path, "utf8"));
    assert.deepEqual(persisted.completed, ["wire-the-verify-gate"]);
    assert.deepEqual(persisted.fires, [{ fired_at_ms: 1000, tranche_id: "wire-the-verify-gate" }]);

    const second = advanceAeonTaskSource(ref, 2000);
    assert.equal(second.tranche?.id, "land-the-eval-rubric");

    const third = advanceAeonTaskSource(ref, 3000);
    assert.equal(third.tranche?.id, "distil-the-return-insight");
    assert.equal(third.remaining_count, 0);

    const done = advanceAeonTaskSource(ref, 4000);
    assert.equal(done.exhausted, true);
    assert.equal(done.tranche, null);
    // exhaustion does not mutate the checkpoint
    const after = JSON.parse(readFileSync(ref.checkpoint_path, "utf8"));
    assert.equal(after.fires.length, 3);

    assert.match(aeonTaskSourceBlock(second), /tranche: land the eval rubric/);
    assert.match(aeonTaskSourceBlock(done), /EXHAUSTED/);
  });

  it("refuses unknown kinds, missing PRDs, and checkbox-free PRDs", () => {
    const ref = tempRef();
    assert.throws(
      () => advanceAeonTaskSource({ ...ref, kind: "beads" as never }),
      /unsupported Aeon task-source kind 'beads'/,
    );
    assert.throws(() => advanceAeonTaskSource(ref), /PRD not found/);
    writePrd(ref, "# empty prd\n\nno checkboxes here\n");
    assert.throws(() => advanceAeonTaskSource(ref), /contains no checkbox tranches/);
  });

  it("a scheduled Aeon bound to a Ralph PRD advances its tranches per fire through the Anima dispatch seam", async () => {
    const ref = tempRef();
    writePrd(ref, PRD);
    const vak: VakAddress = {
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT4b"],
      cp: "CP4.2",
      cf: "(0/1/2)",
      cfp: "Z",
      cs: { code: "CS4", direction: "Day" },
    };
    const aeon: AeonInvocationForm = {
      aeon_id: "assess-improve",
      aeon_name: "Assess And Improve",
      agent: "eros",
      task: "Advance the bound work-list.",
      vak_address: vak,
      schedule: "*/15 * * * *",
      consent_posture: { cpf: "(4.0/1-4.4/5)", granted: true, consent_gate: "user-granted-2026-07-07" },
      task_source: ref,
    };
    const envelopes: string[] = [];
    const dispatch = async (_agent: string, task: string) => {
      envelopes.push(task);
      return "dispatched";
    };

    const first = await chronos_aeon_fire({ aeon, trigger: "schedule", fired_at_ms: 111 }, dispatch);
    assert.equal(first.task_source_advance?.tranche?.id, "wire-the-verify-gate");
    assert.match(envelopes[0] ?? "", /tranche: wire the verify gate/);

    const second = await chronos_aeon_fire({ aeon, trigger: "schedule", fired_at_ms: 222 }, dispatch);
    assert.equal(second.task_source_advance?.tranche?.id, "land-the-eval-rubric");
    assert.match(envelopes[1] ?? "", /tranche: land the eval rubric/);

    // checkpoint persisted across fires on disk
    const cp = JSON.parse(readFileSync(ref.checkpoint_path, "utf8"));
    assert.deepEqual(cp.fires.map((f: { fired_at_ms: number }) => f.fired_at_ms), [111, 222]);
  });

  it("an exhausted task-source Aeon refuses dispatch instead of firing an open task", async () => {
    const ref = tempRef();
    writePrd(ref, "# tiny\n\n- [ ] only tranche\n");
    const aeon: AeonInvocationForm = {
      aeon_id: "tiny",
      aeon_name: "Tiny",
      agent: "eros",
      task: "Advance.",
      schedule: "*/5 * * * *",
      vak_address: {
        cpf: "(4.0/1-4.4/5)",
        ct: ["CT4b"],
        cp: "CP4.2",
        cf: "(0/1/2)",
        cfp: "Z",
        cs: { code: "CS4", direction: "Day" },
      },
      consent_posture: { cpf: "(4.0/1-4.4/5)", granted: true, consent_gate: "user-granted-2026-07-07" },
      task_source: ref,
    };
    let dispatched = 0;
    const dispatch = async () => { dispatched += 1; return "ok"; };

    const first = await chronos_aeon_fire({ aeon, trigger: "schedule" }, dispatch);
    assert.equal(first.task_source_advance?.exhausted, false);
    const done = await chronos_aeon_fire({ aeon, trigger: "schedule" }, dispatch);
    assert.equal(done.task_source_advance?.exhausted, true);
    assert.equal(done.dispatch_output, "task-source exhausted; no dispatch");
    assert.equal(dispatched, 1, "exhausted fire must not dispatch");
  });
});

