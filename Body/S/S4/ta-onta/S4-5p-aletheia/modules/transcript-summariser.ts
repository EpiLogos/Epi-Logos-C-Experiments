/**
 * Coordinate: S4-5' (harness-blind transcript summariser — Tranche 42.9)
 * Residency: Body/S/S4/ta-onta/S4-5p-aletheia/modules
 * Actualises: the 42.9 pipeline seam — Sophia/Aletheia read the GATEWAY
 *   transcript (the 42.5 harness-neutral record shape written by
 *   Body/S/S3/gateway/src/transcripts.rs), never a harness-specific log.
 *   One reader, one summariser: a Pi-run and a Codex-run session flow
 *   through the identical code path (there is deliberately no branch on
 *   harness_id anywhere in this module — harness_id is carried as data).
 *   Episode group_id derives from the session's VAK address with the
 *   phase marker preserved verbatim (12.36 phase-preserving law).
 * Does NOT own: transcript writing (gateway transcripts.rs), Graphiti
 *   ingest transport (thought-tools.ts posts the episodes), VAK phase
 *   stamping (12.36 upstream emissions).
 */

import { readFileSync } from "node:fs";

/** One line of the gateway transcript jsonl (42.5 `TranscriptEntry`). */
export interface GatewayTranscriptEntry {
  kind: string;
  role: string;
  message: string;
  run_id?: string;
  harness_id?: string;
  vak_address?: TranscriptVakAddress;
  event?: unknown;
  timestamp_ms: number;
}

/** The VAK envelope as serialized on transcript records (portal-core shape). */
export interface TranscriptVakAddress {
  cpf: string;
  ct: string[];
  cp: string;
  cf: string;
  cfp: string;
  cs: { code: string; direction: string };
}

export interface TranscriptSummary {
  session_key: string;
  day_id: string;
  group_id: string;
  vak_address: TranscriptVakAddress;
  harness_ids: string[];
  turn_count: number;
  tool_call_count: number;
  episode_body: string;
  source_description: string;
}

/** Read the gateway transcript jsonl — the ONE reader for every harness. */
export function readGatewayTranscript(path: string): GatewayTranscriptEntry[] {
  const raw = readFileSync(path, "utf8");
  const entries: GatewayTranscriptEntry[] = [];
  for (const [index, line] of raw.split("\n").entries()) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      entries.push(JSON.parse(trimmed) as GatewayTranscriptEntry);
    } catch (err) {
      throw new Error(`gateway transcript ${path} line ${index + 1} is not valid jsonl: ${err}`);
    }
  }
  return entries;
}

/**
 * Derive the VAK-keyed Graphiti group_id: `{ day, session, VAK path executed }`
 * per the 42.9 spec, with the phase marker (e.g. the Night' prime) preserved
 * VERBATIM from the transcript's vak_address — never normalized away.
 */
export function deriveVakGroupId(input: {
  dayId: string;
  sessionKey: string;
  vak: TranscriptVakAddress;
}): string {
  const { code, direction } = input.vak.cs;
  return `vak:${input.dayId}:${input.sessionKey}:${input.vak.cp}:${code}:${direction}`;
}

/**
 * Summarise a gateway transcript for the Sophia (5/0) → Aletheia night'
 * crystallisation path. Pure over the entries; harness_id is aggregated as
 * data (provenance), never branched on.
 */
export function summariseTranscript(input: {
  entries: GatewayTranscriptEntry[];
  sessionKey: string;
  dayId: string;
}): TranscriptSummary {
  const vak = input.entries.map((entry) => entry.vak_address).find(Boolean);
  if (!vak) {
    throw new Error(
      `transcript for ${input.sessionKey} carries no vak_address on any record — cannot key the episode (12.36)`,
    );
  }
  const harness_ids = [
    ...new Set(
      input.entries
        .map((entry) => entry.harness_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];
  const turns = input.entries.filter((entry) => entry.kind === "harness_turn_event");
  const tool_call_count = turns.filter((entry) => /tool call/i.test(entry.message)).length;
  const lines = input.entries
    .filter((entry) => entry.message.trim().length > 0)
    .map((entry) => `${entry.role}: ${entry.message}`);
  return {
    session_key: input.sessionKey,
    day_id: input.dayId,
    group_id: deriveVakGroupId({ dayId: input.dayId, sessionKey: input.sessionKey, vak }),
    vak_address: vak,
    harness_ids,
    turn_count: turns.length,
    tool_call_count,
    episode_body: lines.join("\n"),
    source_description:
      `agent:aletheia:session_promote:vak=${vak.cp}:${vak.cs.code}:${vak.cs.direction}` +
      `:harnesses=${harness_ids.join("+") || "unattributed"}`,
  };
}

/**
 * Build the Graphiti episode payload for `aletheia_session_promote` from the
 * harness-neutral transcript summary (the EpisodeRequest shape served by
 * epi_gnostic graphiti_service `/episode`).
 */
export function buildTranscriptPromotionEpisode(summary: TranscriptSummary): Record<string, unknown> {
  return {
    content: summary.episode_body,
    ql_position: summary.vak_address.cp,
    cpf: summary.vak_address.cpf,
    cp: summary.vak_address.cp,
    source: "aletheia-session-promote",
    day_id: summary.day_id,
    group_id: summary.group_id,
  };
}
