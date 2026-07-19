/**
 * Coordinate: M' M1' (session-close 7-8-9 reader, rerun 22.T22.5)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M1-7/8/9 Review-fold aggregate reader
 * Actualises: the active-carrier port of the lean M1 7-8-9 session-close
 *   reader, consuming ONLY the persisted aggregate close bundle.
 * Public surface: M1SessionCloseReader, readM1SessionCloseBundle.
 * Does NOT own: close persistence, contemplation law, or Review-fold fetch.
 * Contract: [[M1'-SPEC]] + rerun [[22-m1-paramasiva-frontend-deep]] 22.5.
 *
 * Provenance: ported from frozen
 * `Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-spine-789-reader.tsx`.
 */

import type { ReactNode } from 'react';

const TOP_LEVEL_KEYS = new Set([
    'session_id',
    'close_ref',
    'm1_closure',
    'audio_octet',
    'virtue_witness_vector',
    'coherence_score',
    'provenance'
]);

const PROVENANCE_KEYS = new Set([
    'privacy_class',
    'source_method',
    'persisted_at',
    'persisted_at_ms',
    'pasu_scoped'
]);

const M1_CLOSURE_KEYS = new Set(['positions_traversed', 'generator_step', 'closed']);
const AUDIO_OCTET_KEYS = new Set(['traversed', 'octave_returned']);

const FORBIDDEN_KEYS = new Set([
    'trajectory',
    'journal',
    'graphiti_relation',
    'graphiti_episodes',
    'pattern_packet',
    'body',
    'contemplation_object',
    'q_nara',
    'q_personal',
    'q_identity',
    'q_composed'
]);

export const M1_SESSION_CLOSE_VIRTUE_LABELS = Object.freeze([
    'Love/Peace - Foundational Essence',
    'Truth - Structural Foundation',
    'Openness/Creativity - Structural Fusion',
    'Joy/Play - Creation Virtue',
    'Goodness - Sustenance Virtue',
    'Beauty - Dissolution Virtue',
    'Life/Nature - Veiling Virtue',
    'Wisdom - Grace Virtue',
    'Reality - Completion Virtue'
]);

export const M1_SESSION_CLOSE_CANONICAL_QUESTIONS = Object.freeze({
    register7:
        "Did the session's action-generator traverse all twelve positions (fifth-generator +7 mod 12 closure)?",
    register8:
        'Did the session return through octave-closure rather than premature contraction?',
    register9:
        'Did wholeness witness all nine virtue-poles, or did virtues go unwitnessed?'
});

export type M1SessionCloseRead =
    | {
          readonly state: 'ready';
          readonly sessionId: string;
          readonly closeRef: string;
          readonly m1Closed: boolean;
          readonly m1GeneratorStep: number;
          readonly m1Traversal: readonly boolean[];
          readonly audioReturned: boolean;
          readonly audioTraversal: readonly boolean[];
          readonly witnessBits: readonly boolean[];
          readonly witnessCount: number;
          readonly completionPercent: number;
          readonly coherenceScore: number;
          readonly coherencePercent: number;
          readonly provenance: {
              readonly privacyClass: string;
              readonly sourceMethod: string;
              readonly persistedAt: string;
          };
          readonly virtueLabels: readonly string[];
      }
    | {
          readonly state: 'blocked';
          readonly reason: string;
      };

function objectValue(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function booleanArray(value: unknown, expected: number, label: string): readonly boolean[] | string {
    if (!Array.isArray(value) || value.length !== expected || value.some(entry => typeof entry !== 'boolean')) {
        return `${label} must be a ${expected}-position boolean array`;
    }
    return Object.freeze([...value]);
}

function decodeWitnessBits(mask: number): readonly boolean[] {
    return Object.freeze(Array.from({ length: 9 }, (_, index) => (mask & (1 << index)) !== 0));
}

function rejectsUnknownKeys(
    value: Record<string, unknown>,
    allowed: ReadonlySet<string>,
    label: string
): string | null {
    const key = Object.keys(value).find(candidate => !allowed.has(candidate));
    return key ? `unexpected ${label} field ${key}` : null;
}

export function readM1SessionCloseBundle(raw: unknown): M1SessionCloseRead {
    const bundle = objectValue(raw);
    if (!bundle) {
        return { state: 'blocked', reason: 'session-close bundle must be an object' };
    }

    for (const key of Object.keys(bundle)) {
        if (FORBIDDEN_KEYS.has(key)) {
            return { state: 'blocked', reason: `forbidden close payload field ${key}` };
        }
        if (!TOP_LEVEL_KEYS.has(key)) {
            return { state: 'blocked', reason: `unexpected close payload field ${key}` };
        }
    }

    if (typeof bundle.session_id !== 'string' || bundle.session_id.trim().length === 0) {
        return { state: 'blocked', reason: 'session_id must be a non-empty string' };
    }
    if (
        typeof bundle.close_ref !== 'string' ||
        !/^close-[A-Za-z0-9_-]+$/.test(bundle.close_ref)
    ) {
        return { state: 'blocked', reason: 'close_ref must be an opaque close reference' };
    }

    const m1Closure = objectValue(bundle.m1_closure);
    if (!m1Closure || typeof m1Closure.closed !== 'boolean') {
        return { state: 'blocked', reason: 'm1_closure.closed must be boolean' };
    }
    const unknownM1Field = rejectsUnknownKeys(m1Closure, M1_CLOSURE_KEYS, 'm1_closure');
    if (unknownM1Field) {
        return { state: 'blocked', reason: unknownM1Field };
    }
    const m1Traversal = booleanArray(
        m1Closure.positions_traversed,
        12,
        'm1_closure.positions_traversed'
    );
    if (typeof m1Traversal === 'string') {
        return { state: 'blocked', reason: m1Traversal };
    }
    if (m1Closure.generator_step !== 7) {
        return { state: 'blocked', reason: 'm1_closure.generator_step must be canonical +7' };
    }

    const audioOctet = objectValue(bundle.audio_octet);
    if (!audioOctet) {
        return { state: 'blocked', reason: 'audio_octet must be an object' };
    }
    const unknownAudioField = rejectsUnknownKeys(audioOctet, AUDIO_OCTET_KEYS, 'audio_octet');
    if (unknownAudioField) {
        return { state: 'blocked', reason: unknownAudioField };
    }
    const audioTraversal = booleanArray(
        audioOctet.traversed,
        8,
        'audio_octet.traversed'
    );
    if (typeof audioTraversal === 'string') {
        return { state: 'blocked', reason: audioTraversal };
    }
    if (typeof audioOctet.octave_returned !== 'boolean') {
        return { state: 'blocked', reason: 'audio_octet.octave_returned must be boolean' };
    }

    if (
        !Number.isInteger(bundle.virtue_witness_vector) ||
        (bundle.virtue_witness_vector as number) < 0 ||
        (bundle.virtue_witness_vector as number) > 0x1ff
    ) {
        return {
            state: 'blocked',
            reason: 'virtue_witness_vector must be a 9-bit unsigned integer'
        };
    }

    if (
        typeof bundle.coherence_score !== 'number' ||
        !Number.isFinite(bundle.coherence_score) ||
        bundle.coherence_score < 0 ||
        bundle.coherence_score > 1
    ) {
        return {
            state: 'blocked',
            reason: 'coherence_score must be a finite value from 0 to 1'
        };
    }

    const provenance = objectValue(bundle.provenance);
    if (!provenance) {
        return { state: 'blocked', reason: 'provenance must be an object' };
    }
    for (const key of Object.keys(provenance)) {
        if (!PROVENANCE_KEYS.has(key)) {
            return { state: 'blocked', reason: `unexpected provenance field ${key}` };
        }
    }
    if (provenance.privacy_class !== 'protected_local') {
        return { state: 'blocked', reason: 'provenance.privacy_class must be protected_local' };
    }
    if (provenance.source_method !== 'nara.session_close') {
        return { state: 'blocked', reason: 'provenance.source_method must be nara.session_close' };
    }
    if (
        typeof provenance.persisted_at !== 'string' ||
        Number.isNaN(Date.parse(provenance.persisted_at)) ||
        !Number.isSafeInteger(provenance.persisted_at_ms) ||
        (provenance.persisted_at_ms as number) < 0 ||
        provenance.pasu_scoped !== true
    ) {
        return {
            state: 'blocked',
            reason: 'provenance must carry a valid persisted time and PASU-scoped proof'
        };
    }

    const witnessBits = decodeWitnessBits(bundle.virtue_witness_vector as number);
    const witnessCount = witnessBits.filter(Boolean).length;
    const completionPercent = Math.round((witnessCount / witnessBits.length) * 100);

    return {
        state: 'ready',
        sessionId: bundle.session_id,
        closeRef: bundle.close_ref,
        m1Closed: m1Closure.closed,
        m1GeneratorStep: m1Closure.generator_step,
        m1Traversal,
        audioReturned: audioOctet.octave_returned,
        audioTraversal,
        witnessBits,
        witnessCount,
        completionPercent,
        coherenceScore: bundle.coherence_score,
        coherencePercent: Math.round(bundle.coherence_score * 100),
        provenance: {
            privacyClass: provenance.privacy_class,
            sourceMethod: provenance.source_method,
            persistedAt: provenance.persisted_at
        },
        virtueLabels: M1_SESSION_CLOSE_VIRTUE_LABELS
    };
}

export function M1SessionCloseReader({ close }: { readonly close: Extract<M1SessionCloseRead, { state: 'ready' }> }) {
    const m1Count = close.m1Traversal.filter(Boolean).length;
    const audioCount = close.audioTraversal.filter(Boolean).length;

    return (
        <section
            className="m1-session-close-reader"
            data-testid="m1-session-close-reader"
            data-close-ref={close.closeRef}
            data-privacy-class={close.provenance.privacyClass}
        >
            <header>
                <h3>7-8-9 spine reader</h3>
                <p data-testid="m1-session-close-provenance">
                    {close.provenance.sourceMethod} · {close.provenance.persistedAt}
                </p>
            </header>
            <div>
                <ReaderRow
                    register="7"
                    question={M1_SESSION_CLOSE_CANONICAL_QUESTIONS.register7}
                    arithmetic="8n - n | 7/4 = (72 - 9)/36"
                    substrate="127 = 2^7 - 1 = M_7"
                    summary={`${m1Count}/12 positions traversed`}
                >
                    <span data-testid="m1-session-close-m1-count">
                        {m1Count}/12 · +{close.m1GeneratorStep} mod 12 ·{' '}
                        {close.m1Closed ? 'closed' : 'open'}
                    </span>
                    <PipStrip
                        entries={close.m1Traversal}
                        litTestId="m1-session-close-m1-pip-lit"
                        darkTestId="m1-session-close-m1-pip-dark"
                    />
                </ReaderRow>
                <ReaderRow
                    register="8"
                    question={M1_SESSION_CLOSE_CANONICAL_QUESTIONS.register8}
                    arithmetic="octave return | binary closure"
                    substrate="128 = 2^7"
                    summary={`${audioCount}/8 audio_octet positions traversed`}
                >
                    <span data-testid="m1-session-close-audio-count">
                        {audioCount}/8 · {close.audioReturned ? 'octave returned' : 'return open'}
                    </span>
                    <PipStrip
                        entries={close.audioTraversal}
                        litTestId="m1-session-close-audio-pip-lit"
                        darkTestId="m1-session-close-audio-pip-dark"
                    />
                </ReaderRow>
                <ReaderRow
                    register="9"
                    question={M1_SESSION_CLOSE_CANONICAL_QUESTIONS.register9}
                    arithmetic="9/8 epogdoon-extension"
                    substrate="137 = 128 + 9"
                    summary={`${close.witnessCount}/9 virtue-poles witnessed`}
                >
                    <span data-testid="m1-session-close-virtue-count">
                        {close.witnessCount}/9 · completion {close.completionPercent}% · coherence{' '}
                        {close.coherencePercent}%
                    </span>
                    <ol data-testid="m1-session-close-virtues">
                        {close.virtueLabels.map((label, index) => {
                            const lit = close.witnessBits[index] === true;
                            return (
                                <li
                                    key={label}
                                    data-testid={lit ? 'm1-session-close-virtue-pip-lit' : 'm1-session-close-virtue-pip-dark'}
                                    data-label={label}
                                >
                                    <span data-testid="m1-session-close-virtue-pip" aria-hidden="true">
                                        {lit ? '●' : '○'}
                                    </span>{' '}
                                    {label}
                                </li>
                            );
                        })}
                    </ol>
                </ReaderRow>
            </div>
        </section>
    );
}

function ReaderRow(props: {
    readonly register: '7' | '8' | '9';
    readonly question: string;
    readonly arithmetic: string;
    readonly substrate: string;
    readonly summary: string;
    readonly children: ReactNode;
}) {
    return (
        <article data-testid={`m1-session-close-row-${props.register}`}>
            <h4>{props.register}</h4>
            <p data-testid={`m1-session-close-question-${props.register}`}>{props.question}</p>
            <p>{props.arithmetic}</p>
            <p>{props.substrate}</p>
            <p>{props.summary}</p>
            <div>{props.children}</div>
        </article>
    );
}

function PipStrip(props: {
    readonly entries: readonly boolean[];
    readonly litTestId: string;
    readonly darkTestId: string;
}) {
    return (
        <div>
            {props.entries.map((entry, index) => (
                <span
                    key={index}
                    data-testid={entry ? props.litTestId : props.darkTestId}
                    aria-hidden="true"
                >
                    {entry ? '●' : '○'}
                </span>
            ))}
        </div>
    );
}
