/**
 * Coordinate: M' (cross-layout intent spine - 31.T31.10)
 * Residency: Body/M/pratibimba-app/src/commands
 * Position (#n): shared M0'/M5' chrome membrane
 * Actualises: one immutable six-family target ledger and strict dispatch of
 *   the CHROME-CONTRACT nine-field CrossLayoutIntent envelope.
 * Public surface: CROSS_LAYOUT_INTENT_TARGETS, dispatchCrossLayoutIntent,
 *   registerCrossLayoutIntentCommand.
 * Does NOT own: FlexLayout, pane bodies, coordinate/session stores, or clocks.
 * Contract: [[CHROME-CONTRACT]] section 5 / [[M'-SYSTEM-SPEC]]
 */

import { commands } from './registry';

export const CROSS_LAYOUT_INTENT_COMMAND = 'pratibimba.intent.dispatch';

export type IntentPrivacyClass = 'public' | 'protected' | 'private';

export interface CrossLayoutIntent {
    readonly coordinate: string | null;
    readonly artifactUri: string | null;
    readonly reviewId: string | null;
    readonly dayNow: string | null;
    readonly sessionKey: string | null;
    readonly profileGeneration: number | null;
    readonly privacyClass: IntentPrivacyClass | null;
    readonly requestedExtensionId: string;
    readonly requestedContributionId: string;
}

export interface CrossLayoutIntentTarget {
    readonly extensionId: string;
    readonly contributionId: string;
    readonly label: string;
    readonly face: 0 | 1;
    readonly component: string;
}

const target = (
    extensionId: string,
    contributionId: string,
    label: string,
    face: 0 | 1,
    component: string
): CrossLayoutIntentTarget =>
    Object.freeze({
        extensionId,
        contributionId,
        label,
        face,
        component
    });

/**
 * Active-carrier union of the Stage-1 M0..M5 target declarations. Each target
 * resolves to its mounted carrier host; requestedContributionId selects the
 * host's mode even where a deeper body remains owned by a later tranche.
 */
export const CROSS_LAYOUT_INTENT_TARGETS: readonly CrossLayoutIntentTarget[] = Object.freeze([
    target('m0-anuttara', 'graph', 'M0 Bimba graph', 0, 'bimbaGraph'),
    target('m0-anuttara', 'language', 'M0 language layer', 0, 'bimbaGraph'),
    target('m0-anuttara', 'ql-structure', 'M0 QL structure layer', 0, 'bimbaGraph'),
    target('m0-anuttara', 'relations', 'M0 relations layer', 0, 'bimbaGraph'),
    target('m0-anuttara', 'time-community', 'M0 time/community layer', 0, 'bimbaGraph'),
    target('m0-anuttara', 'personal', 'M0 personal bridge', 1, 'personalHome'),
    target('m0-anuttara', 'pedagogy', 'M0 pedagogy bridge', 1, 'omniReview'),

    target('m1-paramasiva', 'instrument', 'M1 clock instrument', 0, 'cosmic'),
    target('m1-paramasiva', 'walk', 'M1 Spanda walk', 0, 'walk'),
    target('m1-paramasiva', 'schema', 'M1 schema walk', 1, 'm1SurfaceDeep'),
    target('m1-paramasiva', 'spandaNavigator', 'M1 Spanda navigator', 0, 'spandaNavigator'),
    target('m1-paramasiva', 'kleinTopology', 'M1 Klein topology', 0, 'kleinTopology'),
    target('m1-paramasiva', 'playedTorus', 'M1 played torus', 0, 'm1PlayedTorus'),
    target('m1-paramasiva', 'surfaceDispatch', 'M1 deep surface', 1, 'm1SurfaceDeep'),
    target('m1-paramasiva', 'cl42Inspector', 'M1 Cl(4,2) inspector', 1, 'm1SurfaceDeep'),
    target('m1-paramasiva', 'kleinEventStrip', 'M1 Klein event strip', 1, 'm1SurfaceDeep'),
    target('m1-paramasiva', 'vortexBrowser', 'M1 vortex browser', 1, 'm1SurfaceDeep'),
    target('m1-paramasiva', 'audioBusInspector', 'M1 audio bus inspector', 1, 'm1SurfaceDeep'),

    target('m2-parashakti', 'cymatic', 'M2 cymatic field', 0, 'cosmic'),
    target('m2-parashakti', 'correspondenceTree', 'M2 correspondence tree', 0, 'm2Correspondence'),
    target('m2-parashakti', 'meaning-packet', 'M2 meaning packet', 0, 'm2Correspondence'),
    target('m2-parashakti', 'resonance', 'M2 resonance packet', 0, 'm2Correspondence'),
    target('m2-parashakti', 'planetary', 'M2 planetary correspondence', 0, 'm2Correspondence'),

    target('m3-mahamaya', 'wheel', 'M3 cosmic wheel', 0, 'm3Inspectors'),
    target('m3-mahamaya', 'cosmicClock', 'M3 cosmic clock', 0, 'cosmic'),
    target('m3-mahamaya', 'decanChain', 'M3 decan chain', 0, 'm3PentadicInspector'),
    target('m3-mahamaya', 'codon', 'M3 codon rotation', 0, 'm3Inspectors'),

    target('m4-nara', 'artifact', 'M4 lived artifact', 1, 'personalHome'),
    target('m4-nara', 'journal', 'M4 journal', 1, 'journalTimeline'),
    target('m4-nara', 'dayCalendar', 'M4 day calendar', 1, 'dayCalendar'),
    target('m4-nara', 'journalEntries', 'M4 journal entries', 1, 'journalTimeline'),
    target('m4-nara', 'personalCoordinate', 'M4 personal coordinate', 1, 'personalHome'),
    target('m4-nara', 'oracle', 'M4 oracle', 1, 'oracle'),
    target('m4-nara', 'medicine', 'M4 medicine', 1, 'medicineView'),
    target('m4-nara', 'transform', 'M4 transform', 1, 'personalHome'),
    target('m4-nara', 'lens', 'M4 recognition lens', 1, 'personalHome'),
    target('m4-nara', 'logos', 'M4 Logos cycle', 1, 'personalHome'),
    target('m4-nara', 'kairos', 'M4 Kairos', 1, 'kairosEnablement'),
    target('m4-nara', 'dialogical-arena', 'M4 dialogical arena', 1, 'm4DialogicalArena'),

    target('m5-epii', 'review', 'M5 governed review', 1, 'omniReview'),
    target('m5-epii', 'evidence-deposit', 'M5 evidence deposit', 1, 'omniEvidence'),
    target('m5-epii', 'recognitionLayer', 'M5 recognition layer', 1, 'personalHome'),
    target('m5-epii', 'mobiusPassRibbon', 'M5 Mobius pass ribbon', 1, 'autoresearch'),
    target('m5-epii', 'contemplationObject', 'M5 contemplation object', 1, 'omniReview'),
    target('m5-epii', 'jointComposition', 'M5 joint composition', 0, 'm5Ebm')
]);

const TARGETS = new Map(
    CROSS_LAYOUT_INTENT_TARGETS.map(entry => [`${entry.extensionId}\u0000${entry.contributionId}`, entry])
);

export interface CrossLayoutIntentDependencies {
    readonly setCoordinate: (coordinate: string) => void;
    readonly applySession: (context: Pick<CrossLayoutIntent, 'dayNow' | 'sessionKey' | 'privacyClass'>) => void;
    readonly navigate: (target: CrossLayoutIntentTarget, intent: CrossLayoutIntent) => void | Promise<void>;
}

function nullableString(value: unknown, label: string): string | null {
    if (value === null) return null;
    if (typeof value !== 'string') throw new Error(`${label} must be a string or null`);
    return value;
}

export function parseCrossLayoutIntent(value: unknown): CrossLayoutIntent {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('CrossLayoutIntent must be an object');
    }
    const raw = value as Record<string, unknown>;
    const extensionId = nullableString(raw.requestedExtensionId, 'requestedExtensionId');
    const contributionId = nullableString(raw.requestedContributionId, 'requestedContributionId');
    if (!extensionId || !contributionId) {
        throw new Error('CrossLayoutIntent must name requestedExtensionId and requestedContributionId');
    }
    const generation = raw.profileGeneration;
    if (generation !== null && (typeof generation !== 'number' || !Number.isSafeInteger(generation) || generation < 0)) {
        throw new Error('profileGeneration must be a non-negative safe integer or null');
    }
    const privacy = raw.privacyClass;
    if (privacy !== null && privacy !== 'public' && privacy !== 'protected' && privacy !== 'private') {
        throw new Error('privacyClass must be public, protected, private, or null');
    }
    return Object.freeze({
        coordinate: nullableString(raw.coordinate, 'coordinate'),
        artifactUri: nullableString(raw.artifactUri, 'artifactUri'),
        reviewId: nullableString(raw.reviewId, 'reviewId'),
        dayNow: nullableString(raw.dayNow, 'dayNow'),
        sessionKey: nullableString(raw.sessionKey, 'sessionKey'),
        profileGeneration: generation as number | null,
        privacyClass: privacy as IntentPrivacyClass | null,
        requestedExtensionId: extensionId,
        requestedContributionId: contributionId
    });
}

export function intentTarget(intent: Pick<CrossLayoutIntent, 'requestedExtensionId' | 'requestedContributionId'>) {
    return TARGETS.get(`${intent.requestedExtensionId}\u0000${intent.requestedContributionId}`) ?? null;
}

export async function dispatchCrossLayoutIntent(
    input: unknown,
    dependencies: CrossLayoutIntentDependencies
): Promise<CrossLayoutIntentTarget> {
    const intent = parseCrossLayoutIntent(input);
    const resolved = intentTarget(intent);
    if (!resolved) {
        throw new Error(`unregistered intent target: ${intent.requestedExtensionId}/${intent.requestedContributionId}`);
    }
    if (intent.coordinate) dependencies.setCoordinate(intent.coordinate);
    dependencies.applySession(intent);
    await dependencies.navigate(resolved, intent);
    return resolved;
}

export function registerCrossLayoutIntentCommand(dependencies: CrossLayoutIntentDependencies): () => void {
    return commands.register({
        id: CROSS_LAYOUT_INTENT_COMMAND,
        title: 'Shell: Dispatch cross-layout intent',
        run: input => dispatchCrossLayoutIntent(input, dependencies).then(() => undefined)
    });
}
