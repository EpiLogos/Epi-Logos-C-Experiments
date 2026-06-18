// Sophia post-execution hook (C2 / Z-cycle rehear).
//
// At session end, Khora's `session_shutdown` lifecycle handler calls
// `buildSophiaDisclosure` to crystallise the rehearing: the final VAK address
// the session landed at, the artifacts it touched, and any improvement vectors
// surfaced during the run. The resulting `SophiaDisclosure` is the canonical
// envelope handed off to Aletheia (handoff_target = "aletheia_ingest", consumed
// by C4) which later routes it to Epii recompose (C5-C6).
//
// This module is PURE — no I/O, no side effects. The JSONL append + path
// resolution lives at the call site in Body/S/S4/ta-onta/S4-0p-khora/extension.ts
// session_shutdown handler. The factory shape is the contract; the inbox is
// the wire.
//
// Importing from `../../shared/vak_address.ts` (C Experiments canonical mirror) —
// see z-phase-vak.ts for the same convention.

import {
  isValidVakAddress,
  type VakAddress,
} from "../../shared/vak_address.ts";

/**
 * Discriminator that downstream (Aletheia C4, Epii C5–C6) uses to distinguish
 * sessions that were deliberately closed via the `khora_session_close` tool
 * (`"rehear"` — the canonical Möbius-return synthesis) from sessions whose
 * process was killed before the deliberate-close tool was invoked
 * (`"force_closed"` — lifecycle event still fired, but no explicit rehear).
 *
 * Primary signal: presence of `recordPendingSophia` state at consume time.
 * The act of calling `khora_session_close` IS the rehear signal — no
 * env-VAK heuristics, no comparison lies. See sophia-fire.ts.
 */
export type ClosureKind = "rehear" | "force_closed";

export interface SophiaDisclosure {
  kind: "sophia_session_end_disclosure";
  session_id: string;
  day_id: string;
  final_vak: VakAddress;
  artifacts: string[];
  improvement_vectors: string[];
  q_proposals: QProposal[];
  handoff_target: "aletheia_ingest";
  closure_kind: ClosureKind;
}

export interface QProposal {
  target_coordinate: string;
  q_key: string;
  q_value_candidate: string;
  qm_witness_session: string;
  qm_witness_vak: VakAddress;
  qm_witness_agent: string;
  rationale: string;
  opens_questions: string[];
  source_artifacts: string[];
}

export type AletheiaQProposalGuardian =
  | "anansi"
  | "janus"
  | "mercurius"
  | "agora"
  | "zeithoven";

export interface QProposalRoute {
  mode: "aletheia";
  coordinator: "psyche";
  guardian: AletheiaQProposalGuardian;
  review_surface: "tui_portal_pane" | "theia_agentic_control_room_tab";
  reason: string;
}

const Q_KEY_SHAPE = /^q_[0-5]'?(?:_\d+)?_[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
const PRIVATE_Q_PERSONAL = /\bq_personal\b/i;

export function isValidQKey(qKey: string): boolean {
  return Q_KEY_SHAPE.test(qKey);
}

export function validateQProposal(proposal: QProposal, index = 0): void {
  const label = `q_proposal[${index}]`;
  const requiredText: Array<[keyof QProposal, string]> = [
    ["target_coordinate", proposal.target_coordinate],
    ["q_key", proposal.q_key],
    ["q_value_candidate", proposal.q_value_candidate],
    ["qm_witness_session", proposal.qm_witness_session],
    ["qm_witness_agent", proposal.qm_witness_agent],
    ["rationale", proposal.rationale],
  ];
  for (const [field, value] of requiredText) {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`${label}.${String(field)} must be a non-empty string.`);
    }
  }
  if (!isValidQKey(proposal.q_key)) {
    throw new Error(`${label}.q_key must follow q_{0-5}{prime?}_{slot?}_{snake_case_facet}.`);
  }
  if (!isValidVakAddress(proposal.qm_witness_vak)) {
    throw new Error(`${label}.qm_witness_vak must be a canonical VakAddress.`);
  }
  if (!Array.isArray(proposal.opens_questions) || proposal.opens_questions.length === 0) {
    throw new Error(`${label}.opens_questions must contain at least one opening question.`);
  }
  if (proposal.opens_questions.some((question) => typeof question !== "string" || question.trim().length === 0)) {
    throw new Error(`${label}.opens_questions cannot contain empty questions.`);
  }
  if (!Array.isArray(proposal.source_artifacts)) {
    throw new Error(`${label}.source_artifacts must be an array.`);
  }
  if (proposal.source_artifacts.some((artifact) => typeof artifact !== "string" || artifact.trim().length === 0)) {
    throw new Error(`${label}.source_artifacts cannot contain empty artifacts.`);
  }
  const privacyScan = [
    proposal.q_key,
    proposal.q_value_candidate,
    proposal.rationale,
    ...proposal.opens_questions,
    ...proposal.source_artifacts,
  ].join("\n");
  if (PRIVATE_Q_PERSONAL.test(privacyScan)) {
    throw new Error(`${label} refused: private q_personal mention cannot enter the disclosure envelope.`);
  }
}

export function routeQProposalByVak(vak: VakAddress): QProposalRoute {
  switch (vak.cp) {
    case "CP4.0":
      return {
        mode: "aletheia",
        coordinator: "psyche",
        guardian: "anansi",
        review_surface: "tui_portal_pane",
        reason: "CP4.0 orientation routes q_proposal gap analysis through Anansi.",
      };
    case "CP4.1":
      return {
        mode: "aletheia",
        coordinator: "psyche",
        guardian: "janus",
        review_surface: "tui_portal_pane",
        reason: "CP4.1 threshold definition routes q_proposal temporal-window stamping through Janus.",
      };
    case "CP4.3":
      return {
        mode: "aletheia",
        coordinator: "psyche",
        guardian: "mercurius",
        review_surface: "theia_agentic_control_room_tab",
        reason: "CP4.3 pattern/translation routes multi-coordinate q_proposals through Mercurius.",
      };
    case "CP4.4":
      return {
        mode: "aletheia",
        coordinator: "psyche",
        guardian: "agora",
        review_surface: "theia_agentic_control_room_tab",
        reason: "CP4.4 contextual aggregation routes kin q_proposals through Agora.",
      };
    case "CP4.5":
      return {
        mode: "aletheia",
        coordinator: "psyche",
        guardian: "zeithoven",
        review_surface: "theia_agentic_control_room_tab",
        reason: "CP4.5 integration routes accepted q_proposals toward Zeithoven scheduling.",
      };
    case "CP4.2":
    default:
      return {
        mode: "aletheia",
        coordinator: "psyche",
        guardian: "anansi",
        review_surface: "tui_portal_pane",
        reason: "CP4.2 operative proposals start with Anansi orientation before any downstream guardian handoff.",
      };
  }
}

/**
 * Build a canonical Sophia disclosure envelope at session end.
 *
 * Pure factory: takes the closed session's identity + state and returns the
 * structured record. The caller (Khora session_shutdown) is responsible for
 * appending `JSON.stringify(disclosure) + "\n"` to the Sophia JSONL inbox.
 */
export function buildSophiaDisclosure(input: {
  session_id: string;
  day_id: string;
  final_vak: VakAddress;
  artifacts: string[];
  improvement_vectors: string[];
  closure_kind: ClosureKind;
  q_proposals?: QProposal[];
}): SophiaDisclosure {
  const q_proposals = input.q_proposals ?? [];
  q_proposals.forEach((proposal, index) => validateQProposal(proposal, index));
  return {
    kind: "sophia_session_end_disclosure",
    session_id: input.session_id,
    day_id: input.day_id,
    final_vak: input.final_vak,
    artifacts: input.artifacts,
    improvement_vectors: input.improvement_vectors,
    q_proposals,
    handoff_target: "aletheia_ingest",
    closure_kind: input.closure_kind,
  };
}
