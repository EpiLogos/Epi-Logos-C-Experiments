/**
 * Coordinate: S4-4' (Anima parent-context dispatch envelope)
 * Residency: Body/S/S4/ta-onta/S4-4p-anima/modules/parent-slice.ts
 * Position (#n): #4 — dispatch carries a bounded parent DAY/NOW horizon.
 * Actualises: 12.T12.31 `ConversationSliceHandle` over the S3 contract.
 * Public surface: ConversationSliceHandle, redactParentSliceForChild,
 *   parentSliceChildEnvironment, parentSliceChildDispatchCommand.
 * Does NOT own: conversation persistence, Redis reads, or session authority.
 */

import type { VakAddress } from "../../shared/vak_address.ts";

export type SliceRedactionPolicy =
  | "full_context"
  | "governed_review_metadata_only"
  | "decorrelated_summary";

export interface ConversationSliceHandle {
  readonly session_key: string;
  readonly day_anchor: string;
  readonly now_start_tick: number;
  readonly now_end_tick: number;
  readonly thread_ids: readonly string[];
  readonly message_span: readonly [number, number];
  readonly vak_filter?: {
    readonly address: VakAddress;
    readonly include_descendants: boolean;
  };
  readonly redaction_policy: SliceRedactionPolicy;
  readonly provenance_audit_id: string;
}

export function redactParentSliceForChild(slice: ConversationSliceHandle): ConversationSliceHandle {
  validateParentSlice(slice);
  switch (slice.redaction_policy) {
    case "full_context":
      return slice;
    case "governed_review_metadata_only":
      return { ...slice, thread_ids: [], message_span: [0, 0] };
    case "decorrelated_summary":
      return {
        ...slice,
        session_key: "decorrelated:pasu-public-pool",
        thread_ids: [],
        message_span: [0, 0],
      };
  }
}

/** The only parent-slice data a launched child process receives. */
export function parentSliceChildEnvironment(slice: ConversationSliceHandle): NodeJS.ProcessEnv {
  const redacted = redactParentSliceForChild(slice);
  return {
    EPI_PARENT_SESSION: redacted.session_key,
    EPI_PARENT_SLICE_HANDLE: JSON.stringify(redacted),
  };
}

/**
 * Builds the exact child command Pleroma passes to S0's tmux allocator. The
 * same command works inside a hidden tmux session or a cmux-attached session.
 */
export function parentSliceChildDispatchCommand(input: {
  readonly target_agent: string;
  readonly task_spec: string;
  readonly vak_frame: VakAddress;
  readonly parent_slice: ConversationSliceHandle;
}): string {
  const environment = parentSliceChildEnvironment(input.parent_slice);
  const binary = process.env.EPI_BIN || "epi";
  return [
    `EPI_PARENT_SESSION=${shellQuote(environment.EPI_PARENT_SESSION ?? "")}`,
    `EPI_PARENT_SLICE_HANDLE=${shellQuote(environment.EPI_PARENT_SLICE_HANDLE ?? "")}`,
    `EPI_SESSION_VAK_ADDRESS=${shellQuote(JSON.stringify(input.vak_frame))}`,
    `${binary === "epi" ? binary : shellQuote(binary)} --json agent team dispatch`,
    `--parent-session ${shellQuote(environment.EPI_PARENT_SESSION ?? "")}`,
    `--agent ${shellQuote(input.target_agent)}`,
    `--task ${shellQuote(input.task_spec)}`,
  ].join(" ");
}

function validateParentSlice(slice: ConversationSliceHandle): void {
  if (!slice.session_key || !slice.day_anchor || !slice.provenance_audit_id) {
    throw new Error("ConversationSliceHandle requires session_key, day_anchor, and provenance_audit_id");
  }
  const [start, end] = slice.message_span;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start) {
    throw new Error("ConversationSliceHandle message_span must be a non-negative [start, end) range");
  }
  if (!Number.isInteger(slice.now_start_tick) || !Number.isInteger(slice.now_end_tick)
    || slice.now_start_tick > slice.now_end_tick) {
    throw new Error("ConversationSliceHandle NOW tick window is invalid");
  }
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
