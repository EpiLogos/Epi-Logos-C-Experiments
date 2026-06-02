// Aletheia Sophia ingest (C4 / Möbius seam TS handoff).
//
// At session end, Khora's `session_shutdown` lifecycle handler fires a Sophia
// disclosure (C2) to
// `${EPILOGOS_VAULT}/Empty/Present/{day_id}/{session_id}/sophia-disclosure.jsonl`
// — i.e. into the session's own NOW folder. Moirai (C3) optionally produces
// three short summaries (klotho / lachesis / atropos). C4 closes the seam at
// the TS layer: Aletheia reads the per-session Sophia disclosure, fuses it
// with the (optional) Moirai outputs via the pure `routeToEpiiInbox` factory,
// and APPENDS ONE JSONL line to the **per-session Epii inbox file** at
// `${EPILOGOS_VAULT}/Empty/Present/{day_id}/{session_id}.jsonl` (the day
// folder IS the Epii inbox surface; each session is one file in it). The
// Rust C5 consumer `Body/S/S5/epii-autoresearch-core/src/inbox.rs`
// (`InboxStore`) reads the **exact same wire format** — its `root` is
// `${vault}/Empty/Present` and it composes the same `{day_id}/{session_id}.jsonl`
// path. The schema is the contract; any divergence is a wire break.
//
// Reorg 2026-06-02: the old per-session flat inboxes at
// `Pratibimba/Sophia/inbox/` and `Pratibimba/Epii/inbox/` were retired —
// agent inboxes are not first-class vault residents anymore. Sophia
// disclosures live inside the session's NOW subfolder; the Epii per-session
// JSONL sits at the day level alongside the session subfolder (Rust C5
// InboxStore already enforces this — `Pratibimba/Epii/inbox` writes are
// rejected at the source).
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
  /**
   * Propagated through from the Sophia disclosure. Distinguishes deliberate
   * close via `khora_session_close` ("rehear" — Möbius return synthesis) from
   * sessions whose process was killed before the explicit close tool fired
   * ("force_closed"). Epii C6 `recompose_pass` uses this to decide whether
   * the session deserves canonical recompose treatment or interrupted-flow
   * salvage. Defaults to "rehear" when reading older Sophia disclosures that
   * predate this field.
   */
  closure_kind: "rehear" | "force_closed";
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
    // Older Sophia disclosures (pre-closure_kind) default to "rehear" — the
    // historical assumption was that any disclosure represented deliberate
    // synthesis. New disclosures carry the discriminator explicitly.
    closure_kind: input.sophia_disclosure.closure_kind ?? "rehear",
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
// Uses appendFileSync — repeated invocations grow the Epii inbox jsonl. C5 InboxStore should treat each line as a distinct entry.
export function aletheiaIngestSophia(input: {
  session_id: string;
  day_id: string;
  moirai_outputs: { klotho?: string; lachesis?: string; atropos?: string };
}): { ok: true; path: string; payload: EpiiInboxEntry } | { ok: false; reason: string } {
  const vaultRoot = process.env.EPILOGOS_VAULT;
  if (!vaultRoot) {
    return { ok: false, reason: "EPILOGOS_VAULT not set" };
  }

  const sophiaPath = join(
    vaultRoot,
    "Empty",
    "Present",
    input.day_id,
    input.session_id,
    "sophia-disclosure.jsonl",
  );
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

  const dayDir = join(vaultRoot, "Empty", "Present", input.day_id);
  mkdirSync(dayDir, { recursive: true });
  const epiiInboxPath = join(dayDir, `${input.session_id}.jsonl`);
  appendFileSync(epiiInboxPath, JSON.stringify(payload) + "\n", "utf8");
  return { ok: true, path: epiiInboxPath, payload };
}
