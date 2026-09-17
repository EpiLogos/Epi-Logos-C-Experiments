import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    MathemeHarmonicProfileBoundary,
    MExtensionMiniMode,
    MObservabilityEvent,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const QUINTESSENCE_VIEW_ID = 'm4.nara.quintessence';
export const QUINTESSENCE_LABEL = 'M4 Quintessence';
export const M4_QUINTESSENCE_CHIP_EXPORT = 'M4QuintessenceChip' as const;
export const QUINTESSENCE_PASU_SHOW_METHOD = 'nara.pasu.show';
export const QUINTESSENCE_FULL_HASH_METHOD = 'nara.quintessence.hash.short_form';
export const WISDOM_DELTA_EVENT_KIND = 'm5.session.contemplation.complete';
export const COSMIC_CLOCK_ATTRIBUTION = 'cosmic-clock spec §"M4 Quintessence Identity Hash" — Sun-anchored';

const HASH_PREVIEW_BYTE_COUNT = 8;
const FULL_HASH_HEX_LENGTH = 64;
const PULSE_TICKS = 1;

export interface QuintessenceHashHandle {
    readonly handle: string;
    readonly first8Hex: string;
}

export interface QuintessenceDisplayModel {
    readonly hash: QuintessenceHashHandle | null;
    readonly fullHashShortForm: string | null;
    readonly fullHashStatus: 'idle' | 'loading' | 'ready' | 'error';
    readonly clockDegrees: number | null;
    readonly clockText: string;
    readonly wisdomDeltaHex: readonly string[];
    readonly pulseKey: number;
    readonly pulseActive: boolean;
    readonly profileGeneration: number | null;
    readonly privacyClass: 'protected_local';
}

export interface M4QuintessenceChipProps {
    readonly model: QuintessenceDisplayModel;
    readonly mode?: MExtensionMiniMode;
    readonly onHashHover?: () => void;
}

export interface QuintessencePasuProjection {
    readonly hash: QuintessenceHashHandle | null;
    readonly clockDegrees: number | null;
}

export const M4QuintessenceChip: React.FC<M4QuintessenceChipProps> = ({
    model,
    mode = 'compact-card',
    onHashHover
}) => (
    <section
        className={`m4-quintessence-chip ${privacyChromeClass('protected_local')}`}
        data-test="m4-quintessence-chip"
        data-track="TRACK_08"
        data-export={M4_QUINTESSENCE_CHIP_EXPORT}
        data-view-id={QUINTESSENCE_VIEW_ID}
        data-mode={mode}
        data-profile-generation={model.profileGeneration ?? 'pending'}
        data-privacy-class={model.privacyClass}
        aria-label="Quintessence identity display"
    >
        <header className="m4-quintessence-header">
            <h3>Quintessence</h3>
            <span className="m4-quintessence-privacy mext-privacy-protected-local" data-test="m4-quintessence-privacy">
                protected-local
            </span>
        </header>
        <dl className="m4-quintessence-rows">
            <div className="m4-quintessence-row" data-test="m4-quintessence-hash-row">
                <dt>Quintessence hash</dt>
                <dd>
                    <button
                        type="button"
                        className="m4-quintessence-hash-trigger"
                        data-test="m4-quintessence-hash-trigger"
                        data-hash-handle={model.hash?.handle ?? ''}
                        data-tooltip-state={model.fullHashStatus}
                        aria-describedby="m4-quintessence-full-hash"
                        onMouseEnter={onHashHover}
                        onFocus={onHashHover}
                    >
                        <code className="m4-quintessence-hash-preview">
                            {model.hash?.first8Hex ?? 'pending'}
                        </code>
                    </button>
                    <span
                        id="m4-quintessence-full-hash"
                        role="tooltip"
                        className="m4-quintessence-tooltip"
                        data-test="m4-quintessence-tooltip"
                    >
                        {model.fullHashStatus === 'ready' && model.fullHashShortForm
                            ? model.fullHashShortForm
                            : model.fullHashStatus === 'loading'
                                ? 'loading short-form'
                                : model.fullHashStatus === 'error'
                                    ? 'short-form unavailable'
                                    : 'hover to fetch short-form'}
                    </span>
                </dd>
            </div>
            <div className="m4-quintessence-row" data-test="m4-quintessence-clock-row">
                <dt>Clock position</dt>
                <dd>
                    <span className="m4-quintessence-clock" data-test="m4-quintessence-clock">
                        {model.clockText}
                    </span>
                    <small data-test="m4-quintessence-clock-attribution">
                        {COSMIC_CLOCK_ATTRIBUTION}
                    </small>
                </dd>
            </div>
            <div
                className="m4-quintessence-row"
                data-test="m4-quintessence-wisdom-delta-row"
                data-pulse-key={model.pulseKey}
                data-pulse-active={model.pulseActive ? 'true' : 'false'}
            >
                <dt>Last wisdom_delta</dt>
                <dd>
                    <ol
                        className={`m4-quintessence-delta-strip${model.pulseActive ? ' is-pulsing' : ''}`}
                        data-test="m4-quintessence-delta-strip"
                        aria-label="Last wisdom_delta byte trail"
                    >
                        {model.wisdomDeltaHex.length > 0 ? model.wisdomDeltaHex.map((hex, index) => (
                            <li key={`${index}:${hex}`} data-test="m4-quintessence-delta-byte">
                                <code>{hex}</code>
                            </li>
                        )) : (
                            <li className="m4-quintessence-delta-empty" data-test="m4-quintessence-delta-empty">
                                awaiting close
                            </li>
                        )}
                    </ol>
                </dd>
            </div>
        </dl>
    </section>
);

@injectable()
export class QuintessenceDisplayWidget extends ReactWidget {
    static readonly ID = QUINTESSENCE_VIEW_ID;
    static readonly LABEL = QUINTESSENCE_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected pasuProjection: QuintessencePasuProjection = Object.freeze({
        hash: null,
        clockDegrees: null
    });
    protected fullHashShortForm: string | null = null;
    protected fullHashStatus: QuintessenceDisplayModel['fullHashStatus'] = 'idle';
    protected wisdomDeltaHex: readonly string[] = Object.freeze([]);
    protected pulseKey = 0;
    protected pulseRemainingTicks = 0;
    protected subscriptions: Disposable[] = [];
    protected mode: MExtensionMiniMode = 'compact-card';

    @postConstruct()
    protected init(): void {
        this.id = QuintessenceDisplayWidget.ID;
        this.title.label = QuintessenceDisplayWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-quintessence-display');
        this.addClass(privacyChromeClass('protected_local'));

        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.pasuProjection = readQuintessenceFromProfile(profile, this.pasuProjection);
                if (this.pulseRemainingTicks > 0) {
                    this.pulseRemainingTicks -= 1;
                }
                this.update();
            })
        );
        this.subscriptions.push(
            subscribeToQuintessenceObservability(this.bridge, event => {
                this.handleObservabilityEvent(event);
            })
        );
        void this.refreshPasuProjection();
    }

    override dispose(): void {
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
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-quintessence-root"
            >
                <M4QuintessenceChip
                    mode={this.mode}
                    model={this.model()}
                    onHashHover={() => void this.fetchFullHashShortForm()}
                />
            </div>
        );
    }

    protected model(): QuintessenceDisplayModel {
        return buildQuintessenceDisplayModel({
            projection: this.pasuProjection,
            fullHashShortForm: this.fullHashShortForm,
            fullHashStatus: this.fullHashStatus,
            wisdomDeltaHex: this.wisdomDeltaHex,
            pulseKey: this.pulseKey,
            pulseActive: this.pulseRemainingTicks > 0,
            profileGeneration: this.profile?.generation ?? null
        });
    }

    protected async refreshPasuProjection(): Promise<void> {
        try {
            const raw = await this.bridge.invokeGatewayRpc(QUINTESSENCE_PASU_SHOW_METHOD, {
                reason: 'quintessence-display-open'
            });
            this.pasuProjection = readQuintessenceFromPasuShow(raw, this.pasuProjection);
        } catch {
            this.pasuProjection = Object.freeze({ hash: null, clockDegrees: null });
        }
        this.update();
    }

    protected async fetchFullHashShortForm(): Promise<void> {
        const handle = this.pasuProjection.hash?.handle;
        if (!handle || this.fullHashStatus === 'loading' || this.fullHashStatus === 'ready') {
            return;
        }
        this.fullHashStatus = 'loading';
        this.update();
        try {
            const raw = await this.bridge.invokeGatewayRpc(QUINTESSENCE_FULL_HASH_METHOD, {
                handle,
                format: 'blake3-short-form',
                privacyClass: 'protected_local'
            });
            this.fullHashShortForm = readFullHashShortForm(raw);
            this.fullHashStatus = this.fullHashShortForm ? 'ready' : 'error';
        } catch {
            this.fullHashShortForm = null;
            this.fullHashStatus = 'error';
        }
        this.update();
    }

    protected handleObservabilityEvent(event: MObservabilityEvent): void {
        if (!isWisdomDeltaEvent(event)) {
            return;
        }
        const next = readWisdomDeltaHex(event.payload);
        if (next.length === 0) {
            return;
        }
        this.wisdomDeltaHex = next;
        this.pulseKey += 1;
        this.pulseRemainingTicks = PULSE_TICKS;
        this.update();
    }
}

export function subscribeToQuintessenceObservability(
    bridge: Pick<SharedBridgeAdapter, 'onObservabilityEvent'> & {
        readonly subscribeObservability?: (filter: { readonly kind: string }, listener: (event: MObservabilityEvent) => void) => Disposable;
    },
    listener: (event: MObservabilityEvent) => void
): Disposable {
    return bridge.subscribeObservability?.({ kind: WISDOM_DELTA_EVENT_KIND }, listener) ??
        bridge.onObservabilityEvent(listener);
}

export function buildQuintessenceDisplayModel(input: {
    readonly projection: QuintessencePasuProjection;
    readonly fullHashShortForm: string | null;
    readonly fullHashStatus: QuintessenceDisplayModel['fullHashStatus'];
    readonly wisdomDeltaHex: readonly string[];
    readonly pulseKey: number;
    readonly pulseActive: boolean;
    readonly profileGeneration: number | null;
}): QuintessenceDisplayModel {
    return Object.freeze({
        hash: input.projection.hash,
        fullHashShortForm: input.fullHashShortForm,
        fullHashStatus: input.fullHashStatus,
        clockDegrees: input.projection.clockDegrees,
        clockText: formatClockDegrees(input.projection.clockDegrees),
        wisdomDeltaHex: Object.freeze([...input.wisdomDeltaHex]),
        pulseKey: input.pulseKey,
        pulseActive: input.pulseActive,
        profileGeneration: input.profileGeneration,
        privacyClass: 'protected_local' as const
    });
}

export function readQuintessenceFromProfile(
    profile: MathemeHarmonicProfileBoundary | null,
    fallback: QuintessencePasuProjection = Object.freeze({ hash: null, clockDegrees: null })
): QuintessencePasuProjection {
    if (!profile) {
        return fallback;
    }
    const projection = readQuintessenceFromRecord(profile.payload);
    return projection.hash || projection.clockDegrees !== null ? projection : fallback;
}

export function readQuintessenceFromPasuShow(
    raw: unknown,
    fallback: QuintessencePasuProjection = Object.freeze({ hash: null, clockDegrees: null })
): QuintessencePasuProjection {
    const envelope = objectRecord(raw);
    const payload = objectRecord(envelope?.payload) ??
        objectRecord(envelope?.pasu) ??
        objectRecord(envelope?.profile) ??
        envelope;
    const projection = readQuintessenceFromRecord(payload);
    return projection.hash || projection.clockDegrees !== null ? projection : fallback;
}

export function readQuintessenceFromRecord(record: Readonly<Record<string, unknown>> | null | undefined): QuintessencePasuProjection {
    if (!record) {
        return Object.freeze({ hash: null, clockDegrees: null });
    }
    const hash = normalizeHashHandle(
        record.c_5_quintessence_hash ??
        record.quintessenceHash ??
        record.quintessence_hash ??
        record.quintessenceHashHandle ??
        record.quintessence_hash_handle
    );
    return Object.freeze({
        hash,
        clockDegrees: normalizeClockDegrees(
            record.c_5_quintessence_clock ??
            record.quintessenceClock ??
            record.quintessence_clock ??
            record.clockDegrees ??
            record.clock_degrees
        )
    });
}

export function normalizeHashHandle(raw: unknown): QuintessenceHashHandle | null {
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) {
            return null;
        }
        const first8Hex = first8HexFromUnknown(trimmed);
        return first8Hex ? Object.freeze({ handle: trimmed, first8Hex }) : null;
    }
    const record = objectRecord(raw);
    if (!record) {
        return null;
    }
    const handle = stringValue(
        record.handle ??
        record.shortFormHandle ??
        record.short_form_handle ??
        record.shortForm ??
        record.short_form,
        ''
    );
    const first8Hex = first8HexFromUnknown(
        record.first8Hex ??
        record.first_8_hex ??
        record.first8 ??
        record.previewHex ??
        record.preview_hex ??
        handle
    );
    return handle && first8Hex ? Object.freeze({ handle, first8Hex }) : null;
}

export function readFullHashShortForm(raw: unknown): string | null {
    const direct = fullHashHex(raw);
    if (direct) {
        return direct;
    }
    const record = objectRecord(raw);
    if (!record) {
        return null;
    }
    return fullHashHex(
        record.fullHashShortForm ??
        record.full_hash_short_form ??
        record.shortForm ??
        record.short_form ??
        record.hex
    );
}

export function readWisdomDeltaHex(payload: Readonly<Record<string, unknown>>): readonly string[] {
    return Object.freeze(
        byteArrayFromUnknown(
            payload.wisdomDeltaBytes ??
            payload.wisdom_delta_bytes ??
            payload.wisdomDelta ??
            payload.wisdom_delta ??
            payload.byteTrail ??
            payload.byte_trail
        ).map(byteToHex)
    );
}

export function isWisdomDeltaEvent(event: MObservabilityEvent): boolean {
    const kind = stringValue(event.payload.kind, '');
    return event.type === WISDOM_DELTA_EVENT_KIND || kind === WISDOM_DELTA_EVENT_KIND;
}

export function formatClockDegrees(clockDegrees: number | null): string {
    if (clockDegrees === null || !Number.isFinite(clockDegrees)) {
        return 'pending';
    }
    return `${clockDegrees.toFixed(2).replace(/\.?0+$/, '')} deg`;
}

export function normalizeClockDegrees(raw: unknown): number | null {
    const value = typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
            ? Number(raw.trim().replace(/deg(?:ree)?s?/i, '').replace('°', ''))
            : NaN;
    if (!Number.isFinite(value)) {
        return null;
    }
    return ((value % 360) + 360) % 360;
}

function first8HexFromUnknown(raw: unknown): string | null {
    if (Array.isArray(raw) || ArrayBuffer.isView(raw)) {
        const bytes = byteArrayFromUnknown(raw);
        return bytes.length >= HASH_PREVIEW_BYTE_COUNT
            ? bytes.slice(0, HASH_PREVIEW_BYTE_COUNT).map(byteToHex).join('')
            : null;
    }
    if (typeof raw !== 'string') {
        return null;
    }
    const hex = raw.replace(/^blake3:/i, '').replace(/^0x/i, '').replace(/[^a-f0-9]/gi, '').toLowerCase();
    return hex.length >= HASH_PREVIEW_BYTE_COUNT * 2 ? hex.slice(0, HASH_PREVIEW_BYTE_COUNT * 2) : null;
}

function fullHashHex(raw: unknown): string | null {
    if (Array.isArray(raw) || ArrayBuffer.isView(raw)) {
        const bytes = byteArrayFromUnknown(raw);
        return bytes.length === 32 ? bytes.map(byteToHex).join('') : null;
    }
    if (typeof raw !== 'string') {
        return null;
    }
    const normalized = raw.replace(/^blake3:/i, '').replace(/^0x/i, '').replace(/[^a-f0-9]/gi, '').toLowerCase();
    return normalized.length === FULL_HASH_HEX_LENGTH ? normalized : null;
}

function byteArrayFromUnknown(raw: unknown): number[] {
    if (ArrayBuffer.isView(raw)) {
        return Array.from(raw as Uint8Array, byte => byte & 0xff);
    }
    if (Array.isArray(raw)) {
        return raw.map(byte => Number(byte)).filter(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255);
    }
    if (typeof raw === 'string') {
        const hex = raw.replace(/^0x/i, '').replace(/[^a-f0-9]/gi, '');
        if (hex.length < 2) {
            return [];
        }
        const even = hex.length % 2 === 0 ? hex : `0${hex}`;
        return Array.from({ length: even.length / 2 }, (_, index) => parseInt(even.slice(index * 2, index * 2 + 2), 16));
    }
    return [];
}

function byteToHex(byte: number): string {
    return byte.toString(16).padStart(2, '0');
}

function objectRecord(raw: unknown): Readonly<Record<string, unknown>> | null {
    return raw && typeof raw === 'object' && !Array.isArray(raw)
        ? raw as Readonly<Record<string, unknown>>
        : null;
}

function stringValue(raw: unknown, fallback: string): string {
    return typeof raw === 'string' ? raw : fallback;
}
