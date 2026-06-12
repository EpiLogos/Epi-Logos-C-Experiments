import * as React from 'react';

/**
 * Task 32.10 — Kairos enablement onboarding (closes O-WC-OB-6).
 *
 * Per FR-3, `KAIROS_ENABLED=false` is the canonical default: the live
 * astrological time-signal stays dark until the user explicitly opts in. The
 * cold-start orchestrator (32.1) reaches its optional "kairos refresh" stage,
 * reads {@link KAIROS_ENABLED_PREFERENCE}, and — when the preference is still
 * the default `false` — mounts this three-card enablement step as the post-PASU
 * branch.
 *
 * This module deliberately keeps its decision logic in small pure functions
 * ({@link shouldRefreshKairos}, {@link coldStartKairosBranch},
 * {@link runKairosEnable}, {@link runKairosSkip}, {@link relayReducer}) so the
 * FR-3 default-off law, the post-PASU cold-start branch, and the Mercurius
 * relay indicator (25.16) state machine can be verified without rendering
 * React.
 *
 * Cross-links:
 *  - 19.12 — Mercurius kairos populator (`M4_Temporal_Now.planet_degrees[10]`).
 *  - 25.16 — Mercurius relay indicator surface ("Kairos active — refreshed …").
 *  - 32.13 — onboarding-completion ledger (`kairos.enable` / `kairos.skip`).
 *  - FR-3  — graceful stub when kerykeion is unavailable.
 */

// ============================================================================
// Preference keys + ledger tokens (32.13)
// ============================================================================

/** Privacy preference that gates every kairos refresh. FR-3 default: `false`. */
export const KAIROS_ENABLED_PREFERENCE = 'epi-logos.privacy.kairos-enabled';

/** User preference controlling how often Mercurius should refresh kairos. */
export const KAIROS_REFRESH_INTERVAL_PREFERENCE = 'epi-logos.privacy.kairos-refresh-interval-minutes';

/** Onboarding ledger preference holding the list of completed/handled steps. */
export const ONBOARDING_COMPLETED_STEPS_PREFERENCE = 'epi-logos.onboarding.completed-steps';

/** Ledger token recorded when the user skips kairos enablement. */
export const KAIROS_SKIP_STEP = 'kairos.skip';

/** Ledger token recorded when the user enables kairos. */
export const KAIROS_ENABLE_STEP = 'kairos.enable';

/**
 * FR-3 canonical default. Kairos is OFF until explicit opt-in; nothing in the
 * cold-start path may flip this implicitly.
 */
export const KAIROS_ENABLED_DEFAULT = false as const;

/** Conservative default cadence for the optional live time-signal. */
export const KAIROS_REFRESH_INTERVAL_DEFAULT_MINUTES = 60;

/** Keep the UI bounded to practical refresh cadences. */
export const KAIROS_REFRESH_INTERVAL_MIN_MINUTES = 15;

/** Upper bound for users who want a very quiet kairos signal. */
export const KAIROS_REFRESH_INTERVAL_MAX_MINUTES = 360;

export type ColdStartKairosBranch = 'refresh' | 'mount-enablement';

/**
 * Mercurius kairos populator (19.12). On success it resolves the current planet
 * positions into `M4_Temporal_Now.planet_degrees[10]` and reports the refresh
 * timestamp the relay indicator (25.16) surfaces.
 */
export const MERCURIUS_REFRESH_RPC = 'nara.kairos.refresh';

// ============================================================================
// Preference helpers (FR-3 default-off law)
// ============================================================================

/**
 * Resolve the kairos-enabled preference to a strict boolean. Anything other
 * than a literal `true` — including `undefined`, `null`, `'false'`, `0` — reads
 * as disabled, enforcing the FR-3 default at every read site.
 */
export function readKairosEnabled(prefValue: unknown): boolean {
    return prefValue === true;
}

/**
 * Cold-start stage-6 gate. The orchestrator proceeds with a kairos refresh ONLY
 * when the preference has been explicitly set to `true`; otherwise it mounts the
 * enablement step instead. Equivalent to {@link readKairosEnabled} but named for
 * the orchestrator's decision site.
 */
export function shouldRefreshKairos(prefValue: unknown): boolean {
    return readKairosEnabled(prefValue);
}

/**
 * Cold-start stage 6 branch. Default-off means the orchestrator mounts the
 * enablement UI; an explicit true means it proceeds to Mercurius refresh.
 */
export function coldStartKairosBranch(prefValue: unknown): ColdStartKairosBranch {
    return shouldRefreshKairos(prefValue) ? 'refresh' : 'mount-enablement';
}

/** Normalise the user-controlled interval preference before persisting it. */
export function normalizeKairosRefreshInterval(value: unknown): number {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) {
        return KAIROS_REFRESH_INTERVAL_DEFAULT_MINUTES;
    }
    const rounded = Math.round(numeric);
    return Math.min(
        KAIROS_REFRESH_INTERVAL_MAX_MINUTES,
        Math.max(KAIROS_REFRESH_INTERVAL_MIN_MINUTES, rounded)
    );
}

/** Append a step token to the completed-steps ledger, de-duplicating. */
export function appendCompletedStep(
    existing: readonly string[] | undefined,
    step: string
): string[] {
    const base = Array.isArray(existing) ? existing : [];
    return base.includes(step) ? [...base] : [...base, step];
}

/**
 * Extract a refresh timestamp from the Mercurius populator payload, falling back
 * to the supplied clock when the gateway did not echo one.
 */
export function interpretRefreshTimestamp(raw: unknown, fallback: () => string): string {
    if (raw && typeof raw === 'object') {
        const record = raw as Record<string, unknown>;
        if (typeof record.refreshedAt === 'string') {
            return record.refreshedAt;
        }
        if (typeof record.timestamp === 'string') {
            return record.timestamp;
        }
    }
    return fallback();
}

// ============================================================================
// Mercurius relay indicator (25.16) — state machine
// ============================================================================

export type RelayPhase = 'idle' | 'refreshing' | 'active' | 'unavailable';

export interface RelayIndicatorState {
    readonly phase: RelayPhase;
    /** Refresh timestamp for the active phase; null otherwise. */
    readonly refreshedAt: string | null;
    /** Failure detail for the unavailable phase; null otherwise. */
    readonly message: string | null;
}

export type RelayAction =
    | { readonly type: 'begin-refresh' }
    | { readonly type: 'refresh-success'; readonly refreshedAt: string }
    | { readonly type: 'refresh-failure'; readonly message: string }
    | { readonly type: 'reset' };

export const INITIAL_RELAY_STATE: RelayIndicatorState = Object.freeze({
    phase: 'idle',
    refreshedAt: null,
    message: null
});

/**
 * Pure reducer for the relay indicator. The synthetic-enable path drives it
 * `idle → probing → active`; a failed probe drives `probing → unavailable`.
 */
export function relayReducer(state: RelayIndicatorState, action: RelayAction): RelayIndicatorState {
    switch (action.type) {
        case 'begin-refresh':
            return { phase: 'refreshing', refreshedAt: null, message: null };
        case 'refresh-success':
            return { phase: 'active', refreshedAt: action.refreshedAt, message: null };
        case 'refresh-failure':
            return { phase: 'unavailable', refreshedAt: null, message: action.message };
        case 'reset':
            return INITIAL_RELAY_STATE;
        default:
            return state;
    }
}

/** Human-readable relay label surfaced by the 25.16 indicator. */
export function relayIndicatorLabel(state: RelayIndicatorState): string {
    switch (state.phase) {
        case 'refreshing':
            return 'Mercurius initial kairos fetch in progress';
        case 'active':
            return `Kairos active - refreshed ${state.refreshedAt ?? ''}`.trim();
        case 'unavailable':
            return state.message ?? 'Mercurius initial kairos fetch did not complete';
        case 'idle':
        default:
            return 'Kairos disabled';
    }
}

// ============================================================================
// Onboarding-completion ledger derivation (32.13)
// ============================================================================

export type KairosLedgerEntry = typeof KAIROS_ENABLE_STEP | typeof KAIROS_SKIP_STEP;

/**
 * Derive which 32.13 ledger entries are recorded for the given preference state.
 * `kairos.enable` is keyed off the privacy preference (`kairos-enabled: true`);
 * `kairos.skip` is keyed off the completed-steps ledger.
 */
export function deriveKairosLedgerEntries(prefs: {
    readonly kairosEnabled: unknown;
    readonly completedSteps: readonly string[] | undefined;
}): KairosLedgerEntry[] {
    const entries: KairosLedgerEntry[] = [];
    if (readKairosEnabled(prefs.kairosEnabled)) {
        entries.push(KAIROS_ENABLE_STEP);
    }
    if (Array.isArray(prefs.completedSteps) && prefs.completedSteps.includes(KAIROS_SKIP_STEP)) {
        entries.push(KAIROS_SKIP_STEP);
    }
    return entries;
}

// ============================================================================
// Enable / skip orchestration (pure, dependency-injected)
// ============================================================================

export interface KairosStepServices {
    /** Bridge into {@link SharedBridgeAdapter.invokeGatewayRpc}. */
    readonly invokeGatewayRpc: (method: string, params: Record<string, unknown>) => Promise<unknown>;
    /** Persist a preference value (Theia PreferenceService at the call site). */
    readonly setPreference: (key: string, value: unknown) => void | Promise<void>;
    /** Read the current completed-steps ledger for skip de-duplication. */
    readonly getCompletedSteps?: () => readonly string[];
    /** Injectable clock for deterministic refresh timestamps in tests. */
    readonly nowIso?: () => string;
    /** Observe relay-indicator transitions (25.16 surface hook). */
    readonly onRelay?: (state: RelayIndicatorState) => void;
    /** Current interval selected by the user before enabling. */
    readonly refreshIntervalMinutes?: number;
}

export type KairosEnableOutcome = 'enabled' | 'refresh-failed';

export interface KairosEnableResult {
    readonly outcome: KairosEnableOutcome;
    readonly relay: RelayIndicatorState;
    readonly refreshIntervalMinutes: number;
    /** The completion ledger token, when the enable path succeeded. */
    readonly ledgerEntry?: typeof KAIROS_ENABLE_STEP;
}

function defaultNowIso(): string {
    return new Date().toISOString();
}

/**
 * Enable path (spec 32.10 "On enable"): persist the explicit opt-in and refresh
 * interval, trigger the Mercurius initial kairos fetch (19.12), then let the
 * cold-start orchestrator advance to stage 7 / ready through `onResolved`.
 */
export async function runKairosEnable(services: KairosStepServices): Promise<KairosEnableResult> {
    const nowIso = services.nowIso ?? defaultNowIso;
    const refreshIntervalMinutes = normalizeKairosRefreshInterval(services.refreshIntervalMinutes);
    const emit = (state: RelayIndicatorState): RelayIndicatorState => {
        services.onRelay?.(state);
        return state;
    };

    emit(relayReducer(INITIAL_RELAY_STATE, { type: 'begin-refresh' }));
    await services.setPreference(KAIROS_ENABLED_PREFERENCE, true);
    await services.setPreference(KAIROS_REFRESH_INTERVAL_PREFERENCE, refreshIntervalMinutes);

    try {
        const raw = await services.invokeGatewayRpc(MERCURIUS_REFRESH_RPC, {
            reason: 'cold-start-kairos-enable',
            refreshIntervalMinutes
        });
        const refreshedAt = interpretRefreshTimestamp(raw, nowIso);
        const relay = emit(relayReducer(INITIAL_RELAY_STATE, { type: 'refresh-success', refreshedAt }));
        return {
            outcome: 'enabled',
            relay,
            refreshIntervalMinutes,
            ledgerEntry: KAIROS_ENABLE_STEP
        };
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        const relay = emit(
            relayReducer(INITIAL_RELAY_STATE, {
                type: 'refresh-failure',
                message: `Mercurius initial kairos fetch did not complete: ${detail}`
            })
        );
        return { outcome: 'refresh-failed', relay, refreshIntervalMinutes };
    }
}

export interface KairosSkipResult {
    readonly outcome: 'skipped';
    readonly completedSteps: readonly string[];
}

/**
 * Skip path (spec 32.10 "On skip"): append `kairos.skip` to the completed-steps
 * ledger so the orchestrator advances and the user can enable later in Settings.
 */
export async function runKairosSkip(services: KairosStepServices): Promise<KairosSkipResult> {
    const existing = services.getCompletedSteps?.() ?? [];
    const completedSteps = appendCompletedStep(existing, KAIROS_SKIP_STEP);
    await services.setPreference(ONBOARDING_COMPLETED_STEPS_PREFERENCE, completedSteps);
    return { outcome: 'skipped', completedSteps };
}

// ============================================================================
// React component — three-card enablement sequence
// ============================================================================

interface KairosCard {
    readonly id: string;
    readonly title: string;
    readonly body: string;
    readonly items?: readonly string[];
}

/** The three explanatory cards, surfaced one at a time. */
export const KAIROS_CARDS: readonly KairosCard[] = Object.freeze([
    {
        id: 'what-kairos-is',
        title: 'What kairos is',
        body:
            'Kairos is the live astrological time-signal. When enabled, your widgets ' +
            'carry the current planet positions from kerykeion. Mercurius is the agent ' +
            'that fetches and routes them.'
    },
    {
        id: 'what-it-enables',
        title: 'What it enables',
        body: 'These features depend on the live kairos signal:',
        items: [
            'ambient-state-strip somatic signature',
            'Janus weighting',
            'chronos response-orbit saturnine mode',
            'cross-system bridge'
        ]
    },
    {
        id: 'enable-or-skip',
        title: 'Enable + control',
        body:
            'Use the switch to enable kairos and choose the refresh interval. On enable, ' +
            'Mercurius initial kairos fetch runs once and cold-start advances to ready.'
    }
]);

export interface KairosEnablementStepProps extends KairosStepServices {
    /** Fired once the user resolves the step (enable / skip / unavailable). */
    readonly onResolved?: (
        result: KairosEnableResult | KairosSkipResult
    ) => void;
    /** Test/host hook for mounting a specific card without click choreography. */
    readonly initialCardIndex?: number;
}

/**
 * Three-card enablement step. Cards 1–2 are explanatory ("Next" advances);
 * card 3 offers "Enable kairos" / "Continue without kairos". The enable button
 * runs {@link runKairosEnable} and renders either the active relay indicator
 * (25.16) or the FR-3 graceful stub inline.
 */
export const KairosEnablementStep: React.FC<KairosEnablementStepProps> = props => {
    const { onResolved, initialCardIndex = 0, ...services } = props;
    const [cardIndex, setCardIndex] = React.useState(() =>
        Math.min(KAIROS_CARDS.length - 1, Math.max(0, initialCardIndex))
    );
    const [busy, setBusy] = React.useState(false);
    const [relay, setRelay] = React.useState<RelayIndicatorState>(INITIAL_RELAY_STATE);
    const [resolved, setResolved] = React.useState<KairosEnableOutcome | 'skipped' | null>(null);
    const [enabledDraft, setEnabledDraft] = React.useState(false);
    const [refreshIntervalMinutes, setRefreshIntervalMinutes] = React.useState(() =>
        normalizeKairosRefreshInterval(services.refreshIntervalMinutes)
    );

    const card = KAIROS_CARDS[cardIndex];
    const isLastCard = cardIndex === KAIROS_CARDS.length - 1;

    const stepServices: KairosStepServices = {
        ...services,
        refreshIntervalMinutes,
        onRelay: state => {
            setRelay(state);
            services.onRelay?.(state);
        }
    };

    const handleEnable = React.useCallback(() => {
        setEnabledDraft(true);
        setBusy(true);
        void runKairosEnable(stepServices)
            .then(result => {
                setResolved(result.outcome);
                onResolved?.(result);
            })
            .finally(() => setBusy(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepServices]);

    const handleSkip = React.useCallback(() => {
        setBusy(true);
        void runKairosSkip(stepServices)
            .then(result => {
                setResolved('skipped');
                onResolved?.(result);
            })
            .finally(() => setBusy(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepServices]);

    return (
        <section
            className="mext-kairos-onboarding"
            role="group"
            aria-label="Kairos enablement"
            data-card={card.id}
            data-relay-phase={relay.phase}
        >
            <header className="mext-kairos-header">
                <span className="mext-kairos-glyph" aria-hidden="true">
                    ☿
                </span>
                <h1 className="mext-kairos-title">Kairos — live time-signal</h1>
                <span className="mext-kairos-progress" aria-hidden="true">
                    {cardIndex + 1} / {KAIROS_CARDS.length}
                </span>
            </header>

            <article className="mext-kairos-card">
                <h2 className="mext-kairos-card-title">{card.title}</h2>
                <p className="mext-kairos-card-body">{card.body}</p>
                {card.items && (
                    <ul className="mext-kairos-feature-list">
                        {card.items.map(item => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                )}
            </article>

            {isLastCard && (
                <div className="mext-kairos-controls">
                    <label className="mext-kairos-switch">
                        <input
                            type="checkbox"
                            role="switch"
                            checked={enabledDraft}
                            disabled={busy || resolved === 'enabled'}
                            onChange={event => setEnabledDraft(event.currentTarget.checked)}
                        />
                        <span>Enable kairos</span>
                    </label>
                    <label className="mext-kairos-interval">
                        <span>Refresh interval</span>
                        <input
                            type="number"
                            min={KAIROS_REFRESH_INTERVAL_MIN_MINUTES}
                            max={KAIROS_REFRESH_INTERVAL_MAX_MINUTES}
                            step={15}
                            value={refreshIntervalMinutes}
                            disabled={busy || resolved === 'enabled'}
                            onChange={event => setRefreshIntervalMinutes(normalizeKairosRefreshInterval(event.currentTarget.value))}
                        />
                        <span>minutes</span>
                    </label>
                </div>
            )}

            {relay.phase !== 'idle' && (
                <div
                    className={`mext-kairos-relay mext-kairos-relay-${relay.phase}`}
                    role="status"
                    aria-live="polite"
                >
                    {relayIndicatorLabel(relay)}
                </div>
            )}

            <footer className="mext-kairos-actions">
                {cardIndex > 0 && !resolved && (
                    <button
                        type="button"
                        className="theia-button secondary mext-kairos-back"
                        disabled={busy}
                        onClick={() => setCardIndex(index => Math.max(0, index - 1))}
                    >
                        Back
                    </button>
                )}

                {!isLastCard && (
                    <button
                        type="button"
                        className="theia-button mext-kairos-next"
                        disabled={busy}
                        onClick={() => setCardIndex(index => Math.min(KAIROS_CARDS.length - 1, index + 1))}
                    >
                        Next
                    </button>
                )}

                {isLastCard && resolved !== 'enabled' && (
                    <>
                        <button
                            type="button"
                            className="theia-button mext-kairos-enable"
                            disabled={busy || resolved === 'skipped'}
                            onClick={handleEnable}
                        >
                            Enable + fetch
                        </button>
                        <button
                            type="button"
                            className="theia-button secondary mext-kairos-skip"
                            disabled={busy}
                            onClick={handleSkip}
                        >
                            Continue without kairos
                        </button>
                    </>
                )}
            </footer>
        </section>
    );
};
