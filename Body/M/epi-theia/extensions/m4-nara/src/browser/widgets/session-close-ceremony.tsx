import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    MObservabilityEvent,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const SESSION_CLOSE_CEREMONY_VIEW_ID = 'm4.nara.sessionCloseCeremony';
export const SESSION_CLOSE_CEREMONY_LABEL = 'M4 Session Close Ceremony';
export const SESSION_CLOSE_COMPLETE_EVENT = 'm5.session.contemplation.complete';
export const SESSION_CLOSE_SUMMARY_RPC = 'nara.session.close_summary';
export const M4_SESSION_CLOSE_CEREMONY_EXPORT = 'M4SessionCloseCeremonyCard' as const;

const WISDOM_DELTA_BYTE_COUNT = 8;
const XOR_REGISTER_BYTE_COUNT = 8;
const HASH_HANDLE_PREFIX_BYTES = 4;
const HASH_HANDLE_SUFFIX_BYTES = 2;
const WISDOM_DELTA_EMPTY = 'waiting-for-session-close';

export type SessionCloseCeremonyStatus = 'idle' | 'loading' | 'ready' | 'error';

export type ContemplationRegisterLabel = 'speech' | 'relationship' | 'action' | 'completion';

export interface ContemplationSeedModel {
    readonly archetype: 3 | 5 | 7 | 9;
    readonly register: ContemplationRegisterLabel;
    readonly prompt: string;
}

export interface XorRegisterByteModel {
    readonly byteIndex: number;
    readonly hashIndex: number;
    readonly wisdomDeltaHex: string;
    readonly beforeHex: string;
    readonly afterHex: string;
    readonly profileTick: number;
}

export interface VirtueWitnessLampModel {
    readonly index: number;
    readonly label: string;
    readonly lit: boolean;
}

export interface SessionCloseTripletModel {
    readonly llmNara: string;
    readonly ebmEpii: string;
    readonly verifierAnuttara: string;
}

export interface SessionCloseCeremonyModel {
    readonly sessionKey: string;
    readonly emittedAt: number;
    readonly privacyClass: 'protected_local_handle_only';
    readonly quintessenceHandle: string;
    readonly wisdomDeltaHex: readonly string[];
    readonly xorRegister: readonly XorRegisterByteModel[];
    readonly contemplationSeeds: readonly ContemplationSeedModel[];
    readonly virtueWitness: readonly VirtueWitnessLampModel[];
    readonly triplet: SessionCloseTripletModel;
}

export interface M4SessionCloseCeremonyCardProps {
    readonly model: SessionCloseCeremonyModel;
    readonly animationTick?: number;
}

export const CONTEMPLATION_SEED_FALLBACKS: readonly ContemplationSeedModel[] = Object.freeze([
    Object.freeze({
        archetype: 3,
        register: 'speech',
        prompt: 'Did your speech articulate identity or just signal? Where did naming become performance?'
    }),
    Object.freeze({
        archetype: 5,
        register: 'relationship',
        prompt: 'Did unity-multiplicity hold or did one side eat the other? Where was the mercurial crossroads refused?'
    }),
    Object.freeze({
        archetype: 7,
        register: 'action',
        prompt: 'Did the four causes integrate or did one dominate? Which act was missing?'
    }),
    Object.freeze({
        archetype: 9,
        register: 'completion',
        prompt: 'Did the cycle complete in wholeness or close prematurely? Which virtue went unwitnessed?'
    })
]);

export const VIRTUE_WITNESS_LABELS: readonly string[] = Object.freeze([
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

export const M4SessionCloseCeremonyCard: React.FC<M4SessionCloseCeremonyCardProps> = ({
    model,
    animationTick = XOR_REGISTER_BYTE_COUNT
}) => (
    <section
        className={`m4-session-close-ceremony ${privacyChromeClass('protected_local_handle_only')}`}
        data-test="m4-session-close-ceremony"
        data-track="TRACK_08"
        data-export={M4_SESSION_CLOSE_CEREMONY_EXPORT}
        data-view-id={SESSION_CLOSE_CEREMONY_VIEW_ID}
        data-privacy-class={model.privacyClass}
        aria-label="Session close ceremony"
    >
        <header className="m4-session-close-header">
            <div>
                <h3>Session Close Ceremony</h3>
                <p data-test="m4-session-close-session-key">{model.sessionKey}</p>
            </div>
            <span
                className="m4-session-close-privacy mext-privacy-protected-local-handle-only"
                data-test="m4-session-close-privacy"
            >
                protected_local_handle_only
            </span>
        </header>

        <section className="m4-session-close-section" data-test="m4-session-close-wisdom-delta">
            <h4>Wisdom-delta byte trail</h4>
            <ol className="m4-session-close-hex-strip" aria-label="wisdom_delta hex strip">
                {model.wisdomDeltaHex.map((hex, index) => (
                    <li
                        key={`wisdom-${index}`}
                        data-test="m4-session-close-wisdom-byte"
                        data-byte-index={index}
                    >
                        {hex}
                    </li>
                ))}
            </ol>
        </section>

        <section className="m4-session-close-section" data-test="m4-session-close-xor-animation">
            <h4>XOR animation</h4>
            <div className="m4-session-close-hash-handle" data-test="m4-session-close-quintessence-handle">
                {model.quintessenceHandle}
            </div>
            <ol className="m4-session-close-xor-register" aria-label="8-byte quintessence XOR register">
                {model.xorRegister.map(byte => {
                    const updated = animationTick >= byte.profileTick;
                    return (
                        <li
                            key={`xor-${byte.byteIndex}`}
                            data-test="m4-session-close-xor-byte"
                            data-byte-index={byte.byteIndex}
                            data-hash-index={byte.hashIndex}
                            data-profile-tick={byte.profileTick}
                            data-register-state={updated ? 'updated' : 'pending'}
                        >
                            <span className="m4-session-close-xor-before">{byte.beforeHex}</span>
                            <span className="m4-session-close-xor-delta">{byte.wisdomDeltaHex}</span>
                            <strong className="m4-session-close-xor-after">
                                {updated ? byte.afterHex : byte.beforeHex}
                            </strong>
                        </li>
                    );
                })}
            </ol>
        </section>

        <section className="m4-session-close-section" data-test="m4-session-close-seeds">
            <h4>Four contemplation seeds</h4>
            <div className="m4-session-close-seed-grid">
                {model.contemplationSeeds.map(seed => (
                    <article
                        key={seed.archetype}
                        className="m4-session-close-seed-card"
                        data-test="m4-session-close-seed-card"
                        data-arch-position={seed.archetype}
                        data-register-label={seed.register}
                    >
                        <strong>Arch {seed.archetype} - {seed.register}</strong>
                        <p>{seed.prompt}</p>
                    </article>
                ))}
            </div>
        </section>

        <section className="m4-session-close-section" data-test="m4-session-close-virtue-witness">
            <h4>Virtue witness vector</h4>
            <div className="m4-session-close-triplet" data-test="m4-session-close-triplet">
                <span data-position="4-prime">LLM-Nara 4&apos;: {model.triplet.llmNara}</span>
                <span data-position="5-prime">EBM-Epii 5&apos;: {model.triplet.ebmEpii}</span>
                <span data-position="0-prime">Verifier-Anuttara 0&apos;: {model.triplet.verifierAnuttara}</span>
            </div>
            <ol className="m4-session-close-virtue-lamps" aria-label="VIRTUE_LUT[9] witness lamps">
                {model.virtueWitness.map(lamp => (
                    <li
                        key={lamp.label}
                        data-test="m4-session-close-virtue-lamp"
                        data-virtue-index={lamp.index}
                        data-virtue-label={lamp.label}
                        data-witness-state={lamp.lit ? 'lit' : 'dark'}
                    >
                        <span aria-hidden="true">{lamp.lit ? '1' : '0'}</span>
                        <strong>{lamp.label}</strong>
                    </li>
                ))}
            </ol>
        </section>
    </section>
);

@injectable()
export class SessionCloseCeremonyWidget extends ReactWidget {
    static readonly ID = SESSION_CLOSE_CEREMONY_VIEW_ID;
    static readonly LABEL = SESSION_CLOSE_CEREMONY_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected status: SessionCloseCeremonyStatus = 'idle';
    protected model: SessionCloseCeremonyModel | null = null;
    protected errorMessage = '';
    protected animationTick = 0;
    protected subscriptions: Disposable[] = [];
    private animationTimer: ReturnType<typeof setInterval> | undefined;

    @postConstruct()
    protected init(): void {
        this.id = SessionCloseCeremonyWidget.ID;
        this.title.label = SessionCloseCeremonyWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-session-close-ceremony-modal');
        this.addClass('mext-privacy-protected-local-handle-only');

        this.subscriptions.push(
            subscribeToSessionCloseObservability(this.bridge, event => {
                void this.handleObservabilityEvent(event);
            })
        );
    }

    override dispose(): void {
        this.stopAnimation();
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        if (this.status === 'ready' && this.model) {
            return (
                <div
                    className={`mext-widget-root m4-session-close-root ${privacyChromeClass('protected_local_handle_only')}`}
                    data-test="m4-session-close-root"
                    data-modal-class="modal"
                >
                    <M4SessionCloseCeremonyCard model={this.model} animationTick={this.animationTick} />
                </div>
            );
        }
        const message = this.status === 'error'
            ? this.errorMessage
            : this.status === 'loading'
                ? 'Reading session-close summary handles.'
                : WISDOM_DELTA_EMPTY;
        return (
            <div
                className={`mext-widget-root m4-session-close-root ${privacyChromeClass('protected_local_handle_only')}`}
                data-test="m4-session-close-root"
                data-status={this.status}
            >
                <section className="m4-session-close-placeholder" data-test="m4-session-close-placeholder">
                    <h3>Session Close Ceremony</h3>
                    <p>{message}</p>
                </section>
            </div>
        );
    }

    protected async handleObservabilityEvent(event: MObservabilityEvent): Promise<void> {
        if (!isSessionCloseCompleteEvent(event)) {
            return;
        }
        const sessionKey = sessionKeyFromEvent(event);
        this.status = 'loading';
        this.model = null;
        this.errorMessage = '';
        this.animationTick = 0;
        this.stopAnimation();
        this.update();

        try {
            const summary = await this.bridge.invokeGatewayRpc(SESSION_CLOSE_SUMMARY_RPC, { sessionKey });
            this.model = normalizeSessionCloseSummary(summary, {
                sessionKey,
                emittedAt: event.emittedAt
            });
            this.status = 'ready';
            this.startAnimation();
        } catch (error) {
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : 'Session close summary unavailable.';
        }
        this.update();
    }

    private startAnimation(): void {
        this.stopAnimation();
        this.animationTick = 0;
        this.animationTimer = setInterval(() => {
            this.animationTick = Math.min(this.animationTick + 1, XOR_REGISTER_BYTE_COUNT);
            if (this.animationTick >= XOR_REGISTER_BYTE_COUNT) {
                this.stopAnimation();
            }
            this.update();
        }, 160);
    }

    private stopAnimation(): void {
        if (this.animationTimer) {
            clearInterval(this.animationTimer);
            this.animationTimer = undefined;
        }
    }
}

export function subscribeToSessionCloseObservability(
    bridge: Pick<SharedBridgeAdapter, 'onObservabilityEvent'> & {
        readonly subscribeObservability?: (listener: (event: MObservabilityEvent) => void) => Disposable;
    },
    listener: (event: MObservabilityEvent) => void
): Disposable {
    return bridge.subscribeObservability?.(listener) ?? bridge.onObservabilityEvent(listener);
}

export function isSessionCloseCompleteEvent(event: MObservabilityEvent): boolean {
    const kind = stringValue(event.payload.kind, '');
    return event.type === SESSION_CLOSE_COMPLETE_EVENT || kind === SESSION_CLOSE_COMPLETE_EVENT;
}

export function sessionKeyFromEvent(event: MObservabilityEvent): string {
    return stringValue(
        event.payload.sessionKey ??
        event.payload.session_key ??
        event.payload.sessionId ??
        event.payload.session_id,
        `session-close:${event.emittedAt}`
    );
}

export function normalizeSessionCloseSummary(
    raw: unknown,
    context: { readonly sessionKey: string; readonly emittedAt?: number }
): SessionCloseCeremonyModel {
    const emptyRecord = Object.freeze({}) as Readonly<Record<string, unknown>>;
    const record = objectRecord(raw) ?? emptyRecord;
    const payload = objectRecord(record.payload) ?? record;
    const wisdomDelta = normalizeByteArray(
        payload.wisdomDeltaBytes ??
        payload.wisdom_delta_bytes ??
        payload.wisdomDelta ??
        payload.wisdom_delta,
        WISDOM_DELTA_BYTE_COUNT
    );
    const hashBytes = normalizeByteArray(
        payload.quintessenceHashFirst8 ??
        payload.quintessence_hash_first8 ??
        payload.quintessenceHashRegister ??
        payload.quintessence_hash_register ??
        payload.preXorQuintessenceHash ??
        payload.pre_xor_quintessence_hash ??
        payload.quintessenceHash ??
        payload.quintessence_hash,
        XOR_REGISTER_BYTE_COUNT
    );
    const register = buildXorRegister(hashBytes, wisdomDelta);

    return Object.freeze({
        sessionKey: context.sessionKey,
        emittedAt: context.emittedAt ?? Date.now(),
        privacyClass: 'protected_local_handle_only' as const,
        quintessenceHandle: hashHandle(
            payload.quintessenceHashHandle ??
            payload.quintessence_hash_handle ??
            payload.identityHandle ??
            payload.identity_handle,
            hashBytes
        ),
        wisdomDeltaHex: Object.freeze(Array.from(wisdomDelta, byteToHex)),
        xorRegister: register,
        contemplationSeeds: normalizeContemplationSeeds(payload),
        virtueWitness: normalizeVirtueWitness(payload),
        triplet: normalizeTriplet(payload)
    });
}

export function buildXorRegister(
    quintessenceHashFirst8: Uint8Array,
    wisdomDeltaBytes: Uint8Array
): readonly XorRegisterByteModel[] {
    if (quintessenceHashFirst8.length < XOR_REGISTER_BYTE_COUNT) {
        throw new Error('Session close ceremony requires 8 quintessence hash register bytes');
    }
    if (wisdomDeltaBytes.length < WISDOM_DELTA_BYTE_COUNT) {
        throw new Error('Session close ceremony requires 8 wisdom_delta bytes');
    }
    return Object.freeze(
        Array.from({ length: XOR_REGISTER_BYTE_COUNT }, (_, byteIndex) => {
            const before = quintessenceHashFirst8[byteIndex];
            const delta = wisdomDeltaBytes[byteIndex];
            return Object.freeze({
                byteIndex,
                hashIndex: byteIndex,
                wisdomDeltaHex: byteToHex(delta),
                beforeHex: byteToHex(before),
                afterHex: byteToHex(before ^ delta),
                profileTick: byteIndex + 1
            });
        })
    );
}

function normalizeContemplationSeeds(payload: Readonly<Record<string, unknown>>): readonly ContemplationSeedModel[] {
    const promptTable =
        payload.CONTEMPLATION_PROMPT_LUT ??
        payload.contemplationPromptLut ??
        payload.contemplation_prompt_lut ??
        payload.prompts;
    const promptRecord = objectRecord(promptTable);
    const promptArray = Array.isArray(promptTable) ? promptTable : null;
    const seedRows = Array.isArray(payload.contemplationSeeds ?? payload.contemplation_seeds)
        ? payload.contemplationSeeds ?? payload.contemplation_seeds
        : null;

    return Object.freeze(
        CONTEMPLATION_SEED_FALLBACKS.map(fallback => {
            const row = Array.isArray(seedRows)
                ? seedRows.map(objectRecord).filter(isRecord).find(seed =>
                    integerValue(seed.archetype ?? seed.position ?? seed.arch) === fallback.archetype
                )
                : undefined;
            const prompt =
                stringValue(row?.prompt, '') ||
                stringValue(promptRecord?.[String(fallback.archetype)], '') ||
                stringValue(promptArray?.[fallback.archetype], '') ||
                fallback.prompt;
            return Object.freeze({
                ...fallback,
                prompt
            });
        })
    );
}

function normalizeVirtueWitness(payload: Readonly<Record<string, unknown>>): readonly VirtueWitnessLampModel[] {
    const verifier = objectRecord(payload.verifierReport) ?? objectRecord(payload.verifier_report);
    const spine = objectRecord(payload.spineReading789) ?? objectRecord(payload.spine_reading_789);
    const witness =
        payload.virtueWitnessVector ??
        payload.virtue_witness_vector ??
        payload.virtueLut9Witness ??
        payload.virtue_lut_9_witness ??
        verifier?.virtueWitnessVector ??
        verifier?.virtue_witness_vector ??
        spine?.virtueLut9Witness ??
        spine?.virtue_lut_9_witness;
    const bits = witnessBits(witness);
    return Object.freeze(
        VIRTUE_WITNESS_LABELS.map((label, index) => Object.freeze({
            index,
            label,
            lit: bits[index] === true
        }))
    );
}

function normalizeTriplet(payload: Readonly<Record<string, unknown>>): SessionCloseTripletModel {
    const llm =
        payload.llmNara ??
        payload.llm_nara ??
        payload.position4Prime ??
        payload.position_4_prime ??
        payload.llm_position_4 ??
        payload.llmComposition ??
        payload.llm_composition;
    const ebm =
        payload.ebmEpii ??
        payload.ebm_epii ??
        payload.position5Prime ??
        payload.position_5_prime ??
        payload.ebm_position_5 ??
        payload.ebmEvaluation ??
        payload.ebm_evaluation;
    const verifier =
        payload.verifierAnuttara ??
        payload.verifier_anuttara ??
        payload.position0Prime ??
        payload.position_0_prime ??
        payload.verifier_position_0 ??
        payload.verifierReport ??
        payload.verifier_report;

    return Object.freeze({
        llmNara: compactTripletValue(llm, 'recognition-ready'),
        ebmEpii: compactTripletValue(ebm, 'energy-evaluated'),
        verifierAnuttara: compactTripletValue(verifier, 'virtue-witnessed')
    });
}

function compactTripletValue(value: unknown, fallback: string): string {
    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }
    const record = objectRecord(value);
    if (!record) {
        return fallback;
    }
    return stringValue(
        record.synthesizedRecognition ??
        record.synthesized_recognition ??
        record.summary ??
        record.status ??
        record.actor ??
        record.handle,
        fallback
    );
}

function hashHandle(rawHandle: unknown, hashBytes: Uint8Array): string {
    const supplied = stringValue(rawHandle, '');
    if (supplied) {
        return supplied;
    }
    const prefix = Array.from(hashBytes.slice(0, HASH_HANDLE_PREFIX_BYTES), byteToHex).join('');
    const suffix = Array.from(hashBytes.slice(-HASH_HANDLE_SUFFIX_BYTES), byteToHex).join('');
    return `qhash:${prefix}-${suffix}:${hashBytes.length}b`;
}

function witnessBits(value: unknown): readonly boolean[] {
    if (Array.isArray(value)) {
        return Object.freeze(
            Array.from({ length: VIRTUE_WITNESS_LABELS.length }, (_, index) => Boolean(value[index]))
        );
    }
    if (value instanceof Uint8Array || ArrayBuffer.isView(value)) {
        const bytes = value as unknown as ArrayLike<number>;
        return Object.freeze(
            Array.from({ length: VIRTUE_WITNESS_LABELS.length }, (_, index) => Number(bytes[index]) !== 0)
        );
    }
    const numeric = typeof value === 'bigint'
        ? value
        : typeof value === 'number' && Number.isFinite(value)
            ? BigInt(Math.max(0, Math.trunc(value)))
            : typeof value === 'string'
                ? parseIntegerString(value)
                : 0n;
    return Object.freeze(
        Array.from({ length: VIRTUE_WITNESS_LABELS.length }, (_, index) =>
            ((numeric >> BigInt(index)) & 1n) === 1n
        )
    );
}

function normalizeByteArray(value: unknown, minLength: number): Uint8Array {
    let bytes: Uint8Array;
    if (value instanceof Uint8Array) {
        bytes = new Uint8Array(value);
    } else if (ArrayBuffer.isView(value)) {
        bytes = new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
    } else if (value instanceof ArrayBuffer) {
        bytes = new Uint8Array(value.slice(0));
    } else if (Array.isArray(value)) {
        bytes = new Uint8Array(value.map(byte => clampByte(Number(byte))));
    } else if (typeof value === 'number' && Number.isFinite(value)) {
        bytes = bytesFromBigInt(BigInt(Math.max(0, Math.trunc(value))), minLength);
    } else if (typeof value === 'bigint') {
        bytes = bytesFromBigInt(value, minLength);
    } else if (typeof value === 'string') {
        bytes = bytesFromHex(value);
    } else {
        throw new Error('Session close ceremony expected byte-array-compatible summary field');
    }
    if (bytes.length < minLength) {
        throw new Error(`Session close ceremony expected at least ${minLength} bytes`);
    }
    return bytes.length === minLength ? bytes : bytes.slice(0, minLength);
}

function bytesFromHex(value: string): Uint8Array {
    const compact = value.replace(/^0x/i, '').replace(/[^0-9a-f]/gi, '');
    if (compact.length % 2 !== 0) {
        throw new Error('Session close ceremony rejected odd-length hex bytes');
    }
    const bytes = new Uint8Array(compact.length / 2);
    for (let index = 0; index < compact.length; index += 2) {
        bytes[index / 2] = parseInt(compact.slice(index, index + 2), 16);
    }
    return bytes;
}

function bytesFromBigInt(value: bigint, minLength: number): Uint8Array {
    const bytes = new Uint8Array(minLength);
    let cursor = value;
    for (let index = minLength - 1; index >= 0; index -= 1) {
        bytes[index] = Number(cursor & 0xffn);
        cursor >>= 8n;
    }
    return bytes;
}

function byteToHex(value: number): string {
    return clampByte(value).toString(16).padStart(2, '0');
}

function clampByte(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.min(255, Math.trunc(value)));
}

function parseIntegerString(value: string): bigint {
    const trimmed = value.trim();
    if (!trimmed) {
        return 0n;
    }
    try {
        return BigInt(trimmed.startsWith('0x') ? trimmed : Number(trimmed));
    } catch {
        return 0n;
    }
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return undefined;
    }
    return value as Readonly<Record<string, unknown>>;
}

function isRecord(value: Readonly<Record<string, unknown>> | undefined): value is Readonly<Record<string, unknown>> {
    return value !== undefined;
}

function stringValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function integerValue(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value)) {
        return value;
    }
    if (typeof value === 'string' && /^-?\d+$/.test(value)) {
        return Number(value);
    }
    return null;
}
