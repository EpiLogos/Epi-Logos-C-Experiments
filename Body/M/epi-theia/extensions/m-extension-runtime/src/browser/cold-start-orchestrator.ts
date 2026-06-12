import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { PreferenceService } from '@theia/core/lib/browser/preferences';
import { Disposable } from '../common/bridge-api';
import { ConnectionStatus, MathemeHarmonicProfileBoundary } from '../common/profile';
import { MExtensionReadinessSnapshot, readinessSeverity } from '../common/readiness';
import { SharedBridgeAdapter } from '../common/shared-bridge';
import {
    coldStartKairosBranch,
    KAIROS_ENABLED_DEFAULT,
    KAIROS_ENABLED_PREFERENCE,
    KAIROS_REFRESH_INTERVAL_DEFAULT_MINUTES,
    KAIROS_REFRESH_INTERVAL_PREFERENCE,
    MERCURIUS_REFRESH_RPC,
    normalizeKairosRefreshInterval
} from './onboarding/kairos-enablement-step';

/**
 * Six discrete cold-start states. The orchestrator never collapses these to a
 * binary loading/loaded flag — the splash renderer switches on the literal
 * state so the user sees exactly which step of the playbook is in flight.
 */
export type ColdStartState =
    | 'initializing'
    | 'awaiting-bridge'
    | 'awaiting-handshake'
    | 'awaiting-readiness'
    | 'pasu-identity'
    | 'kairos-enablement'
    | 'splash-visible'
    | 'dismissed';

/**
 * How stage 6 (the optional kairos refresh) was un-suspended after a pre-stage-6
 * identity gate (task 32.2's PASU-absence check) held it. Recorded purely for
 * inspection/observability; the state machine only cares that suspension lifted.
 *
 *  - `pasu-present`  — PASU was found; the wizard never opened, stage 6 proceeds.
 *  - `fresh-pasu`    — the PASU wizard completed; stage 6 resumes with new data.
 *  - `fr3-stub`      — the wizard was fully skipped (or unavailable); stage 6
 *                      advances on the FR-3 graceful stub, no live identity.
 */
export type Stage6ResumeMode = 'pasu-present' | 'fresh-pasu' | 'fr3-stub';

/** A pre-stage-6 gate. Invoked once when the readiness gate first clears. */
export type PreStage6Gate = () => void;

/**
 * Monotonic stage order. Used only for documentation/ordinal comparison; the
 * authoritative transition is the pure `computeStage` function below, which is
 * a deterministic mapping from the latest readiness-ledger snapshot to a state.
 */
export const COLD_START_STAGE_ORDER: readonly ColdStartState[] = Object.freeze([
    'initializing',
    'awaiting-bridge',
    'awaiting-handshake',
    'awaiting-readiness',
    'pasu-identity',
    'kairos-enablement',
    'splash-visible',
    'dismissed'
]);

/**
 * ColdStartOrchestrator — single driver for the cold-start splash lifecycle.
 *
 * It is a passive consumer of the kernel-bridge readiness ledger via the
 * {@link SharedBridgeAdapter} singleton; it is NOT a
 * `FrontendApplicationContribution`. It advances through a six-step playbook
 * purely in reaction to the adapter's profile / connection / readiness streams:
 *
 *   a) bridge initialization              → 'initializing'
 *   b) kernel-bridge subscription         → 'awaiting-bridge'
 *   c) S2/S3 handshake verification       → 'awaiting-handshake'
 *   d) M-extension readiness gate eval    → 'awaiting-readiness'
 *   e) PASU-identity gate (task 32.2)     → 'pasu-identity' | proceed
 *   f) optional kairos refresh gate       → 'kairos-enablement' | refresh
 *   g) cold-start splash render decision  → 'splash-visible'
 *   h) first-profile delivery → dismiss   → 'dismissed'
 *
 * The state advance is deterministic: feeding the same synthetic readiness
 * ledger stream through the adapter always yields the same state sequence.
 */
@injectable()
export class ColdStartOrchestrator {
    @inject(SharedBridgeAdapter) protected readonly adapter!: SharedBridgeAdapter;
    @inject(PreferenceService) protected readonly preferences!: PreferenceService;

    private state: ColdStartState = 'initializing';
    private started = false;
    private dismissed = false;
    private kairosResolved = false;
    private kairosRefreshRequested = false;

    // ----------------------------------------------------------------------
    // Task 32.2 — PASU-absence identity gate (stage 5, pre-kairos).
    //
    // When the readiness gate (stage 4) first clears, the orchestrator fires any
    // registered pre-stage-6 gates exactly once. A gate (m4-nara's PASU-absence
    // check) may call {@link suspendStage6} to hold the optional kairos refresh
    // while the PASU identity wizard (owned by Tranche 25.4) is up, then call
    // {@link resumeStage6} on skip/completion. With no gate registered the
    // pipeline flows straight into stage 6 exactly as before.
    // ----------------------------------------------------------------------
    private identityGates = new Set<PreStage6Gate>();
    private identityGatesFired = false;
    private stage6Suspended = false;
    private stage6ResumeMode: Stage6ResumeMode | null = null;

    /**
     * Set the first time a renderable readiness signal (non-blocked severity)
     * or a delivered profile is observed. Gates the splash's dismiss button so
     * the user may dismiss on first-ready even while other stages stay blocked.
     */
    private firstReadySeen = false;

    private subscriptions: Disposable[] = [];
    private stateListeners = new Set<(state: ColdStartState) => void>();

    @postConstruct()
    protected init(): void {
        this.start();
    }

    /**
     * Subscribe to the readiness ledger and run the first reconciliation. The
     * adapter replays its cached profile/status/readiness to each listener on
     * subscribe, so this immediately settles to the correct stage. Idempotent.
     */
    start(): void {
        if (this.started) {
            return;
        }
        this.started = true;

        this.subscriptions.push(
            this.adapter.onReadiness((snapshot: MExtensionReadinessSnapshot) => {
                void snapshot;
                this.reconcile();
            })
        );
        this.subscriptions.push(
            this.adapter.onConnectionStatus((status: ConnectionStatus) => {
                void status;
                this.reconcile();
            })
        );
        this.subscriptions.push(
            this.adapter.onProfile((profile: MathemeHarmonicProfileBoundary | null) => {
                void profile;
                this.reconcile();
            })
        );

        this.reconcile();
    }

    /** Current cold-start state. */
    currentStage(): ColdStartState {
        return this.state;
    }

    /**
     * Whether the dismiss affordance should be active. True once the first
     * ready signal lands, regardless of whether downstream stages are blocked.
     */
    canDismiss(): boolean {
        return this.firstReadySeen && !this.dismissed;
    }

    /**
     * Force the splash dismissed. Sticky — explicit user dismissal (or the
     * first-profile delivery in step f) ends the cold-start session.
     */
    dismiss(): void {
        if (this.dismissed) {
            return;
        }
        this.dismissed = true;
        this.transitionTo('dismissed');
    }

    /**
     * Called by the mounted KairosEnablementStep after the user either enables
     * kairos or intentionally continues without it. Stage 7 is ready/dismissed.
     */
    completeKairosEnablement(): void {
        this.kairosResolved = true;
        this.dismiss();
    }

    /**
     * Register a pre-stage-6 identity gate. Gates fire exactly once, the first
     * time the readiness gate clears (stage 4 → ready), before the optional
     * kairos refresh. The returned disposable removes the gate. Idempotent
     * registration of the same gate is a no-op.
     */
    registerStage6Gate(gate: PreStage6Gate): Disposable {
        this.identityGates.add(gate);
        return { dispose: () => this.identityGates.delete(gate) };
    }

    /**
     * Suspend stage 6 (the optional kairos refresh). Called synchronously by a
     * pre-stage-6 gate while it resolves identity (PASU presence) so the splash
     * holds at `'pasu-identity'` instead of racing ahead into kairos. No-op once
     * stage 6 has already resolved or the splash is dismissed.
     */
    suspendStage6(): void {
        if (this.kairosResolved || this.dismissed || this.stage6Suspended) {
            return;
        }
        this.stage6Suspended = true;
        this.reconcile();
    }

    /**
     * Lift a stage-6 suspension and record how it resolved. The state machine
     * only cares that suspension cleared; {@link mode} is retained for
     * inspection ({@link stage6ResolvedAs}). No-op when not suspended.
     */
    resumeStage6(mode: Stage6ResumeMode): void {
        if (!this.stage6Suspended) {
            return;
        }
        this.stage6ResumeMode = mode;
        this.stage6Suspended = false;
        this.reconcile();
    }

    /** Whether stage 6 is currently held by a pre-stage-6 gate. */
    isStage6Suspended(): boolean {
        return this.stage6Suspended;
    }

    /** How stage 6 was last resumed, or null if it was never suspended. */
    stage6ResolvedAs(): Stage6ResumeMode | null {
        return this.stage6ResumeMode;
    }

    /**
     * Subscribe to state transitions. Replays the current state immediately so
     * late subscribers (e.g. a freshly mounted splash) agree on the stage.
     */
    onStateChange(listener: (state: ColdStartState) => void): Disposable {
        this.stateListeners.add(listener);
        listener(this.state);
        return { dispose: () => this.stateListeners.delete(listener) };
    }

    dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        this.subscriptions = [];
        this.stateListeners.clear();
    }

    /**
     * Deterministic reconciliation against the latest ledger snapshot. Pure
     * function of (started, dismissed, status, readiness, profile) — same
     * stream in, same stage out.
     */
    private reconcile(): void {
        const { status, readiness, profile } = this.adapter.currentSnapshot();

        if (profile || readinessSeverity(readiness.state) !== 'blocked') {
            this.firstReadySeen = true;
        }

        this.transitionTo(this.computeStage(status, readiness, profile));
    }

    private computeStage(
        status: ConnectionStatus,
        readiness: MExtensionReadinessSnapshot,
        profile: MathemeHarmonicProfileBoundary | null
    ): ColdStartState {
        // (h) Dismissal is sticky for the lifetime of the cold-start session.
        if (this.dismissed) {
            return 'dismissed';
        }
        // (a) Pre-subscription: bridge not yet initialized.
        if (!this.started) {
            return 'initializing';
        }
        // (b) Subscribed, but the bridge has produced no reachable signal yet.
        if (!readiness.bridgeReachable && !status.connected) {
            return 'awaiting-bridge';
        }
        // (c) Bridge reachable, but the S2/S3 handshake has not connected.
        if (!status.connected) {
            return 'awaiting-handshake';
        }
        // (d) Handshake up, but the readiness gate is still blocked.
        if (readinessSeverity(readiness.state) === 'blocked') {
            return 'awaiting-readiness';
        }

        // (e) Stage 5: PASU-identity gate. On the first readiness-clear, fire any
        // registered pre-stage-6 gates exactly once. A gate may suspend stage 6
        // (PASU absent → wizard up); while suspended the splash holds here.
        if (!this.kairosResolved) {
            this.fireIdentityGatesOnce();
            if (this.stage6Suspended) {
                return 'pasu-identity';
            }
        }

        // (f) Stage 6: optional kairos refresh, default-off per FR-3.
        if (!this.kairosResolved) {
            const prefValue = this.preferences.get<boolean>(
                KAIROS_ENABLED_PREFERENCE,
                KAIROS_ENABLED_DEFAULT
            );
            if (coldStartKairosBranch(prefValue) === 'mount-enablement') {
                return 'kairos-enablement';
            }
            this.kairosResolved = true;
            this.triggerMercuriusInitialFetch();
        }

        // (h) First-profile delivery dismisses the splash once stage 6 resolves.
        if (profile) {
            return 'dismissed';
        }

        // (g) Gate evaluated as renderable — show the splash until a profile lands.
        return 'splash-visible';
    }

    /**
     * Fire every registered pre-stage-6 gate exactly once. Gate side effects
     * (the PASU `nara.pasu.show` probe, `m4.openPasuWizard` dispatch) must never
     * trap cold-start, so a throwing gate is swallowed and stage 6 proceeds.
     */
    private fireIdentityGatesOnce(): void {
        if (this.identityGatesFired) {
            return;
        }
        this.identityGatesFired = true;
        for (const gate of this.identityGates) {
            try {
                gate();
            } catch {
                // best-effort — a failed identity gate never blocks the pipeline.
            }
        }
    }

    private triggerMercuriusInitialFetch(): void {
        if (this.kairosRefreshRequested) {
            return;
        }
        this.kairosRefreshRequested = true;
        const refreshIntervalMinutes = normalizeKairosRefreshInterval(
            this.preferences.get<number>(
                KAIROS_REFRESH_INTERVAL_PREFERENCE,
                KAIROS_REFRESH_INTERVAL_DEFAULT_MINUTES
            )
        );
        void this.adapter.invokeGatewayRpc(MERCURIUS_REFRESH_RPC, {
            reason: 'cold-start-stage-6',
            refreshIntervalMinutes
        }).catch(() => {
            // Stage 6 is optional; the relay indicator owns visible fetch errors.
        });
    }

    private transitionTo(next: ColdStartState): void {
        if (next === 'dismissed') {
            this.dismissed = true;
        }
        if (next === this.state) {
            return;
        }
        this.state = next;
        for (const listener of this.stateListeners) {
            listener(next);
        }
    }
}
