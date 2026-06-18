import * as React from 'react';
import type {
    Disposable,
    MObservabilityEvent,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import {
    createWisdomDeltaViewModel,
    WisdomDeltaInspector,
    type WisdomDeltaTrace,
    type WisdomDeltaViewModel
} from '../../../m5-epii/lib/browser/services/wisdom-delta-service';

export const CONTEMPLATION_COMPLETE_EVENT = 'm5.session.contemplation.complete';
export const COMPOSITION_CONTEMPLATION_COMPLETE_EVENT = 'composition.contemplation.complete';
export const KHORA_HIGHLIGHTED_INSCRIPTION_RPC = 'khora_write_highlighted_inscription';
export const ANUTTARA_SYMBOLIC_PARSE_RPC = 'anuttara-symbolic-parse';
export const RECOGNITION_HIGHLIGHT_COLOR = '#d4a574';

export interface TarotPsycheAnchor {
    readonly card: string;
    readonly codon: string;
    readonly correspondence: string;
}

export interface ContemplationFlowState {
    readonly eventType: typeof CONTEMPLATION_COMPLETE_EVENT;
    readonly sessionKey: string;
    readonly emittedAt: number;
    readonly contemplationObjectRef: string;
    readonly left: {
        readonly inscription: {
            readonly category: 'recognition';
            readonly highlightColor: typeof RECOGNITION_HIGHLIGHT_COLOR;
            readonly text: string;
            readonly authorChip: 'Pi → Nara';
        };
        readonly tarotAnchors: readonly TarotPsycheAnchor[];
    };
    readonly right: {
        readonly wisdomDeltaHex: readonly string[];
        readonly wisdomDeltaModel: WisdomDeltaViewModel;
        readonly gaugeTrioCoverage: readonly {
            readonly key: 'comp' | 'move' | 'res';
            readonly label: 'COMP σ_x' | 'MOVE σ_y' | 'RES σ_z';
            readonly fraction: number;
        }[];
        readonly predicted72: readonly number[];
        readonly target72: readonly number[];
        readonly energyReadout: string;
        readonly tritoneCoherences: readonly {
            readonly pair: '(0,5)' | '(1,4)' | '(2,3)';
            readonly score: number;
        }[];
        readonly mobiusDescentStep: string;
    };
    readonly under: {
        readonly virtueWitnessLamps: readonly {
            readonly index: number;
            readonly lit: boolean;
            readonly label: string;
        }[];
        readonly unsatisfiedConstraints: readonly string[];
        readonly coherenceScore: number;
        readonly chargeInvariant: {
            readonly pp: number;
            readonly mm: number;
            readonly mp: number;
            readonly pm: number;
            readonly outer: number;
            readonly balanced: boolean;
        };
        readonly parseSymbolicCoordinate: (expression: string) => Promise<string>;
    };
}

export interface ContemplationFlowDirectorProps {
    readonly bridge?: Pick<SharedBridgeAdapter, 'onObservabilityEvent' | 'invokeGatewayRpc' | 'publish'> | null;
    readonly event?: MObservabilityEvent | null;
    readonly state?: ContemplationFlowState | null;
}

export const ContemplationFlowDirector: React.FC<ContemplationFlowDirectorProps> = ({
    bridge,
    event,
    state: suppliedState
}) => {
    const [liveState, setLiveState] = React.useState<ContemplationFlowState | null>(() =>
        suppliedState ?? (event && isContemplationCompleteEvent(event) ? buildContemplationFlowState(event, bridge) : null)
    );

    React.useEffect(() => {
        if (suppliedState) {
            setLiveState(suppliedState);
        }
    }, [suppliedState]);

    React.useEffect(() => {
        if (!event || !isContemplationCompleteEvent(event)) {
            return;
        }
        setLiveState(buildContemplationFlowState(event, bridge));
    }, [event, bridge]);

    React.useEffect(() => {
        if (!bridge || suppliedState) {
            return undefined;
        }
        const subscription = subscribeContemplationFlowDirector(bridge, setLiveState);
        return () => subscription.dispose();
    }, [bridge, suppliedState]);

    if (!liveState) {
        return null;
    }

    return (
        <section
            className="contemplation-flow-director"
            data-test="contemplation-flow-director"
            data-session-key={liveState.sessionKey}
            data-event-type={liveState.eventType}
        >
            <LeftSlotReading state={liveState} />
            <RightSlotWisdom state={liveState} />
            <UnderLayerVerifier state={liveState} />
        </section>
    );
};

export function subscribeContemplationFlowDirector(
    bridge: Pick<SharedBridgeAdapter, 'onObservabilityEvent' | 'invokeGatewayRpc' | 'publish'>,
    listener: (state: ContemplationFlowState) => void
): Disposable {
    return bridge.onObservabilityEvent(event => {
        if (!isContemplationCompleteEvent(event)) {
            return;
        }
        return handleContemplationCompleteEvent(bridge, event, listener);
    });
}

export async function handleContemplationCompleteEvent(
    bridge: Pick<SharedBridgeAdapter, 'invokeGatewayRpc' | 'publish'>,
    event: MObservabilityEvent,
    listener: (state: ContemplationFlowState) => void
): Promise<ContemplationFlowState> {
    const state = buildContemplationFlowState(event, bridge);
    await bridge.invokeGatewayRpc(KHORA_HIGHLIGHTED_INSCRIPTION_RPC, {
        category: state.left.inscription.category,
        highlightColor: state.left.inscription.highlightColor,
        text: state.left.inscription.text,
        authorChip: state.left.inscription.authorChip,
        sessionKey: state.sessionKey,
        contemplationObjectRef: state.contemplationObjectRef,
        position: 'session-end'
    });
    listener(state);
    bridge.publish({
        type: COMPOSITION_CONTEMPLATION_COMPLETE_EVENT,
        extensionId: 'plugin-integrated-4-5-0',
        emittedAt: Date.now(),
        payload: Object.freeze({
            sessionKey: state.sessionKey,
            contemplationObjectRef: state.contemplationObjectRef,
            slots: Object.freeze(['left', 'right', 'under'])
        })
    });
    return state;
}

export function buildContemplationFlowState(
    event: MObservabilityEvent,
    bridge?: Pick<SharedBridgeAdapter, 'invokeGatewayRpc'> | null
): ContemplationFlowState {
    const payload = recordOf(event.payload);
    const wisdomDeltaModel = createWisdomDeltaViewModel(normalizeWisdomTrace(payload));
    const verifier = readVerifierReport(payload);
    const wisdomDeltaBytes = readByteArray(
        payload.wisdomDeltaBytes ?? payload.wisdom_delta_bytes ?? payload.wisdomDelta ?? payload.wisdom_delta,
        16,
        wisdomDeltaModel.trace.wisdomDeltaBytes
    );
    const virtueBits = readVirtueBits(verifier.virtueWitnessVector ?? verifier.virtue_witness_vector);
    const coherenceScore = finiteNumber(verifier.coherenceScore ?? verifier.coherence_score, 0);

    return Object.freeze({
        eventType: CONTEMPLATION_COMPLETE_EVENT,
        sessionKey: readString(payload.sessionKey ?? payload.session_key ?? payload.sessionId ?? payload.session_id, 'session:pending'),
        emittedAt: finiteNumber(event.emittedAt, Date.now()),
        contemplationObjectRef: readString(
            payload.contemplationObjectRef ?? payload.contemplation_object_ref,
            wisdomDeltaModel.contemplationObjectRef
        ),
        left: Object.freeze({
            inscription: Object.freeze({
                category: 'recognition' as const,
                highlightColor: RECOGNITION_HIGHLIGHT_COLOR,
                text: readLlmReading(payload, wisdomDeltaModel),
                authorChip: 'Pi → Nara' as const
            }),
            tarotAnchors: readTarotAnchors(payload)
        }),
        right: Object.freeze({
            wisdomDeltaHex: Object.freeze(wisdomDeltaBytes.map(byteToHex)),
            wisdomDeltaModel,
            gaugeTrioCoverage: readGaugeCoverage(payload),
            predicted72: readNumberArray(
                recordOf(wisdomDeltaModel.trace.ebmEvaluation).predicted72 ??
                recordOf(payload.ebmEvaluation ?? payload.ebm_evaluation).predicted72 ??
                recordOf(payload.ebmEvaluation ?? payload.ebm_evaluation).predicted_72
            ),
            target72: readNumberArray(
                recordOf(wisdomDeltaModel.trace.ebmEvaluation).target72 ??
                recordOf(payload.ebmEvaluation ?? payload.ebm_evaluation).target72 ??
                recordOf(payload.ebmEvaluation ?? payload.ebm_evaluation).target_72
            ),
            energyReadout: `E = ${wisdomDeltaModel.trace.ebmEvaluation.energyScore.toFixed(4)}`,
            tritoneCoherences: Object.freeze(
                wisdomDeltaModel.trace.ebmEvaluation.tritoneSquareCoherences.map((score, index) => Object.freeze({
                    pair: (['(0,5)', '(1,4)', '(2,3)'] as const)[index],
                    score
                }))
            ),
            mobiusDescentStep: 'q_p^(n+1) = q_p^(n) - log(9/8) · ∇E'
        }),
        under: Object.freeze({
            virtueWitnessLamps: Object.freeze(
                VIRTUE_LABELS.map((label, index) => Object.freeze({ index, label, lit: virtueBits[index] === true }))
            ),
            unsatisfiedConstraints: readStringArray(verifier.unsatisfiedConstraints ?? verifier.unsatisfied_constraints),
            coherenceScore,
            chargeInvariant: readChargeInvariant(verifier.chargeInvariant ?? verifier.charge_invariant, virtueBits[0] === true),
            parseSymbolicCoordinate: async (expression: string) => {
                if (!bridge) {
                    return '';
                }
                const result = await bridge.invokeGatewayRpc(ANUTTARA_SYMBOLIC_PARSE_RPC, { expression });
                return readRpcText(result);
            }
        })
    });
}

export function isContemplationCompleteEvent(event: MObservabilityEvent): boolean {
    const kind = readString(recordOf(event.payload).kind, '');
    return event.type === CONTEMPLATION_COMPLETE_EVENT || kind === CONTEMPLATION_COMPLETE_EVENT;
}

const LeftSlotReading: React.FC<{ readonly state: ContemplationFlowState }> = ({ state }) => (
    <section
        className="contemplation-flow-left-slot"
        data-test="contemplation-left-slot"
        data-geometric-slot="left"
        data-author-chip={state.left.inscription.authorChip}
    >
        <div
            className="contemplation-flow-inscription"
            data-test="contemplation-recognition-inscription"
            data-highlight-category={state.left.inscription.category}
            data-highlight-color={state.left.inscription.highlightColor}
        >
            {state.left.inscription.text}
        </div>
        <div className="contemplation-tarot-anchor-ribbon" data-test="contemplation-tarot-anchor-ribbon">
            {state.left.tarotAnchors.map(anchor => (
                <span key={`${anchor.card}-${anchor.codon}`} data-card={anchor.card} data-codon={anchor.codon}>
                    {anchor.card}: {anchor.codon}
                </span>
            ))}
        </div>
    </section>
);

const RightSlotWisdom: React.FC<{ readonly state: ContemplationFlowState }> = ({ state }) => (
    <section className="contemplation-flow-right-slot" data-test="contemplation-right-slot" data-geometric-slot="right">
        <div className="contemplation-gauge-trio" data-test="contemplation-gauge-trio">
            {state.right.gaugeTrioCoverage.map(bar => (
                <span
                    key={bar.key}
                    data-test="contemplation-gauge-bar"
                    data-gauge={bar.key}
                    data-coverage={bar.fraction}
                    style={{ '--coverage': String(bar.fraction) } as React.CSSProperties}
                >
                    {bar.label}
                </span>
            ))}
        </div>
        <ol className="contemplation-wisdom-tape" data-test="contemplation-wisdom-tape">
            {state.right.wisdomDeltaHex.map((hex, index) => (
                <li key={`${index}-${hex}`} data-test="contemplation-wisdom-byte" data-byte-index={index}>
                    {hex}
                </li>
            ))}
        </ol>
        <div className="contemplation-resonance-grid" data-test="contemplation-resonance-grid">
            {Array.from({ length: 72 }, (_, index) => (
                <span
                    key={index}
                    data-cell={index}
                    data-predicted={state.right.predicted72[index] ?? 0}
                    data-target={state.right.target72[index] ?? 0}
                />
            ))}
        </div>
        <strong data-test="contemplation-energy-readout">{state.right.energyReadout}</strong>
        <div className="contemplation-tritone-coherences" data-test="contemplation-tritone-coherences">
            {state.right.tritoneCoherences.map(item => (
                <span key={item.pair} data-pair={item.pair} data-score={item.score}>
                    {item.pair}:{item.score.toFixed(3)}
                </span>
            ))}
        </div>
        <div className="contemplation-mobius-descent" data-test="contemplation-mobius-descent">
            {state.right.mobiusDescentStep}
        </div>
        <WisdomDeltaInspector model={state.right.wisdomDeltaModel} />
    </section>
);

const UnderLayerVerifier: React.FC<{ readonly state: ContemplationFlowState }> = ({ state }) => (
    <section
        className="contemplation-flow-under-layer"
        data-test="contemplation-under-layer"
        data-geometric-slot="under"
        data-coherence-score={state.under.coherenceScore}
    >
        <div
            className="contemplation-charge-invariant"
            data-test="contemplation-charge-invariant"
            data-balanced={state.under.chargeInvariant.balanced ? 'true' : 'false'}
        >
            <span data-charge="pp">{state.under.chargeInvariant.pp}</span>
            <span data-charge="mm">{state.under.chargeInvariant.mm}</span>
            <span data-charge="mp">{state.under.chargeInvariant.mp}</span>
            <span data-charge="pm">{state.under.chargeInvariant.pm}</span>
            <span data-charge="outer">{state.under.chargeInvariant.outer}</span>
        </div>
        <ol className="contemplation-virtue-lamps" data-test="contemplation-virtue-lamps">
            {state.under.virtueWitnessLamps.map(lamp => (
                <li
                    key={lamp.index}
                    data-test="contemplation-virtue-lamp"
                    data-virtue-index={lamp.index}
                    data-witness-state={lamp.lit ? 'lit' : 'dim'}
                    data-animation={lamp.lit ? 'dim-to-lit' : 'dim'}
                >
                    {lamp.label}
                </li>
            ))}
        </ol>
        <div className="contemplation-unsatisfied-constraints" data-test="contemplation-unsatisfied-constraints">
            {state.under.unsatisfiedConstraints.map(expression => (
                <button
                    key={expression}
                    type="button"
                    data-test="contemplation-symbolic-coordinate-chip"
                    data-expression={expression}
                >
                    {expression}
                </button>
            ))}
        </div>
    </section>
);

const VIRTUE_LABELS: readonly string[] = Object.freeze([
    'Love/Peace',
    'Truth',
    'Openness/Creativity',
    'Joy/Play',
    'Goodness',
    'Beauty',
    'Life/Nature',
    'Wisdom',
    'Reality'
]);

function normalizeWisdomTrace(payload: Readonly<Record<string, unknown>>): WisdomDeltaTrace {
    const tracePayload = recordOf(
        payload.wisdomDeltaTrace ??
        payload.wisdom_delta_trace ??
        payload.trace ??
        recordOf(payload.payload).wisdomDeltaTrace ??
        recordOf(payload.payload).trace
    );
    return createWisdomDeltaViewModel({
        privacyClass: readString(tracePayload.privacyClass ?? payload.privacyClass, 'pasu-scoped'),
        sessionId: readString(tracePayload.sessionId ?? tracePayload.session_id ?? payload.sessionId ?? payload.session_id, 'session:pending'),
        contemplationObjectRef: readString(
            tracePayload.contemplationObjectRef ?? tracePayload.contemplation_object_ref ?? payload.contemplationObjectRef,
            'contemplation:pending'
        ),
        llmComposition: Object.freeze({
            actor: 'pi-llm-position-4' as const,
            reasoningText: readString(
                recordOf(tracePayload.llmComposition ?? tracePayload.llm_composition).reasoningText,
                'LLM-Nara reading unavailable.'
            ),
            synthesizedRecognition: readString(
                recordOf(tracePayload.llmComposition ?? tracePayload.llm_composition).synthesizedRecognition,
                readLlmReading(payload, null)
            )
        }),
        ebmEvaluation: Object.freeze({
            actor: 'epii-ebm-position-5' as const,
            energyScore: finiteNumber(recordOf(tracePayload.ebmEvaluation ?? tracePayload.ebm_evaluation).energyScore, 0),
            gradient: new Float32Array(readNumberArray(recordOf(tracePayload.ebmEvaluation ?? tracePayload.ebm_evaluation).gradient)),
            lensWeightings: readNumberRecord(recordOf(tracePayload.ebmEvaluation ?? tracePayload.ebm_evaluation).lensWeightings),
            tritoneSquareCoherences: normalizeThreeScores(
                recordOf(tracePayload.ebmEvaluation ?? tracePayload.ebm_evaluation).tritoneSquareCoherences ??
                recordOf(tracePayload.ebmEvaluation ?? tracePayload.ebm_evaluation).tritone_square_coherences
            )
        }),
        verifierReport: Object.freeze({
            actor: 'anuttara-verifier-position-0' as const,
            axiomChecks: Object.freeze(readAxiomChecks(recordOf(tracePayload.verifierReport ?? tracePayload.verifier_report))),
            symbolicCoordinateQuestions: Object.freeze(
                readStringArray(
                    recordOf(tracePayload.verifierReport ?? tracePayload.verifier_report).symbolicCoordinateQuestions ??
                    recordOf(tracePayload.verifierReport ?? tracePayload.verifier_report).symbolic_coordinate_questions
                )
            )
        }),
        wisdomDeltaBytes: new Uint8Array(readByteArray(
            tracePayload.wisdomDeltaBytes ?? tracePayload.wisdom_delta_bytes ?? tracePayload.wisdom_delta ?? payload.wisdom_delta,
            8
        ).slice(0, 8)),
        preXorQuintessenceHash: new Uint8Array(readByteArray(
            tracePayload.preXorQuintessenceHash ?? tracePayload.pre_xor_quintessence_hash,
            9
        ).slice(0, 9)),
        postXorQuintessenceHash: new Uint8Array(readByteArray(
            tracePayload.postXorQuintessenceHash ?? tracePayload.post_xor_quintessence_hash,
            9
        ).slice(0, 9)),
        spineReading789: Object.freeze({
            action7: normalizeSpineRegister(recordOf(tracePayload.spineReading789 ?? tracePayload.spine_reading_789).action7),
            octave8: normalizeSpineRegister(recordOf(tracePayload.spineReading789 ?? tracePayload.spine_reading_789).octave8),
            wholeness9: normalizeSpineRegister(recordOf(tracePayload.spineReading789 ?? tracePayload.spine_reading_789).wholeness9),
            virtueLut9Witness: new Uint8Array(readByteArray(
                recordOf(tracePayload.spineReading789 ?? tracePayload.spine_reading_789).virtueLut9Witness ??
                recordOf(tracePayload.spineReading789 ?? tracePayload.spine_reading_789).virtue_lut_9_witness,
                9
            ).slice(0, 9))
        })
    }).trace;
}

function readVerifierReport(payload: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
    const trace = recordOf(payload.wisdomDeltaTrace ?? payload.wisdom_delta_trace ?? payload.trace);
    return Object.freeze({
        ...recordOf(trace.verifierReport ?? trace.verifier_report),
        ...recordOf(payload.verifierReport ?? payload.verifier_report)
    });
}

function readLlmReading(
    payload: Readonly<Record<string, unknown>>,
    model: WisdomDeltaViewModel | null
): string {
    const llm = recordOf(payload.llmNaraReading ?? payload.llm_nara_reading ?? payload.llmComposition ?? payload.llm_composition);
    return readString(
        llm.text ?? llm.reading ?? llm.synthesizedRecognition,
        model?.trace.llmComposition.synthesizedRecognition ?? 'LLM-Nara recognition reading unavailable.'
    );
}

function readTarotAnchors(payload: Readonly<Record<string, unknown>>): readonly TarotPsycheAnchor[] {
    const llm = recordOf(payload.llmNaraReading ?? payload.llm_nara_reading);
    const anchorValue = llm.tarotPsycheAnchors ?? llm.tarot_psyche_anchors;
    const anchors: readonly unknown[] = Array.isArray(anchorValue) ? anchorValue : [];
    return Object.freeze(
        anchors.map(item => {
            const record = recordOf(item);
            return Object.freeze({
                card: readString(record.card, 'unknown-card'),
                codon: readString(record.codon, 'unknown-codon'),
                correspondence: readString(record.correspondence, 'unmapped')
            });
        })
    );
}

function readGaugeCoverage(payload: Readonly<Record<string, unknown>>): ContemplationFlowState['right']['gaugeTrioCoverage'] {
    const raw = recordOf(payload.gaugeTrioCoverage ?? payload.gauge_trio_coverage);
    return Object.freeze([
        Object.freeze({ key: 'comp' as const, label: 'COMP σ_x' as const, fraction: clampFraction(raw.comp) }),
        Object.freeze({ key: 'move' as const, label: 'MOVE σ_y' as const, fraction: clampFraction(raw.move) }),
        Object.freeze({ key: 'res' as const, label: 'RES σ_z' as const, fraction: clampFraction(raw.res) })
    ]);
}

function readChargeInvariant(value: unknown, paramesvaraWitnessed: boolean): ContemplationFlowState['under']['chargeInvariant'] {
    const record = recordOf(value);
    const pp = finiteNumber(record.pp, 0);
    const mm = finiteNumber(record.mm, 0);
    const mp = finiteNumber(record.mp, 0);
    const pm = finiteNumber(record.pm, 0);
    const outer = finiteNumber(record.outer, 0);
    return Object.freeze({
        pp,
        mm,
        mp,
        pm,
        outer,
        balanced: paramesvaraWitnessed && pp + mm + mp + pm === 4 * outer
    });
}

function normalizeThreeScores(value: unknown): [number, number, number] {
    const array = Array.isArray(value) ? value : [];
    return [finiteNumber(array[0], 0), finiteNumber(array[1], 0), finiteNumber(array[2], 0)];
}

function normalizeSpineRegister(value: unknown): { readonly register: string; readonly virtueBits: number } {
    const record = recordOf(value);
    return Object.freeze({
        register: readString(record.register, 'pending'),
        virtueBits: finiteNumber(record.virtueBits ?? record.virtue_bits, 0)
    });
}

function readAxiomChecks(verifier: Readonly<Record<string, unknown>>): readonly {
    readonly id: string;
    readonly label: string;
    readonly status: 'pass' | 'fail' | 'pending' | 'answered' | 'warning';
}[] {
    const checkValue = verifier.axiomChecks ?? verifier.axiom_checks;
    const checks: readonly unknown[] = Array.isArray(checkValue) ? checkValue : [];
    return Object.freeze(checks.map(check => {
        const record = recordOf(check);
        return Object.freeze({
            id: readString(record.id, 'axiom'),
            label: readString(record.label, readString(record.id, 'axiom')),
            status: readStatus(record.status)
        });
    }));
}

function readStatus(value: unknown): 'pass' | 'fail' | 'pending' | 'answered' | 'warning' {
    return value === 'pass' || value === 'fail' || value === 'answered' || value === 'warning'
        ? value
        : 'pending';
}

function readVirtueBits(value: unknown): readonly boolean[] {
    if (Array.isArray(value)) {
        return Object.freeze(Array.from({ length: 9 }, (_, index) => Boolean(value[index])));
    }
    const numeric = typeof value === 'bigint'
        ? value
        : typeof value === 'number' && Number.isFinite(value)
            ? BigInt(Math.max(0, Math.trunc(value)))
            : typeof value === 'string'
                ? parseBigInt(value)
                : 0n;
    return Object.freeze(Array.from({ length: 9 }, (_, index) => ((numeric >> BigInt(index)) & 1n) === 1n));
}

function readByteArray(value: unknown, minLength: number, fallback?: Uint8Array): readonly number[] {
    if (value instanceof Uint8Array) {
        return Array.from(value.length >= minLength ? value : fallback ?? value, Number);
    }
    if (ArrayBuffer.isView(value)) {
        return Array.from(value as unknown as ArrayLike<number>, Number);
    }
    if (Array.isArray(value)) {
        return Object.freeze(value.map(byte => clampByte(Number(byte))));
    }
    if (typeof value === 'string') {
        return Object.freeze(bytesFromHex(value));
    }
    if (fallback) {
        return Object.freeze(Array.from(fallback, Number));
    }
    return Object.freeze(Array.from({ length: minLength }, () => 0));
}

function bytesFromHex(value: string): number[] {
    const compact = value.replace(/^0x/i, '').replace(/[^0-9a-f]/gi, '');
    const length = Math.floor(compact.length / 2);
    return Array.from({ length }, (_, index) => parseInt(compact.slice(index * 2, index * 2 + 2), 16));
}

function readStringArray(value: unknown): readonly string[] {
    if (!Array.isArray(value)) {
        return Object.freeze([]);
    }
    return Object.freeze(value.filter((item): item is string => typeof item === 'string' && item.trim() !== ''));
}

function readNumberArray(value: unknown): readonly number[] {
    if (!Array.isArray(value) && !ArrayBuffer.isView(value)) {
        return Object.freeze([]);
    }
    return Object.freeze(Array.from(value as ArrayLike<number>, Number).map(item => Number.isFinite(item) ? item : 0));
}

function readNumberRecord(value: unknown): Record<string, number> {
    const record = recordOf(value);
    const entries = Object.entries(record)
        .map(([key, item]) => [key, finiteNumber(item, 0)] as const);
    return Object.freeze(Object.fromEntries(entries));
}

function readRpcText(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    const record = recordOf(value);
    return readString(record.text ?? record.response ?? record.markdown, '');
}

function recordOf(value: unknown): Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : Object.freeze({});
}

function readString(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function finiteNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampFraction(value: unknown): number {
    const number = finiteNumber(value, 0);
    return Math.max(0, Math.min(1, number));
}

function clampByte(value: number): number {
    return Number.isFinite(value) ? Math.max(0, Math.min(255, Math.trunc(value))) : 0;
}

function byteToHex(value: number): string {
    return clampByte(value).toString(16).padStart(2, '0');
}

function parseBigInt(value: string): bigint {
    try {
        return BigInt(value.trim().startsWith('0x') ? value.trim() : Number(value));
    } catch {
        return 0n;
    }
}
