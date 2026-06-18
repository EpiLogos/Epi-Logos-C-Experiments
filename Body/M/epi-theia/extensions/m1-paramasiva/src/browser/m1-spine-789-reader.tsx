import * as React from 'react';

export const M1_SPINE_789_READER_VIEW_ID = 'm1.paramasiva.spineReader789';
export const M1_SPINE_789_REGISTER_COUNT = 3;
export const M1_SPINE_789_VIRTUE_COUNT = 9;
export const M1_SPINE_789_AUDIO_OCTET_COUNT = 8;
export const M1_SPINE_789_RING_POSITION_COUNT = 12;

export type Spine789WitnessSeed = number | string | readonly boolean[];

export interface M0VerifierReport789 {
    readonly virtue_witness_vector: Spine789WitnessSeed;
    readonly coherence_score: number;
}

export interface Spine789VirtueLabel {
    readonly position: number;
    readonly label: string;
}

export interface M1Spine789ReaderProps {
    readonly report: M0VerifierReport789;
    readonly virtueLabels?: readonly Spine789VirtueLabel[];
    readonly m1RingTraversalClosed?: boolean;
    readonly audioOctetTraversal?: readonly boolean[];
}

export interface Spine789CompletionSummary {
    readonly witnessBits: readonly boolean[];
    readonly witnessedCount: number;
    readonly witnessCompletionPercent: number;
    readonly coherencePercent: number;
    readonly audioOctetCount: number;
}

export const SPINE_789_CANONICAL_QUESTIONS = Object.freeze({
    register7:
        "Did the session's action-generator traverse all twelve positions (fifth-generator +7 mod 12 closure)?",
    register8:
        'Did the session return through octave-closure rather than premature contraction?',
    register9:
        'Did wholeness witness all nine virtue-poles, or did virtues go unwitnessed?'
});

export const SPINE_789_VIRTUE_LABELS: readonly Spine789VirtueLabel[] = Object.freeze([
    Object.freeze({ position: 0, label: 'Love/Peace - Foundational Essence' }),
    Object.freeze({ position: 1, label: 'Truth - Structural Foundation' }),
    Object.freeze({ position: 2, label: 'Openness/Creativity - Structural Fusion' }),
    Object.freeze({ position: 3, label: 'Joy/Play - Creation Virtue' }),
    Object.freeze({ position: 4, label: 'Goodness - Sustenance Virtue' }),
    Object.freeze({ position: 5, label: 'Beauty - Dissolution Virtue' }),
    Object.freeze({ position: 6, label: 'Life/Nature - Veiling Virtue' }),
    Object.freeze({ position: 7, label: 'Wisdom - Grace Virtue' }),
    Object.freeze({ position: 8, label: 'Reality - Completion Virtue' })
]);

export function decodeVirtueWitnessVector(seed: Spine789WitnessSeed): readonly boolean[] {
    const bits = new Array<boolean>(M1_SPINE_789_VIRTUE_COUNT).fill(false);
    if (typeof seed === 'number') {
        const mask = Number.isFinite(seed) ? Math.max(0, Math.floor(seed)) : 0;
        for (let position = 0; position < M1_SPINE_789_VIRTUE_COUNT; position++) {
            bits[position] = Boolean(mask & (1 << position));
        }
        return Object.freeze(bits);
    }
    if (typeof seed === 'string') {
        const compact = seed.trim().replace(/^0b/i, '');
        for (let position = 0; position < M1_SPINE_789_VIRTUE_COUNT; position++) {
            const sourceIndex = compact.length - 1 - position;
            bits[position] = compact[sourceIndex] === '1';
        }
        return Object.freeze(bits);
    }
    for (let position = 0; position < M1_SPINE_789_VIRTUE_COUNT; position++) {
        bits[position] = Boolean(seed[position]);
    }
    return Object.freeze(bits);
}

export function countWitnessedVirtues(bits: readonly boolean[]): number {
    return bits.slice(0, M1_SPINE_789_VIRTUE_COUNT).filter(Boolean).length;
}

export function buildSpine789CompletionSummary(
    props: M1Spine789ReaderProps
): Spine789CompletionSummary {
    const witnessBits = decodeVirtueWitnessVector(props.report.virtue_witness_vector);
    const witnessedCount = countWitnessedVirtues(witnessBits);
    const audioOctetCount = normalizeAudioOctetTraversal(props.audioOctetTraversal).filter(Boolean)
        .length;

    return Object.freeze({
        witnessBits,
        witnessedCount,
        witnessCompletionPercent: Math.round(
            (witnessedCount / M1_SPINE_789_VIRTUE_COUNT) * 100
        ),
        coherencePercent: Math.round(clampUnit(props.report.coherence_score) * 100),
        audioOctetCount
    });
}

export const M1Spine789Reader: React.FC<M1Spine789ReaderProps> = props => {
    const labels = normalizeVirtueLabels(props.virtueLabels);
    const summary = buildSpine789CompletionSummary(props);
    const audioTraversal = normalizeAudioOctetTraversal(props.audioOctetTraversal);
    const ringClosed = props.m1RingTraversalClosed === true;

    return (
        <section
            className="m1-spine-789-reader"
            data-view-id={M1_SPINE_789_READER_VIEW_ID}
            data-witnessed-count={summary.witnessedCount}
            data-witness-completion-percent={summary.witnessCompletionPercent}
            aria-label="7-8-9 spine completion reader"
            style={readerStyle}
        >
            <header style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>7-8-9 spine reader</h3>
                    <p style={subtitleStyle}>session-close aggregate completion</p>
                </div>
                <output
                    aria-label="Virtue witness completion"
                    data-test="m1-spine-789-completion"
                    style={completionBadgeStyle}
                >
                    {summary.witnessCompletionPercent}%
                </output>
            </header>

            <div style={rowsStyle}>
                <Spine789Row
                    register="7"
                    tone="actional contraction"
                    question={SPINE_789_CANONICAL_QUESTIONS.register7}
                    arithmetic="8n - n | 7/4 = (72 - 9)/36"
                    substrate="127 = 2^7 - 1 = M_7"
                    state={ringClosed ? 'lit' : 'dim'}
                    stateLabel={
                        ringClosed
                            ? 'M1 ring traversal closed'
                            : 'M1 ring traversal cut early'
                    }
                >
                    <RingClosureIndicator closed={ringClosed} />
                </Spine789Row>

                <Spine789Row
                    register="8"
                    tone="octave-field return"
                    question={SPINE_789_CANONICAL_QUESTIONS.register8}
                    arithmetic="octave return | binary closure"
                    substrate="128 = 2^7"
                    state={
                        summary.audioOctetCount === M1_SPINE_789_AUDIO_OCTET_COUNT
                            ? 'lit'
                            : 'dim'
                    }
                    stateLabel={`${summary.audioOctetCount}/${M1_SPINE_789_AUDIO_OCTET_COUNT} audio_octet positions traversed`}
                >
                    <AudioOctetIndicator traversal={audioTraversal} />
                </Spine789Row>

                <Spine789Row
                    register="9"
                    tone="wholeness witness"
                    question={SPINE_789_CANONICAL_QUESTIONS.register9}
                    arithmetic="9/8 epogdoon-extension"
                    substrate="137 = 128 + 9"
                    state={
                        summary.witnessedCount === M1_SPINE_789_VIRTUE_COUNT ? 'lit' : 'dim'
                    }
                    stateLabel={`${summary.witnessedCount}/${M1_SPINE_789_VIRTUE_COUNT} virtue-poles witnessed`}
                >
                    <VirtueWitnessPipStrip labels={labels} witnessBits={summary.witnessBits} />
                    <div style={scoreLineStyle}>
                        <span>Coherence {summary.coherencePercent}%</span>
                        <span>Witness {summary.witnessCompletionPercent}%</span>
                    </div>
                </Spine789Row>
            </div>
        </section>
    );
};

const Spine789Row: React.FC<{
    readonly register: '7' | '8' | '9';
    readonly tone: string;
    readonly question: string;
    readonly arithmetic: string;
    readonly substrate: string;
    readonly state: 'lit' | 'dim';
    readonly stateLabel: string;
    readonly children: React.ReactNode;
}> = props => (
    <article
        className={`m1-spine-789-row m1-spine-789-row-${props.register}`}
        data-register={props.register}
        data-state={props.state}
        style={{
            ...rowStyle,
            ...(props.state === 'lit' ? litRowStyle : dimRowStyle)
        }}
    >
        <div style={registerStyle} aria-hidden="true">
            {props.register}
        </div>
        <div style={rowBodyStyle}>
            <div style={rowHeaderStyle}>
                <span style={toneStyle}>{props.tone}</span>
                <span
                    data-test={`m1-spine-789-row-${props.register}-state`}
                    style={{
                        ...statePillStyle,
                        ...(props.state === 'lit' ? litPillStyle : dimPillStyle)
                    }}
                >
                    {props.stateLabel}
                </span>
            </div>
            <p data-test={`m1-spine-789-question-${props.register}`} style={questionStyle}>
                {props.question}
            </p>
            <div style={arithmeticGridStyle}>
                <span>{props.arithmetic}</span>
                <strong>{props.substrate}</strong>
            </div>
            <div style={indicatorSlotStyle}>{props.children}</div>
        </div>
    </article>
);

const RingClosureIndicator: React.FC<{ readonly closed: boolean }> = ({ closed }) => (
    <div
        aria-label={closed ? 'M1 ring traversal closed' : 'M1 ring traversal cut early'}
        style={ringStyle}
    >
        {Array.from({ length: M1_SPINE_789_RING_POSITION_COUNT }, (_, position) => (
            <span
                key={position}
                title={`ring position ${position}`}
                data-position={position}
                data-state={closed ? 'lit' : 'dim'}
                style={{
                    ...microPipStyle,
                    ...(closed ? litMicroPipStyle : dimMicroPipStyle)
                }}
            />
        ))}
    </div>
);

const AudioOctetIndicator: React.FC<{ readonly traversal: readonly boolean[] }> = ({
    traversal
}) => (
    <div aria-label="Eight audio_octet traversal positions" style={pipStripStyle}>
        {traversal.map((active, position) => (
            <span
                key={position}
                title={`audio_octet ${position}`}
                data-audio-octet-position={position}
                data-state={active ? 'lit' : 'dark'}
                style={{
                    ...pipStyle,
                    ...(active ? litPipStyle : darkPipStyle)
                }}
            />
        ))}
    </div>
);

const VirtueWitnessPipStrip: React.FC<{
    readonly labels: readonly Spine789VirtueLabel[];
    readonly witnessBits: readonly boolean[];
}> = ({ labels, witnessBits }) => (
    <div
        aria-label="Nine virtue witness vector"
        data-test="m1-spine-789-virtue-pips"
        style={pipStripStyle}
    >
        {labels.map(entry => {
            const witnessed = witnessBits[entry.position] === true;
            return (
                <span
                    key={entry.position}
                    title={entry.label}
                    aria-label={`${entry.label}: ${witnessed ? 'witnessed' : 'unwitnessed'}`}
                    data-virtue-position={entry.position}
                    data-virtue-label={entry.label}
                    data-witness-state={witnessed ? 'lit' : 'dark'}
                    style={{
                        ...pipStyle,
                        ...(witnessed ? litPipStyle : darkPipStyle)
                    }}
                />
            );
        })}
    </div>
);

function normalizeVirtueLabels(
    labels: readonly Spine789VirtueLabel[] | undefined
): readonly Spine789VirtueLabel[] {
    const byPosition = new Map<number, Spine789VirtueLabel>();
    for (const label of SPINE_789_VIRTUE_LABELS) {
        byPosition.set(label.position, label);
    }
    for (const label of labels ?? []) {
        if (Number.isInteger(label.position) && label.position >= 0) {
            byPosition.set(label.position, label);
        }
    }
    return Object.freeze(
        Array.from({ length: M1_SPINE_789_VIRTUE_COUNT }, (_, position) =>
            Object.freeze(
                byPosition.get(position) ?? {
                    position,
                    label: `Virtue ${position}`
                }
            )
        )
    );
}

function normalizeAudioOctetTraversal(traversal: readonly boolean[] | undefined): readonly boolean[] {
    return Object.freeze(
        Array.from(
            { length: M1_SPINE_789_AUDIO_OCTET_COUNT },
            (_, position) => traversal?.[position] === true
        )
    );
}

function clampUnit(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.min(1, value));
}

const readerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 14,
    color: 'var(--theia-foreground)',
    background: 'var(--theia-editor-background)',
    border: '1px solid var(--theia-editorWidget-border)',
    borderRadius: 6
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 16,
    fontWeight: 650,
    letterSpacing: 0
};

const subtitleStyle: React.CSSProperties = {
    margin: '3px 0 0',
    color: 'var(--theia-descriptionForeground)',
    fontSize: 12
};

const completionBadgeStyle: React.CSSProperties = {
    minWidth: 58,
    padding: '6px 8px',
    borderRadius: 6,
    textAlign: 'center',
    color: 'var(--theia-button-foreground)',
    background: 'var(--theia-button-background)',
    fontWeight: 700,
    fontSize: 14
};

const rowsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
};

const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '38px minmax(0, 1fr)',
    gap: 12,
    padding: 12,
    border: '1px solid var(--theia-editorWidget-border)',
    borderRadius: 6
};

const litRowStyle: React.CSSProperties = {
    background: 'rgba(60, 118, 92, 0.16)'
};

const dimRowStyle: React.CSSProperties = {
    background: 'rgba(127, 127, 127, 0.08)'
};

const registerStyle: React.CSSProperties = {
    display: 'grid',
    placeItems: 'center',
    width: 38,
    height: 38,
    borderRadius: 6,
    color: 'var(--theia-button-foreground)',
    background: 'var(--theia-button-background)',
    fontSize: 20,
    fontWeight: 800
};

const rowBodyStyle: React.CSSProperties = {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
};

const rowHeaderStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
};

const toneStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--theia-descriptionForeground)'
};

const questionStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.4
};

const statePillStyle: React.CSSProperties = {
    maxWidth: '100%',
    padding: '3px 7px',
    borderRadius: 6,
    fontSize: 11,
    whiteSpace: 'normal'
};

const litPillStyle: React.CSSProperties = {
    color: 'var(--theia-charts-green)',
    border: '1px solid var(--theia-charts-green)'
};

const dimPillStyle: React.CSSProperties = {
    color: 'var(--theia-descriptionForeground)',
    border: '1px solid var(--theia-editorWidget-border)'
};

const arithmeticGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 8,
    alignItems: 'center',
    fontSize: 12
};

const indicatorSlotStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
};

const ringStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: 4
};

const pipStripStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(18px, 1fr))',
    gap: 5,
    alignItems: 'center'
};

const pipStyle: React.CSSProperties = {
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    border: '1px solid var(--theia-editorWidget-border)'
};

const microPipStyle: React.CSSProperties = {
    minWidth: 8,
    height: 8,
    borderRadius: 999
};

const litPipStyle: React.CSSProperties = {
    background: 'var(--theia-charts-green)',
    borderColor: 'var(--theia-charts-green)'
};

const darkPipStyle: React.CSSProperties = {
    background: 'transparent'
};

const litMicroPipStyle: React.CSSProperties = {
    background: 'var(--theia-charts-green)'
};

const dimMicroPipStyle: React.CSSProperties = {
    background: 'var(--theia-editorWidget-border)'
};

const scoreLineStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    color: 'var(--theia-descriptionForeground)',
    fontSize: 12
};
