import * as React from 'react';
import type {
    AletheiaLineageBadge,
    AletheiaSubagent,
    AletheiaVetoRecord,
    DispatchTraceNode
} from './types';

export interface AletheiaSubagentTraceProps {
    readonly subagent: AletheiaSubagent;
    readonly subtrace: DispatchTraceNode;
    readonly vetoRecord?: AletheiaVetoRecord | null;
}

export const JANUS_PROSPECTIVE_RETROSPECTIVE_CANVAS_SPEC =
    "Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md#4";

export const AletheiaSubagentTrace: React.FC<AletheiaSubagentTraceProps> = ({
    subagent,
    subtrace,
    vetoRecord
}) => {
    const profile = SUBAGENT_RENDERERS[subagent];
    const effectiveVeto = vetoRecord ?? subtrace.veto ?? null;
    const lineageBadges = subtrace.lineageBadges ?? [];
    return (
        <article
            className="ide-shell-aletheia-subagent-trace"
            data-test={`acr-aletheia-subagent-trace-${subagent}`}
            data-subagent={subagent}
            data-trace-mode="crystallisation-mode"
            data-peer-review-actor="false"
            data-veto-non-blocking={effectiveVeto ? 'true' : 'false'}
        >
            <header>
                <strong>{profile.label}</strong>
                <span> — {profile.mode}</span>
            </header>
            {effectiveVeto && (
                <p
                    className="ide-shell-aletheia-veto-banner ide-shell-error"
                    data-test={`acr-aletheia-veto-${subagent}`}
                    data-human-gate-blocking="false"
                    role="status"
                >
                    Aletheia subagent {profile.label} veto — {effectiveVeto.reason}
                    {typeof effectiveVeto.raisedAt === 'number' && (
                        <> ({new Date(effectiveVeto.raisedAt).toISOString()})</>
                    )}
                    {' '}Human gate remains override authority.
                </p>
            )}
            <dl>
                <dt>Role</dt>
                <dd>dispatch sub-trace in crystallisation-mode; not a peer review actor</dd>
                <dt>Trace node</dt>
                <dd>{subtrace.label}</dd>
                <dt>Rendering</dt>
                <dd>{profile.rendering}</dd>
                <dt>Method / skill</dt>
                <dd>{subtrace.methodOrSkill ?? 'crystallisation-mode'}</dd>
                {subagent === 'janus' && (
                    <>
                        <dt>Janus source</dt>
                        <dd data-test="acr-aletheia-janus-source">
                            {JANUS_PROSPECTIVE_RETROSPECTIVE_CANVAS_SPEC}
                        </dd>
                        <dt>Prospective / retrospective</dt>
                        <dd data-test="acr-aletheia-janus-frame">
                            {renderJanusFrame(subtrace)}
                        </dd>
                    </>
                )}
            </dl>
            {lineageBadges.length > 0 && (
                <ul
                    className="ide-shell-aletheia-lineage-badges"
                    data-test={`acr-aletheia-lineage-badges-${subagent}`}
                    aria-label={`${profile.label} lineage badges`}
                >
                    {lineageBadges.map(badge => (
                        <li
                            key={`${badge.label}:${badge.handle ?? badge.source ?? 'lineage'}`}
                            className="ide-shell-aletheia-lineage-badge"
                            data-test={`acr-aletheia-lineage-badge-${subagent}`}
                            data-lineage-handle={badge.handle ?? ''}
                        >
                            {formatLineageBadge(badge)}
                        </li>
                    ))}
                </ul>
            )}
        </article>
    );
};

function renderJanusFrame(subtrace: DispatchTraceNode): string {
    const frame = subtrace.janusFrame;
    if (!frame) {
        return 'OracleSpread aliveness + kairos-driven weighting from prospective-retrospective-canvas-spec §4';
    }
    const prospective = Math.round(frame.prospective * 100);
    const retrospective = Math.round(frame.retrospective * 100);
    return [
        `${prospective}% prospective`,
        `${retrospective}% retrospective`,
        frame.oracleSpreadAliveness ? `OracleSpread ${frame.oracleSpreadAliveness}` : 'OracleSpread aliveness',
        frame.kairosWeighting ? `kairos ${frame.kairosWeighting}` : 'kairos-driven weighting'
    ].join(' · ');
}

function formatLineageBadge(badge: AletheiaLineageBadge): string {
    const parts = [badge.label, badge.handle, badge.source].filter((part): part is string =>
        typeof part === 'string' && part.trim().length > 0
    );
    return parts.join(' · ');
}

const SUBAGENT_RENDERERS: Record<AletheiaSubagent, {
    readonly label: string;
    readonly mode: string;
    readonly rendering: string;
}> = {
    anansi: {
        label: 'Anansi',
        mode: 'citation trail — source-to-source provenance graph',
        rendering: 'source-to-source provenance graph'
    },
    janus: {
        label: 'Janus',
        mode: 'prospective / retrospective binary',
        rendering: 'OracleSpread aliveness + kairos-driven weighting per 12.18 and prospective-retrospective-canvas-spec §4'
    },
    moirai: {
        label: 'Moirai',
        mode: 'tarot cast-anchor at session open / decision point',
        rendering: 'tarot cast-anchor at session open / decision point'
    },
    mercurius: {
        label: 'Mercurius',
        mode: 'kairos signal',
        rendering: 'Kerykeion-derived ephemeris context'
    },
    agora: {
        label: 'Agora',
        mode: 'deliberation log',
        rendering: 'deliberation log between Anima dispatchees'
    },
    zeithoven: {
        label: 'Zeithoven',
        mode: 'temporal-rhythm anchor',
        rendering: 'tick-grid alignment of subagent invocations'
    }
};
