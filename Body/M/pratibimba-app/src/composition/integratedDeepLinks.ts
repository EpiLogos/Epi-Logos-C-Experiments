/**
 * Coordinate: M' M5' (integrated composition deep links - 29.T29.14)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): shared daily-0-1 composition route membrane
 * Actualises: strict composition intents that persist validated state hints
 *   before dispatching the canonical nine-field CrossLayoutIntent.
 * Public surface: COMPOSITION_ROUTES, buildCompositionIntent,
 *   dispatchCompositionIntent.
 * Does NOT own: command routing, persistence storage, or composition rendering.
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]].
 */

import { CROSS_LAYOUT_INTENT_COMMAND, type CrossLayoutIntent } from '../commands/crossLayoutIntent';
import {
    type CompositionStatePort,
    type IntegratedCompositionId,
    type IntegratedCompositionPersistedState,
    readCompositionState,
    persistCompositionState
} from './compositionState';

export const COMPOSITION_ROUTES = {
    cosmicComposition: 'epi-logos://ide/integrated-1-2-3/cosmic-composition',
    personalComposition: 'epi-logos://ide/integrated-4-5-0/personal-composition'
} as const;

export type CompositionRoute = (typeof COMPOSITION_ROUTES)[keyof typeof COMPOSITION_ROUTES];
export type CompositionStateHints = Partial<Omit<IntegratedCompositionPersistedState, 'compositionId'>>;

export interface CompositionIntent {
    readonly route: CompositionRoute;
    readonly compositionId: IntegratedCompositionId;
    readonly stateHints: CompositionStateHints;
}

export interface CompositionIntentDependencies {
    readonly statePort: CompositionStatePort;
    readonly dispatch: (command: string, intent: CrossLayoutIntent) => Promise<void>;
}

const ROUTE_BY_COMPOSITION: Readonly<Record<IntegratedCompositionId, CompositionRoute>> = Object.freeze({
    'cosmic-engine.integrated': COMPOSITION_ROUTES.cosmicComposition,
    'jiva-siva.integrated': COMPOSITION_ROUTES.personalComposition
});

const DEFAULT_STATE: Readonly<Record<IntegratedCompositionId, IntegratedCompositionPersistedState>> = Object.freeze({
    'cosmic-engine.integrated': emptyState('cosmic-engine.integrated'),
    'jiva-siva.integrated': emptyState('jiva-siva.integrated')
});

function emptyState(compositionId: IntegratedCompositionId): IntegratedCompositionPersistedState {
    return Object.freeze({
        compositionId,
        coordinate: null,
        lens: null,
        mode: null,
        profileGeneration: null,
        sessionKey: null,
        dayNow: null,
        pinnedMatrixFamily: null,
        selectedLensCell: null,
        activeCodonCell: null,
        k2OrientationQ: null,
        mathemeProofModeEnabled: false,
        timeAxisMode: null,
        senseOverride: null,
        qComposedSnapshotId: null,
        recognitionLayerView: null,
        anuttaraGroundingExpanded: false,
        miniInspectorActiveIds: Object.freeze([])
    });
}

export function buildCompositionIntent(
    compositionId: IntegratedCompositionId,
    stateHints: CompositionStateHints
): CompositionIntent {
    const route = ROUTE_BY_COMPOSITION[compositionId];
    if (!route) throw new Error(`unregistered integrated composition: ${compositionId}`);
    return Object.freeze({
        route,
        compositionId,
        stateHints: Object.freeze({ ...stateHints })
    });
}

export async function dispatchCompositionIntent(
    intent: CompositionIntent,
    dependencies: CompositionIntentDependencies
): Promise<void> {
    if (ROUTE_BY_COMPOSITION[intent.compositionId] !== intent.route) {
        throw new Error('composition route does not match compositionId');
    }
    const persisted = await readCompositionState(intent.compositionId, dependencies.statePort);
    const next = {
        ...(persisted ?? DEFAULT_STATE[intent.compositionId]),
        ...intent.stateHints,
        compositionId: intent.compositionId
    };
    await persistCompositionState(next, dependencies.statePort);

    const cosmic = intent.compositionId === 'cosmic-engine.integrated';
    await dependencies.dispatch(CROSS_LAYOUT_INTENT_COMMAND, {
        coordinate: next.coordinate,
        artifactUri: intent.route,
        reviewId: null,
        dayNow: next.dayNow,
        sessionKey: next.sessionKey,
        profileGeneration: next.profileGeneration,
        privacyClass: next.qComposedSnapshotId ? 'protected' : 'public',
        requestedExtensionId: cosmic ? 'plugin-integrated-1-2-3' : 'plugin-integrated-4-5-0',
        requestedContributionId: cosmic ? 'cosmic-composition' : 'personal-composition'
    });
}
