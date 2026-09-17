import type { OracleFrame } from './oracle-frame';

const MAJOR_ARCANA = Object.freeze([
    Object.freeze({ number: 0, name: 'Fool' }),
    Object.freeze({ number: 1, name: 'Magician' }),
    Object.freeze({ number: 2, name: 'High Priestess' }),
    Object.freeze({ number: 3, name: 'Empress' }),
    Object.freeze({ number: 4, name: 'Emperor' }),
    Object.freeze({ number: 5, name: 'Hierophant' }),
    Object.freeze({ number: 6, name: 'Lovers' }),
    Object.freeze({ number: 7, name: 'Chariot' }),
    Object.freeze({ number: 8, name: 'Strength' }),
    Object.freeze({ number: 9, name: 'Hermit' }),
    Object.freeze({ number: 10, name: 'Wheel of Fortune' }),
    Object.freeze({ number: 11, name: 'Justice' }),
    Object.freeze({ number: 12, name: 'Hanged Man' }),
    Object.freeze({ number: 13, name: 'Death' }),
    Object.freeze({ number: 14, name: 'Temperance' }),
    Object.freeze({ number: 15, name: 'Devil' }),
    Object.freeze({ number: 16, name: 'Tower' }),
    Object.freeze({ number: 17, name: 'Star' }),
    Object.freeze({ number: 18, name: 'Moon' }),
    Object.freeze({ number: 19, name: 'Sun' }),
    Object.freeze({ number: 20, name: 'Judgement' }),
    Object.freeze({ number: 21, name: 'World' })
] as const);

export type SymbolicProteinFoldState =
    | 'linear'
    | 'folding'
    | 'folded'
    | 'active'
    | 'reviewed'
    | 'dormant';

export type SymbolicProteinSequenceMode =
    | 'motif'
    | 'peptide'
    | 'protein'
    | 'clock-walk'
    | 'spread-chain'
    | 'symbolic-orf';

export interface SymbolicProteinChainNode {
    readonly ordinal: number;
    readonly packetRef: string;
    readonly tarotRef?: string;
    readonly ichingRef?: string;
    readonly codonRef?: string;
    readonly cpPositionRef?: string;
}

export interface SymbolicProteinActivationMarker {
    readonly markerId: string;
    readonly positionRef: string;
    readonly state: 'start' | 'stop' | 'activated' | 'muted' | 'review-required';
    readonly sourceHandle: string;
}

export type MythosReadingTriggerMode =
    | 'every-nth-utterance'
    | 'every-mth-kairos-pulse'
    | 'hybrid-utterance-and-pulse'
    | 'adaptive';

export type MythosReificationGuardStrictness = 'permissive' | 'standard' | 'strict';

export type MythosTriggerEventKind = 'user-utterance' | 'kairos-pulse' | 'session-close';

export interface MajorArcanaCardRef {
    readonly arcanaNumber: number;
    readonly name: string;
    readonly ref: string;
}

export interface SymbolicProteinCosmicWeatherWeights {
    readonly m1: number;
    readonly m2: number;
    readonly m3: number;
}

export interface MythosSymbolicProteinReadingConfig {
    readonly triggerMode: MythosReadingTriggerMode;
    readonly utteranceIntervalN: number;
    readonly kairosPulseIntervalM: number;
    readonly adaptiveFloorSeconds: number;
    readonly adaptiveCeilingSeconds: number;
    readonly cosmicWeatherWeights: SymbolicProteinCosmicWeatherWeights;
    readonly secondaryArchetypesCount: number;
    readonly voiceTemplatePath: string;
    readonly reificationGuardStrictness: MythosReificationGuardStrictness;
}

export interface MythosSymbolicProteinReadingConfigOverrides {
    readonly triggerMode?: MythosReadingTriggerMode;
    readonly utteranceIntervalN?: number;
    readonly kairosPulseIntervalM?: number;
    readonly adaptiveFloorSeconds?: number;
    readonly adaptiveCeilingSeconds?: number;
    readonly cosmicWeatherWeights?: Partial<SymbolicProteinCosmicWeatherWeights>;
    readonly secondaryArchetypesCount?: number;
    readonly voiceTemplatePath?: string;
    readonly reificationGuardStrictness?: MythosReificationGuardStrictness;
}

export interface SymbolicProteinCosmicWeatherSnapshot {
    readonly m1SpandaTick: string | number;
    readonly m2CymaticPhase: string | number;
    readonly m3CodonTranscriptionState: string | number;
    readonly mathemeHarmonicProfileHandle?: string;
    readonly dominantPlanet?: string;
    readonly planetDegrees?: readonly number[];
}

export interface MythosReadingProvenance {
    readonly sessionRef: string;
    readonly chainPositionRef: string;
    readonly cosmicWeatherSnapshotRef: string;
    readonly kairosPulseRef: string;
}

export interface MythosArchetypeReading {
    readonly readingId: string;
    readonly ownerAgent: '[[Mythos]]';
    readonly dominantChromosomeArcana: MajorArcanaCardRef;
    readonly secondaryPatternArcanas: readonly MajorArcanaCardRef[];
    readonly narrativeSummary: string;
    readonly cosmicWeatherSnapshot: SymbolicProteinCosmicWeatherSnapshot;
    readonly provenance: MythosReadingProvenance;
    readonly createdAtKairosPulse: string;
    readonly chainPositionBookmark: string;
    readonly reificationGuardStrictness: MythosReificationGuardStrictness;
}

export interface MythosReadingTriggerEvent {
    readonly kind: MythosTriggerEventKind;
    readonly occurredAtMs: number;
}

export interface MythosReadingTriggerState {
    readonly utteranceCount: number;
    readonly kairosPulseCount: number;
    readonly lastReadAtMs?: number;
}

export interface MythosReadingTriggerDecision {
    readonly nextState: MythosReadingTriggerState;
    readonly shouldRead: boolean;
    readonly reason: string;
}

export interface SymbolicProtein {
    readonly proteinId: string;
    readonly frameId: string;
    readonly chainSequence: readonly SymbolicProteinChainNode[];
    readonly foldingState: SymbolicProteinFoldState;
    readonly activationMarkers: readonly SymbolicProteinActivationMarker[];
    readonly sequenceMode: SymbolicProteinSequenceMode;
    readonly oracleFrame?: OracleFrame;
    readonly graphProvenanceHandles?: readonly string[];
    readonly patternPacketHandle?: string;
    readonly mythosReadingHistory?: readonly MythosArchetypeReading[];
    readonly mythosArchetypeReading?: MythosArchetypeReading;
}

export const MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG_TOML_SECTION = 'mythos.symbolic_protein_reading';

export const DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG: MythosSymbolicProteinReadingConfig = Object.freeze({
    triggerMode: 'every-mth-kairos-pulse',
    utteranceIntervalN: 5,
    kairosPulseIntervalM: 3,
    adaptiveFloorSeconds: 90,
    adaptiveCeilingSeconds: 1800,
    cosmicWeatherWeights: Object.freeze({ m1: 0.33, m2: 0.34, m3: 0.33 }),
    secondaryArchetypesCount: 2,
    voiceTemplatePath: "Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/symbolic-protein-reading/voice-templates/default.md",
    reificationGuardStrictness: 'standard'
});

export function isSymbolicProtein(value: unknown): value is SymbolicProtein {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.proteinId) &&
            isNonEmptyString(record.frameId) &&
            Array.isArray(record.chainSequence) &&
            record.chainSequence.length > 0 &&
            record.chainSequence.every(isSymbolicProteinChainNode) &&
            isSymbolicProteinFoldState(record.foldingState) &&
            Array.isArray(record.activationMarkers) &&
            record.activationMarkers.every(isSymbolicProteinActivationMarker) &&
            isSymbolicProteinSequenceMode(record.sequenceMode) &&
            optionalStringArray(record.graphProvenanceHandles) &&
            optionalString(record.patternPacketHandle) &&
            optionalMythosReadingArray(record.mythosReadingHistory) &&
            (record.mythosArchetypeReading === undefined || isMythosArchetypeReading(record.mythosArchetypeReading))
    );
}

export function normalizeMythosSymbolicProteinReadingConfig(
    overrides: MythosSymbolicProteinReadingConfigOverrides = {}
): MythosSymbolicProteinReadingConfig {
    const defaults = DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG;
    const floor = positiveInteger(overrides.adaptiveFloorSeconds, defaults.adaptiveFloorSeconds);
    const ceiling = Math.max(
        floor,
        positiveInteger(overrides.adaptiveCeilingSeconds, defaults.adaptiveCeilingSeconds)
    );
    return Object.freeze({
        triggerMode: isTriggerMode(overrides.triggerMode) ? overrides.triggerMode : defaults.triggerMode,
        utteranceIntervalN: positiveInteger(overrides.utteranceIntervalN, defaults.utteranceIntervalN),
        kairosPulseIntervalM: positiveInteger(overrides.kairosPulseIntervalM, defaults.kairosPulseIntervalM),
        adaptiveFloorSeconds: floor,
        adaptiveCeilingSeconds: ceiling,
        cosmicWeatherWeights: Object.freeze({
            m1: finiteNumber(overrides.cosmicWeatherWeights?.m1, defaults.cosmicWeatherWeights.m1),
            m2: finiteNumber(overrides.cosmicWeatherWeights?.m2, defaults.cosmicWeatherWeights.m2),
            m3: finiteNumber(overrides.cosmicWeatherWeights?.m3, defaults.cosmicWeatherWeights.m3)
        }),
        secondaryArchetypesCount: clampInteger(
            overrides.secondaryArchetypesCount,
            defaults.secondaryArchetypesCount,
            0,
            6
        ),
        voiceTemplatePath: isNonEmptyString(overrides.voiceTemplatePath)
            ? overrides.voiceTemplatePath
            : defaults.voiceTemplatePath,
        reificationGuardStrictness: isReificationGuardStrictness(overrides.reificationGuardStrictness)
            ? overrides.reificationGuardStrictness
            : defaults.reificationGuardStrictness
    });
}

export function mythosSymbolicProteinReadingConfigFromToml(
    toml: string
): MythosSymbolicProteinReadingConfig {
    return normalizeMythosSymbolicProteinReadingConfig(readMythosTomlOverrides(toml));
}

export function mythosSymbolicProteinReadingDefaultsToml(): string {
    const c = DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG;
    return [
        `[${MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG_TOML_SECTION}]`,
        `trigger_mode = "${c.triggerMode}"`,
        `utterance_interval_n = ${c.utteranceIntervalN}`,
        `kairos_pulse_interval_m = ${c.kairosPulseIntervalM}`,
        `adaptive_floor_seconds = ${c.adaptiveFloorSeconds}`,
        `adaptive_ceiling_seconds = ${c.adaptiveCeilingSeconds}`,
        `secondary_archetypes_count = ${c.secondaryArchetypesCount}`,
        `voice_template_path = "${c.voiceTemplatePath}"`,
        `reification_guard_strictness = "${c.reificationGuardStrictness}"`,
        '',
        `[${MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG_TOML_SECTION}.cosmic_weather_weights]`,
        `m1 = ${c.cosmicWeatherWeights.m1}`,
        `m2 = ${c.cosmicWeatherWeights.m2}`,
        `m3 = ${c.cosmicWeatherWeights.m3}`
    ].join('\n');
}

export function mythosCosmicWeatherSnapshotFromProfile(
    profile: Readonly<{ generation?: unknown; pointerAnchor?: unknown; payload?: Readonly<Record<string, unknown>> }>
): SymbolicProteinCosmicWeatherSnapshot {
    const payload = objectValue(profile.payload) ?? {};
    return Object.freeze({
        m1SpandaTick: firstPresent(
            payload.m1SpandaTick,
            payload.m1_spanda_tick,
            payload.spandaTick,
            profile.generation,
            'm1:unknown'
        ),
        m2CymaticPhase: firstPresent(
            payload.m2CymaticPhase,
            payload.m2_cymatic_phase,
            payload.cymaticPhase,
            payload.cymatic_phase,
            'm2:unknown'
        ),
        m3CodonTranscriptionState: firstPresent(
            payload.m3CodonTranscriptionState,
            payload.m3_codon_transcription_state,
            payload.codonTranscriptionState,
            payload.transcriptionState,
            'm3:unknown'
        ),
        mathemeHarmonicProfileHandle: stringOrUndefined(profile.pointerAnchor),
        dominantPlanet: stringOrUndefined(payload.dominantPlanet ?? payload.dominant_planet),
        planetDegrees: numberArrayOrUndefined(payload.planetDegrees ?? payload.planet_degrees)
    });
}

export function applyMythosReadingTriggerEvent(
    state: MythosReadingTriggerState,
    event: MythosReadingTriggerEvent,
    config: MythosSymbolicProteinReadingConfig = DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG
): MythosReadingTriggerDecision {
    const nextState: MythosReadingTriggerState = Object.freeze({
        utteranceCount: state.utteranceCount + (event.kind === 'user-utterance' ? 1 : 0),
        kairosPulseCount: state.kairosPulseCount + (event.kind === 'kairos-pulse' ? 1 : 0),
        lastReadAtMs: state.lastReadAtMs
    });
    const decision = shouldFireMythosReading(nextState, event, config);
    return Object.freeze({
        shouldRead: decision.shouldRead,
        reason: decision.reason,
        nextState: decision.shouldRead
            ? Object.freeze({ ...nextState, lastReadAtMs: event.occurredAtMs })
            : nextState
    });
}

export function shouldFireMythosReading(
    state: MythosReadingTriggerState,
    event: MythosReadingTriggerEvent,
    config: MythosSymbolicProteinReadingConfig = DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG
): Pick<MythosReadingTriggerDecision, 'shouldRead' | 'reason'> {
    if (event.kind === 'session-close') {
        return { shouldRead: true, reason: 'session-close-final-mythos-read' };
    }

    const utteranceHit = event.kind === 'user-utterance' &&
        state.utteranceCount > 0 &&
        state.utteranceCount % config.utteranceIntervalN === 0;
    const kairosHit = event.kind === 'kairos-pulse' &&
        state.kairosPulseCount > 0 &&
        state.kairosPulseCount % config.kairosPulseIntervalM === 0;

    if (config.triggerMode === 'every-nth-utterance') {
        return { shouldRead: utteranceHit, reason: utteranceHit ? 'utterance-interval' : 'utterance-interval-pending' };
    }
    if (config.triggerMode === 'every-mth-kairos-pulse') {
        return { shouldRead: kairosHit, reason: kairosHit ? 'kairos-pulse-interval' : 'kairos-pulse-interval-pending' };
    }
    if (config.triggerMode === 'hybrid-utterance-and-pulse') {
        return {
            shouldRead: utteranceHit || kairosHit,
            reason: utteranceHit ? 'hybrid-utterance-interval' : kairosHit ? 'hybrid-kairos-pulse-interval' : 'hybrid-pending'
        };
    }

    const lastReadAtMs = state.lastReadAtMs;
    if (lastReadAtMs === undefined) {
        return { shouldRead: true, reason: 'adaptive-first-read' };
    }
    const elapsedSeconds = Math.floor((event.occurredAtMs - lastReadAtMs) / 1000);
    if (elapsedSeconds >= config.adaptiveCeilingSeconds) {
        return { shouldRead: true, reason: 'adaptive-ceiling' };
    }
    if (elapsedSeconds >= config.adaptiveFloorSeconds && (utteranceHit || kairosHit)) {
        return { shouldRead: true, reason: utteranceHit ? 'adaptive-utterance-floor' : 'adaptive-kairos-floor' };
    }
    return { shouldRead: false, reason: 'adaptive-floor-pending' };
}

export function createMythosArchetypeReading(input: {
    readonly protein: SymbolicProtein;
    readonly cosmicWeatherSnapshot: SymbolicProteinCosmicWeatherSnapshot;
    readonly provenance: MythosReadingProvenance;
    readonly kairosPulseRef: string;
    readonly config?: MythosSymbolicProteinReadingConfig;
}): MythosArchetypeReading {
    const config = input.config ?? DEFAULT_MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG;
    const dominant = majorArcanaRef(
        dominantArcanaIndex(input.protein, input.cosmicWeatherSnapshot, config.cosmicWeatherWeights)
    );
    const secondaries = secondaryArcanaRefs(
        dominant.arcanaNumber,
        input.protein.chainSequence.length,
        config.secondaryArchetypesCount
    );
    const summary = buildNarrativeSummary(input.protein, input.cosmicWeatherSnapshot, dominant);
    const guard = assertMythosNarrativeVoiceLaw(summary, config.reificationGuardStrictness);
    if (!guard.ok) {
        throw new Error(guard.error ?? 'Mythos narrative failed voice-law check');
    }
    return Object.freeze({
        readingId: `${input.protein.proteinId}:mythos:${input.protein.chainSequence.length}:${input.kairosPulseRef}`,
        ownerAgent: '[[Mythos]]',
        dominantChromosomeArcana: dominant,
        secondaryPatternArcanas: secondaries,
        narrativeSummary: summary,
        cosmicWeatherSnapshot: input.cosmicWeatherSnapshot,
        provenance: input.provenance,
        createdAtKairosPulse: input.kairosPulseRef,
        chainPositionBookmark: input.provenance.chainPositionRef,
        reificationGuardStrictness: config.reificationGuardStrictness
    });
}

export function appendMythosReadingToSymbolicProtein(
    protein: SymbolicProtein,
    reading: MythosArchetypeReading
): SymbolicProtein {
    return Object.freeze({
        ...protein,
        mythosReadingHistory: Object.freeze([...(protein.mythosReadingHistory ?? []), reading])
    });
}

export function closeSymbolicProteinWithMythosReading(
    protein: SymbolicProtein,
    reading: MythosArchetypeReading
): SymbolicProtein {
    const history = protein.mythosReadingHistory?.includes(reading)
        ? protein.mythosReadingHistory
        : Object.freeze([...(protein.mythosReadingHistory ?? []), reading]);
    return Object.freeze({
        ...protein,
        mythosReadingHistory: history,
        mythosArchetypeReading: reading
    });
}

export function assertMythosNarrativeVoiceLaw(
    summary: string,
    strictness: MythosReificationGuardStrictness = 'standard'
): { readonly ok: boolean; readonly error?: string } {
    if (!isNonEmptyString(summary)) {
        return { ok: false, error: 'Mythos reading requires a narrative summary.' };
    }
    const lower = summary.toLowerCase();
    if (/\b(this\s+)?session\s+is\b/.test(lower) || /\bcodon\s+arc\s+is\b/.test(lower)) {
        return {
            ok: false,
            error: 'Reification guard: summarize the codon arc as figuring an archetype, never as being it.'
        };
    }
    if (strictness !== 'permissive' && !/\bfigures?\b|\bfigured\b|\barchetype\b/.test(lower)) {
        return {
            ok: false,
            error: 'Reification guard: summary must remain paraphrasable as archetypal figuring.'
        };
    }
    if (strictness === 'strict' && !/\bunder\b.*\bweather\b|\bcosmic-weather\b/.test(lower)) {
        return {
            ok: false,
            error: 'Strict Mythos guard requires explicit cosmic-weather grounding.'
        };
    }
    return { ok: true };
}

export function mythosReadingHasRequiredProvenance(reading: MythosArchetypeReading): boolean {
    return [
        reading.provenance.sessionRef,
        reading.provenance.chainPositionRef,
        reading.provenance.cosmicWeatherSnapshotRef,
        reading.provenance.kairosPulseRef
    ].every(isWikilink);
}

export function isMythosArchetypeReading(value: unknown): value is MythosArchetypeReading {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.readingId) &&
            record.ownerAgent === '[[Mythos]]' &&
            isMajorArcanaCardRef(record.dominantChromosomeArcana) &&
            Array.isArray(record.secondaryPatternArcanas) &&
            record.secondaryPatternArcanas.every(isMajorArcanaCardRef) &&
            isNonEmptyString(record.narrativeSummary) &&
            isCosmicWeatherSnapshot(record.cosmicWeatherSnapshot) &&
            isMythosReadingProvenance(record.provenance) &&
            isNonEmptyString(record.createdAtKairosPulse) &&
            isNonEmptyString(record.chainPositionBookmark) &&
            isReificationGuardStrictness(record.reificationGuardStrictness)
    );
}

function isSymbolicProteinChainNode(value: unknown): value is SymbolicProteinChainNode {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonNegativeInteger(record.ordinal) &&
            isNonEmptyString(record.packetRef) &&
            optionalString(record.tarotRef) &&
            optionalString(record.ichingRef) &&
            optionalString(record.codonRef) &&
            optionalString(record.cpPositionRef)
    );
}

function isSymbolicProteinActivationMarker(value: unknown): value is SymbolicProteinActivationMarker {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.markerId) &&
            isNonEmptyString(record.positionRef) &&
            isActivationMarkerState(record.state) &&
            isNonEmptyString(record.sourceHandle)
    );
}

function isSymbolicProteinFoldState(value: unknown): value is SymbolicProteinFoldState {
    return (
        value === 'linear' ||
        value === 'folding' ||
        value === 'folded' ||
        value === 'active' ||
        value === 'reviewed' ||
        value === 'dormant'
    );
}

function isSymbolicProteinSequenceMode(value: unknown): value is SymbolicProteinSequenceMode {
    return (
        value === 'motif' ||
        value === 'peptide' ||
        value === 'protein' ||
        value === 'clock-walk' ||
        value === 'spread-chain' ||
        value === 'symbolic-orf'
    );
}

function isActivationMarkerState(value: unknown): boolean {
    return (
        value === 'start' ||
        value === 'stop' ||
        value === 'activated' ||
        value === 'muted' ||
        value === 'review-required'
    );
}

function readMythosTomlOverrides(toml: string): MythosSymbolicProteinReadingConfigOverrides {
    let section = '';
    const overrides: {
        triggerMode?: MythosReadingTriggerMode;
        utteranceIntervalN?: number;
        kairosPulseIntervalM?: number;
        adaptiveFloorSeconds?: number;
        adaptiveCeilingSeconds?: number;
        cosmicWeatherWeights?: Partial<SymbolicProteinCosmicWeatherWeights>;
        secondaryArchetypesCount?: number;
        voiceTemplatePath?: string;
        reificationGuardStrictness?: MythosReificationGuardStrictness;
    } = {};
    for (const rawLine of toml.split(/\r?\n/)) {
        const line = rawLine.replace(/#.*/, '').trim();
        if (!line) continue;
        const sectionMatch = /^\[([^\]]+)\]$/.exec(line);
        if (sectionMatch) {
            section = sectionMatch[1];
            continue;
        }
        const keyMatch = /^([A-Za-z0-9_]+)\s*=\s*(.+)$/.exec(line);
        if (!keyMatch) continue;
        const key = keyMatch[1];
        const value = parseTomlScalar(keyMatch[2]);
        if (section === MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG_TOML_SECTION) {
            if (key === 'trigger_mode' && isTriggerMode(value)) overrides.triggerMode = value;
            if (key === 'utterance_interval_n') overrides.utteranceIntervalN = numberOrUndefined(value);
            if (key === 'kairos_pulse_interval_m') overrides.kairosPulseIntervalM = numberOrUndefined(value);
            if (key === 'adaptive_floor_seconds') overrides.adaptiveFloorSeconds = numberOrUndefined(value);
            if (key === 'adaptive_ceiling_seconds') overrides.adaptiveCeilingSeconds = numberOrUndefined(value);
            if (key === 'secondary_archetypes_count') overrides.secondaryArchetypesCount = numberOrUndefined(value);
            if (key === 'voice_template_path' && typeof value === 'string') overrides.voiceTemplatePath = value;
            if (key === 'reification_guard_strictness' && isReificationGuardStrictness(value)) {
                overrides.reificationGuardStrictness = value;
            }
        }
        if (section === `${MYTHOS_SYMBOLIC_PROTEIN_READING_CONFIG_TOML_SECTION}.cosmic_weather_weights`) {
            const weights = overrides.cosmicWeatherWeights ?? {};
            if (key === 'm1') {
                overrides.cosmicWeatherWeights = { ...weights, m1: numberOrUndefined(value) };
            }
            if (key === 'm2') {
                overrides.cosmicWeatherWeights = { ...weights, m2: numberOrUndefined(value) };
            }
            if (key === 'm3') {
                overrides.cosmicWeatherWeights = { ...weights, m3: numberOrUndefined(value) };
            }
        }
    }
    return overrides;
}

function parseTomlScalar(value: string): string | number {
    const trimmed = value.trim();
    if (/^".*"$/.test(trimmed)) {
        return trimmed.slice(1, -1);
    }
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : trimmed;
}

function dominantArcanaIndex(
    protein: SymbolicProtein,
    weather: SymbolicProteinCosmicWeatherSnapshot,
    weights: SymbolicProteinCosmicWeatherWeights
): number {
    const chain = protein.chainSequence.reduce(
        (sum, node) => sum + node.ordinal + hashString(node.codonRef ?? node.tarotRef ?? node.packetRef),
        hashString(protein.proteinId) + protein.chainSequence.length
    ) % MAJOR_ARCANA.length;
    const m1 = valueArcanaIndex(weather.m1SpandaTick);
    const m2 = valueArcanaIndex(weather.m2CymaticPhase);
    const m3 = valueArcanaIndex(weather.m3CodonTranscriptionState);
    const weightedWeather = Math.round(m1 * weights.m1 + m2 * weights.m2 + m3 * weights.m3);
    return positiveModulo(chain + weightedWeather, MAJOR_ARCANA.length);
}

function secondaryArcanaRefs(
    dominantIndex: number,
    chainLength: number,
    count: number
): readonly MajorArcanaCardRef[] {
    const refs: MajorArcanaCardRef[] = [];
    let step = 1;
    while (refs.length < count) {
        const candidate = positiveModulo(dominantIndex + chainLength + step * 7, MAJOR_ARCANA.length);
        if (candidate !== dominantIndex && !refs.some(ref => ref.arcanaNumber === candidate)) {
            refs.push(majorArcanaRef(candidate));
        }
        step++;
    }
    return Object.freeze(refs);
}

function majorArcanaRef(index: number): MajorArcanaCardRef {
    const card = MAJOR_ARCANA[positiveModulo(index, MAJOR_ARCANA.length)];
    return Object.freeze({
        arcanaNumber: card.number,
        name: card.name,
        ref: `major-arcana://${String(card.number).padStart(2, '0')}-${card.name.toLowerCase().replace(/\s+/g, '-')}`
    });
}

function buildNarrativeSummary(
    protein: SymbolicProtein,
    weather: SymbolicProteinCosmicWeatherSnapshot,
    dominant: MajorArcanaCardRef
): string {
    return `This session's codon arc figures archetype ${dominant.name} under cosmic-weather ` +
        `M1 ${String(weather.m1SpandaTick)}, M2 ${String(weather.m2CymaticPhase)}, ` +
        `and M3 ${String(weather.m3CodonTranscriptionState)} across ${protein.chainSequence.length} chain positions.`;
}

function valueArcanaIndex(value: string | number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return positiveModulo(Math.round(value), MAJOR_ARCANA.length);
    }
    return positiveModulo(hashString(String(value)), MAJOR_ARCANA.length);
}

function hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

function positiveModulo(value: number, modulo: number): number {
    return ((value % modulo) + modulo) % modulo;
}

function firstPresent(...values: unknown[]): string | number {
    for (const value of values) {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (isNonEmptyString(value)) return value;
    }
    return 'unknown';
}

function isCosmicWeatherSnapshot(value: unknown): value is SymbolicProteinCosmicWeatherSnapshot {
    const record = objectValue(value);
    return Boolean(
        record &&
            stringOrNumber(record.m1SpandaTick) &&
            stringOrNumber(record.m2CymaticPhase) &&
            stringOrNumber(record.m3CodonTranscriptionState) &&
            optionalString(record.mathemeHarmonicProfileHandle) &&
            optionalString(record.dominantPlanet) &&
            (record.planetDegrees === undefined || Array.isArray(record.planetDegrees))
    );
}

function isMythosReadingProvenance(value: unknown): value is MythosReadingProvenance {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonEmptyString(record.sessionRef) &&
            isNonEmptyString(record.chainPositionRef) &&
            isNonEmptyString(record.cosmicWeatherSnapshotRef) &&
            isNonEmptyString(record.kairosPulseRef)
    );
}

function isMajorArcanaCardRef(value: unknown): value is MajorArcanaCardRef {
    const record = objectValue(value);
    return Boolean(
        record &&
            isNonNegativeInteger(record.arcanaNumber) &&
            record.arcanaNumber < MAJOR_ARCANA.length &&
            isNonEmptyString(record.name) &&
            isNonEmptyString(record.ref)
    );
}

function optionalMythosReadingArray(value: unknown): boolean {
    return value === undefined || (Array.isArray(value) && value.every(isMythosArchetypeReading));
}

function isTriggerMode(value: unknown): value is MythosReadingTriggerMode {
    return (
        value === 'every-nth-utterance' ||
        value === 'every-mth-kairos-pulse' ||
        value === 'hybrid-utterance-and-pulse' ||
        value === 'adaptive'
    );
}

function isReificationGuardStrictness(value: unknown): value is MythosReificationGuardStrictness {
    return value === 'permissive' || value === 'standard' || value === 'strict';
}

function isWikilink(value: string): boolean {
    return /^\[\[[^\]]+\]\]$/.test(value);
}

function stringOrNumber(value: unknown): value is string | number {
    return isNonEmptyString(value) || (typeof value === 'number' && Number.isFinite(value));
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : undefined;
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

function optionalString(value: unknown): boolean {
    return value === undefined || isNonEmptyString(value);
}

function optionalStringArray(value: unknown): boolean {
    return value === undefined || (Array.isArray(value) && value.every(isNonEmptyString));
}

function isNonNegativeInteger(value: unknown): value is number {
    return Number.isInteger(value) && typeof value === 'number' && value >= 0;
}

function positiveInteger(value: unknown, fallback: number): number {
    return Number.isInteger(value) && typeof value === 'number' && value > 0 ? value : fallback;
}

function finiteNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampInteger(value: unknown, fallback: number, min: number, max: number): number {
    const next = Number.isInteger(value) && typeof value === 'number' ? value : fallback;
    return Math.min(max, Math.max(min, next));
}

function numberOrUndefined(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function stringOrUndefined(value: unknown): string | undefined {
    return isNonEmptyString(value) ? value : undefined;
}

function numberArrayOrUndefined(value: unknown): readonly number[] | undefined {
    return Array.isArray(value) && value.every(item => typeof item === 'number' && Number.isFinite(item))
        ? Object.freeze([...value])
        : undefined;
}
