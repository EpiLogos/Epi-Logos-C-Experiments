// 26.T26.13 - WisdomDelta trace service for the M5' Epii surface.
//
// The service accepts the joint 4'-5'-0' composition that produced
// wisdom_delta, validates the PASU privacy envelope, verifies the 8-byte XOR
// fold into quintessence_hash[0..8], and derives a frozen render model.

import { injectable } from '@theia/core/shared/inversify';
import {
    CONTEMPLATION_OBJECT_PRIVACY_CLASS,
    enforcePasuPrivacy
} from './contemplation-object-service';

export const CONTEMPLATE_FETCH_WISDOM_DELTA_METHOD = 'contemplate.fetch_wisdom_delta';
export const WISDOM_DELTA_PRIVACY_CLASS = CONTEMPLATION_OBJECT_PRIVACY_CLASS;
export const WISDOM_DELTA_BYTE_COUNT = 8;
export const QUINTESSENCE_HASH_BYTE_COUNT = 9;
export const VIRTUE_LUT_9_COUNT = 9;
export const PI_AXIOM_TRANSLATION_INSPECTOR_ROUTE =
    'epi-logos://ide/m0-anuttara/pi-axiom-translation';

export type AxiomCheckStatus = 'pass' | 'fail' | 'pending' | 'answered' | 'warning';

export interface AxiomCheck {
    readonly id: string;
    readonly label: string;
    readonly status: AxiomCheckStatus;
    readonly detail?: string;
}

export interface WisdomDeltaTrace {
    readonly privacyClass?: string | null;
    readonly sessionId: string;
    readonly contemplationObjectRef: string;
    readonly llmComposition: {
        readonly actor: 'pi-llm-position-4';
        readonly reasoningText: string;
        readonly synthesizedRecognition: string;
    };
    readonly ebmEvaluation: {
        readonly actor: 'epii-ebm-position-5';
        readonly energyScore: number;
        readonly gradient: Float32Array;
        readonly lensWeightings: Record<string, number>;
        readonly tritoneSquareCoherences: [number, number, number];
    };
    readonly verifierReport: {
        readonly actor: 'anuttara-verifier-position-0';
        readonly axiomChecks: readonly AxiomCheck[];
        readonly symbolicCoordinateQuestions: readonly string[];
    };
    readonly wisdomDeltaBytes: Uint8Array;
    readonly preXorQuintessenceHash: Uint8Array;
    readonly postXorQuintessenceHash: Uint8Array;
    readonly spineReading789: {
        readonly action7: WisdomDeltaSpineRegister;
        readonly octave8: WisdomDeltaSpineRegister;
        readonly wholeness9: WisdomDeltaSpineRegister;
        readonly virtueLut9Witness: Uint8Array;
    };
}

export interface WisdomDeltaSpineRegister {
    readonly register: string;
    readonly virtueBits: number;
}

export interface WisdomDeltaFetchRequest {
    readonly sessionId: string;
    readonly contemplationObjectRef?: string | null;
    readonly profileGeneration?: number | null;
}

export interface WisdomDeltaFetchReceipt {
    readonly method?: string;
    readonly privacyClass?: string | null;
    readonly wisdomDeltaTrace?: WisdomDeltaTracePayload | null;
    readonly trace?: WisdomDeltaTracePayload | null;
    readonly payload?: {
        readonly wisdomDeltaTrace?: WisdomDeltaTracePayload | null;
        readonly trace?: WisdomDeltaTracePayload | null;
    } | null;
}

export interface WisdomDeltaRuntimeContext {
    readonly method?: string;
    readonly privacyClass?: string | null;
    readonly wisdomDeltaTrace?: WisdomDeltaTracePayload | null;
    readonly trace?: WisdomDeltaTracePayload | null;
    readonly payload?: {
        readonly wisdomDeltaTrace?: WisdomDeltaTracePayload | null;
        readonly trace?: WisdomDeltaTracePayload | null;
    } | null;
}

export interface WisdomDeltaTracePayload {
    readonly privacyClass?: string | null;
    readonly sessionId?: string;
    readonly session_id?: string;
    readonly contemplationObjectRef?: string;
    readonly contemplation_object_ref?: string;
    readonly llmComposition?: WisdomDeltaTrace['llmComposition'];
    readonly llm_composition?: WisdomDeltaTrace['llmComposition'];
    readonly ebmEvaluation?: {
        readonly actor?: string;
        readonly energyScore?: number;
        readonly energy_score?: number;
        readonly gradient?: unknown;
        readonly lensWeightings?: Record<string, number>;
        readonly lens_weightings?: Record<string, number>;
        readonly tritoneSquareCoherences?: readonly number[];
        readonly tritone_square_coherences?: readonly number[];
    };
    readonly ebm_evaluation?: WisdomDeltaTracePayload['ebmEvaluation'];
    readonly verifierReport?: WisdomDeltaTrace['verifierReport'];
    readonly verifier_report?: WisdomDeltaTrace['verifierReport'];
    readonly wisdomDeltaBytes?: unknown;
    readonly wisdom_delta_bytes?: unknown;
    readonly wisdom_delta?: unknown;
    readonly preXorQuintessenceHash?: unknown;
    readonly pre_xor_quintessence_hash?: unknown;
    readonly postXorQuintessenceHash?: unknown;
    readonly post_xor_quintessence_hash?: unknown;
    readonly spineReading789?: {
        readonly action7?: WisdomDeltaSpineRegister;
        readonly action_7?: WisdomDeltaSpineRegister;
        readonly octave8?: WisdomDeltaSpineRegister;
        readonly octave_8?: WisdomDeltaSpineRegister;
        readonly wholeness9?: WisdomDeltaSpineRegister;
        readonly wholeness_9?: WisdomDeltaSpineRegister;
        readonly virtueLut9Witness?: unknown;
        readonly virtue_lut_9_witness?: unknown;
    };
    readonly spine_reading_789?: WisdomDeltaTracePayload['spineReading789'];
}

export interface WisdomDeltaDispatcher {
    (
        method: typeof CONTEMPLATE_FETCH_WISDOM_DELTA_METHOD,
        request: WisdomDeltaFetchRequest
    ): Promise<WisdomDeltaFetchReceipt>;
}

export interface XorFoldBitFlip {
    readonly byteIndex: number;
    readonly bitIndex: number;
    readonly mask: number;
    readonly from: 0 | 1;
    readonly to: 0 | 1;
    readonly profileTick: number;
}

export interface XorFoldByteStep {
    readonly byteIndex: number;
    readonly hashIndex: number;
    readonly profileTick: number;
    readonly wisdomDeltaHex: string;
    readonly beforeHex: string;
    readonly afterHex: string;
    readonly bitFlips: readonly XorFoldBitFlip[];
}

export interface XorFoldResult {
    readonly postHash: Uint8Array;
    readonly steps: readonly XorFoldByteStep[];
}

export interface SymbolicCoordinateQuestionModel {
    readonly raw: string;
    readonly status: 'parsed' | 'pending' | 'answered';
    readonly inspectorHref: string;
    readonly skillRoute: 'anuttara-symbolic-parse';
}

export interface SpineReading789Model {
    readonly columns: readonly {
        readonly key: 'action7' | 'octave8' | 'wholeness9';
        readonly label: string;
        readonly register: string;
        readonly virtueBits: number;
    }[];
    readonly virtueWitnessBits: readonly boolean[];
    readonly virtueLabels: readonly string[];
}

export interface WisdomDeltaViewModel {
    readonly sessionId: string;
    readonly contemplationObjectRef: string;
    readonly identityNarrative: string;
    readonly trace: WisdomDeltaTrace;
    readonly preXorHex: readonly string[];
    readonly postXorHex: readonly string[];
    readonly wisdomDeltaHex: readonly string[];
    readonly xorFold: XorFoldResult;
    readonly symbolicCoordinateQuestions: readonly SymbolicCoordinateQuestionModel[];
    readonly spineReading789: SpineReading789Model;
}

export const VIRTUE_LUT_9_LABELS: readonly string[] = Object.freeze([
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

const IDENTITY_NARRATIVE =
    "WisdomDelta is the 8-byte XOR seed that closes the Möbius return. M4' LLM voice composes recognition; M5' EBM evaluates energy across 72 cells; M0' Verifier checks axioms and emits questions. The three positions of the mental-pole triplet in joint operation.";

@injectable()
export class WisdomDeltaService {
    private current: WisdomDeltaTrace | null = null;

    get trace(): WisdomDeltaTrace | null {
        return this.current;
    }

    currentModel(): WisdomDeltaViewModel | null {
        return this.current ? createWisdomDeltaViewModel(this.current) : null;
    }

    async acceptRuntimeContext(context: WisdomDeltaRuntimeContext): Promise<WisdomDeltaViewModel> {
        const payload =
            context.wisdomDeltaTrace ??
            context.trace ??
            context.payload?.wisdomDeltaTrace ??
            context.payload?.trace ??
            null;
        if (!payload) {
            throw new Error('WisdomDeltaService rejected runtime context: missing wisdomDeltaTrace');
        }
        return this.acceptTracePayload(payload, context.privacyClass ?? payload.privacyClass ?? null);
    }

    async fetchWisdomDelta(
        dispatch: WisdomDeltaDispatcher,
        request: WisdomDeltaFetchRequest
    ): Promise<WisdomDeltaViewModel> {
        const receipt = await dispatch(CONTEMPLATE_FETCH_WISDOM_DELTA_METHOD, request);
        const payload =
            receipt.wisdomDeltaTrace ??
            receipt.trace ??
            receipt.payload?.wisdomDeltaTrace ??
            receipt.payload?.trace ??
            null;
        if (!payload) {
            throw new Error('WisdomDeltaService rejected fetch receipt: missing wisdomDeltaTrace');
        }
        return this.acceptTracePayload(payload, receipt.privacyClass ?? payload.privacyClass ?? null);
    }

    acceptTracePayload(
        payload: WisdomDeltaTracePayload,
        privacyClass: string | null | undefined = payload.privacyClass
    ): WisdomDeltaViewModel {
        enforcePasuPrivacy(privacyClass ?? WISDOM_DELTA_PRIVACY_CLASS);
        const trace = normalizeWisdomDeltaTrace(payload, privacyClass ?? WISDOM_DELTA_PRIVACY_CLASS);
        this.current = trace;
        return createWisdomDeltaViewModel(trace);
    }
}

export function normalizeWisdomDeltaTrace(
    payload: WisdomDeltaTracePayload,
    privacyClass: string | null | undefined = payload.privacyClass
): WisdomDeltaTrace {
    enforcePasuPrivacy(privacyClass ?? WISDOM_DELTA_PRIVACY_CLASS);
    const sessionId = payload.sessionId ?? payload.session_id;
    const contemplationObjectRef = payload.contemplationObjectRef ?? payload.contemplation_object_ref;
    if (!sessionId) {
        throw new Error('WisdomDeltaTrace rejected: missing sessionId');
    }
    if (!contemplationObjectRef) {
        throw new Error('WisdomDeltaTrace rejected: missing contemplationObjectRef');
    }

    const llm = payload.llmComposition ?? payload.llm_composition;
    if (!llm || llm.actor !== 'pi-llm-position-4') {
        throw new Error('WisdomDeltaTrace rejected: missing pi-llm-position-4 composition');
    }

    const ebm = payload.ebmEvaluation ?? payload.ebm_evaluation;
    if (!ebm || ebm.actor !== 'epii-ebm-position-5') {
        throw new Error('WisdomDeltaTrace rejected: missing epii-ebm-position-5 evaluation');
    }

    const verifier = payload.verifierReport ?? payload.verifier_report;
    if (!verifier || verifier.actor !== 'anuttara-verifier-position-0') {
        throw new Error('WisdomDeltaTrace rejected: missing anuttara-verifier-position-0 report');
    }

    const wisdomDeltaBytes = normalizeByteArray(
        payload.wisdomDeltaBytes ?? payload.wisdom_delta_bytes ?? payload.wisdom_delta,
        'wisdomDeltaBytes',
        WISDOM_DELTA_BYTE_COUNT
    );
    const preXorQuintessenceHash = normalizeByteArray(
        payload.preXorQuintessenceHash ?? payload.pre_xor_quintessence_hash,
        'preXorQuintessenceHash',
        QUINTESSENCE_HASH_BYTE_COUNT
    );
    const postXorQuintessenceHash = normalizeByteArray(
        payload.postXorQuintessenceHash ?? payload.post_xor_quintessence_hash,
        'postXorQuintessenceHash',
        QUINTESSENCE_HASH_BYTE_COUNT
    );
    const computed = xorFoldWisdomDelta(preXorQuintessenceHash, wisdomDeltaBytes).postHash;
    if (!byteArraysEqual(computed, postXorQuintessenceHash)) {
        throw new Error('WisdomDeltaTrace rejected: postXorQuintessenceHash does not match deterministic XOR fold');
    }

    const spine = payload.spineReading789 ?? payload.spine_reading_789;
    if (!spine) {
        throw new Error('WisdomDeltaTrace rejected: missing spineReading789');
    }

    return Object.freeze({
        privacyClass: privacyClass ?? WISDOM_DELTA_PRIVACY_CLASS,
        sessionId,
        contemplationObjectRef,
        llmComposition: Object.freeze({
            actor: llm.actor,
            reasoningText: llm.reasoningText,
            synthesizedRecognition: llm.synthesizedRecognition
        }),
        ebmEvaluation: Object.freeze({
            actor: 'epii-ebm-position-5' as const,
            energyScore: finiteNumber(ebm.energyScore ?? ebm.energy_score, 0),
            gradient: normalizeFloatArray(ebm.gradient),
            lensWeightings: Object.freeze({ ...(ebm.lensWeightings ?? ebm.lens_weightings ?? {}) }),
            tritoneSquareCoherences: normalizeTritoneCoherences(
                ebm.tritoneSquareCoherences ?? ebm.tritone_square_coherences
            )
        }),
        verifierReport: Object.freeze({
            actor: verifier.actor,
            axiomChecks: Object.freeze(verifier.axiomChecks.map(normalizeAxiomCheck)),
            symbolicCoordinateQuestions: Object.freeze([...verifier.symbolicCoordinateQuestions])
        }),
        wisdomDeltaBytes,
        preXorQuintessenceHash,
        postXorQuintessenceHash,
        spineReading789: Object.freeze({
            action7: normalizeSpineRegister(spine.action7 ?? spine.action_7, 'action-7'),
            octave8: normalizeSpineRegister(spine.octave8 ?? spine.octave_8, 'octave-8'),
            wholeness9: normalizeSpineRegister(spine.wholeness9 ?? spine.wholeness_9, 'wholeness-9'),
            virtueLut9Witness: normalizeByteArray(
                spine.virtueLut9Witness ?? spine.virtue_lut_9_witness,
                'virtueLut9Witness',
                VIRTUE_LUT_9_COUNT
            )
        })
    });
}

export function createWisdomDeltaViewModel(trace: WisdomDeltaTrace): WisdomDeltaViewModel {
    enforcePasuPrivacy(trace.privacyClass ?? WISDOM_DELTA_PRIVACY_CLASS);
    return Object.freeze({
        sessionId: trace.sessionId,
        contemplationObjectRef: trace.contemplationObjectRef,
        identityNarrative: IDENTITY_NARRATIVE,
        trace,
        preXorHex: Object.freeze(Array.from(trace.preXorQuintessenceHash, byteToHex)),
        postXorHex: Object.freeze(Array.from(trace.postXorQuintessenceHash, byteToHex)),
        wisdomDeltaHex: Object.freeze(Array.from(trace.wisdomDeltaBytes, byteToHex)),
        xorFold: xorFoldWisdomDelta(trace.preXorQuintessenceHash, trace.wisdomDeltaBytes),
        symbolicCoordinateQuestions: Object.freeze(
            trace.verifierReport.symbolicCoordinateQuestions.map(buildSymbolicCoordinateQuestion)
        ),
        spineReading789: buildSpineReading789Model(trace)
    });
}

export function xorFoldWisdomDelta(
    preXorQuintessenceHash: Uint8Array,
    wisdomDeltaBytes: Uint8Array
): XorFoldResult {
    if (wisdomDeltaBytes.length !== WISDOM_DELTA_BYTE_COUNT) {
        throw new Error(`WisdomDelta XOR fold requires ${WISDOM_DELTA_BYTE_COUNT} wisdom_delta bytes`);
    }
    if (preXorQuintessenceHash.length < QUINTESSENCE_HASH_BYTE_COUNT) {
        throw new Error(`WisdomDelta XOR fold requires ${QUINTESSENCE_HASH_BYTE_COUNT} quintessence hash bytes`);
    }

    const postHash = new Uint8Array(preXorQuintessenceHash);
    const steps: XorFoldByteStep[] = [];
    for (let byteIndex = 0; byteIndex < WISDOM_DELTA_BYTE_COUNT; byteIndex += 1) {
        const hashIndex = byteIndex % QUINTESSENCE_HASH_BYTE_COUNT;
        const before = postHash[hashIndex];
        const delta = wisdomDeltaBytes[byteIndex];
        const after = before ^ delta;
        postHash[hashIndex] = after;
        const profileTick = byteIndex + 1;
        steps.push(Object.freeze({
            byteIndex,
            hashIndex,
            profileTick,
            wisdomDeltaHex: byteToHex(delta),
            beforeHex: byteToHex(before),
            afterHex: byteToHex(after),
            bitFlips: Object.freeze(bitFlipsForByte(byteIndex, before, after, profileTick))
        }));
    }
    return Object.freeze({
        postHash,
        steps: Object.freeze(steps)
    });
}

export function buildSymbolicCoordinateQuestion(raw: string): SymbolicCoordinateQuestionModel {
    const status = raw.includes('answered')
        ? 'answered'
        : raw.includes('pending')
            ? 'pending'
            : 'parsed';
    const query = encodeURIComponent(raw);
    return Object.freeze({
        raw,
        status,
        inspectorHref: `${PI_AXIOM_TRANSLATION_INSPECTOR_ROUTE}?question=${query}`,
        skillRoute: 'anuttara-symbolic-parse' as const
    });
}

function buildSpineReading789Model(trace: WisdomDeltaTrace): SpineReading789Model {
    return Object.freeze({
        columns: Object.freeze([
            Object.freeze({
                key: 'action7' as const,
                label: 'action-7',
                register: trace.spineReading789.action7.register,
                virtueBits: trace.spineReading789.action7.virtueBits
            }),
            Object.freeze({
                key: 'octave8' as const,
                label: 'octave-8',
                register: trace.spineReading789.octave8.register,
                virtueBits: trace.spineReading789.octave8.virtueBits
            }),
            Object.freeze({
                key: 'wholeness9' as const,
                label: 'wholeness-9',
                register: trace.spineReading789.wholeness9.register,
                virtueBits: trace.spineReading789.wholeness9.virtueBits
            })
        ]),
        virtueWitnessBits: Object.freeze(
            Array.from({ length: VIRTUE_LUT_9_COUNT }, (_, index) =>
                trace.spineReading789.virtueLut9Witness[index] !== 0
            )
        ),
        virtueLabels: VIRTUE_LUT_9_LABELS
    });
}

function normalizeAxiomCheck(check: AxiomCheck): AxiomCheck {
    return Object.freeze({
        id: check.id,
        label: check.label,
        status: check.status,
        detail: check.detail
    });
}

function normalizeSpineRegister(
    register: WisdomDeltaSpineRegister | undefined,
    label: string
): WisdomDeltaSpineRegister {
    if (!register) {
        throw new Error(`WisdomDeltaTrace rejected: missing ${label} spine register`);
    }
    return Object.freeze({
        register: register.register,
        virtueBits: finiteNumber(register.virtueBits, 0)
    });
}

function normalizeTritoneCoherences(value: readonly number[] | undefined): [number, number, number] {
    return [
        finiteNumber(value?.[0], 0),
        finiteNumber(value?.[1], 0),
        finiteNumber(value?.[2], 0)
    ];
}

function normalizeByteArray(value: unknown, name: string, minLength: number): Uint8Array {
    let bytes: Uint8Array;
    if (value instanceof Uint8Array) {
        bytes = new Uint8Array(value);
    } else if (ArrayBuffer.isView(value)) {
        bytes = new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
    } else if (value instanceof ArrayBuffer) {
        bytes = new Uint8Array(value.slice(0));
    } else if (Array.isArray(value)) {
        bytes = new Uint8Array(value.map(byte => clampByte(Number(byte))));
    } else if (typeof value === 'string') {
        bytes = bytesFromHex(value);
    } else {
        throw new Error(`WisdomDeltaTrace rejected: ${name} is not a byte array`);
    }
    if (bytes.length < minLength) {
        throw new Error(`WisdomDeltaTrace rejected: ${name} expected at least ${minLength} bytes`);
    }
    return bytes.length === minLength ? bytes : bytes.slice(0, minLength);
}

function normalizeFloatArray(value: unknown): Float32Array {
    if (value instanceof Float32Array) {
        return new Float32Array(value);
    }
    if (ArrayBuffer.isView(value)) {
        return new Float32Array(Array.from(value as unknown as ArrayLike<number>, Number));
    }
    if (Array.isArray(value)) {
        return new Float32Array(value.map(Number));
    }
    return new Float32Array();
}

function bytesFromHex(value: string): Uint8Array {
    const compact = value.replace(/^0x/i, '').replace(/[^0-9a-f]/gi, '');
    if (compact.length % 2 !== 0) {
        throw new Error('WisdomDeltaTrace rejected: odd-length hex byte string');
    }
    const bytes = new Uint8Array(compact.length / 2);
    for (let index = 0; index < compact.length; index += 2) {
        bytes[index / 2] = parseInt(compact.slice(index, index + 2), 16);
    }
    return bytes;
}

function bitFlipsForByte(
    byteIndex: number,
    before: number,
    after: number,
    profileTick: number
): readonly XorFoldBitFlip[] {
    const flips: XorFoldBitFlip[] = [];
    for (let bitIndex = 0; bitIndex < 8; bitIndex += 1) {
        const mask = 1 << bitIndex;
        const from = (before & mask) === 0 ? 0 : 1;
        const to = (after & mask) === 0 ? 0 : 1;
        if (from !== to) {
            flips.push(Object.freeze({ byteIndex, bitIndex, mask, from, to, profileTick }));
        }
    }
    return Object.freeze(flips);
}

function byteArraysEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
        return false;
    }
    for (let index = 0; index < a.length; index += 1) {
        if (a[index] !== b[index]) {
            return false;
        }
    }
    return true;
}

function byteToHex(byte: number): string {
    return clampByte(byte).toString(16).padStart(2, '0');
}

function clampByte(value: number): number {
    return Number.isFinite(value) ? Math.max(0, Math.min(255, Math.floor(value))) : 0;
}

function finiteNumber(value: number | undefined, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export {
    JointCompositionPanel,
    SpineReading789,
    SymbolicCoordinateQuestionsPanel,
    VirtueLut9WitnessGrid,
    WisdomDeltaInspector,
    XorFoldAnimation
} from './wisdom-delta-components';
