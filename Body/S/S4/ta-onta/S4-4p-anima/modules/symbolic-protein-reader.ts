/**
 * symbolic-protein-reader — Mythos-owned in-session pattern reading over a protected M4 protein projection.
 *
 * @coordinate   S4-4' | Anima / Mythos
 * @residency    Body/S/S4/ta-onta/S4-4p-anima/modules/symbolic-protein-reader.ts
 * @position     #4 — Context / agentic pattern naming
 * @actualises   [[S4-SPEC]], [[S4-ARCHITECTURE]], and M4 Tranche 5.27
 *
 * Public surface:
 *   MythosSymbolicProteinSession — session-scoped trigger, history, and close binding
 *   createMythosArchetypeReading — provenance-bound cosmic-weather reading
 *   mythosConfigFromResolvedTunables — structured tunable-registry adapter
 * Does NOT own:
 *   M4 protein bodies, M3 Major Arcana labels, TOML parsing, or gateway/session persistence
 *
 * @contract     Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md
 */

export type MythosReadingTriggerMode =
  | "every-nth-utterance"
  | "every-mth-kairos-pulse"
  | "hybrid-utterance-and-pulse"
  | "adaptive";

export type MythosReificationGuardStrictness = "permissive" | "standard" | "strict";
export type MythosReadingEventKind = "user-utterance" | "kairos-pulse" | "session-close";

export interface MajorArcanaCardRef {
  readonly cardId: number;
  readonly label?: string;
}

export interface CosmicWeatherWeights {
  readonly m1: number;
  readonly m2: number;
  readonly m3: number;
}

export interface MythosSymbolicProteinConfig {
  readonly triggerMode: MythosReadingTriggerMode;
  readonly utteranceIntervalN: number;
  readonly kairosPulseIntervalM: number;
  readonly adaptiveFloorSeconds: number;
  readonly adaptiveCeilingSeconds: number;
  readonly cosmicWeatherWeights: CosmicWeatherWeights;
  readonly secondaryArchetypesCount: number;
  readonly voiceTemplatePath: string;
  readonly reificationGuardStrictness: MythosReificationGuardStrictness;
}

export interface MythosSymbolicProteinConfigOverrides {
  readonly triggerMode?: MythosReadingTriggerMode;
  readonly utteranceIntervalN?: number;
  readonly kairosPulseIntervalM?: number;
  readonly adaptiveFloorSeconds?: number;
  readonly adaptiveCeilingSeconds?: number;
  readonly cosmicWeatherWeights?: Partial<CosmicWeatherWeights>;
  readonly secondaryArchetypesCount?: number;
  readonly voiceTemplatePath?: string;
  readonly reificationGuardStrictness?: MythosReificationGuardStrictness;
}

export interface SymbolicProteinChainProjection {
  readonly proteinHandle: string;
  readonly chainPosition: number;
  /** Digest prepared inside the governed M4 surface; never the protein body. */
  readonly chainFingerprint: string;
}

export interface SymbolicProteinCosmicWeatherSnapshot {
  readonly m1SpandaTick: string | number;
  readonly m2CymaticPhase: string | number;
  readonly m3CodonTranscriptionState: string | number;
  readonly profileHandle?: string;
}

export interface MythosReadingProvenance {
  readonly sessionRef: string;
  readonly chainPositionRef: string;
  readonly cosmicWeatherSnapshotRef: string;
  readonly kairosPulseRef: string;
}

export interface MythosReadingEvent {
  readonly kind: MythosReadingEventKind;
  readonly occurredAtMs: number;
  readonly kairosPulseRef: string;
  readonly chain: SymbolicProteinChainProjection;
  readonly cosmicWeather: SymbolicProteinCosmicWeatherSnapshot;
  readonly provenance: MythosReadingProvenance;
}

export interface MythosArchetypeReading {
  readonly readingId: string;
  readonly ownerAgent: "[[Mythos]]";
  readonly dominantChromosomeArcana: MajorArcanaCardRef;
  readonly secondaryPatternArcanas: readonly MajorArcanaCardRef[];
  readonly narrativeSummary: string;
  readonly cosmicWeatherSnapshot: SymbolicProteinCosmicWeatherSnapshot;
  readonly provenance: MythosReadingProvenance;
  readonly chainPosition: number;
  readonly chainFingerprint: string;
  readonly createdAtMs: number;
  readonly voiceTemplatePath: string;
  readonly reificationGuardStrictness: MythosReificationGuardStrictness;
}

export interface MythosReadingEventResult {
  readonly triggered: boolean;
  readonly reason: string;
  readonly reading?: MythosArchetypeReading;
}

export interface MythosSymbolicProteinSessionSnapshot {
  readonly sessionId: string;
  readonly proteinHandle: string;
  readonly closed: boolean;
  readonly utteranceCount: number;
  readonly kairosPulseCount: number;
  readonly readingHistory: readonly MythosArchetypeReading[];
  readonly mythosArchetypeReading?: MythosArchetypeReading;
}

const CONFIG_PREFIX = "mythos.symbolic_protein_reading.";
const MAJOR_ARCANA_COUNT = 22;

export const DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_CONFIG: MythosSymbolicProteinConfig = deepFreezeConfig({
  triggerMode: "every-mth-kairos-pulse",
  utteranceIntervalN: 5,
  kairosPulseIntervalM: 3,
  adaptiveFloorSeconds: 90,
  adaptiveCeilingSeconds: 1800,
  cosmicWeatherWeights: { m1: 0.33, m2: 0.34, m3: 0.33 },
  secondaryArchetypesCount: 2,
  voiceTemplatePath:
    "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/symbolic-protein-reading/voice-templates/default.md",
  reificationGuardStrictness: "standard",
});

export function normalizeMythosSymbolicProteinConfig(
  overrides: MythosSymbolicProteinConfigOverrides = {},
): MythosSymbolicProteinConfig {
  const defaults = DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_CONFIG;
  const triggerMode = overrides.triggerMode ?? defaults.triggerMode;
  const reificationGuardStrictness =
    overrides.reificationGuardStrictness ?? defaults.reificationGuardStrictness;
  assertTriggerMode(triggerMode);
  assertGuardStrictness(reificationGuardStrictness);

  const utteranceIntervalN = overrides.utteranceIntervalN ?? defaults.utteranceIntervalN;
  const kairosPulseIntervalM = overrides.kairosPulseIntervalM ?? defaults.kairosPulseIntervalM;
  const adaptiveFloorSeconds = overrides.adaptiveFloorSeconds ?? defaults.adaptiveFloorSeconds;
  const adaptiveCeilingSeconds = overrides.adaptiveCeilingSeconds ?? defaults.adaptiveCeilingSeconds;
  const secondaryArchetypesCount =
    overrides.secondaryArchetypesCount ?? defaults.secondaryArchetypesCount;
  assertIntegerRange("utterance_interval_n", utteranceIntervalN, 1, 100);
  assertIntegerRange("kairos_pulse_interval_m", kairosPulseIntervalM, 1, 50);
  assertIntegerRange("adaptive_floor_seconds", adaptiveFloorSeconds, 1, Number.MAX_SAFE_INTEGER);
  assertIntegerRange("adaptive_ceiling_seconds", adaptiveCeilingSeconds, 1, Number.MAX_SAFE_INTEGER);
  if (adaptiveCeilingSeconds < adaptiveFloorSeconds) {
    throw new Error("adaptive_ceiling_seconds must be greater than or equal to adaptive_floor_seconds");
  }
  assertIntegerRange("secondary_archetypes_count", secondaryArchetypesCount, 0, 6);

  const cosmicWeatherWeights = {
    m1: overrides.cosmicWeatherWeights?.m1 ?? defaults.cosmicWeatherWeights.m1,
    m2: overrides.cosmicWeatherWeights?.m2 ?? defaults.cosmicWeatherWeights.m2,
    m3: overrides.cosmicWeatherWeights?.m3 ?? defaults.cosmicWeatherWeights.m3,
  };
  assertCosmicWeatherWeights(cosmicWeatherWeights);

  const voiceTemplatePath = overrides.voiceTemplatePath ?? defaults.voiceTemplatePath;
  if (!isNonEmptyString(voiceTemplatePath)) {
    throw new Error("voice_template_path must be a non-empty path");
  }

  return deepFreezeConfig({
    triggerMode,
    utteranceIntervalN,
    kairosPulseIntervalM,
    adaptiveFloorSeconds,
    adaptiveCeilingSeconds,
    cosmicWeatherWeights,
    secondaryArchetypesCount,
    voiceTemplatePath,
    reificationGuardStrictness,
  });
}

/**
 * Adapt values already parsed and validated by the portal-core tunable registry.
 * TOML syntax and merge precedence remain S0's concern; S4 consumes typed values.
 */
export function mythosConfigFromResolvedTunables(
  values: Readonly<Record<string, unknown>>,
): MythosSymbolicProteinConfig {
  const value = (name: string) => values[`${CONFIG_PREFIX}${name}`];
  return normalizeMythosSymbolicProteinConfig({
    triggerMode: value("trigger_mode") as MythosReadingTriggerMode | undefined,
    utteranceIntervalN: value("utterance_interval_n") as number | undefined,
    kairosPulseIntervalM: value("kairos_pulse_interval_m") as number | undefined,
    adaptiveFloorSeconds: value("adaptive_floor_seconds") as number | undefined,
    adaptiveCeilingSeconds: value("adaptive_ceiling_seconds") as number | undefined,
    cosmicWeatherWeights: value("cosmic_weather_weights") as Partial<CosmicWeatherWeights> | undefined,
    secondaryArchetypesCount: value("secondary_archetypes_count") as number | undefined,
    voiceTemplatePath: value("voice_template_path") as string | undefined,
    reificationGuardStrictness: value("reification_guard_strictness") as
      | MythosReificationGuardStrictness
      | undefined,
  });
}

export function createMythosArchetypeReading(input: {
  readonly event: MythosReadingEvent;
  readonly config: MythosSymbolicProteinConfig;
}): MythosArchetypeReading {
  assertReadingEvent(input.event);
  assertRequiredProvenance(input.event.provenance);

  const dominantCardId = dominantArcanaCardId(
    input.event.chain,
    input.event.cosmicWeather,
    input.config.cosmicWeatherWeights,
  );
  const dominantChromosomeArcana = cardRef(dominantCardId);
  const secondaryPatternArcanas = secondaryCardRefs(
    dominantCardId,
    input.event.chain.chainPosition,
    input.config.secondaryArchetypesCount,
  );
  const narrativeSummary = buildNarrativeSummary(
    dominantChromosomeArcana,
    input.event.cosmicWeather,
    input.event.chain.chainPosition,
  );
  const voiceVerdict = assertMythosNarrativeVoiceLaw(
    narrativeSummary,
    input.config.reificationGuardStrictness,
  );
  if (!voiceVerdict.ok) throw new Error(voiceVerdict.error);

  return Object.freeze({
    readingId: `${input.event.chain.proteinHandle}:mythos:${input.event.chain.chainPosition}:${stableHash(input.event.kairosPulseRef)}`,
    ownerAgent: "[[Mythos]]" as const,
    dominantChromosomeArcana,
    secondaryPatternArcanas,
    narrativeSummary,
    cosmicWeatherSnapshot: Object.freeze({ ...input.event.cosmicWeather }),
    provenance: Object.freeze({ ...input.event.provenance }),
    chainPosition: input.event.chain.chainPosition,
    chainFingerprint: input.event.chain.chainFingerprint,
    createdAtMs: input.event.occurredAtMs,
    voiceTemplatePath: input.config.voiceTemplatePath,
    reificationGuardStrictness: input.config.reificationGuardStrictness,
  });
}

export function assertMythosNarrativeVoiceLaw(
  summary: string,
  strictness: MythosReificationGuardStrictness = "standard",
): { readonly ok: boolean; readonly error?: string } {
  if (!isNonEmptyString(summary)) {
    return { ok: false, error: "Mythos reading requires a narrative summary." };
  }
  const lower = summary.toLowerCase();
  if (/\b(this\s+)?session\s+is\b/.test(lower) || /\bcodon\s+arc\s+is\b/.test(lower)) {
    return {
      ok: false,
      error: "Reification guard: the session may figure an archetype but may not be identified with it.",
    };
  }
  if (strictness !== "permissive" && !/\bfigures?\b|\bsuggests?\b|\bnames?\b/.test(lower)) {
    return {
      ok: false,
      error: "Reification guard: the summary must use provisional pattern-naming language.",
    };
  }
  if (strictness === "strict" && !/\bunder\b.*\b(?:cosmic-)?weather\b/.test(lower)) {
    return {
      ok: false,
      error: "Strict Mythos voice requires explicit cosmic-weather grounding.",
    };
  }
  return { ok: true };
}

export function mythosReadingHasRequiredProvenance(reading: MythosArchetypeReading): boolean {
  return provenanceValues(reading.provenance).every(isWikilink);
}

export class MythosSymbolicProteinSession {
  readonly #sessionId: string;
  readonly #proteinHandle: string;
  readonly #config: MythosSymbolicProteinConfig;
  #utteranceCount = 0;
  #kairosPulseCount = 0;
  #lastReadAtMs: number | undefined;
  #closed = false;
  #readingHistory: MythosArchetypeReading[] = [];
  #finalReading: MythosArchetypeReading | undefined;

  constructor(input: {
    readonly sessionId: string;
    readonly proteinHandle: string;
    readonly config?: MythosSymbolicProteinConfig;
  }) {
    if (!isNonEmptyString(input.sessionId)) throw new Error("Mythos session requires sessionId");
    if (!isProtectedProteinHandle(input.proteinHandle)) {
      throw new Error("Mythos session requires an opaque m4-protein:// handle");
    }
    this.#sessionId = input.sessionId;
    this.#proteinHandle = input.proteinHandle;
    this.#config = input.config ?? DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_CONFIG;
  }

  consume(event: MythosReadingEvent): MythosReadingEventResult {
    if (this.#closed) throw new Error(`Mythos symbolic-protein session ${this.#sessionId} is already closed`);
    if (event.chain.proteinHandle !== this.#proteinHandle) {
      throw new Error("Mythos event protein handle does not match the open session");
    }
    assertReadingEvent(event);

    const nextUtteranceCount = this.#utteranceCount + (event.kind === "user-utterance" ? 1 : 0);
    const nextKairosPulseCount = this.#kairosPulseCount + (event.kind === "kairos-pulse" ? 1 : 0);
    const decision = decideTrigger({
      event,
      config: this.#config,
      utteranceCount: nextUtteranceCount,
      kairosPulseCount: nextKairosPulseCount,
      lastReadAtMs: this.#lastReadAtMs,
    });

    const reading = decision.triggered
      ? createMythosArchetypeReading({ event, config: this.#config })
      : undefined;
    this.#utteranceCount = nextUtteranceCount;
    this.#kairosPulseCount = nextKairosPulseCount;
    if (reading) {
      this.#readingHistory.push(reading);
      this.#lastReadAtMs = event.occurredAtMs;
    }
    if (event.kind === "session-close") {
      this.#closed = true;
      this.#finalReading = reading;
    }
    return Object.freeze({ ...decision, reading });
  }

  snapshot(): MythosSymbolicProteinSessionSnapshot {
    return Object.freeze({
      sessionId: this.#sessionId,
      proteinHandle: this.#proteinHandle,
      closed: this.#closed,
      utteranceCount: this.#utteranceCount,
      kairosPulseCount: this.#kairosPulseCount,
      readingHistory: Object.freeze([...this.#readingHistory]),
      mythosArchetypeReading: this.#finalReading,
    });
  }
}

function decideTrigger(input: {
  readonly event: MythosReadingEvent;
  readonly config: MythosSymbolicProteinConfig;
  readonly utteranceCount: number;
  readonly kairosPulseCount: number;
  readonly lastReadAtMs?: number;
}): Pick<MythosReadingEventResult, "triggered" | "reason"> {
  if (input.event.kind === "session-close") {
    return { triggered: true, reason: "session-close-final-mythos-read" };
  }
  const utteranceHit =
    input.event.kind === "user-utterance" &&
    input.utteranceCount % input.config.utteranceIntervalN === 0;
  const kairosHit =
    input.event.kind === "kairos-pulse" &&
    input.kairosPulseCount % input.config.kairosPulseIntervalM === 0;

  switch (input.config.triggerMode) {
    case "every-nth-utterance":
      return {
        triggered: utteranceHit,
        reason: utteranceHit ? "utterance-interval" : "utterance-interval-pending",
      };
    case "every-mth-kairos-pulse":
      return {
        triggered: kairosHit,
        reason: kairosHit ? "kairos-pulse-interval" : "kairos-pulse-interval-pending",
      };
    case "hybrid-utterance-and-pulse":
      return {
        triggered: utteranceHit || kairosHit,
        reason: utteranceHit
          ? "hybrid-utterance-interval"
          : kairosHit
            ? "hybrid-kairos-pulse-interval"
            : "hybrid-pending",
      };
    case "adaptive": {
      if (input.lastReadAtMs === undefined) {
        return { triggered: true, reason: "adaptive-first-read" };
      }
      const elapsedSeconds = Math.max(0, (input.event.occurredAtMs - input.lastReadAtMs) / 1_000);
      if (elapsedSeconds >= input.config.adaptiveCeilingSeconds) {
        return { triggered: true, reason: "adaptive-ceiling" };
      }
      if (elapsedSeconds >= input.config.adaptiveFloorSeconds && (utteranceHit || kairosHit)) {
        return {
          triggered: true,
          reason: utteranceHit ? "adaptive-utterance-floor" : "adaptive-kairos-floor",
        };
      }
      return { triggered: false, reason: "adaptive-floor-pending" };
    }
  }
}

function dominantArcanaCardId(
  chain: SymbolicProteinChainProjection,
  weather: SymbolicProteinCosmicWeatherSnapshot,
  weights: CosmicWeatherWeights,
): number {
  const chainIndex = positiveModulo(
    stableHash(chain.proteinHandle) + stableHash(chain.chainFingerprint) + chain.chainPosition,
    MAJOR_ARCANA_COUNT,
  );
  const weightedWeather = Math.round(
    valueArcanaIndex(weather.m1SpandaTick) * weights.m1 +
      valueArcanaIndex(weather.m2CymaticPhase) * weights.m2 +
      valueArcanaIndex(weather.m3CodonTranscriptionState) * weights.m3,
  );
  return positiveModulo(chainIndex + weightedWeather, MAJOR_ARCANA_COUNT);
}

function secondaryCardRefs(dominantCardId: number, chainPosition: number, count: number) {
  const refs: MajorArcanaCardRef[] = [];
  for (let step = 1; refs.length < count; step++) {
    const candidate = positiveModulo(dominantCardId + chainPosition + step * 7, MAJOR_ARCANA_COUNT);
    if (candidate !== dominantCardId && !refs.some((ref) => ref.cardId === candidate)) {
      refs.push(cardRef(candidate));
    }
  }
  return Object.freeze(refs);
}

function cardRef(cardId: number): MajorArcanaCardRef {
  return Object.freeze({ cardId: positiveModulo(cardId, MAJOR_ARCANA_COUNT) });
}

function buildNarrativeSummary(
  dominant: MajorArcanaCardRef,
  weather: SymbolicProteinCosmicWeatherSnapshot,
  chainPosition: number,
): string {
  const archetype = dominant.label ?? `Major Arcana #${dominant.cardId}`;
  return (
    `This session's codon arc figures archetype ${archetype} under cosmic-weather ` +
    `M1 ${String(weather.m1SpandaTick)}, M2 ${String(weather.m2CymaticPhase)}, and ` +
    `M3 ${String(weather.m3CodonTranscriptionState)} at chain position ${chainPosition}; ` +
    "the pattern remains provisional and provenance-bound."
  );
}

function assertReadingEvent(event: MythosReadingEvent): void {
  if (!Number.isFinite(event.occurredAtMs) || event.occurredAtMs < 0) {
    throw new Error("Mythos event requires a non-negative occurredAtMs");
  }
  if (!Number.isInteger(event.chain.chainPosition) || event.chain.chainPosition < 0) {
    throw new Error("Mythos chain projection requires a non-negative chainPosition");
  }
  if (!isNonEmptyString(event.chain.chainFingerprint)) {
    throw new Error("Mythos chain projection requires a governed chain fingerprint");
  }
  for (const value of [
    event.cosmicWeather.m1SpandaTick,
    event.cosmicWeather.m2CymaticPhase,
    event.cosmicWeather.m3CodonTranscriptionState,
  ]) {
    if (!(isNonEmptyString(value) || (typeof value === "number" && Number.isFinite(value)))) {
      throw new Error("Mythos reading requires finite M1/M2/M3 cosmic-weather values");
    }
  }
  if (event.kairosPulseRef !== event.provenance.kairosPulseRef) {
    throw new Error("Mythos event and provenance kairos pulse refs must match");
  }
}

function assertRequiredProvenance(provenance: MythosReadingProvenance): void {
  if (!provenanceValues(provenance).every(isWikilink)) {
    throw new Error("Mythos reading provenance requires four [[wikilink]] references");
  }
}

function provenanceValues(provenance: MythosReadingProvenance): string[] {
  return [
    provenance.sessionRef,
    provenance.chainPositionRef,
    provenance.cosmicWeatherSnapshotRef,
    provenance.kairosPulseRef,
  ];
}

function assertCosmicWeatherWeights(weights: CosmicWeatherWeights): void {
  for (const [name, weight] of Object.entries(weights)) {
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) {
      throw new Error(`cosmic_weather_weights.${name} must be between 0 and 1`);
    }
  }
  const sum = weights.m1 + weights.m2 + weights.m3;
  if (Math.abs(sum - 1) > 1e-6) {
    throw new Error("cosmic_weather_weights must sum to 1");
  }
}

function assertIntegerRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer in ${min}..${max}`);
  }
}

function assertTriggerMode(value: string): asserts value is MythosReadingTriggerMode {
  if (![
    "every-nth-utterance",
    "every-mth-kairos-pulse",
    "hybrid-utterance-and-pulse",
    "adaptive",
  ].includes(value)) {
    throw new Error(`unsupported Mythos trigger_mode: ${value}`);
  }
}

function assertGuardStrictness(value: string): asserts value is MythosReificationGuardStrictness {
  if (!["permissive", "standard", "strict"].includes(value)) {
    throw new Error(`unsupported Mythos reification_guard_strictness: ${value}`);
  }
}

function deepFreezeConfig(config: MythosSymbolicProteinConfig): MythosSymbolicProteinConfig {
  return Object.freeze({
    ...config,
    cosmicWeatherWeights: Object.freeze({ ...config.cosmicWeatherWeights }),
  });
}

function valueArcanaIndex(value: string | number): number {
  return positiveModulo(
    typeof value === "number" ? Math.round(value) : stableHash(value),
    MAJOR_ARCANA_COUNT,
  );
}

function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function positiveModulo(value: number, modulo: number): number {
  return ((value % modulo) + modulo) % modulo;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isProtectedProteinHandle(value: string): boolean {
  return /^m4-protein:\/\/session\/[^/]+\/[^/]+$/.test(value);
}

function isWikilink(value: string): boolean {
  return /^\[\[[^\]]+\]\]$/.test(value);
}
