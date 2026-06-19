import * as React from 'react';
import type { AletheiaSubagent, DispatchTraceNode } from './types';

export interface AletheiaSubagentTraceProps {
    readonly subagent: AletheiaSubagent;
    readonly subtrace: DispatchTraceNode;
    readonly vetoRecord?: { reason: string; raisedAt: number };
}

export const AletheiaSubagentTrace: React.FC<AletheiaSubagentTraceProps> = ({
    subagent,
    subtrace,
    vetoRecord
}) => {
    const profile = SUBAGENT_RENDERERS[subagent];
    return (
        <article
            data-test={`acr-aletheia-subagent-trace-${subagent}`}
            data-subagent={subagent}
            data-veto-non-blocking={vetoRecord ? 'true' : 'false'}
        >
            <header>
                <strong>{profile.label}</strong>
                <span> — {profile.mode}</span>
            </header>
            {vetoRecord && (
                <p className="ide-shell-error" data-test={`acr-aletheia-veto-${subagent}`}>
                    Veto raised at {new Date(vetoRecord.raisedAt).toISOString()}: {vetoRecord.reason}
                    {' '}Non-blocking while the human gate owns final review.
                </p>
            )}
            <dl>
                <dt>Trace node</dt>
                <dd>{subtrace.label}</dd>
                <dt>Rendering</dt>
                <dd>{profile.rendering}</dd>
                <dt>Method / skill</dt>
                <dd>{subtrace.methodOrSkill ?? 'crystallisation-mode'}</dd>
            </dl>
        </article>
    );
};

const SUBAGENT_RENDERERS: Record<AletheiaSubagent, {
    readonly label: string;
    readonly mode: string;
    readonly rendering: string;
}> = {
    anansi: {
        label: 'Anansi',
        mode: 'citation trail graph',
        rendering: 'citation trail graph'
    },
    janus: {
        label: 'Janus',
        mode: 'prospective-retrospective binary',
        rendering: 'prospective-retrospective binary per 12.18'
    },
    moirai: {
        label: 'Moirai',
        mode: 'tarot cast-anchor',
        rendering: 'tarot cast-anchor'
    },
    mercurius: {
        label: 'Mercurius',
        mode: 'kairos Kerykeion ephemeris',
        rendering: 'kairos Kerykeion ephemeris'
    },
    agora: {
        label: 'Agora',
        mode: 'deliberation log',
        rendering: 'deliberation log'
    },
    zeithoven: {
        label: 'Zeithoven',
        mode: 'temporal-rhythm tick alignment',
        rendering: 'temporal-rhythm tick alignment'
    }
};
