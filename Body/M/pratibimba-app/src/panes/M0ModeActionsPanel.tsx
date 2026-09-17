/**
 * Coordinate: M' M0' (reading/authoring mode toggle — rerun 21.T21.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the mode-keyed M0 actions panel (WC-M0-13/14, ratifies DR-M0-1 at
 *   the UI level). Reading mode offers only the read-side readiness-evidence
 *   deposit; authoring mode adds the two further M5-routed actions, the two
 *   routed-write deep-links, and the DR-M0-1 provenance banner. Every affordance
 *   routes via the real carrier cross-layout intent spine — M0' NEVER mutates
 *   canon (SC-2: no direct canon-mutation path; routed-write via M5 only).
 * Public surface: M0ModeActionsPanel, M0ModeActionsPanelProps.
 * Does NOT own: the intent transport (commands/crossLayoutIntent), canon
 *   mutation (routed-write via M5 governance only), the action model
 *   (m0ModeActions), the layer rail / reader panels. The App can control this
 *   mode through its persisted M0 surface record.
 */

import { useCallback, useState } from 'react';
import { commands } from '../commands/registry';
import { CROSS_LAYOUT_INTENT_COMMAND, IntentPrivacyClass } from '../commands/crossLayoutIntent';
import { useCoordinateStore, useSessionStore, useTickStore } from '../state/stores';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import {
    M0_AUTHORING_DEEPLINKS,
    M0_DR_M0_1_BANNER,
    m0ActionsForMode,
    type M0SurfaceMode
} from './m0ModeActions';

export interface M0ModeActionsPanelProps {
    readonly mode?: M0SurfaceMode;
    readonly onModeChange?: (mode: M0SurfaceMode) => void;
}

export function M0ModeActionsPanel({ mode: controlledMode, onModeChange }: M0ModeActionsPanelProps = {}) {
    const [uncontrolledMode, setUncontrolledMode] = useState<M0SurfaceMode>('reading');
    const mode = controlledMode ?? uncontrolledMode;
    const setMode = (nextMode: M0SurfaceMode) => {
        if (controlledMode === undefined) {
            setUncontrolledMode(nextMode);
        }
        onModeChange?.(nextMode);
    };
    const coordinate = useCoordinateStore(state => state.selected);
    const sessionKey = useSessionStore(state => state.sessionKey);
    const dayNow = useSessionStore(state => state.dayNow);
    const privacy = useSessionStore(state => state.privacyClass);
    const generation = useTickStore(state => state.generation);

    const dispatch = useCallback(
        (requestedExtensionId: string, requestedContributionId: string) => {
            const privacyClass: IntentPrivacyClass | null =
                privacy === 'public' || privacy === 'protected' || privacy === 'private' ? privacy : null;
            void commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
                coordinate,
                artifactUri: null,
                reviewId: null,
                dayNow,
                sessionKey,
                profileGeneration: generation,
                privacyClass,
                requestedExtensionId,
                requestedContributionId
            });
        },
        [coordinate, dayNow, sessionKey, privacy, generation]
    );

    const actions = m0ActionsForMode(mode);

    return (
        <section className="m0-mode-actions" data-testid="m0-mode-actions" data-mode={mode}>
            <div className="m0-mode-actions-header">
                <span className="m0-mode-label">{`M0' actions — ${mode}`}</span>
                {mode === 'reading' ? (
                    <button
                        type="button"
                        data-testid="m0-mode-switch-authoring"
                        onClick={() => setMode('authoring')}
                    >
                        Switch to Authoring
                    </button>
                ) : (
                    <button
                        type="button"
                        data-testid="m0-mode-switch-reading"
                        onClick={() => setMode('reading')}
                    >
                        Switch to Reading
                    </button>
                )}
            </div>

            {mode === 'authoring' ? (
                <p
                    className="m0-dr-m0-1-banner"
                    data-testid="m0-dr-m0-1-banner"
                    data-provenance-state="derived"
                >
                    <ProvenanceBadge state="derived" reason={M0_DR_M0_1_BANNER} />
                    {M0_DR_M0_1_BANNER}
                </p>
            ) : null}

            <ul className="m0-action-list">
                {actions.map(action => (
                    <li key={action.id}>
                        <button
                            type="button"
                            data-testid={`m0-action-${action.id}`}
                            onClick={() => dispatch(action.requestedExtensionId, action.requestedContributionId)}
                        >
                            {action.label}
                        </button>
                    </li>
                ))}
            </ul>

            {mode === 'authoring' ? (
                <div className="m0-authoring-deeplinks">
                    {M0_AUTHORING_DEEPLINKS.map(link => (
                        <button
                            key={link.id}
                            type="button"
                            data-testid={`m0-deeplink-${link.id}`}
                            onClick={() => dispatch(link.requestedExtensionId, link.requestedContributionId)}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
