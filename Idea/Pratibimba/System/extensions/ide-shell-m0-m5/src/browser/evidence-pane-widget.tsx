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
 * Evidence pane — Track 05 T4 (T8 wires it to the agentic flow).
 *
 * Consumes evidence-envelope DTOs from `@pratibimba/integrated-composition`
 * (already-landed Track 08 deliverable) — but DOES NOT import that extension;
 * instead the contribution injects an evidence-loader callback so test
 * extensions can drive the pane from fixtures.
 *
 * The pane refuses to surface any evidence record whose privacy class is in
 * FORBIDDEN_PRIVACY_CLASSES — the privacy gate is identical to the one used
 * by the graph viewer, coordinate tree, and Logos Atelier.
 */
export interface EvidenceRecord {
    readonly id: string;
    readonly title: string;
    readonly coordinate?: string;
    readonly privacyClass?: string;
    readonly artifactUri?: string;
    readonly sourceAnchor?: string;
    readonly graphAnchor?: string;
    readonly testAnchor?: string;
    readonly reviewId?: string;
    readonly bridgeReadinessHandle?: string;
    readonly sessionKey?: string;
    readonly dayNowContext?: string;
    readonly profileGeneration?: number;
}

@injectable()
export class EvidencePaneWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.EVIDENCE_PANE;
    static readonly LABEL = 'Evidence Pane';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    protected records: EvidenceRecord[] = [];
    protected privacyDropped: number = 0;
    protected lastError: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = EvidencePaneWidget.ID;
        this.title.label = EvidencePaneWidget.LABEL;
        this.title.caption = EvidencePaneWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-evidence-pane');
    }

    /**
     * Surface a record. Returns whether the record was accepted; rejected
     * records (forbidden privacy class) increment `privacyDropped`.
     */
    addRecord(record: EvidenceRecord): boolean {
        if (!isPrivacySafe(record.privacyClass)) {
            this.privacyDropped += 1;
            this.update();
            return false;
        }
        this.records = [...this.records, record];
        this.update();
        return true;
    }

    /** Replace the visible record set (used by intent dispatch). */
    setRecords(records: readonly EvidenceRecord[]): void {
        const accepted: EvidenceRecord[] = [];
        let dropped = 0;
        for (const r of records) {
            if (isPrivacySafe(r.privacyClass)) {
                accepted.push(r);
            } else {
                dropped += 1;
            }
        }
        this.records = accepted;
        this.privacyDropped += dropped;
        this.update();
    }

    get visibleRecordCount(): number {
        return this.records.length;
    }

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate bridge={this.bridge} widgetLabel={EvidencePaneWidget.LABEL}>
                {this.renderPane()}
            </IdeShellBridgeGate>
        );
    }

    protected renderPane(): React.ReactNode {
        return (
            <div className="ide-shell-widget-root" data-test="evidence-pane-root">
                <header className="ide-shell-widget-header">
                    <h3>{EvidencePaneWidget.LABEL}</h3>
                    <span data-test="evidence-pane-count">{this.records.length} record(s)</span>
                    <span data-test="evidence-pane-privacy-dropped">
                        privacy-dropped: {this.privacyDropped}
                    </span>
                </header>
                {this.lastError !== null && (
                    <p className="ide-shell-error" data-test="evidence-pane-error">
                        {this.lastError}
                    </p>
                )}
                {this.records.length === 0 ? (
                    <p
                        className="ide-shell-widget-empty"
                        data-test="evidence-pane-empty"
                    >
                        No evidence records surfaced. Records arrive via the Agentic
                        Control Room run flow (T8) or the M5 review surface.
                    </p>
                ) : (
                    <ul data-test="evidence-pane-list">
                        {this.records.map(r => (
                            <li
                                key={r.id}
                                data-test={`evidence-record-${r.id}`}
                                data-coordinate={r.coordinate ?? ''}
                                data-privacy-class={r.privacyClass ?? ''}
                            >
                                <strong>{r.title}</strong>
                                <dl className="ide-shell-evidence-fields">
                                    {r.coordinate && (
                                        <>
                                            <dt>Coordinate</dt>
                                            <dd>{r.coordinate}</dd>
                                        </>
                                    )}
                                    {r.artifactUri && (
                                        <>
                                            <dt>Artifact</dt>
                                            <dd>
                                                <code>{r.artifactUri}</code>
                                            </dd>
                                        </>
                                    )}
                                    {r.sourceAnchor && (
                                        <>
                                            <dt>Source anchor</dt>
                                            <dd>{r.sourceAnchor}</dd>
                                        </>
                                    )}
                                    {r.graphAnchor && (
                                        <>
                                            <dt>Graph anchor</dt>
                                            <dd>{r.graphAnchor}</dd>
                                        </>
                                    )}
                                    {r.testAnchor && (
                                        <>
                                            <dt>Test anchor</dt>
                                            <dd>{r.testAnchor}</dd>
                                        </>
                                    )}
                                    {r.reviewId && (
                                        <>
                                            <dt>Review</dt>
                                            <dd>{r.reviewId}</dd>
                                        </>
                                    )}
                                    {r.bridgeReadinessHandle && (
                                        <>
                                            <dt>Bridge readiness</dt>
                                            <dd>{r.bridgeReadinessHandle}</dd>
                                        </>
                                    )}
                                    {r.sessionKey && (
                                        <>
                                            <dt>Session</dt>
                                            <dd>{r.sessionKey}</dd>
                                        </>
                                    )}
                                    {r.dayNowContext && (
                                        <>
                                            <dt>DAY/NOW</dt>
                                            <dd>{r.dayNowContext}</dd>
                                        </>
                                    )}
                                    {r.profileGeneration !== undefined && (
                                        <>
                                            <dt>Profile generation</dt>
                                            <dd>{r.profileGeneration}</dd>
                                        </>
                                    )}
                                </dl>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}
