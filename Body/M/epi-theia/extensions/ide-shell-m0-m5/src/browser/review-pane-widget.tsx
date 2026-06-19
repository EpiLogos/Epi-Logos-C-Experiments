import * as React from 'react';
import { CommandService } from '@theia/core';
import { injectable, inject, optional, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { BridgeReadinessBadge } from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import type { CrossLayoutIntent, IntentPrivacyClass } from '@pratibimba/pratibimba-layouts';
import {
    enforcePiReviewRoutingGate
} from '@pratibimba/m-extension-runtime/lib/common/recursive-self-review-gate';
import { EXTENSION_ID, IDE_SHELL_INTENT_TARGETS, IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import { IdeShellBridgeGate } from './bridge-gate';
import { PrivacyDropFeed } from './services/privacy-drop-feed';

const CROSS_LAYOUT_INTENT_DISPATCH_COMMAND = 'pratibimba.intent.dispatch' as const;

type IOD17ParityState = 'human-required' | 'agent-allowed' | 'unset';

type ReviewCrossLayoutIntent = CrossLayoutIntent & {
    readonly requestedSessionKey?: string;
    readonly requestedEvidenceRecordId?: string;
};

/**
 * Review pane — Track 05 T4.
 *
 * Surface for S5 review DTOs (epii-review-core). The pane consumes the
 * `s5'.review.inbox` / `s5'.review.history` gateway methods via
 * `KERNEL_BRIDGE_API.invokeCapability`. Human-required transitions are
 * enforced: an item with `humanRequired === true` cannot be approved /
 * rejected / revised by an agent — the pane disables those affordances and
 * shows a banner. (The gateway also enforces this; the UI parity is part of
 * T8's verification.)
 */
export interface ReviewItem {
    readonly id: string;
    readonly title: string;
    readonly status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'revised' | string;
    readonly humanRequired: boolean;
    readonly recursiveSelfReview?: boolean;
    readonly actor?: string;
    readonly privacyClass?: string;
    readonly proposer?: string;
    readonly coordinate?: string;
    readonly summary?: string;
    readonly axiomTranslationQuestion?: string;
    readonly axiomTranslationSessionId?: string;
}

export interface ReviewItemDeep extends ReviewItem {
    readonly iod17Parity: {
        readonly capabilityMatrixState: IOD17ParityState;
        readonly agentContractState: IOD17ParityState;
        readonly widgetState: IOD17ParityState;
        readonly inParity: boolean;
    };
    readonly dispatchGenealogyRef: string;
    readonly mediatedRunEvidencePacketId?: string;
}

@injectable()
export class ReviewPaneWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.REVIEW_PANE;
    static readonly LABEL = 'Review Pane';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(PrivacyDropFeed)
    protected readonly privacyDropFeed!: PrivacyDropFeed;

    @inject(CommandService) @optional()
    protected readonly commandService?: CommandService;

    protected items: ReviewItemDeep[] = [];
    protected lastError: string | null = null;
    protected highlightedReviewId: string | null = null;
    protected lastCrossLayoutIntent: ReviewCrossLayoutIntent | null = null;

    @postConstruct()
    protected init(): void {
        this.id = ReviewPaneWidget.ID;
        this.title.label = ReviewPaneWidget.LABEL;
        this.title.caption = ReviewPaneWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-review-pane');
    }

    async refreshInbox(): Promise<void> {
        try {
            const receipt = await this.bridge.invokeCapability({
                method: 'invokeGatewayRpc',
                sessionKey: 'ide-shell-review-pane',
                params: { gatewayMethod: "s5'.review.inbox" },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: [],
                vak: null
            });
            if (!isPrivacySafe(receipt.privacyClass)) {
                this.recordPrivacyDrop(receipt.privacyClass);
                this.items = [];
                this.lastError = `Privacy class "${receipt.privacyClass}" rejected by ide-shell gate`;
            } else {
                const list = Array.isArray(receipt.artifact)
                    ? (receipt.artifact as ReviewItem[])
                    : (receipt.artifact as { items?: ReviewItem[] } | undefined)?.items ?? [];
                const accepted: ReviewItemDeep[] = [];
                for (const it of list) {
                    if (isPrivacySafe(it.privacyClass)) {
                        accepted.push(this.toDeepReviewItem(it));
                    } else {
                        this.recordPrivacyDrop(it.privacyClass);
                    }
                }
                this.items = accepted;
                this.lastError = null;
            }
        } catch (err) {
            this.lastError = err instanceof Error ? err.message : String(err);
        }
        this.update();
    }

    /** Direct setter for tests + intent dispatch. */
    setItems(items: readonly ReviewItem[]): void {
        const accepted: ReviewItemDeep[] = [];
        for (const it of items) {
            if (isPrivacySafe(it.privacyClass)) {
                accepted.push(this.toDeepReviewItem(it));
            } else {
                this.recordPrivacyDrop(it.privacyClass);
            }
        }
        this.items = accepted;
        this.update();
    }

    get visibleItemCount(): number {
        return this.items.length;
    }

    protected get privacyDropped(): number {
        return this.privacyDropFeed.aggregate.byWidget[this.id] ?? 0;
    }

    protected recordPrivacyDrop(privacyClass: string | null | undefined): void {
        this.privacyDropFeed.record(this.id, privacyClass as string);
    }

    highlightReviewItem(reviewId: string): void {
        this.highlightedReviewId = reviewId;
        this.update();
        window.setTimeout(() => {
            const selector = `[data-test="review-item-${CSS.escape(reviewId)}"]`;
            document.querySelector(selector)?.scrollIntoView({
                block: 'center',
                behavior: 'smooth'
            });
        }, 0);
    }

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate bridge={this.bridge} widgetLabel={ReviewPaneWidget.LABEL}>
                {this.renderPane()}
            </IdeShellBridgeGate>
        );
    }

    protected renderPane(): React.ReactNode {
        return (
            <div className="ide-shell-widget-root" data-test="review-pane-root">
                <header className="ide-shell-widget-header">
                    <h3>{ReviewPaneWidget.LABEL}</h3>
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="s5'.review.inbox"
                    />
                    <span data-test="review-pane-count">{this.items.length} item(s)</span>
                    <span data-test="review-pane-privacy-dropped">
                        privacy-dropped: {this.privacyDropped}
                    </span>
                </header>
                {this.lastError !== null && (
                    <p className="ide-shell-error" data-test="review-pane-error">
                        {this.lastError}
                    </p>
                )}
                {this.items.length === 0 ? (
                    <p className="ide-shell-widget-empty" data-test="review-pane-empty">
                        Inbox empty. Refresh via the agentic control room run flow.
                    </p>
                ) : (
                    <ul data-test="review-pane-list">
                        {this.items.map(item => this.renderReviewItem(item))}
                    </ul>
                )}
            </div>
        );
    }

    protected renderReviewItem(item: ReviewItemDeep): React.ReactNode {
        const gate = enforcePiReviewRoutingGate({
            decision: 'applied',
            humanRequired: item.humanRequired,
            actorIsHuman: false,
            recursiveSelfReview: item.recursiveSelfReview,
            actor: item.actor ?? item.proposer
        });
        return (
            <li
                key={item.id}
                data-test={`review-item-${item.id}`}
                data-status={item.status}
                data-human-required={item.humanRequired ? 'true' : 'false'}
                data-recursive-self-review={item.recursiveSelfReview ? 'true' : 'false'}
                data-applied-verdict-gated={gate.ok ? 'false' : 'true'}
                data-iod17-in-parity={item.iod17Parity.inParity ? 'true' : 'false'}
                data-dispatch-genealogy-ref={item.dispatchGenealogyRef}
                data-mediated-run-evidence-packet-id={item.mediatedRunEvidencePacketId ?? ''}
                data-highlighted={this.highlightedReviewId === item.id ? 'true' : 'false'}
                className={this.highlightedReviewId === item.id ? 'ide-shell-intent-highlight' : undefined}
            >
                <strong>{item.title}</strong>
                <span> — status: {item.status}</span>
                {this.renderIOD17ParityMatrix(item)}
                {!item.iod17Parity.inParity && (
                    <p
                        className="ide-shell-error"
                        data-test={`review-item-iod17-parity-violation-${item.id}`}
                    >
                        IOD-17 parity violated — gateway will reject any transition
                    </p>
                )}
                {!gate.ok && (
                    <p
                        className="ide-shell-human-required"
                        data-test={`review-item-human-required-banner-${item.id}`}
                    >
                        {gate.reason}
                        <br />
                        <span data-test={`review-item-human-required-parity-status-${item.id}`}>
                            IOD-17 parity: {item.iod17Parity.inParity ? 'in parity' : 'violated'}
                        </span>
                    </p>
                )}
                {item.coordinate && (
                    <p>
                        coordinate: <code>{item.coordinate}</code>
                    </p>
                )}
                {item.summary && <p>{item.summary}</p>}
                {(item.axiomTranslationQuestion || item.axiomTranslationSessionId) && (
                    <p>
                        <a
                            href={`epi-logos://ide/ide-shell-m0-m5/pi-axiom-translation?${
                                item.axiomTranslationSessionId
                                    ? `session=${encodeURIComponent(item.axiomTranslationSessionId)}`
                                    : `question=${encodeURIComponent(item.axiomTranslationQuestion ?? '')}`
                            }`}
                            data-intent-target="pi-axiom-translation"
                            data-test={`review-item-pi-axiom-link-${item.id}`}
                        >
                            PiAxiomTranslationInspector
                        </a>
                    </p>
                )}
                <nav aria-label={`Review item ${item.id} cross-layout actions`}>
                    <button
                        type="button"
                        data-test={`review-item-dispatch-tree-${item.id}`}
                        data-dispatch-genealogy-ref={item.dispatchGenealogyRef}
                        onClick={() => this.openDispatchTree(item)}
                    >
                        View dispatch tree -&gt;
                    </button>
                    {item.mediatedRunEvidencePacketId && (
                        <button
                            type="button"
                            data-test={`review-item-evidence-${item.id}`}
                            data-evidence-packet-id={item.mediatedRunEvidencePacketId}
                            onClick={() => this.openEvidenceRecord(item)}
                        >
                            View evidence -&gt;
                        </button>
                    )}
                </nav>
            </li>
        );
    }

    protected renderIOD17ParityMatrix(item: ReviewItemDeep): React.ReactNode {
        const cells = [
            ['capability-matrix', item.iod17Parity.capabilityMatrixState],
            ['agent-contract', item.iod17Parity.agentContractState],
            ['widget', item.iod17Parity.widgetState]
        ] as const;
        return (
            <section
                data-test={`review-item-iod17-parity-matrix-${item.id}`}
                data-iod17-in-parity={item.iod17Parity.inParity ? 'true' : 'false'}
                aria-label={`IOD-17 parity for ${item.title}`}
            >
                <h4>IOD-17 parity</h4>
                <dl>
                    {cells.map(([label, state]) => {
                        const ok = this.parityCellMatchesExpectation(item.humanRequired, state);
                        return (
                            <React.Fragment key={label}>
                                <dt>{label}</dt>
                                <dd
                                    data-test={`review-item-iod17-parity-${label}-${item.id}`}
                                    data-parity-state={state}
                                    data-parity-ok={ok ? 'true' : 'false'}
                                    data-parity-indicator={ok ? 'green-check' : 'red-x'}
                                    className={ok ? 'ide-shell-parity-ok' : 'ide-shell-error'}
                                    style={ok ? { color: '#168a45' } : undefined}
                                >
                                    {ok ? '✓' : 'X'} — {state}
                                </dd>
                            </React.Fragment>
                        );
                    })}
                    <dt>aggregate</dt>
                    <dd
                        data-test={`review-item-iod17-parity-aggregate-${item.id}`}
                        data-parity-state={item.iod17Parity.inParity ? 'in-parity' : 'violated'}
                        data-parity-indicator={item.iod17Parity.inParity ? 'green-check' : 'red-x'}
                        className={item.iod17Parity.inParity ? 'ide-shell-parity-ok' : 'ide-shell-error'}
                        style={item.iod17Parity.inParity ? { color: '#168a45' } : undefined}
                    >
                        {item.iod17Parity.inParity ? '✓ — in parity' : 'X — parity violated'}
                    </dd>
                </dl>
            </section>
        );
    }

    protected parityCellMatchesExpectation(
        humanRequired: boolean,
        state: IOD17ParityState
    ): boolean {
        return humanRequired ? state === 'human-required' : state === 'agent-allowed';
    }

    protected openDispatchTree(item: ReviewItemDeep): void {
        this.emitCrossLayoutIntent({
            ...this.baseIntent(item),
            sessionKey: item.dispatchGenealogyRef,
            requestedSessionKey: item.dispatchGenealogyRef,
            requestedExtensionId: EXTENSION_ID,
            requestedContributionId: IDE_SHELL_INTENT_TARGETS.AGENTIC_CONTROL_ROOM,
            reason: 'Review pane dispatch genealogy click-through'
        });
    }

    protected openEvidenceRecord(item: ReviewItemDeep): void {
        if (!item.mediatedRunEvidencePacketId) {
            return;
        }
        this.emitCrossLayoutIntent({
            ...this.baseIntent(item),
            requestedExtensionId: EXTENSION_ID,
            requestedContributionId: IDE_SHELL_INTENT_TARGETS.EVIDENCE_PANEL,
            requestedEvidenceRecordId: item.mediatedRunEvidencePacketId,
            reason: 'Review pane evidence packet click-through'
        });
    }

    protected emitCrossLayoutIntent(intent: ReviewCrossLayoutIntent): void {
        this.lastCrossLayoutIntent = intent;
        void this.commandService?.executeCommand(CROSS_LAYOUT_INTENT_DISPATCH_COMMAND, intent);
    }

    protected baseIntent(item: ReviewItemDeep): CrossLayoutIntent {
        return {
            coordinate: item.coordinate ?? null,
            artifactUri: null,
            reviewId: item.id,
            dayNow: null,
            sessionKey: item.dispatchGenealogyRef,
            profileGeneration: this.bridge.cachedProfile?.generation ?? null,
            privacyClass: this.intentPrivacyClass(item.privacyClass),
            requestedLayout: 'ide-deep',
            requestedExtensionId: null,
            requestedContributionId: null
        };
    }

    protected intentPrivacyClass(privacyClass: string | null | undefined): IntentPrivacyClass | null {
        if (!privacyClass) {
            return null;
        }
        if (privacyClass === 'public' || privacyClass === 'protected' || privacyClass === 'private') {
            return privacyClass;
        }
        if (privacyClass.includes('private')) {
            return 'private';
        }
        if (privacyClass.includes('protected')) {
            return 'protected';
        }
        return 'public';
    }

    protected toDeepReviewItem(item: ReviewItem): ReviewItemDeep {
        const candidate = item as ReviewItem & Partial<ReviewItemDeep>;
        return {
            ...item,
            iod17Parity: this.normaliseIOD17Parity(candidate.iod17Parity, item.humanRequired),
            dispatchGenealogyRef: candidate.dispatchGenealogyRef ?? item.axiomTranslationSessionId ?? item.id,
            mediatedRunEvidencePacketId: candidate.mediatedRunEvidencePacketId
        };
    }

    protected normaliseIOD17Parity(
        parity: Partial<ReviewItemDeep['iod17Parity']> | undefined,
        humanRequired: boolean
    ): ReviewItemDeep['iod17Parity'] {
        const expectedState: IOD17ParityState = humanRequired ? 'human-required' : 'agent-allowed';
        const capabilityMatrixState = this.normaliseParityState(
            parity?.capabilityMatrixState,
            expectedState
        );
        const agentContractState = this.normaliseParityState(
            parity?.agentContractState,
            expectedState
        );
        const widgetState = this.normaliseParityState(parity?.widgetState, expectedState);
        const derivedParity =
            capabilityMatrixState === expectedState &&
            agentContractState === expectedState &&
            widgetState === expectedState;
        return {
            capabilityMatrixState,
            agentContractState,
            widgetState,
            inParity: typeof parity?.inParity === 'boolean' ? parity.inParity : derivedParity
        };
    }

    protected normaliseParityState(
        state: string | undefined,
        fallback: IOD17ParityState
    ): IOD17ParityState {
        return state === 'human-required' || state === 'agent-allowed' || state === 'unset'
            ? state
            : fallback;
    }
}
