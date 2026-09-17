/** 12.T12.31 behavioral contract: redaction is applied before child launch. */

import { execFileSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import type { VakAddress } from "../../shared/vak_address.ts";
import {
  parentSliceChildDispatchCommand,
  parentSliceChildEnvironment,
  type ConversationSliceHandle,
} from "../modules/parent-slice.ts";
import { resolveHarnessDispatch, type HarnessDispatchRequest } from "../modules/dispatch-policy.ts";
import {
  configureParentSliceCompletionEmitter,
  parentSliceCompletionFromDispatchOutput,
  publishParentSliceCompletion,
} from "../extension/dispatch.ts";

const vak: VakAddress = {
  cpf: "(4.0/1-4.4/5)", ct: ["CT2"], cp: "CP4.2", cf: "(0/1/2)", cfp: "CFP0",
  cs: { code: "CS2", direction: "Day" },
};

const slice: ConversationSliceHandle = {
  session_key: "agent:main:main",
  day_anchor: "2026-07-17",
  now_start_tick: 10,
  now_end_tick: 14,
  thread_ids: ["thread-parent"],
  message_span: [7, 12],
  vak_filter: { address: vak, include_descendants: true },
  redaction_policy: "governed_review_metadata_only",
  provenance_audit_id: "audit-parent-1",
};

describe("12.T12.31 parent-slice child dispatch", () => {
  it("passes only a redacted handle to the launched child command", () => {
    const environment = parentSliceChildEnvironment(slice);
    const delivered = JSON.parse(environment.EPI_PARENT_SLICE_HANDLE ?? "{}") as ConversationSliceHandle;
    assert.deepEqual(delivered.thread_ids, []);
    assert.deepEqual(delivered.message_span, [0, 0]);
    assert.equal(delivered.day_anchor, "2026-07-17");
    assert.deepEqual(delivered.vak_filter?.address, vak);

    const command = parentSliceChildDispatchCommand({
      target_agent: "eros", task_spec: "Find the relational resonance", vak_frame: vak, parent_slice: slice,
    });
    assert.match(command, /epi --json agent team dispatch/);
    assert.match(command, /--agent 'eros'/);
    assert.match(command, /--task 'Find the relational resonance'/);
    assert.doesNotMatch(command, /thread-parent/);
  });

  it("carries the redacted handle through the harness decision used by tmux topology", () => {
    const request: HarnessDispatchRequest = {
      purpose: "explore",
      roster: [{ harness_id: "local", available: true, authenticated: true, model_families: ["local"] }],
      model_slot_by_family: { local: "slot.local" },
      vak_frame: vak,
      parent_session_key: slice.session_key,
      parent_slice: slice,
      config: { subscription: {}, cost_class: { local: "cheap" } },
    };
    const dispatch = resolveHarnessDispatch(request);
    assert.deepEqual(dispatch.parent_slice?.thread_ids, []);
    assert.deepEqual(dispatch.parent_slice?.message_span, [0, 0]);
  });

  it("shell-quotes an apostrophe-bearing task before Pleroma passes it to tmux", () => {
    const command = parentSliceChildDispatchCommand({
      target_agent: "eros",
      task_spec: "preserve O'Brien's provenance",
      vak_frame: vak,
      parent_slice: slice,
    });
    const output = execFileSync(
      "sh",
      ["-c", command.replace("epi --json agent team dispatch", "printf '%s\\n'")],
      { encoding: "utf8" },
    );
    assert.equal(output, [
      "--parent-session",
      "agent:main:main",
      "--agent",
      "eros",
      "--task",
      "preserve O'Brien's provenance",
      "",
    ].join("\n"));
  });

  it("publishes the child's explicit c=0 signal onto Chronos's completion channel", async () => {
    const completion = parentSliceCompletionFromDispatchOutput({
      target_agent: "eros",
      task_spec: "trace the relation",
      vak_frame: vak,
      parent_slice: slice,
    }, JSON.stringify({
      ok: true,
      team_id: "team-parent-slice",
      output: "EPI_SUBGOAL_STATUS={\"c\":0,\"evidence\":\"inspect relation A\"}",
    }));
    assert.ok(completion);

    const bus = new EventEmitter();
    const received = new Promise<unknown>((resolve) => {
      bus.once("agent:team:dispatch:complete", resolve);
    });
    configureParentSliceCompletionEmitter((event) => { bus.emit("agent:team:dispatch:complete", event); });
    await publishParentSliceCompletion(completion);
    configureParentSliceCompletionEmitter(undefined);

    assert.deepEqual(await received, {
      ...completion,
      c: 0,
      evidence: "inspect relation A",
      taskId: "team-parent-slice",
    });
  });

  it("fails closed when the native child dispatch does not return a successful JSON report", () => {
    assert.equal(parentSliceCompletionFromDispatchOutput({
      target_agent: "eros",
      task_spec: "trace the relation",
      vak_frame: vak,
      parent_slice: slice,
    }, "agent error: terminal unavailable"), null);
  });
});
