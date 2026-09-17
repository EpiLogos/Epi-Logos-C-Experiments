import * as React from 'react';
import { CommandService } from '@theia/core';
import { injectable, inject, optional, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { BlockHost } from '@pratibimba/block-kit/lib/browser/block-host';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import type { Block, BlockPrivacyClass } from '@pratibimba/m-extension-runtime';
import { BridgeReadinessBadge } from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import type { CrossLayoutIntent, IntentPrivacyClass } from '@pratibimba/pratibimba-layouts';
import type {
    DispatchTraceNode,
    MediatedRunEvidencePacket
} from '@pratibimba/integrated-composition';
import { IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import { IdeShellBridgeGate } from './bridge-gate';
import { PrivacyDropFeed } from './services/privacy-drop-feed';
import { ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH } from './services/pi-axiom-translation-service';

const CROSS_LAYOUT_INTENT_DISPATCH_COMMAND = 'pratibimba.intent.dispatch' as const;

declare module '@pratibimba/integrated-composition' {
    export interface ActorMediator {
        readonly kind: 'Pi' | 'Anima' | 'Aletheia' | string;
        readonly subagent?: string | null;
    }

    export interface DispatchTraceNode {
        readonly id: string;
        readonly actor: string;
        readonly label?: string | null;
        readonly methodOrSkill?: string | null;
        readonly tickAtInvoke?: number | null;
        readonly psycheFacet?: string | null;
        readonly children?: readonly DispatchTraceNode[];
    }

    export interface ToolInvocationRef {
        readonly id: string;
        readonly toolName?: string | null;
        readonly dispatchNodeId?: string | null;
        readonly invokedAt?: number | null;
    }

    export interface AxiomTranslationStep {
        readonly id?: string | null;
        readonly label?: string | null;
        readonly sourceAnchor?: string | null;
    }

    export interface MediatedRunEvidencePacket {
        readonly id?: string;
        readonly title?: string;
        readonly coordinate?: string | null;
        readonly privacyClass?: string | null;
        readonly artifactUri?: string | null;
        readonly sourceAnchor?: string | null;
        readonly graphAnchor?: string | null;
        readonly testAnchor?: string | null;
        readonly reviewId?: string | null;
        readonly bridgeReadinessHandle?: string | null;
        readonly sessionKey?: string | null;
        readonly dayNowContext?: string | null;
        readonly profileGeneration?: number | null;
        readonly mediatedBy?: ActorMediator | null;
        readonly dispatchTrace?: DispatchTraceNode | null;
        readonly toolStream?: readonly ToolInvocationRef[];
        readonly axiomTranslationSteps?: readonly AxiomTranslationStep[];
        readonly axiomTranslationSessionId?: string | null;
        readonly contemplationObjectRef?: string | null;
    }
}

type EvidenceCrossLayoutIntent = CrossLayoutIntent & {
    readonly evidenceRecordId?: string;
    readonly requestedEvidenceRecordId?: string;
    readonly requestedReviewId?: string;
    readonly requestedHostContributionId?: string;
    readonly requestedNestedContributionId?: string;
    readonly axiomTranslationSessionId?: string | null;
    readonly contemplationObjectRef?: string | null;
    readonly requestedObjectId?: string | null;
};

interface MediatorBadgeModel {
    readonly label: string;
    readonly className: string;
    readonly background: string;
}

const ALETHEIA_SUBAGENT_COLOURS: Record<string, string> = {
    anansi: '#2563eb',
    janus: '#0891b2',
    moirai: '#7c3aed',
    mercurius: '#059669',
    agora: '#dc2626',
    zeithoven: '#ca8a04'
};

/**
 * Evidence pane — Track 05 T4 (T8 wires it to the agentic flow).
 *
 * Consumes `MediatedRunEvidencePacket` DTOs from
 * `@pratibimba/integrated-composition`. ide-shell owns the full, governance
 * audit render; OmniPanel owns the abbreviated cross-layout list.
 *
 * The pane refuses to surface any evidence record whose privacy class is in
 * FORBIDDEN_PRIVACY_CLASSES — the privacy gate is identical to the one used
 * by the graph viewer, coordinate tree, and Logos Atelier.
 */
@injectable()
export class EvidencePaneWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.EVIDENCE_PANE;
    static readonly LABEL = 'Evidence Pane';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(PrivacyDropFeed)
    protected readonly privacyDropFeed!: PrivacyDropFeed;

    @inject(CommandService) @optional()
    protected readonly commandService?: CommandService;

    protected records: MediatedRunEvidencePacket[] = [];
    protected highlightedRecordId: string | null = null;
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
    addRecord(record: MediatedRunEvidencePacket): boolean {
        if (!isPrivacySafe(record.privacyClass ?? undefined)) {
            this.recordPrivacyDrop(record.privacyClass);
            this.update();
            return false;
        }
        this.records = [...this.records, record];
        this.update();
        return true;
    }

    /** Replace the visible record set (used by intent dispatch). */
    setRecords(records: readonly MediatedRunEvidencePacket[]): void {
        const accepted: MediatedRunEvidencePacket[] = [];
        for (const r of records) {
            if (isPrivacySafe(r.privacyClass ?? undefined)) {
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

    highlightRecord(evidenceRecordId: string | null): void {
        this.highlightedRecordId = evidenceRecordId;
        this.update();
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
                        {this.records.map(r => {
                            const recordId = this.recordId(r);
                            const isHighlighted = this.highlightedRecordId === recordId;
                            return (
                                <li
                                    key={recordId}
                                    data-test={`evidence-record-${recordId}`}
                                    data-evidence-id={recordId}
                                    data-highlighted={isHighlighted ? 'true' : 'false'}
                                    data-coordinate={r.coordinate ?? ''}
                                    data-privacy-class={r.privacyClass ?? ''}
                                    style={{ position: 'relative' }}
                                >
                                    {this.renderMediatorBadge(r)}
                                    <strong>{this.recordTitle(r)}</strong>
                                    <BlockHost blocks={this.evidenceBlocks(r, recordId)} />
                                    <dl className="ide-shell-evidence-fields">
                                        <dt>Packet</dt>
                                        <dd>
                                            <code>{recordId}</code>
                                        </dd>
                                        <dt>Run</dt>
                                        <dd>{r.runId}</dd>
                                        <dt>Task</dt>
                                        <dd>{r.taskId}</dd>
                                        <dt>Verdict</dt>
                                        <dd>{r.verdict}</dd>
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
                                        {r.provenance && (
                                            <>
                                                <dt>Provenance</dt>
                                                <dd>{r.provenance}</dd>
                                            </>
                                        )}
                                        {r.timestamp !== undefined && (
                                            <>
                                                <dt>Timestamp</dt>
                                                <dd>{new Date(r.timestamp).toISOString()}</dd>
                                            </>
                                        )}
                                    </dl>
                                    {this.renderStringList('Evidence', r.evidence)}
                                    {this.renderStringList('Acceptance criteria', r.acceptanceCriteria)}
                                    {this.renderStringList('Passed criteria', r.passedCriteria)}
                                    {this.renderDispatchTrace(r.dispatchTrace ?? null)}
                                    {this.renderDeepLinks(r, recordId)}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        );
    }

    protected renderMediatorBadge(record: MediatedRunEvidencePacket): React.ReactNode {
        const badge = this.mediatorBadge(record);
        return (
            <span
                className={`ide-shell-mediator-badge ${badge.className}`}
                data-test="evidence-mediator-badge"
                data-mediated-by-kind={record.mediatedBy?.kind ?? ''}
                data-mediated-by-subagent={record.mediatedBy?.subagent ?? ''}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: badge.background,
                    color: '#fff',
                    fontSize: 11
                }}
            >
                {badge.label}
            </span>
        );
    }

    protected renderStringList(label: string, values: readonly string[]): React.ReactNode {
        if (values.length === 0) {
            return null;
        }
        return (
            <section className="ide-shell-evidence-section">
                <h4>{label}</h4>
                <ul>
                    {values.map(value => (
                        <li key={value}>{value}</li>
                    ))}
                </ul>
            </section>
        );
    }

    protected renderDispatchTrace(dispatchTrace: DispatchTraceNode | null): React.ReactNode {
        if (!dispatchTrace) {
            return null;
        }
        return (
            <details
                className="ide-shell-dispatch-trace-mini-graph"
                data-test="evidence-dispatch-trace-mini-graph"
            >
                <summary>Dispatch trace mini-graph</summary>
                {this.renderDispatchTraceNode(dispatchTrace)}
            </details>
        );
    }

    protected renderDispatchTraceNode(node: DispatchTraceNode): React.ReactNode {
        return (
            <ul className="ide-shell-dispatch-trace-tree">
                <li
                    data-test="evidence-dispatch-trace-node"
                    data-dispatch-node-id={node.id}
                    data-actor={node.actor}
                    data-method-or-skill={node.methodOrSkill ?? ''}
                    data-tick-at-invoke={node.tickAtInvoke ?? ''}
                    data-psyche-facet={node.psycheFacet ?? ''}
                >
                    <span className="ide-shell-dispatch-actor">{node.actor}</span>
                    {node.methodOrSkill && (
                        <span className="ide-shell-dispatch-method"> · {node.methodOrSkill}</span>
                    )}
                    {node.tickAtInvoke !== null && node.tickAtInvoke !== undefined && (
                        <span className="ide-shell-dispatch-tick"> · tick {node.tickAtInvoke}</span>
                    )}
                    {node.psycheFacet && (
                        <span
                            className="ide-shell-psyche-facet-badge"
                            data-test="evidence-psyche-facet-badge"
                        >
                            {node.psycheFacet}
                        </span>
                    )}
                    {node.children && node.children.length > 0 && (
                        <>{node.children.map(child => this.renderDispatchTraceNode(child))}</>
                    )}
                </li>
            </ul>
        );
    }

    protected renderDeepLinks(record: MediatedRunEvidencePacket, recordId: string): React.ReactNode {
        const hasAxiomTranslation = (record.axiomTranslationSteps?.length ?? 0) > 0;
        return (
            <nav className="ide-shell-evidence-cross-links" aria-label="Evidence cross-links">
                <a
                    href="#"
                    data-cross-link="omnipanel.tool-stream"
                    data-evidence-id={recordId}
                    onClick={event => {
                        event.preventDefault();
                        this.emitCrossLayoutIntent(this.toolStreamIntent(record, recordId));
                    }}
                >
                    View tool stream in OmniPanel -&gt;
                </a>
                {hasAxiomTranslation && (
                    <button
                        type="button"
                        data-cross-link="ide-shell.axiom-translation-inspector"
                        data-evidence-id={recordId}
                        onClick={() => this.emitCrossLayoutIntent(this.axiomTranslationIntent(record, recordId))}
                    >
                        View axiom translation -&gt;
                    </button>
                )}
                {record.contemplationObjectRef && (
                    <button
                        type="button"
                        data-cross-link="m5-epii.contemplation-object-viewer"
                        data-evidence-id={recordId}
                        data-contemplation-object-ref={record.contemplationObjectRef}
                        onClick={() => this.emitCrossLayoutIntent(this.contemplationObjectIntent(record, recordId))}
                    >
                        Contemplation: open viewer -&gt;
                    </button>
                )}
            </nav>
        );
    }

    protected evidenceBlocks(record: MediatedRunEvidencePacket, recordId: string): readonly Block[] {
        const blocks: Block[] = [
            {
                id: `block:evidence:${recordId}`,
                type: 'evidence',
                ctx: this.blockCtx('evidence-inspector'),
                coordinate: record.coordinate ?? 'M5-4',
                privacyClass: this.blockPrivacyClass(record.privacyClass),
                provenance: {
                    kind: 'evidence-envelope',
                    handle: recordId,
                    source: 'ide-shell.evidence-pane'
                },
                data: {
                    id: recordId,
                    title: this.recordTitle(record),
                    sourceAnchor: record.sourceAnchor ?? null,
                    graphAnchor: record.graphAnchor ?? null,
                    testAnchor: record.testAnchor ?? null,
                    reviewId: record.reviewId ?? null,
                    sessionKey: record.sessionKey ?? null,
                    dayNowContext: record.dayNowContext ?? null,
                    profileGeneration: record.profileGeneration ?? null
                },
                affordances: ['navigate']
            }
        ];
        if (record.dispatchTrace) {
            blocks.push({
                id: `block:evidence:${recordId}:dispatch`,
                type: 'dispatch-genealogy',
                ctx: this.blockCtx('evidence-dispatch-trace'),
                coordinate: record.coordinate ?? 'M5-4',
                privacyClass: this.blockPrivacyClass(record.privacyClass),
                provenance: {
                    kind: 'evidence-envelope',
                    handle: recordId,
                    source: 'ide-shell.evidence-pane.dispatchTrace'
                },
                data: record.dispatchTrace,
                affordances: ['navigate']
            });
        }
        for (const tool of record.toolStream ?? []) {
            blocks.push({
                id: `block:evidence:${recordId}:tool:${tool.id}`,
                type: 'tool-stream-event',
                ctx: this.blockCtx('evidence-tool-stream'),
                coordinate: record.coordinate ?? 'M5-4',
                privacyClass: this.blockPrivacyClass(record.privacyClass),
                provenance: {
                    kind: 'evidence-envelope',
                    handle: recordId,
                    source: 'ide-shell.evidence-pane.toolStream'
                },
                data: tool,
                affordances: ['navigate']
            });
        }
        return Object.freeze(blocks);
    }

    protected blockCtx(cpf: string): Block['ctx'] {
        return {
            cf: '(0/1/2)',
            ct: 'CT2',
            cp: '4.2',
            cpf,
            cs: 'day'
        };
    }

    protected blockPrivacyClass(privacyClass: string | null | undefined): BlockPrivacyClass {
        if (privacyClass === 'protected-local') {
            return 'protected-local';
        }
        if (privacyClass?.startsWith('protected')) {
            return 'protected';
        }
        return 'public';
    }

    protected emitCrossLayoutIntent(intent: EvidenceCrossLayoutIntent): void {
        void this.commandService?.executeCommand(CROSS_LAYOUT_INTENT_DISPATCH_COMMAND, intent);
    }

    protected toolStreamIntent(record: MediatedRunEvidencePacket, recordId: string): EvidenceCrossLayoutIntent {
        return {
            ...this.baseIntent(record),
            requestedExtensionId: 'omnipanel-shell',
            requestedContributionId: 'tool-stream',
            requestedReviewId: recordId,
            requestedEvidenceRecordId: recordId,
            evidenceRecordId: recordId
        };
    }

    protected axiomTranslationIntent(record: MediatedRunEvidencePacket, recordId: string): EvidenceCrossLayoutIntent {
        return {
            ...this.baseIntent(record),
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'pi-axiom-translation',
            requestedHostContributionId: 'agentic-control-room',
            requestedNestedContributionId: 'axiom-translation-inspector',
            requestedEvidenceRecordId: recordId,
            evidenceRecordId: recordId,
            axiomTranslationSessionId: record.axiomTranslationSessionId ?? record.sessionKey ?? null
        };
    }

    protected contemplationObjectIntent(record: MediatedRunEvidencePacket, recordId: string): EvidenceCrossLayoutIntent {
        return {
            ...this.baseIntent(record),
            requestedExtensionId: 'm5-epii',
            requestedContributionId: 'contemplation-object-viewer',
            requestedEvidenceRecordId: recordId,
            evidenceRecordId: recordId,
            contemplationObjectRef: record.contemplationObjectRef ?? null,
            requestedObjectId: record.contemplationObjectRef ?? null
        };
    }

    protected baseIntent(record: MediatedRunEvidencePacket): CrossLayoutIntent {
        return {
            coordinate: record.coordinate ?? null,
            artifactUri: record.artifactUri ?? null,
            reviewId: record.reviewId ?? null,
            dayNow: record.dayNowContext ?? null,
            sessionKey: record.sessionKey ?? null,
            profileGeneration: record.profileGeneration ?? null,
            privacyClass: this.intentPrivacyClass(record.privacyClass),
            requestedLayout: 'ide-deep',
            requestedExtensionId: null,
            requestedContributionId: null
        };
    }

    protected intentPrivacyClass(privacyClass: string | null | undefined): IntentPrivacyClass | null {
        if (!privacyClass) {
            return null;
        }
        if (privacyClass.startsWith('private')) {
            return 'private';
        }
        if (privacyClass.startsWith('protected')) {
            return 'protected';
        }
        if (privacyClass.startsWith('public') || privacyClass === 'safe-public') {
            return 'public';
        }
        return null;
    }

    protected recordId(record: MediatedRunEvidencePacket): string {
        return record.id ?? record.runId ?? record.taskId;
    }

    protected recordTitle(record: MediatedRunEvidencePacket): string {
        return record.title ?? `MediatedRunEvidencePacket ${this.recordId(record)}`;
    }

    protected mediatorBadge(record: MediatedRunEvidencePacket): MediatorBadgeModel {
        const kind = record.mediatedBy?.kind ?? this.legacyMediatorKind(record.mediator);
        if (kind === 'Pi') {
            return { label: 'Pi', className: 'ide-shell-mediator-pi', background: '#7c3aed' };
        }
        if (kind === 'Anima') {
            return { label: 'Anima', className: 'ide-shell-mediator-anima', background: '#b45309' };
        }
        if (kind === 'Aletheia') {
            const subagent = record.mediatedBy?.subagent ?? 'subagent';
            const key = subagent.toLowerCase();
            return {
                label: `Aletheia · ${subagent}`,
                className: `ide-shell-mediator-aletheia ide-shell-mediator-${key}`,
                background: ALETHEIA_SUBAGENT_COLOURS[key] ?? '#64748b'
            };
        }
        return { label: kind, className: 'ide-shell-mediator-generic', background: '#475569' };
    }

    protected legacyMediatorKind(mediator: MediatedRunEvidencePacket['mediator']): string {
        if (mediator === 'claude' || mediator === 'fable-5') {
            return 'Aletheia';
        }
        if (mediator === 'hermes') {
            return 'Anima';
        }
        return 'Pi';
    }
}
