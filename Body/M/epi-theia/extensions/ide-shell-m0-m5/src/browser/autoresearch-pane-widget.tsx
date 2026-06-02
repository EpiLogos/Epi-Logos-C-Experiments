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
 * Autoresearch pane — Track 05 T4.
 *
 * Surface for S5 autoresearch DTOs (epii-autoresearch-core). Consumes the
 * `s5'.improve.history` / `s5'.improve.status` gateway methods via
 * `KERNEL_BRIDGE_API.invokeCapability`.
 */
export interface AutoresearchCandidate {
    readonly id: string;
    readonly title: string;
    readonly score?: number;
    readonly privacyClass?: string;
    readonly source?: string;
    readonly coordinate?: string;
    readonly anchors?: readonly string[];
}

@injectable()
export class AutoresearchPaneWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.AUTORESEARCH_PANE;
    static readonly LABEL = 'Autoresearch Pane';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    protected candidates: AutoresearchCandidate[] = [];
    protected privacyDropped: number = 0;
    protected lastError: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = AutoresearchPaneWidget.ID;
        this.title.label = AutoresearchPaneWidget.LABEL;
        this.title.caption = AutoresearchPaneWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-autoresearch-pane');
    }

    async refreshHistory(): Promise<void> {
        try {
            const receipt = await this.bridge.invokeCapability({
                method: 'invokeGatewayRpc',
                sessionKey: 'ide-shell-autoresearch-pane',
                params: { gatewayMethod: "s5'.improve.history" },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: [],
                vak: null
            });
            if (!isPrivacySafe(receipt.privacyClass)) {
                this.privacyDropped += 1;
                this.candidates = [];
                this.lastError = `Privacy class "${receipt.privacyClass}" rejected by ide-shell gate`;
            } else {
                const list = Array.isArray(receipt.artifact)
                    ? (receipt.artifact as AutoresearchCandidate[])
                    : (receipt.artifact as { candidates?: AutoresearchCandidate[] } | undefined)?.candidates
                        ?? [];
                const accepted: AutoresearchCandidate[] = [];
                let dropped = 0;
                for (const c of list) {
                    if (isPrivacySafe(c.privacyClass)) {
                        accepted.push(c);
                    } else {
                        dropped += 1;
                    }
                }
                this.candidates = accepted;
                this.privacyDropped += dropped;
                this.lastError = null;
            }
        } catch (err) {
            this.lastError = err instanceof Error ? err.message : String(err);
        }
        this.update();
    }

    setCandidates(candidates: readonly AutoresearchCandidate[]): void {
        const accepted: AutoresearchCandidate[] = [];
        let dropped = 0;
        for (const c of candidates) {
            if (isPrivacySafe(c.privacyClass)) {
                accepted.push(c);
            } else {
                dropped += 1;
            }
        }
        this.candidates = accepted;
        this.privacyDropped += dropped;
        this.update();
    }

    get visibleCandidateCount(): number {
        return this.candidates.length;
    }

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate
                bridge={this.bridge}
                widgetLabel={AutoresearchPaneWidget.LABEL}
            >
                {this.renderPane()}
            </IdeShellBridgeGate>
        );
    }

    protected renderPane(): React.ReactNode {
        return (
            <div className="ide-shell-widget-root" data-test="autoresearch-pane-root">
                <header className="ide-shell-widget-header">
                    <h3>{AutoresearchPaneWidget.LABEL}</h3>
                    <span data-test="autoresearch-pane-count">
                        {this.candidates.length} candidate(s)
                    </span>
                </header>
                {this.lastError !== null && (
                    <p className="ide-shell-error" data-test="autoresearch-pane-error">
                        {this.lastError}
                    </p>
                )}
                {this.candidates.length === 0 ? (
                    <p
                        className="ide-shell-widget-empty"
                        data-test="autoresearch-pane-empty"
                    >
                        No autoresearch candidates surfaced.
                    </p>
                ) : (
                    <ul data-test="autoresearch-pane-list">
                        {this.candidates.map(c => (
                            <li
                                key={c.id}
                                data-test={`autoresearch-candidate-${c.id}`}
                            >
                                <strong>{c.title}</strong>
                                {c.score !== undefined && (
                                    <span> — score: {c.score.toFixed(3)}</span>
                                )}
                                {c.coordinate && (
                                    <span>
                                        {' '}
                                        — coordinate: <code>{c.coordinate}</code>
                                    </span>
                                )}
                                {c.anchors && c.anchors.length > 0 && (
                                    <p>anchors: {c.anchors.join(' | ')}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}
