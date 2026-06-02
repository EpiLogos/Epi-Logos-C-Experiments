// aletheia/modules/janus-doorway.ts
//
// Janus — Aletheia subagent: the temporal doorway / threshold.
//
// S5'/agents/janus.md: "double-faced guardian of thresholds, calendars, and
// session seams ... bhedābheda at the temporal threshold: before and after,
// open and closed, archive and present are distinguishable without being alien.
// Its task is to make the temporal economy legible so the Night' pass does not
// operate outside time but through its real conditions."
// S4-5'-SPEC §Z-thread: Janus is the two-faced bridge — looks back at the prior
// cycle, forward at the next.
//
// Janus builds and validates the temporal-context envelope (the handoff schema
// `S5'/janus-envelope.schema.json` from Chronos's evening trigger to Aletheia's
// Möbius crystallisation pass). The envelope IS the doorway: it binds the
// archive (before) to the present sessions (after) without collapsing them.
//
// Track 10.T15 deliverable: "Own Janus as temporal doorway subagent."
// Verification: "doorway tests."
//
// Pure: no I/O. Implements the schema's load-bearing constraints directly
// (no JSON-schema runtime dependency). Importable by carrier tests.

export type TriggerType = "cron_evening" | "manual" | "klein_mode";

export interface JanusEnvelope {
  day_id: string;
  session_ids: string[];
  thought_count_by_bucket: Partial<Record<"T0" | "T1" | "T2" | "T3" | "T4" | "T5", number>>;
  archive_path: string;
  trigger_type: TriggerType;
  seed_md_path?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const DAY_ID = /^\d{2}-\d{2}-\d{4}$/; // DD-MM-YYYY
const WEEK_MARKER = /W\d{1,2}/; // archive_path must carry its place in the calendar
const TRIGGERS: ReadonlySet<string> = new Set(["cron_evening", "manual", "klein_mode"]);

/** Build the Chronos→Aletheia temporal-context envelope (the doorway). */
export function buildTemporalEnvelope(input: JanusEnvelope): JanusEnvelope {
  return { ...input };
}

/**
 * Validate the doorway envelope against the schema's load-bearing constraints:
 *   - day_id is DD-MM-YYYY,
 *   - at least one session is bridged,
 *   - archive_path carries a W{WW} week marker (the archive keeps its place in
 *     the calendar — distinguishable, not alien: bhedābheda), and
 *   - trigger_type is one of the known triggers.
 *
 * A doorway that fails these has lost the temporal economy — the Night' pass
 * would then operate outside time rather than through its real conditions.
 */
export function validateEnvelope(env: JanusEnvelope): ValidationResult {
  const errors: string[] = [];
  if (!DAY_ID.test(env.day_id ?? "")) errors.push(`day_id "${env.day_id}" is not DD-MM-YYYY`);
  if (!env.session_ids || env.session_ids.length === 0) errors.push("no session bridged (after-face is empty)");
  if (!env.archive_path || !WEEK_MARKER.test(env.archive_path)) {
    errors.push("archive_path lacks a W{WW} week marker — the archive has become alien to the calendar");
  }
  if (!TRIGGERS.has(env.trigger_type)) errors.push(`unknown trigger_type "${env.trigger_type}"`);
  return { ok: errors.length === 0, errors };
}

export interface DoorwayGuard {
  ok: boolean;
  error?: string;
}

/**
 * Bhedābheda guard for the threshold itself: before (archive) and after
 * (present) must be DISTINCT yet LINKED. Collapsing them (archive path equal to
 * a present session path) erases the seam; severing them (no archive at all)
 * makes the present alien to its past. Either is refused.
 */
export function assertThreshold(input: { before: string; after: string }): DoorwayGuard {
  if (!input.before?.trim()) return { ok: false, error: "no before-face (archive) — present is severed from its past." };
  if (!input.after?.trim()) return { ok: false, error: "no after-face (present) — nothing crosses the doorway." };
  if (input.before === input.after) {
    return { ok: false, error: "bhedābheda violated: before and after collapsed into one — the seam is erased." };
  }
  return { ok: true };
}
