// Aletheia Sophia ingest (C4 / Möbius seam TS handoff).
//
// At session end, Khora's `session_shutdown` lifecycle handler fires a Sophia
// disclosure (C2) to ${EPILOGOS_VAULT}/Pratibimba/Sophia/inbox/${session_id}.jsonl.
// Moirai (C3) optionally produces three short summaries (klotho / lachesis /
// atropos). C4 closes the seam at the TS layer: Aletheia reads the Sophia
// disclosure, fuses it with the (optional) Moirai outputs via the pure
// `routeToEpiiInbox` factory, and writes ONE JSONL line to
// ${EPILOGOS_VAULT}/Pratibimba/Epii/inbox/${session_id}.jsonl. That JSONL is
// the bridge surface that Epii-autoresearch-core (C5: Rust InboxStore, C6:
// recompose_pass) will consume.
//
// `routeToEpiiInbox` is PURE — no I/O. `aletheiaIngestSophia` performs the
// read/write file orchestration so the lifecycle/tool surfaces can stay thin.
//
// Importing `SophiaDisclosure` from the sibling anima package — within the
// ta-onta tree, anima (S4-4p) and aletheia (S4-5p) are siblings and the
// disclosure factory is part of the cross-package contract (see also
// `S4-0p-khora/modules/sophia-fire.ts` which imports from the same path).

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SophiaDisclosure } from "../../S4-4p-anima/modules/sophia-hook.ts";

export interface EpiiInboxEntry {
  kind: "epii_autoresearch_inbox_entry";
  source: "aletheia_sophia_ingest";
  session_id: string;
  day_id: string;
  final_vak: SophiaDisclosure["final_vak"];
  improvement_vectors: string[];
  moirai_summary: { klotho?: string; lachesis?: string; atropos?: string };
  artifacts: string[];
}

/**
 * Compose an Epii autoresearch inbox entry from a Sophia disclosure plus
 * (optional) Moirai outputs. The Möbius seam handoff at the TS layer.
 *
 * Pure: no I/O. Caller writes the JSON-serialized result to the Epii inbox.
 */
export function routeToEpiiInbox(input: {
  session_id: string;
  day_id: string;
  sophia_disclosure: SophiaDisclosure;
  moirai_outputs: { klotho?: string; lachesis?: string; atropos?: string };
}): EpiiInboxEntry {
  return {
    kind: "epii_autoresearch_inbox_entry",
    source: "aletheia_sophia_ingest",
    session_id: input.session_id,
    day_id: input.day_id,
    final_vak: input.sophia_disclosure.final_vak,
    improvement_vectors: input.sophia_disclosure.improvement_vectors,
    moirai_summary: input.moirai_outputs,
    artifacts: input.sophia_disclosure.artifacts,
  };
}

/**
 * File-I/O orchestration around `routeToEpiiInbox`. Reads the Sophia
 * disclosure JSONL for the given session, calls the pure factory, and
 * appends ONE JSONL line to the Epii inbox. Defensive against multi-line
 * Sophia files (C2's single-writer invariant should make this rare, but if
 * multiple disclosures landed we take the latest non-empty line).
 *
 * Returns `{ ok: true, path }` with the path of the Epii inbox file on
 * success, or `{ ok: false, reason }` with a stable reason string on any
 * failure (missing env, missing Sophia file, parse error). Callers can
 * surface `reason` directly in tool results.
 */
export function aletheiaIngestSophia(input: {
  session_id: string;
  day_id: string;
  moirai_outputs: { klotho?: string; lachesis?: string; atropos?: string };
}): { ok: true; path: string; payload: EpiiInboxEntry } | { ok: false; reason: string } {
  const vaultRoot = process.env.EPILOGOS_VAULT;
  if (!vaultRoot) {
    return { ok: false, reason: "EPILOGOS_VAULT not set" };
  }

  const sophiaPath = join(vaultRoot, "Pratibimba", "Sophia", "inbox", `${input.session_id}.jsonl`);
  if (!existsSync(sophiaPath)) {
    return { ok: false, reason: "no Sophia disclosure for session" };
  }

  const raw = readFileSync(sophiaPath, "utf8");
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { ok: false, reason: "Sophia disclosure file is empty" };
  }
  const lastLine = lines[lines.length - 1];

  let sophia_disclosure: SophiaDisclosure;
  try {
    sophia_disclosure = JSON.parse(lastLine) as SophiaDisclosure;
  } catch (e) {
    return { ok: false, reason: `Sophia disclosure JSON parse failed: ${e}` };
  }

  const payload = routeToEpiiInbox({
    session_id: input.session_id,
    day_id: input.day_id,
    sophia_disclosure,
    moirai_outputs: input.moirai_outputs ?? {},
  });

  const epiiInboxDir = join(vaultRoot, "Pratibimba", "Epii", "inbox");
  mkdirSync(epiiInboxDir, { recursive: true });
  const epiiInboxPath = join(epiiInboxDir, `${input.session_id}.jsonl`);
  appendFileSync(epiiInboxPath, JSON.stringify(payload) + "\n", "utf8");
  return { ok: true, path: epiiInboxPath, payload };
}
