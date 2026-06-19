import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { BridgeReadinessBadge } from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import { IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import { IdeShellBridgeGate } from './bridge-gate';
import { PrivacyDropFeed } from './services/privacy-drop-feed';
import { ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH } from './services/pi-axiom-translation-service';

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
    readonly axiomTranslationSessionId?: string;
}

@injectable()
export class EvidencePaneWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.EVIDENCE_PANE;
    static readonly LABEL = 'Evidence Pane';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(PrivacyDropFeed)
    protected readonly privacyDropFeed!: PrivacyDropFeed;

    protected records: EvidenceRecord[] = [];
    protected lastError: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = EvidencePaneWidget.ID;
        this.title.label = EvidencePaneWidget.LABEL;
        this.title.caption = EvidencePaneWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');

        /* 28.18 status-bar consumption contract: sessionKey/dayNowContext/profileGeneration
           per evidence record MUST derive from record.{sessionKey, dayNowContext, profileGeneration}
           set at record creation; widget does NOT compute these fields. 15.10 owns status-bar build. */
        this.addClass('ide-shell-evidence-pane');
    }

    /**
     * Surface a record. Returns whether the record was accepted; rejected
     * records (forbidden privacy class) increment `privacyDropped`.
     */
    addRecord(record: EvidenceRecord): boolean {
        if (!isPrivacySafe(record.privacyClass)) {
            this.recordPrivacyDrop(record.privacyClass);
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
        for (const r of records) {
            if (isPrivacySafe(r.privacyClass)) {
                accepted.push(r);
            } else {
                this.recordPrivacyDrop(r.privacyClass);
            }
        }
        this.records = accepted;
        this.update();
    }

    get visibleRecordCount(): number {
        return this.records.length;
    }

    protected get privacyDropped(): number {
        return this.privacyDropFeed.aggregate.byWidget[this.id] ?? 0;
    }

    protected recordPrivacyDrop(privacyClass: string | null | undefined): void {
        this.privacyDropFeed.record(this.id, privacyClass as string);
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
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="s5'.review.history"
                    />
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
                                    {r.axiomTranslationSessionId && (
                                        <>
                                            <dt>Axiom translation</dt>
                                            <dd>
                                                <a
                                                    href={`epi-logos://ide/ide-shell-m0-m5/pi-axiom-translation?session=${encodeURIComponent(r.axiomTranslationSessionId)}`}
                                                    data-intent-target="pi-axiom-translation"
                                                    data-source-skill={ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH}
                                                >
                                                    PiAxiomTranslationInspector
                                                </a>
                                            </dd>
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
