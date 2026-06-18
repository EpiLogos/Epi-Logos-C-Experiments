// 08.T5 jiva-siva slice — hand-extended from the 08.T1 scaffold.
// The scaffolder will no longer overwrite this file (see
// scripts/scaffold-integrated-plugins.mjs PRESERVE_HANDWRITTEN).
import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    MExtensionId,
    MathemeHarmonicProfileBoundary,
    MObservabilityEvent,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    CLOSED_EPII_REVIEW_STATE,
    EpiiActionId,
    EpiiReviewSurfaceState,
    CompositionCoordinator,
    ConsentAction,
    ConsentGate,
    findNamedLayout,
    IntegratedContributorRecord,
    IntegratedEmptyState,
    buildEmptyState,
    withPanelMode,
    withReviewInboxCount,
    type IdentityAugmentReviewProposal,
    type RoutedIdentityAugmentReviewProposal
} from '@pratibimba/integrated-composition';
import { EpiiReviewPanel } from './epii-review-panel';
import { PersonalRecognitionComposition } from './personal-recognition-composition';
import {
    routePluginIdentityAugmentProposalThroughM5Gate
} from './identity-augment-review-routing';
import {
    DepositHandleReceptionResult,
    NaraJournalDepositReceipt,
    NaraJournalDepositReception
} from './deposit-handle-reception';
import { PLUGIN_ID, CONTRIBUTOR_IDS } from '../common';

@injectable()
export class PluginIntegrated450Widget extends ReactWidget {
    static readonly ID = 'plugin-integrated-4-5-0.primary';
    static readonly LABEL = 'Jiva-Siva';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected coordinator: CompositionCoordinator = new CompositionCoordinator(
        findNamedLayout('plugin-integrated-4-5-0')
    );
    protected consentGate: ConsentGate = new ConsentGate();
    protected contributorRecords: readonly IntegratedContributorRecord[] = [];
    protected currentProfile: MathemeHarmonicProfileBoundary | null = null;
    protected subscriptions: Disposable[] = [];
    /** Epii review pane state — defaults to closed per 08.T6 deliverable 4. */
    protected epiiReviewState: EpiiReviewSurfaceState = CLOSED_EPII_REVIEW_STATE;
    protected naraJournalDepositReception = new NaraJournalDepositReception();
    protected sessionCloseEvent: MObservabilityEvent | null = null;

    @postConstruct()
    protected init(): void {
        this.id = PluginIntegrated450Widget.ID;
        this.title.label = PluginIntegrated450Widget.LABEL;
        this.title.caption = PluginIntegrated450Widget.LABEL;
        this.title.closable = true;
        this.addClass('integrated-widget');
        this.addClass('integrated-widget-' + PLUGIN_ID);

        this.subscriptions.push(
            this.bridge.onReadiness(() => this.update())
        );
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.currentProfile = profile;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onObservabilityEvent(event => this.handleObservabilityEvent(event))
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try { sub.dispose(); } catch { /* best-effort */ }
        }
        super.dispose();
    }

    setContributors(records: readonly IntegratedContributorRecord[]): void {
        this.contributorRecords = records;
        this.update();
    }

    /** Hook for the S5 consent service to deliver records into the gate. */
    consentGateRef(): ConsentGate {
        return this.consentGate;
    }

    /** Summon / dismiss the Epii review panel (08.T6 deliverable 4). */
    setEpiiReviewMode(mode: EpiiReviewSurfaceState['mode']): void {
        this.epiiReviewState = withPanelMode(this.epiiReviewState, mode, Date.now());
        this.update();
    }

    /** Track 04 / S5 push: refresh inbox count; auto-summon on growth. */
    setReviewInboxCount(count: number): void {
        this.epiiReviewState = withReviewInboxCount(this.epiiReviewState, count, Date.now());
        this.update();
    }

    epiiReviewStateRef(): EpiiReviewSurfaceState {
        return this.epiiReviewState;
    }

    routeIdentityAugmentProposalToM5Review(
        proposal: IdentityAugmentReviewProposal
    ): RoutedIdentityAugmentReviewProposal {
        const routed = routePluginIdentityAugmentProposalThroughM5Gate(
            this.epiiReviewState,
            proposal,
            Date.now()
        );
        this.epiiReviewState = routed.state;
        this.update();
        return routed;
    }

    naraJournalDepositsRef(): readonly NaraJournalDepositReceipt[] {
        return this.naraJournalDepositReception.entries();
    }

    protected handleObservabilityEvent(event: MObservabilityEvent): void {
        const eventKind = typeof event.payload.kind === 'string' ? event.payload.kind : event.type;
        if (event.type === 'm5.session.contemplation.complete' || eventKind === 'm5.session.contemplation.complete') {
            this.sessionCloseEvent = event;
            this.update();
        }
        const result = this.naraJournalDepositReception.receive(event);
        if (result.status !== 'ignored') {
            this.publishDepositHandoffResult(result);
        }
    }

    protected publishDepositHandoffResult(
        result: Exclude<DepositHandleReceptionResult, { readonly status: 'ignored' }>
    ): void {
        this.bridge.publish(result.event);
        if (result.status === 'accepted') {
            this.update();
        }
    }

    protected handleEpiiAction(_action: EpiiActionId): void {
        // Real Epii action routing happens in epii-review-actions.ts. The
        // widget owns the UI dispatch; bridge wiring is deferred until the
        // S5 service is plumbed (Track 04 T6+).
        // For now the button click is a no-op visible in the UI — it does
        // NOT silently fabricate a submission.
    }

    protected handleDeepOpen(action: ConsentAction): void {
        // Single chokepoint for protected deep actions. The gate throws on
        // missing/expired consent — we surface the failure but never bypass.
        try {
            this.consentGate.require(action);
            // When the gate accepts, the actual deep-open routine lives in a
            // Track 04-owned service that is not yet plumbed. For 08.T5 we
            // log and return — the public default view never reaches this
            // branch unless a real consent record has been installed.
        } catch {
            // Drop silently in the UI; the disabled state already explains
            // why the button is unavailable.
        }
    }

    protected override render(): React.ReactNode {
        const required = CONTRIBUTOR_IDS as readonly MExtensionId[];
        const present = this.contributorRecords.map(r => r.extensionId);
        const allContributorsPresent = required.every(id => present.includes(id));

        if (!allContributorsPresent || !this.currentProfile) {
            const aggregate = this.coordinator.aggregateReadiness(this.contributorRecords);
            const view = buildEmptyState(
                this.coordinator.layout,
                aggregate,
                required,
                present
            );
            return (
                <div className="integrated-widget-root">
                    <IntegratedEmptyState
                        view={view}
                        title={PluginIntegrated450Widget.LABEL}
                    />
                </div>
            );
        }

        return (
            <div className="integrated-widget-root">
                <PersonalRecognitionComposition
                    profile={this.currentProfile}
                    sessionCloseEvent={this.sessionCloseEvent}
                />
                <EpiiReviewPanel
                    state={this.epiiReviewState}
                    onAction={action => this.handleEpiiAction(action)}
                    onDismiss={() => this.setEpiiReviewMode('closed')}
                />
            </div>
        );
    }
}
