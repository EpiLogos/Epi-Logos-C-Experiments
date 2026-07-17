import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import type { VakAddress } from "../../shared/vak_address.ts";
import type { ConversationSliceHandle } from "../../S4-4p-anima/modules/parent-slice.ts";
import { routeParentSliceCompletion } from "../modules/parent-slice-bifurcation.ts";

const vak: VakAddress = {
  cpf: "(4.0/1-4.4/5)", ct: ["CT2"], cp: "CP4.2", cf: "(0/1/2)", cfp: "CFP0",
  cs: { code: "CS2", direction: "Day" },
};

const parent_slice: ConversationSliceHandle = {
  session_key: "agent:main:main", day_anchor: "2026-07-17", now_start_tick: 10,
  now_end_tick: 14, thread_ids: ["thread-parent"], message_span: [7, 12],
  vak_filter: { address: vak, include_descendants: true }, redaction_policy: "full_context",
  provenance_audit_id: "audit-parent-1",
};

describe("12.T12.31 Chronos parent-slice bifurcation", () => {
  it("re-dispatches c=0 with the same slice and only its micro-history appended", async () => {
    const calls: Array<Record<string, unknown>> = [];
    const result = await routeParentSliceCompletion({
      agent_id: "eros", task_id: "task-1", c: 0, evidence: "inspect relation A",
      task_spec: "trace the relation", vak_frame: vak, parent_slice,
    }, {
      continueDispatch: async (input) => {
        calls.push(input as unknown as Record<string, unknown>);
        return "continued";
      },
    });
    assert.equal(result.route, "continue_tau");
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.target_agent, "eros");
    assert.match(String(calls[0]?.task_spec), /tau continuation/);
    assert.match(String(calls[0]?.task_spec), /inspect relation A/);
    assert.equal(calls[0]?.parent_slice, parent_slice);
  });

  it("folds c=1 through the existing session-continuation boundary", async () => {
    let summary = "";
    const result = await routeParentSliceCompletion({
      agent_id: "eros", task_id: "task-2", c: 1, evidence: "resonance map complete",
      task_spec: "trace the relation", vak_frame: vak, parent_slice,
    }, {
      foldContinuation: (received) => {
        summary = received;
        return "wrote CONTINUATION.md";
      },
    });
    assert.equal(result.route, "fold_tau_into_h");
    assert.match(summary, /task-2/);
    assert.match(summary, /resonance map complete/);
    assert.match(summary, /audit-parent-1/);
  });
});
