// 08.T3 — Cosmic Engine composition slice.
//
// CRITICAL DISCIPLINE: this file MUST NOT contain any local codon, tarot,
// planetary, pitch, audio, harmonic ratio, or correspondence table. Every
// rendered value originates from a backend-supplied MathemeHarmonicProfile
// field. If a field is missing the pane renders a readiness blocker that
// names the upstream owner — never a placeholder constant pretending to be
// data.
//
// The no-local-tables discipline is enforced by
// extensions/test/cosmic-engine-no-local-tables.test.mjs which scans this
// file's source for suspicious literal arrays.

import * as React from 'react';
import {
    MathemeHarmonicProfileBoundary
} from '@pratibimba/m-extension-runtime';
import { PaneAvailability } from '@pratibimba/integrated-composition';

interface PaneShellProps {
    readonly title: string;
    readonly extensionLabel: string;
    readonly availability: PaneAvailability;
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly children: React.ReactNode;
}

const PaneShell: React.FC<PaneShellProps> = ({
    title,
    extensionLabel,
    availability,
    profile,
    children
}) => {
    return (
        <section className={`cosmic-pane cosmic-pane-${availability.paneId}`}>
            <header className="cosmic-pane-header">
                <h3 className="cosmic-pane-title">{title}</h3>
                <span className="cosmic-pane-source">{extensionLabel}</span>
                <span className="cosmic-pane-gen" data-test="profile-generation">
                    gen {profile ? profile.generation : '—'}
                </span>
            </header>
            {availability.allFieldsPresent ? (
                <div className="cosmic-pane-body">{children}</div>
            ) : (
                <div className="cosmic-pane-blocker">
                    <p>
                        Cannot render this pane — the backend has not supplied{' '}
                        {availability.missingFields.length} required field
                        {availability.missingFields.length === 1 ? '' : 's'}.
                    </p>
                    <ul>
                        {availability.fields
                            .filter(f => !f.present)
                            .map(f => (
                                <li key={f.field}>
                                    <code>{f.field}</code> — owner:{' '}
                                    <em>{f.blockerOwnerTrack}</em>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </section>
    );
};

export interface CosmicEnginePanesProps {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly m3CenterStage: PaneAvailability;
    readonly m2LeftStage: PaneAvailability;
    readonly m1RightInspector: PaneAvailability;
}

/**
 * The cosmic engine composition. Three panes from one shared profile
 * generation. Values are read straight from the profile payload — no local
 * codon, tarot, planetary, pitch, or correspondence table is allowed in
 * this file (enforced by cosmic-engine-no-local-tables.test.mjs).
 */
export const CosmicEnginePanes: React.FC<CosmicEnginePanesProps> = ({
    profile,
    m3CenterStage,
    m2LeftStage,
    m1RightInspector
}) => {
    const codon = readPayloadString(profile, 'codon_rotation_projection');
    const mahamaya = readPayloadString(profile, 'mahamaya');
    const resonance72 = readPayloadString(profile, 'resonance72');
    const planetaryChakral = readPayloadString(profile, 'planetaryChakral');
    const kleinFlipState = readPayloadString(profile, 'kleinFlipState');
    const lens = readPayloadString(profile, 'lens');
    const mode = readPayloadString(profile, 'mode');
    const audioOctet = readPayloadString(profile, 'audio_octet');
    const nodalQuartet = readPayloadString(profile, 'nodal_quartet');
    return (
        <div className="cosmic-engine-layout">
            <PaneShell
                title="Cosmic Wheel"
                extensionLabel="M3 Mahamaya"
                availability={m3CenterStage}
                profile={profile}
            >
                <dl>
                    <dt>codon_rotation_projection</dt>
                    <dd data-test="m3-codon">{codon}</dd>
                    <dt>mahamaya</dt>
                    <dd data-test="m3-mahamaya">{mahamaya}</dd>
                </dl>
            </PaneShell>
            <PaneShell
                title="Lens / Cymatic Backdrop"
                extensionLabel="M2 Parashakti"
                availability={m2LeftStage}
                profile={profile}
            >
                <dl>
                    <dt>resonance72</dt>
                    <dd data-test="m2-resonance72">{resonance72}</dd>
                    <dt>planetaryChakral</dt>
                    <dd data-test="m2-planetary">{planetaryChakral}</dd>
                    <dt>kleinFlipState</dt>
                    <dd data-test="m2-klein">{kleinFlipState}</dd>
                </dl>
            </PaneShell>
            <PaneShell
                title="Torus / Path / Audio Walk Inspector"
                extensionLabel="M1 Paramasiva"
                availability={m1RightInspector}
                profile={profile}
            >
                <dl>
                    <dt>lens</dt>
                    <dd data-test="m1-lens">{lens}</dd>
                    <dt>mode</dt>
                    <dd data-test="m1-mode">{mode}</dd>
                    <dt>audio_octet</dt>
                    <dd data-test="m1-audio">{audioOctet}</dd>
                    <dt>nodal_quartet</dt>
                    <dd data-test="m1-nodal">{nodalQuartet}</dd>
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
    // Render any structured value as JSON for inspection. We never *interpret*
    // its meaning here — that is upstream's job.
    try {
        return JSON.stringify(value);
    } catch {
        return '[unserializable]';
    }
}
