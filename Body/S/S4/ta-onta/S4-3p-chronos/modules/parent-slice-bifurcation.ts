/**
 * Coordinate: S4-3' (Chronos parent-slice bifurcation router)
 * Residency: Body/S/S4/ta-onta/S4-3p-chronos/modules/parent-slice-bifurcation.ts
 * Position (#n): #3 — temporal c=1/c=0 continuation routing.
 * Actualises: 12.T12.31 HiP-If `(C, H, g_k, tau)` completion handling.
 * Public surface: routeParentSliceCompletion, parseParentSliceCompletion.
 * Does NOT own: slice storage, parent-session authority, or Anima selection.
 */

import { spawnSync } from "node:child_process";
import { dispatchWithParentSlice } from "../../S4-4p-anima/extension/dispatch.ts";
import type { VakAddress } from "../../shared/vak_address.ts";
import type { ConversationSliceHandle } from "../../S4-4p-anima/modules/parent-slice.ts";

export interface ParentSliceCompletion {
  readonly agent_id: string;
  readonly task_id: string;
  readonly c: 0 | 1;
  readonly evidence: string;
  readonly task_spec: string;
  readonly vak_frame: VakAddress;
  readonly parent_slice: ConversationSliceHandle;
}

export interface ParentSliceBifurcationResult {
  readonly route: "fold_tau_into_h" | "continue_tau";
  readonly task_id: string;
  readonly agent_id: string;
  readonly output: string;
}

export interface ParentSliceBifurcationDependencies {
  readonly continueDispatch?: typeof dispatchWithParentSlice;
  readonly foldContinuation?: (summary: string, parentSlice: ConversationSliceHandle) => string;
}

/**
 * Chronos owns the completion bifurcation, not the child launch policy:
 * `c=1` persists the folded horizon through the existing session continuation
 * surface; `c=0` keeps the same agent on its micro-history through Anima.
 */
export async function routeParentSliceCompletion(
  completion: ParentSliceCompletion,
  dependencies: ParentSliceBifurcationDependencies = {},
): Promise<ParentSliceBifurcationResult> {
  if (completion.c === 1) {
    const summary = foldedHorizonSummary(completion);
    const fold = dependencies.foldContinuation ?? writeSessionContinuation;
    return {
      route: "fold_tau_into_h",
      task_id: completion.task_id,
      agent_id: completion.agent_id,
      output: fold(summary, completion.parent_slice),
    };
  }

  const dispatch = dependencies.continueDispatch ?? dispatchWithParentSlice;
  const output = await dispatch({
    target_agent: completion.agent_id,
    task_spec: `${completion.task_spec}\n\n## tau continuation\n\n${completion.evidence}`,
    vak_frame: completion.vak_frame,
    parent_slice: completion.parent_slice,
  });
  return {
    route: "continue_tau",
    task_id: completion.task_id,
    agent_id: completion.agent_id,
    output,
  };
}

export function parseParentSliceCompletion(payload: Record<string, unknown>): ParentSliceCompletion | null {
  const c = payload.c;
  const parentSlice = record(payload.parent_slice);
  const vakFrame = record(payload.vak_frame);
  if ((c !== 0 && c !== 1) || !parentSlice || !vakFrame
    || typeof payload.agentId !== "string" || typeof payload.taskId !== "string"
    || typeof payload.evidence !== "string" || typeof payload.task_spec !== "string") {
    return null;
  }
  return {
    agent_id: payload.agentId,
    task_id: payload.taskId,
    c,
    evidence: payload.evidence,
    task_spec: payload.task_spec,
    vak_frame: vakFrame as VakAddress,
    parent_slice: parentSlice as ConversationSliceHandle,
  };
}

function writeSessionContinuation(summary: string, parentSlice: ConversationSliceHandle): string {
  const result = spawnSync(process.env.EPI_BIN || "epi", ["agent", "session", "continuation", "--summary", summary], {
    encoding: "utf8",
    env: { ...process.env, EPI_PARENT_SESSION: parentSlice.session_key },
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || "failed to write parent session continuation");
  }
  return result.stdout.trim();
}

function foldedHorizonSummary(completion: ParentSliceCompletion): string {
  return [
    `Parent-slice sub-goal ${completion.task_id} completed by ${completion.agent_id}.`,
    `DAY/NOW: ${completion.parent_slice.day_anchor} ticks ${completion.parent_slice.now_start_tick}-${completion.parent_slice.now_end_tick}.`,
    `VAK: ${JSON.stringify(completion.vak_frame)}.`,
    `Provenance: ${completion.parent_slice.provenance_audit_id}.`,
    "Child evidence:",
    completion.evidence,
  ].join("\n");
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
