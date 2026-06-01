// 08.T5 — Jiva-Siva composition slice.
//
// CRITICAL DISCIPLINE: this file MUST NOT contain any local M4 personal field
// table, identity quaternion component, Nara journal sample, Graphiti episode
// body, or any other raw-protected content. Every rendered value comes from a
// backend-supplied handle/summary/visual-state field. Deep bodies live behind
// the ConsentGate path and never appear in the default render.
//
// The no-local-tables / no-raw-bodies discipline is enforced by
// extensions/test/jiva-siva-no-local-tables.test.mjs (added with this slice).

import * as React from 'react';
import {
    MathemeHarmonicProfileBoundary
} from '@pratibimba/m-extension-runtime';
import {
    ConsentAction,
    JivaSivaPaneAvailability
} from '@pratibimba/integrated-composition';

interface PaneShellProps {
    readonly title: string;
    readonly extensionLabel: string;
    readonly availability: JivaSivaPaneAvailability;
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly children: React.ReactNode;
    readonly deepActions: readonly { action: ConsentAction; label: string }[];
    readonly onDeepOpen?: (action: ConsentAction) => void;
    readonly isActionPermitted?: (action: ConsentAction) => boolean;
}

const PaneShell: React.FC<PaneShellProps> = ({
    title,
    extensionLabel,
    availability,
    profile,
    children,
    deepActions,
    onDeepOpen,
    isActionPermitted
}) => {
    return (
        <section className={`jiva-pane jiva-pane-${availability.paneId}`}>
            <header className="jiva-pane-header">
                <h3 className="jiva-pane-title">{title}</h3>
                <span className="jiva-pane-source">{extensionLabel}</span>
                <span className="jiva-pane-gen" data-test="profile-generation">
                    gen {profile ? profile.generation : '—'}
                </span>
            </header>
            {availability.allFieldsPresent ? (
                <div className="jiva-pane-body">
                    {children}
                    {deepActions.length > 0 && onDeepOpen ? (
                        <div className="jiva-pane-deep-actions">
                            <h4>Protected deep actions (require consent)</h4>
                            <ul>
                                {deepActions.map(({ action, label }) => {
                                    const permitted =
                                        isActionPermitted?.(action) ?? false;
                                    return (
                                        <li key={action}>
                                            <button
                                                type="button"
                                                className="theia-button jiva-deep-action"
                                                disabled={!permitted}
                                                onClick={() => onDeepOpen(action)}
                                            >
                                                {label}
                                                {!permitted ? ' (consent required)' : ''}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className="jiva-pane-blocker">
                    <p>
                        {availability.missingFields.length} required public-safe field
                        {availability.missingFields.length === 1 ? ' is' : 's are'} not
                        yet available.
                    </p>
                    <ul>
                        {availability.fields
                            .filter(f => !f.present)
                            .map(f => (
                                <li key={f.field}>
                                    <code>{f.field}</code> — owner:{' '}
                                    <em>{f.ownerTrack}</em>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </section>
    );
};

export interface JivaSivaPanesProps {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly m4Foreground: JivaSivaPaneAvailability;
    readonly m0Backdrop: JivaSivaPaneAvailability;
    readonly m5Side: JivaSivaPaneAvailability;
    readonly onDeepOpen?: (action: ConsentAction) => void;
    readonly isActionPermitted?: (action: ConsentAction) => boolean;
}

export const JivaSivaPanes: React.FC<JivaSivaPanesProps> = ({
    profile,
    m4Foreground,
    m0Backdrop,
    m5Side,
    onDeepOpen,
    isActionPermitted
}) => {
    const bedrockLink = readPayloadString(profile, 'bedrock_link');
    const selectedCoordinate = readPayloadString(profile, 'selected_coordinate');
    const activityDots = readPayloadString(profile, 'activity_resonance_dots');
    const fieldSummary = readPayloadString(profile, 'field_state_summary');
    const gdsClusters = readPayloadString(profile, 'gds_clusters');
    const m0Provenance = readPayloadString(profile, 'm0_coordinate_provenance');
    const reviewCount = readPayloadString(profile, 'review_queue_count');
    const continuityHandle = readPayloadString(profile, 'continuity_handle');
    const lastCanon = readPayloadString(profile, 'last_canon_recognition_event');
    return (
        <div className="jiva-siva-layout">
            <PaneShell
                title="Personal Field Foreground"
                extensionLabel="M4 Nara (public-safe handles)"
                availability={m4Foreground}
                profile={profile}
                deepActions={[
                    { action: 'open-m4-field-deep', label: 'Open deep M4 field' },
                    { action: 'open-identity-quaternion', label: 'Open identity quaternion' },
                    { action: 'open-nara-dialogue', label: 'Open Nara dialogue artifact' },
                    { action: 'open-graphiti-body', label: 'Open Graphiti episode body' }
                ]}
                onDeepOpen={onDeepOpen}
                isActionPermitted={isActionPermitted}
            >
                <dl>
                    <dt>bedrock_link</dt>
                    <dd data-test="m4-bedrock">{bedrockLink}</dd>
                    <dt>selected_coordinate</dt>
                    <dd data-test="m4-coord">{selectedCoordinate}</dd>
                    <dt>activity_resonance_dots</dt>
                    <dd data-test="m4-activity">{activityDots}</dd>
                    <dt>field_state_summary</dt>
                    <dd data-test="m4-summary">{fieldSummary}</dd>
                </dl>
            </PaneShell>
            <PaneShell
                title="Canonical Graph / City Backdrop"
                extensionLabel="M0 Anuttara (prior ground)"
                availability={m0Backdrop}
                profile={profile}
                deepActions={[]}
            >
                <dl>
                    <dt>gds_clusters</dt>
                    <dd data-test="m0-gds">{gdsClusters}</dd>
                    <dt>m0_coordinate_provenance</dt>
                    <dd data-test="m0-prov">{m0Provenance}</dd>
                </dl>
            </PaneShell>
            <PaneShell
                title="Epii Review / Continuity Side"
                extensionLabel="M5 Epii (governed metadata)"
                availability={m5Side}
                profile={profile}
                deepActions={[
                    { action: 'publish-shared-archetype', label: 'Publish shared archetype event' }
                ]}
                onDeepOpen={onDeepOpen}
                isActionPermitted={isActionPermitted}
            >
                <dl>
                    <dt>review_queue_count</dt>
                    <dd data-test="m5-review">{reviewCount}</dd>
                    <dt>continuity_handle</dt>
                    <dd data-test="m5-cont">{continuityHandle}</dd>
                    <dt>last_canon_recognition_event</dt>
                    <dd data-test="m5-canon">{lastCanon}</dd>
                </dl>
            </PaneShell>
        </div>
    );
};

function readPayloadString(
    profile: MathemeHarmonicProfileBoundary | null,
    field: string
): string {
    if (!profile) {
        return '—';
    }
    const value = profile.payload[field];
    if (value === null || value === undefined) {
        return '—';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    try {
        return JSON.stringify(value);
    } catch {
        return '[unserializable]';
    }
}
