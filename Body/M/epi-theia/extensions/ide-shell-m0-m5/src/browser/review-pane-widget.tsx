import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import { IdeShellBridgeGate } from './bridge-gate';

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
    readonly privacyClass?: string;
    readonly proposer?: string;
    readonly coordinate?: string;
    readonly summary?: string;
}

@injectable()
export class ReviewPaneWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.REVIEW_PANE;
    static readonly LABEL = 'Review Pane';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    protected items: ReviewItem[] = [];
    protected privacyDropped: number = 0;
    protected lastError: string | null = null;

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
                this.privacyDropped += 1;
                this.items = [];
                this.lastError = `Privacy class "${receipt.privacyClass}" rejected by ide-shell gate`;
            } else {
                const list = Array.isArray(receipt.artifact)
                    ? (receipt.artifact as ReviewItem[])
                    : (receipt.artifact as { items?: ReviewItem[] } | undefined)?.items ?? [];
                const accepted: ReviewItem[] = [];
                let dropped = 0;
                for (const it of list) {
                    if (isPrivacySafe(it.privacyClass)) {
                        accepted.push(it);
                    } else {
                        dropped += 1;
                    }
                }
                this.items = accepted;
                this.privacyDropped += dropped;
                this.lastError = null;
            }
        } catch (err) {
            this.lastError = err instanceof Error ? err.message : String(err);
        }
        this.update();
    }

    /** Direct setter for tests + intent dispatch. */
    setItems(items: readonly ReviewItem[]): void {
        const accepted: ReviewItem[] = [];
        let dropped = 0;
        for (const it of items) {
            if (isPrivacySafe(it.privacyClass)) {
                accepted.push(it);
            } else {
                dropped += 1;
            }
        }
        this.items = accepted;
        this.privacyDropped += dropped;
        this.update();
    }

    get visibleItemCount(): number {
        return this.items.length;
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
                        {this.items.map(item => (
                            <li
                                key={item.id}
                                data-test={`review-item-${item.id}`}
                                data-status={item.status}
                                data-human-required={item.humanRequired ? 'true' : 'false'}
                            >
                                <strong>{item.title}</strong>
                                <span> — status: {item.status}</span>
                                {item.humanRequired && (
                                    <p
                                        className="ide-shell-human-required"
                                        data-test={`review-item-human-required-banner-${item.id}`}
                                    >
                                        Human-required gate: agent approve/reject/revise BLOCKED.
                                        Only a human (via the M5 review surface) can transition
                                        this item; the gateway will reject any agent transition
                                        attempt with `human-gate enforced`.
                                    </p>
                                )}
                                {item.coordinate && (
                                    <p>
                                        coordinate: <code>{item.coordinate}</code>
                                    </p>
                                )}
                                {item.summary && <p>{item.summary}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}
