/**
 * Coordinate: M' M4' (resonance + conjugate-form indicator law — Track 05.T5.1)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: M4'-SPEC §6.5 — the resonance indicator (numeric +
 *   conjugate-form-character Major/Minor/Shadow) read from each
 *   NaraArtifactEnvelope `resonance` field and aggregated per day. Lean
 *   surface only: the quaternion interior (q_personal components, the
 *   Q_identity·Q_transit·Q_activity composition, natal readouts) never
 *   crosses into this module's outputs. The computation law is portal-core
 *   `PersonalResonance` (personal_identity.rs — score = |⟨q_personal,
 *   q_cosmic⟩| in [0,1]; signed_dot < 0 ⇒ ShadowInversion), surfaced on the
 *   profile bus as `harmonicProfile.personalPole.resonance{score,
 *   conjugateFormCharacter}` with the top-level `harmonicProfile.resonance` /
 *   `conjugateFormCharacter` tick fallback (kernel/profile.rs). The kernel
 *   wire spells the shadow pole `ShadowInversion`; §6.5 surface vocabulary is
 *   `Shadow` — normalization maps it here.
 * Public surface: normalizeConjugateFormCharacter, normalizeResonanceIndicator,
 *   resonanceIndicatorFromProfile, artifactResonanceIndicator,
 *   summarizeDayResonance; ConjugateFormCharacter, NaraResonanceIndicator,
 *   NaraArtifactResonanceSource, NaraDayResonanceSummary.
 * Does NOT own: the resonance computation (portal-core personal_identity.rs),
 *   the profile bus (kernel bridge), artifact deposition (src-tauri oracle
 *   seam), pane composition (M4NaraResonance.tsx renders these values).
 * Provenance: indicator + day-summary contract shapes cribbed from the FROZEN
 *   reference `Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts`
 *   (envelope `resonance` field law, `pending-resonance` state law) after
 *   verifying them against M4'-SPEC §6.5 and the live portal-core substrate —
 *   counts as new code per the rerun CHARTER retarget law.
 */

export type ConjugateFormCharacter = 'Major' | 'Minor' | 'Shadow';

export interface NaraResonanceIndicator {
    readonly state: 'resolved' | 'pending-resonance';
    readonly numeric: number | null;
    readonly conjugateFormCharacter: ConjugateFormCharacter | null;
    readonly sourceHandle: string | null;
    readonly label: string;
}

/**
 * The envelope read-contract: any day artifact carrying the optional §6.6
 * envelope `resonance` field. Unstamped artifacts aggregate as pending.
 */
export interface NaraArtifactResonanceSource {
    readonly artifactPath: string;
    readonly resonance?: unknown;
}

export interface NaraDayResonanceSummary {
    readonly state: 'resolved' | 'pending-resonance';
    readonly numericAverage: number | null;
    readonly resolvedCount: number;
    readonly pendingCount: number;
    readonly byConjugateFormCharacter: Readonly<Record<ConjugateFormCharacter, number>>;
    readonly label: string;
}

const PENDING: NaraResonanceIndicator = Object.freeze({
    state: 'pending-resonance' as const,
    numeric: null,
    conjugateFormCharacter: null,
    sourceHandle: null,
    label: 'pending-resonance'
});

export function normalizeConjugateFormCharacter(value: unknown): ConjugateFormCharacter | null {
    if (value === 'Major' || value === 'Minor' || value === 'Shadow') {
        return value;
    }
    // portal-core kernel.rs ConjugateFormCharacter serialises the shadow pole
    // as `ShadowInversion`; §6.5 surface vocabulary names it `Shadow`.
    if (value === 'ShadowInversion' || value === 'shadow-inversion' || value === 'shadow_inversion') {
        return 'Shadow';
    }
    return null;
}

function asRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : null;
}

function finiteNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function resolvedIndicator(
    numeric: number,
    character: ConjugateFormCharacter,
    sourceHandle: string | null
): NaraResonanceIndicator {
    return Object.freeze({
        state: 'resolved' as const,
        numeric,
        conjugateFormCharacter: character,
        sourceHandle,
        label: `${numeric.toFixed(3)} ${character}`
    });
}

function pendingIndicator(sourceHandle: string | null): NaraResonanceIndicator {
    return sourceHandle === null ? PENDING : Object.freeze({ ...PENDING, sourceHandle });
}

/**
 * Envelope law: the artifact's `resonance` field → indicator. Partial or
 * absent stamps NEVER fabricate a reading — they fall back to
 * `pending-resonance` (label included, so the surface renders the fallback
 * verbatim).
 */
export function normalizeResonanceIndicator(input: unknown): NaraResonanceIndicator {
    const record = asRecord(input);
    const numeric = finiteNumber(record?.numeric);
    const character = normalizeConjugateFormCharacter(record?.conjugateFormCharacter);
    const sourceHandle = stringValue(record?.sourceHandle);
    if (numeric === null || character === null) {
        return pendingIndicator(sourceHandle);
    }
    return resolvedIndicator(numeric, character, sourceHandle);
}

/**
 * Profile-bus law: the live kernel payload → the at-now indicator (the §6.5
 * DAY/NOW header element). Prefers the personal pole
 * (`personalPole.resonance` from PersonalResonance::from_quaternions);
 * falls back to the tick-level `resonance` + `conjugateFormCharacter` pair
 * (kernel/profile.rs from_tick_with_personal_identity). The sourceHandle is
 * handle-only (a ProtectedHandle string, never a body) per DR-M4-3.
 */
export function resonanceIndicatorFromProfile(profilePayload: unknown): NaraResonanceIndicator {
    const harmonicProfile = asRecord(asRecord(profilePayload)?.harmonicProfile);
    if (!harmonicProfile) {
        return PENDING;
    }
    const personalPole = asRecord(harmonicProfile.personalPole);
    const poleResonance = asRecord(personalPole?.resonance);
    const poleScore = finiteNumber(poleResonance?.score);
    const poleCharacter = normalizeConjugateFormCharacter(poleResonance?.conjugateFormCharacter);
    if (poleScore !== null && poleCharacter !== null) {
        const handle = stringValue(asRecord(personalPole?.qPersonalHandle)?.handle);
        return resolvedIndicator(poleScore, poleCharacter, handle ?? 'kernel-profile:personal-pole');
    }
    const numeric = finiteNumber(harmonicProfile.resonance);
    const character = normalizeConjugateFormCharacter(harmonicProfile.conjugateFormCharacter);
    if (numeric !== null && character !== null) {
        return resolvedIndicator(numeric, character, 'kernel-profile');
    }
    return PENDING;
}

/**
 * Artifact chip law: the envelope stamp is the truth. A fresh deposit whose
 * envelope is not yet stamped reads the at-now profile (deposition happens
 * at NOW); when both are silent the chip stays `pending-resonance` — never
 * fabricated.
 */
export function artifactResonanceIndicator(
    envelopeResonance: unknown,
    profilePayload: unknown
): NaraResonanceIndicator {
    const fromEnvelope = normalizeResonanceIndicator(envelopeResonance);
    if (fromEnvelope.state === 'resolved') {
        return fromEnvelope;
    }
    const fromProfile = resonanceIndicatorFromProfile(profilePayload);
    return fromProfile.state === 'resolved' ? fromProfile : fromEnvelope;
}

/**
 * Day-summary law: aggregate the day's envelope indicators — numeric average
 * over resolved stamps, Major/Minor/Shadow counts, pending count. A day with
 * no resolved stamp is `pending-resonance`, never averaged from nothing.
 */
export function summarizeDayResonance(
    artifacts: readonly NaraArtifactResonanceSource[]
): NaraDayResonanceSummary {
    const indicators = artifacts.map(artifact => normalizeResonanceIndicator(artifact.resonance));
    const resolved = indicators.filter(indicator => indicator.state === 'resolved');
    const numericAverage =
        resolved.length === 0
            ? null
            : resolved.reduce((sum, indicator) => sum + (indicator.numeric ?? 0), 0) / resolved.length;
    const byConjugateFormCharacter: Record<ConjugateFormCharacter, number> = {
        Major: 0,
        Minor: 0,
        Shadow: 0
    };
    for (const indicator of resolved) {
        if (indicator.conjugateFormCharacter) {
            byConjugateFormCharacter[indicator.conjugateFormCharacter] += 1;
        }
    }
    return Object.freeze({
        state: resolved.length === 0 ? ('pending-resonance' as const) : ('resolved' as const),
        numericAverage,
        resolvedCount: resolved.length,
        pendingCount: indicators.length - resolved.length,
        byConjugateFormCharacter: Object.freeze(byConjugateFormCharacter),
        label: numericAverage === null ? 'pending-resonance' : `${numericAverage.toFixed(3)} day resonance`
    });
}
