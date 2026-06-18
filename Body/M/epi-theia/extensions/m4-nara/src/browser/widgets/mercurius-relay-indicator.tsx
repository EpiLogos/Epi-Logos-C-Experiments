import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    MExtensionReadinessSnapshot,
    MObservabilityEvent,
    PENDING_M_READINESS,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const MERCURIUS_RELAY_VIEW_ID = 'm4.nara.mercuriusRelay';
export const MERCURIUS_RELAY_LABEL = 'M4 Mercurius Relay';

/**
 * Track 08 compact export name. Composition (Track 08) places this chip above
 * the Kairos Wheel (25.15) in the `ide-deep` layout and adjacent to the status
 * bar in `daily-0-1`. The chip is a pure indicator — no body content, no
 * privacy chrome — so it never surfaces protected payload, only relay liveness.
 */
export const M4_MERCURIUS_RELAY_CHIP_EXPORT = 'M4MercuriusRelayChip' as const;

/**
 * Observability `kind` carried by the Mercurius kairos populator (19.12). The
 * carrier publishes either via the top-level `type` or a `payload.kind`, so
 * both are accepted — mirroring how the Kairos Wheel (25.15) reads the signal.
 */
export const MERCURIUS_KAIROS_DELTA_KIND = 'mercurius.kairos.delta';

/**
 * FR-3 privacy gate. `KAIROS_ENABLED=false` is the canonical default: the live
 * kairos signal stays off until the user opts in. This is the same preference
 * key the cold-start kairos-enablement step (32.x) and the Mercurius populator
 * (19.12) gate on; duplicated here because the runtime package does not
 * re-export it from its root. Keep the literal in sync with that step.
 */
export const KAIROS_ENABLED_PREFERENCE = 'epi-logos.privacy.kairos-enabled';
export const KAIROS_ENABLED_DEFAULT = false as const;

/** Canonical mod-10 planet count (Sun[0]..Pluto[9]); Earth is the observer. */
export const MOD10_PLANET_COUNT = 10;

/**
 * Mercurius kairos delta payload as emitted by 19.12. Only the fields this
 * indicator reads are typed; the carrier may include more. The mod-10 contract
 * requires every live refresh to carry `planet_degrees[10]`.
 */
export interface MercuriusKairosDeltaPayload {
    readonly kind?: string;
    readonly kairosEnabled?: boolean;
    readonly enabled?: boolean;
    readonly refreshedAtIso?: string;
    readonly refreshed_at?: string;
    readonly planet_degrees?: readonly number[];
    readonly M4_Temporal_Now?: { readonly planet_degrees?: readonly number[] };
}

/**
 * Indicator state. `deltaCount` counts deltas since the current UI mount;
 * `pulseToken` is bumped exactly once per counted delta so the chip can replay
 * a single CSS pulse by re-keying the pulse node.
 */
export interface MercuriusRelayState {
    readonly kairosEnabled: boolean;
    readonly lastRefreshIso: string | null;
    readonly deltaCount: number;
    readonly pulseToken: number;
    readonly lastPlanetDegrees: readonly number[] | null;
}

export function initialRelayState(kairosEnabled: boolean = KAIROS_ENABLED_DEFAULT): MercuriusRelayState {
    return Object.freeze({
        kairosEnabled,
        lastRefreshIso: null,
        deltaCount: 0,
        pulseToken: 0,
        lastPlanetDegrees: null
    });
}

/** Strict boolean read of the FR-3 preference; anything non-`true` is `false`. */
export function readKairosEnabled(value: unknown): boolean {
    return value === true;
}

/** True when the event is a Mercurius kairos delta (by `type` or `payload.kind`). */
export function isMercuriusKairosDelta(event: MObservabilityEvent): boolean {
    const payload = event.payload as MercuriusKairosDeltaPayload | undefined;
    const kind = typeof payload?.kind === 'string' ? payload.kind : event.type;
    return event.type === MERCURIUS_KAIROS_DELTA_KIND || kind === MERCURIUS_KAIROS_DELTA_KIND;
}

/**
 * Extract the mod-10 planet-degree vector from a delta payload. Returns the
 * frozen length-10 array of finite numbers, or `null` if the payload does not
 * satisfy the mod-10 contract (wrong length, missing, or non-finite entry).
 */
export function readDeltaPlanetDegrees(payload: MercuriusKairosDeltaPayload | undefined): readonly number[] | null {
    const raw = payload?.planet_degrees ?? payload?.M4_Temporal_Now?.planet_degrees;
    if (!Array.isArray(raw) || raw.length !== MOD10_PLANET_COUNT) {
        return null;
    }
    if (!raw.every(value => typeof value === 'number' && Number.isFinite(value))) {
        return null;
    }
    return Object.freeze(raw.slice());
}

/** Resolve an explicit enabled signal from the payload, or `undefined` if absent. */
export function readDeltaKairosEnabled(payload: MercuriusKairosDeltaPayload | undefined): boolean | undefined {
    if (typeof payload?.kairosEnabled === 'boolean') {
        return payload.kairosEnabled;
    }
    if (typeof payload?.enabled === 'boolean') {
        return payload.enabled;
    }
    return undefined;
}

/** ISO refresh timestamp: payload-provided if present, else derived from `emittedAt`. */
export function readDeltaRefreshIso(event: MObservabilityEvent): string {
    const payload = event.payload as MercuriusKairosDeltaPayload | undefined;
    if (typeof payload?.refreshedAtIso === 'string') {
        return payload.refreshedAtIso;
    }
    if (typeof payload?.refreshed_at === 'string') {
        return payload.refreshed_at;
    }
    return new Date(event.emittedAt).toISOString();
}

/**
 * Fold a Mercurius observability event into the indicator state.
 *
 * - Non-Mercurius events leave the state untouched.
 * - An explicit `kairosEnabled:false` (FR-3 stub) flips the chip to its grey
 *   disabled state without counting or pulsing.
 * - A live delta MUST carry `planet_degrees[10]` (mod-10 contract); a delta
 *   without a valid vector marks the relay enabled but is not counted.
 * - A valid delta increments `deltaCount`, bumps `pulseToken` once, and records
 *   the refresh timestamp and degree vector.
 */
export function applyMercuriusDelta(state: MercuriusRelayState, event: MObservabilityEvent): MercuriusRelayState {
    if (!isMercuriusKairosDelta(event)) {
        return state;
    }
    const payload = event.payload as MercuriusKairosDeltaPayload | undefined;
    const degrees = readDeltaPlanetDegrees(payload);
    const enabledSignal = readDeltaKairosEnabled(payload);
    const nextEnabled = enabledSignal ?? (degrees ? true : state.kairosEnabled);

    if (!nextEnabled) {
        return state.kairosEnabled === false ? state : Object.freeze({ ...state, kairosEnabled: false });
    }
    if (!degrees) {
        return state.kairosEnabled === true ? state : Object.freeze({ ...state, kairosEnabled: true });
    }
    return Object.freeze({
        kairosEnabled: true,
        lastRefreshIso: readDeltaRefreshIso(event),
        deltaCount: state.deltaCount + 1,
        pulseToken: state.pulseToken + 1,
        lastPlanetDegrees: degrees
    });
}

/** Apply an out-of-band enabled signal (e.g. the FR-3 preference) to the state. */
export function setKairosEnabled(state: MercuriusRelayState, enabled: boolean): MercuriusRelayState {
    return state.kairosEnabled === enabled ? state : Object.freeze({ ...state, kairosEnabled: enabled });
}

export interface M4MercuriusRelayChipProps {
    readonly kairosEnabled: boolean;
    readonly lastRefreshIso: string | null;
    readonly deltaCount: number;
    readonly pulseToken: number;
    readonly connected: boolean;
}

/**
 * Compact chrome chip (~24px tall) reporting Mercurius kairos-relay liveness.
 * When kairos is disabled (FR-3 default) it renders a grey "Kairos disabled"
 * stub. When enabled it shows the last refresh ISO timestamp and the delta
 * count, and re-keys the pulse node on every delta so the single-shot CSS pulse
 * replays exactly once per refresh.
 */
export const M4MercuriusRelayChip: React.FC<M4MercuriusRelayChipProps> = props => {
    const { kairosEnabled, lastRefreshIso, deltaCount, pulseToken, connected } = props;
    return (
        <div
            className={`m4-mercurius-relay ${privacyChromeClass('protected_local_handle_only')}`}
            data-test="m4-mercurius-relay"
            data-track="TRACK_08"
            data-export={M4_MERCURIUS_RELAY_CHIP_EXPORT}
            data-view-id={MERCURIUS_RELAY_VIEW_ID}
            data-kairos-enabled={kairosEnabled ? 'true' : 'false'}
            data-connected={connected ? 'true' : 'false'}
            role="status"
            aria-label="Mercurius kairos relay status"
        >
            {kairosEnabled ? (
                <React.Fragment>
                    <span
                        key={pulseToken}
                        className="m4-mercurius-pulse"
                        data-test="m4-mercurius-pulse"
                        data-pulse-token={pulseToken}
                        data-connected={connected ? 'true' : 'false'}
                        aria-hidden="true"
                    />
                    <span className="m4-mercurius-glyph" aria-hidden="true">
                        ☿
                    </span>
                    <span className="m4-mercurius-label">Mercurius</span>
                    <time
                        className="m4-mercurius-refresh"
                        data-test="m4-mercurius-refresh"
                        dateTime={lastRefreshIso ?? undefined}
                    >
                        {lastRefreshIso ?? 'awaiting kairos…'}
                    </time>
                    <span className="m4-mercurius-delta" data-test="m4-mercurius-delta-count">
                        Δ {deltaCount}
                    </span>
                </React.Fragment>
            ) : (
                <span
                    className="m4-mercurius-stub"
                    data-test="m4-mercurius-relay-stub"
                    data-kairos-enabled="false"
                >
                    Kairos disabled
                </span>
            )}
        </div>
    );
};

@injectable()
export class MercuriusRelayIndicatorWidget extends ReactWidget {
    static readonly ID = MERCURIUS_RELAY_VIEW_ID;
    static readonly LABEL = MERCURIUS_RELAY_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected relay: MercuriusRelayState = initialRelayState();
    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = MercuriusRelayIndicatorWidget.ID;
        this.title.label = MercuriusRelayIndicatorWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-mercurius-relay');
        this.addClass(privacyChromeClass('protected_local_handle_only'));

        this.subscriptions.push(
            this.bridge.onObservabilityEvent(event => this.handleObservabilityEvent(event))
        );
        this.subscriptions.push(
            this.bridge.onReadiness(snapshot => {
                this.readiness = snapshot;
                this.update();
            })
        );
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

    /**
     * Push the FR-3 kairos-enabled preference into the indicator. The widget
     * does not import Theia's PreferenceService (kept test-light); the owning
     * contribution reads `KAIROS_ENABLED_PREFERENCE` and calls this on start and
     * on every preference change.
     */
    setKairosEnabled(enabled: boolean): void {
        const next = setKairosEnabled(this.relay, enabled);
        if (next !== this.relay) {
            this.relay = next;
            this.update();
        }
    }

    protected handleObservabilityEvent(event: MObservabilityEvent): void {
        const next = applyMercuriusDelta(this.relay, event);
        if (next !== this.relay) {
            this.relay = next;
            this.update();
        }
    }

    protected override render(): React.ReactNode {
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local_handle_only')}`}
                data-test="m4-mercurius-relay-root"
            >
                <M4MercuriusRelayChip
                    kairosEnabled={this.relay.kairosEnabled}
                    lastRefreshIso={this.relay.lastRefreshIso}
                    deltaCount={this.relay.deltaCount}
                    pulseToken={this.relay.pulseToken}
                    connected={this.readiness.bridgeReachable}
                />
            </div>
        );
    }
}
