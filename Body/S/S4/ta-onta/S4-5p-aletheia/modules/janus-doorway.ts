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

export type OracleCardKind = "tarot_major" | "tarot_pip" | "tarot_court" | "hexagram";
export type OracleLiveState = "generating" | "muting" | "mute";
export type KleinFace = "prospective" | "retrospective";
export type AspectKind = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface TargetAspect {
  /** Canonical mod-10 planet id: Sun=0, Moon=1, Mercury=2, ... Pluto=9. */
  planet_a: number;
  aspect_kind: AspectKind;
  planet_b_or_natal: number;
  exact_at?: string;
}

export interface OracleSpreadPosition {
  spread_id: string | number;
  position_idx: number;
  card_id: number;
  card_kind: OracleCardKind;
  card_name?: string;
  image_id?: string;
  drawn_at: string;
  drawn_in_session: string;
  target_aspect?: TargetAspect;
  live_state: OracleLiveState;
  last_recognition_at?: string;
  recognition_count: number;
  klein_face: KleinFace;
  ruling_planet?: string;
  decan?: string;
  state_changed_at?: string;
}

export interface DailyNoteRecognition {
  session_id: string;
  noted_at: string;
  body: string;
}

export interface JanusTrackSpreadsInput {
  session_id: string;
  positions: OracleSpreadPosition[];
  daily_notes: DailyNoteRecognition[];
}

export interface JanusEvaluateAlivenessInput {
  spread_id: string | number;
  positions: OracleSpreadPosition[];
  now: string;
}

export interface SpreadResolution {
  spread_id: string | number;
  resolved: boolean;
  resolved_at?: string;
}

export interface M4TemporalNow {
  /** Canonical mod-10 order: Sun=0, Moon=1, Mercury=2, Venus=3, Mars=4, Jupiter=5, Saturn=6, Uranus=7, Neptune=8, Pluto=9. */
  planet_degrees: number[];
}

export interface KairosMotionSignals {
  saturn_station?: boolean;
  mercury_retrograde_shadow_entry?: boolean;
  mercury_direct_station?: boolean;
}

export interface KleinWeighting {
  prospective: number;
  retrospective: number;
}

export interface JanusWeightSessionInput {
  session_id: string;
  M4_Temporal_Now: M4TemporalNow;
  natal_planet_degrees?: number[];
  kairos_signals?: KairosMotionSignals;
  user_override?: Partial<KleinWeighting>;
}

export interface JanusWeightSessionResult {
  session_id: string;
  c_3_klein_weighting: KleinWeighting;
  basis: string[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function parseTime(value: string): number {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new Error(`invalid timestamp "${value}"`);
  return time;
}

function daysBetween(start: string, end: string): number {
  return (parseTime(end) - parseTime(start)) / DAY_MS;
}

function hoursApart(a: string, b: string): number {
  return Math.abs(parseTime(a) - parseTime(b)) / HOUR_MS;
}

function normaliseText(value: string): string {
  return value.toLocaleLowerCase();
}

function includesTerm(text: string, term?: string): boolean {
  const clean = term?.trim();
  return !!clean && text.includes(normaliseText(clean));
}

function noteRecognisesPosition(noteBody: string, position: OracleSpreadPosition): boolean {
  const text = normaliseText(noteBody);
  return (
    includesTerm(text, position.card_name) ||
    includesTerm(text, position.image_id) ||
    includesTerm(text, position.decan) ||
    includesTerm(text, position.ruling_planet) ||
    (text.includes("live-spread") && text.includes(String(position.position_idx)))
  );
}

function latestIso(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return parseTime(a) >= parseTime(b) ? a : b;
}

function hasTargetAspectWithin(position: OracleSpreadPosition, now: string, days: number): boolean {
  const exactAt = position.target_aspect?.exact_at;
  return !!exactAt && Math.abs(daysBetween(exactAt, now)) <= days;
}

function hasRecognitionAfter(position: OracleSpreadPosition, timestamp?: string): boolean {
  if (!position.last_recognition_at || !timestamp) return false;
  return parseTime(position.last_recognition_at) > parseTime(timestamp);
}

/**
 * Track OracleSpread recognitions from daily-note text. Janus stays pure here:
 * callers provide the note corpus for the session; this function performs the
 * temporal filtering and position-reference detection.
 */
export function janus_track_spreads(input: JanusTrackSpreadsInput): OracleSpreadPosition[] {
  return input.positions.map((position) => {
    let recognitionCount = position.recognition_count;
    let lastRecognitionAt = position.last_recognition_at;
    const drawnAt = parseTime(position.drawn_at);

    for (const note of input.daily_notes) {
      if (note.session_id !== input.session_id) continue;
      if (parseTime(note.noted_at) < drawnAt) continue;
      if (!noteRecognisesPosition(note.body, position)) continue;
      recognitionCount += 1;
      lastRecognitionAt = latestIso(lastRecognitionAt, note.noted_at);
    }

    return {
      ...position,
      recognition_count: recognitionCount,
      last_recognition_at: lastRecognitionAt,
    };
  });
}

/**
 * Evaluate live-vs-mute transitions for an OracleSpread. The thresholds follow
 * the M4' prospective/retrospective canvas spec: unrecognised positions begin
 * muting after 14 days unless a target aspect is within seven days; muting
 * positions become mute after seven further days without recognition; mute
 * positions reopen when their target aspect is within 24 hours of exactness.
 */
export function janus_evaluate_aliveness(input: JanusEvaluateAlivenessInput): OracleSpreadPosition[] {
  return input.positions.map((position) => {
    if (position.spread_id !== input.spread_id) return { ...position };
    const next: OracleSpreadPosition = { ...position };

    if (next.live_state === "mute" && next.target_aspect?.exact_at && hoursApart(next.target_aspect.exact_at, input.now) <= 24) {
      return { ...next, live_state: "generating", state_changed_at: input.now };
    }

    if (next.live_state === "muting") {
      const changedAt = next.state_changed_at ?? next.drawn_at;
      if (!hasRecognitionAfter(next, changedAt) && daysBetween(changedAt, input.now) >= 7) {
        return { ...next, live_state: "mute", state_changed_at: input.now };
      }
      if (hasRecognitionAfter(next, changedAt)) {
        return { ...next, live_state: "generating", state_changed_at: input.now };
      }
      return next;
    }

    if (
      next.live_state === "generating" &&
      next.recognition_count === 0 &&
      daysBetween(next.drawn_at, input.now) > 14 &&
      !hasTargetAspectWithin(next, input.now, 7)
    ) {
      return { ...next, live_state: "muting", state_changed_at: input.now };
    }

    return next;
  });
}

/** Resolve a spread once every position in that spread has become mute. */
export function janus_spread_resolved(input: JanusEvaluateAlivenessInput): SpreadResolution {
  const spreadPositions = input.positions.filter((position) => position.spread_id === input.spread_id);
  const resolved = spreadPositions.length > 0 && spreadPositions.every((position) => position.live_state === "mute");
  return {
    spread_id: input.spread_id,
    resolved,
    resolved_at: resolved ? input.now : undefined,
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function roundWeight(value: number): number {
  return Math.round(value * 100) / 100;
}

function angularDistance(a: number, b: number): number {
  const diff = Math.abs((((a - b) % 360) + 360) % 360);
  return diff > 180 ? 360 - diff : diff;
}

function assertPlanetDegrees(degrees: number[]): void {
  if (!Array.isArray(degrees) || degrees.length < 10) {
    throw new Error("M4_Temporal_Now.planet_degrees must provide Sun(0) through Pluto(9).");
  }
  degrees.slice(0, 10).forEach((degree, index) => {
    if (!Number.isFinite(degree)) throw new Error(`planet_degrees[${index}] is not finite`);
  });
}

function fromProspective(prospective: number): KleinWeighting {
  const p = roundWeight(clamp01(prospective));
  return { prospective: p, retrospective: roundWeight(1 - p) };
}

/** Compute Janus's per-session prospective/retrospective Klein weighting. */
export function janus_weight_session(input: JanusWeightSessionInput): JanusWeightSessionResult {
  if (input.user_override?.prospective !== undefined || input.user_override?.retrospective !== undefined) {
    const prospective =
      input.user_override.prospective !== undefined ? input.user_override.prospective : 1 - input.user_override.retrospective!;
    return {
      session_id: input.session_id,
      c_3_klein_weighting: fromProspective(prospective),
      basis: ["user override"],
    };
  }

  const degrees = input.M4_Temporal_Now.planet_degrees;
  assertPlanetDegrees(degrees);

  const basis: string[] = [];
  let prospective = 0.5;
  const sun = degrees[0];
  const moon = degrees[1];
  const saturn = degrees[6];
  const natalSun = input.natal_planet_degrees?.[0];
  const natalSaturn = input.natal_planet_degrees?.[6];

  if (input.kairos_signals?.saturn_station) {
    prospective -= 0.3;
    basis.push("Saturn station: retrospective +0.3");
  }
  if (natalSaturn !== undefined && angularDistance(saturn, natalSaturn) <= 2) {
    prospective -= 0.5;
    basis.push("Saturn return: retrospective +0.5");
  }
  if (angularDistance(sun, moon) <= 6) {
    prospective += 0.3;
    basis.push("New Moon: prospective +0.3");
  }
  if (input.kairos_signals?.mercury_retrograde_shadow_entry) {
    prospective -= 0.2;
    basis.push("Mercury retrograde shadow entry: retrospective +0.2");
  }
  if (input.kairos_signals?.mercury_direct_station) {
    prospective += 0.2;
    basis.push("Mercury direct station: prospective +0.2");
  }
  if (natalSun !== undefined) {
    const sunDistance = angularDistance(sun, natalSun);
    if (Math.abs(sunDistance - 60) <= 2 || Math.abs(sunDistance - 120) <= 2) {
      basis.push("Sun trine/sextile natal Sun: balanced");
    }
  }

  if (basis.length === 0) basis.push("balanced kairos");

  return {
    session_id: input.session_id,
    c_3_klein_weighting: fromProspective(prospective),
    basis,
  };
}
