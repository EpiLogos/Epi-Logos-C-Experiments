import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandRegistry } from '@theia/core/lib/common';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI,
    type KernelBridgeCapabilityReceipt
} from '@pratibimba/kernel-bridge';
import { BridgeReadinessBadge } from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import {
    ReadinessBanner,
    type MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime/lib/common';
import type { CrossLayoutIntent } from '@pratibimba/pratibimba-layouts';
import {
    EXTENSION_ID,
    IDE_SHELL_INTENT_TARGETS,
    IDE_SHELL_WIDGET_IDS,
    isPrivacySafe
} from '../common/contract';
import { IdeShellBridgeGate } from './bridge-gate';
import { PrivacyDropFeed } from './services/privacy-drop-feed';
import { AletheiaSubagentTrace } from './acr/aletheia-subagent-trace';
import { isPsycheFacet } from './acr/psyche-facets';
import type { AletheiaSubagent, DispatchTraceNode } from './acr/types';

const CROSS_LAYOUT_INTENT_DISPATCH_COMMAND = 'pratibimba.intent.dispatch' as const;

/**
 * Logos Atelier — Track 05 T4.
 *
 * Etymology namespace + scent-following exploration workflow. Each stage
 * stores its own notes and `etymology://` provenance handles. Nothing carries
 * forward to the gateway except via `KERNEL_BRIDGE_API.invokeCapability`, and
 * Möbius write-back emits only a governed Canon Studio intent.
 */
const SCENT_FOLLOWING_STAGES = [
    { id: 'root',              label: 'Root',                  purpose: 'Etymology root of term' },
    { id: 'cognate',           label: 'Cognate',               purpose: 'Cross-language cognates' },
    { id: 'drift',             label: 'Semantic Drift',        purpose: 'Historical sense drift' },
    { id: 'psychoid',          label: 'Psychoid Charge',       purpose: 'Archetypal-affective charge per Atelier' },
    { id: 'pros-hen',          label: 'Pros-hen Synthesis',    purpose: 'Toward-the-One; Klein-V4 square pull' },
    { id: 'mobius-write-back', label: 'Möbius Write-Back',     purpose: 'Candidate articulation flowing to M0/M5-1' }
] as const;

type ScentFollowingStageId = (typeof SCENT_FOLLOWING_STAGES)[number]['id'];

interface AtelierStageState {
    notes: string;
    provenanceHandles: string[];
}

interface AletheiaThreadTrace {
    root: DispatchTraceNode | null;
    provenanceChain: string[];
    mergeMarkers: string[];
}

type CanonStudioWriteBackIntent = CrossLayoutIntent & {
    readonly content: string;
    readonly provenanceHandles: readonly string[];
    readonly mutatesGraphCanon: false;
    readonly sourceWidgetId: typeof IDE_SHELL_WIDGET_IDS.LOGOS_ATELIER;
};

const PENDING_ALETHEIA_GATEWAY_READINESS: MExtensionReadinessSnapshot = Object.freeze({
    fetchedAt: 0,
    state: 'authority_payload_missing',
    reason: "pending-gateway: s5'.gnostic.query unregistered",
    profileGeneration: null,
    bridgeReachable: false,
    blockerIds: Object.freeze(["s5'.gnostic.query unregistered"]),
    payloadOwner: "s5'.gnostic.*"
});

const ALETHEIA_GATEWAY_BLOCKERS = ["s5'.gnostic.query unregistered"] as const;
const ALETHEIA_SUBAGENTS: readonly AletheiaSubagent[] = [
    'anansi',
    'janus',
    'moirai',
    'mercurius',
    'agora',
    'zeithoven'
];

@injectable()
export class LogosAtelierWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.LOGOS_ATELIER;
    static readonly LABEL = 'Logos Atelier';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    @inject(PrivacyDropFeed)
    protected readonly privacyDropFeed!: PrivacyDropFeed;

    @inject(CommandRegistry)
    protected readonly commandRegistry!: CommandRegistry;

    protected currentTerm: string = '';
    protected stages: Record<string, AtelierStageState> = Object.fromEntries(
        SCENT_FOLLOWING_STAGES.map(s => [s.id, { notes: '', provenanceHandles: [] }])
    );
    protected lastError: string | null = null;
    protected lastToolStatus: string | null = null;
    protected latestThreadTrace: AletheiaThreadTrace | null = null;
    protected lastCrystallisedArticulation: string | null = null;
    public lastCanonStudioIntent: CanonStudioWriteBackIntent | null = null;

    @postConstruct()
    protected init(): void {
        this.id = LogosAtelierWidget.ID;
        this.title.label = LogosAtelierWidget.LABEL;
        this.title.caption = LogosAtelierWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');

        /* 28.18 status-bar consumption contract: logos-atelier does not render shared status-bar fields.
           No consumption contract needed. 15.10 owns status-bar build; 28.18 confirms no own-state pattern. */
        this.addClass('ide-shell-logos-atelier');
    }

    setTerm(term: string): void {
        this.currentTerm = term;
        this.update();
    }

    setStageNotes(stageId: string, notes: string): void {
        if (this.stages[stageId]) {
            this.stages[stageId] = { ...this.stages[stageId], notes };
            this.update();
        }
    }

    prepopulateMobiusWriteBack(artifactUri: string, privacyClass?: string | null): void {
        if (!isPrivacySafe(privacyClass)) {
            this.recordPrivacyDrop(privacyClass);
            this.lastError = `Privacy class "${privacyClass}" rejected by Logos Atelier`;
            this.update();
            return;
        }
        const stage = this.stages['mobius-write-back'];
        const writeBackLine = `Möbius write-back artifact: ${artifactUri}`;
        if (stage && !stage.notes.includes(writeBackLine)) {
            const notes = stage.notes ? `${stage.notes}\n${writeBackLine}` : writeBackLine;
            this.stages['mobius-write-back'] = { ...stage, notes };
        }
        if (this.isEtymologyHandle(artifactUri)) {
            this.attachProvenance('mobius-write-back', artifactUri, privacyClass ?? undefined);
        }
        this.update();
    }

    /**
     * Attach a gateway provenance handle to a stage. Used when the user adds
     * an autoresearch citation or graph-node reference to the exploration.
     */
    attachProvenance(stageId: string, handle: string, privacyClass?: string): void {
        if (!isPrivacySafe(privacyClass)) {
            this.recordPrivacyDrop(privacyClass);
            this.lastError = `Privacy class "${privacyClass}" rejected by Logos Atelier`;
            this.update();
            return;
        }
        if (!this.isEtymologyHandle(handle)) {
            this.recordPrivacyDrop('invalid-etymology-uri');
            this.lastError = `Provenance handle "${handle}" rejected: Logos Atelier accepts only etymology:// URIs`;
            this.update();
            return;
        }
        const stage = this.stages[stageId];
        if (stage && !stage.provenanceHandles.includes(handle)) {
            stage.provenanceHandles = [...stage.provenanceHandles, handle];
            this.update();
        }
    }

    protected get privacyDropped(): number {
        return this.privacyDropFeed.aggregate.byWidget[this.id] ?? 0;
    }

    protected recordPrivacyDrop(privacyClass: string | null | undefined): void {
        this.privacyDropFeed.record(this.id, privacyClass as string);
    }

    protected isEtymologyHandle(handle: string): boolean {
        return /^etymology:\/\/[^\s]+$/u.test(handle);
    }

    protected get accumulatedProvenanceHandles(): string[] {
        return SCENT_FOLLOWING_STAGES.flatMap(stage => this.stages[stage.id].provenanceHandles);
    }

    protected get accumulatedStageNotes(): Record<string, string> {
        return Object.fromEntries(
            SCENT_FOLLOWING_STAGES.map(stage => [stage.id, this.stages[stage.id].notes])
        );
    }

    protected aletheiaGatewayPending(): boolean {
        return true;
    }

    protected async runAletheiaGnosisQuery(stageId: Extract<ScentFollowingStageId, 'root' | 'cognate'>): Promise<void> {
        await this.invokeAletheiaStageTool(stageId, 'aletheia_gnosis_query');
    }

    protected async runAletheiaThoughtRoute(stageId: Extract<ScentFollowingStageId, 'drift' | 'psychoid'>): Promise<void> {
        await this.invokeAletheiaStageTool(stageId, 'aletheia_thought_route');
    }

    protected async invokeAletheiaStageTool(
        stageId: ScentFollowingStageId,
        gatewayMethod: 'aletheia_gnosis_query' | 'aletheia_thought_route'
    ): Promise<void> {
        this.lastError = null;
        try {
            const receipt = await this.bridge.invokeCapability({
                method: `ide-shell.logos-atelier.${gatewayMethod}`,
                sessionKey: this.sessionKeyFor(stageId),
                params: {
                    gatewayMethod,
                    term: this.currentTerm,
                    stageId,
                    notes: this.stages[stageId].notes,
                    provenanceHandles: this.accumulatedProvenanceHandles
                },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: this.accumulatedProvenanceHandles,
                vak: null
            });
            this.ingestEtymologyHandles(stageId, receipt);
            this.lastToolStatus = `${gatewayMethod} completed for ${stageId}`;
        } catch (err) {
            this.lastError = err instanceof Error ? err.message : String(err);
        }
        this.update();
    }

    protected async refreshAletheiaThreadTrace(): Promise<void> {
        this.lastError = null;
        try {
            const receipt = await this.bridge.invokeCapability({
                method: 'ide-shell.logos-atelier.thread_trace',
                sessionKey: this.sessionKeyFor('psychoid'),
                params: {
                    gatewayMethod: "s5'.gnostic.thread_trace",
                    term: this.currentTerm
                },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: this.accumulatedProvenanceHandles,
                vak: null
            });
            this.latestThreadTrace = this.asAletheiaThreadTrace(receipt.artifact, receipt.provenanceHandles);
            this.lastToolStatus = "s5'.gnostic.thread_trace refreshed";
        } catch (err) {
            this.lastError = err instanceof Error ? err.message : String(err);
        }
        this.update();
    }

    protected async crystalliseAndSendToCanonStudio(): Promise<void> {
        this.lastError = null;
        try {
            const receipt = await this.bridge.invokeCapability({
                method: 'ide-shell.logos-atelier.aletheia_crystallise',
                sessionKey: this.sessionKeyFor('mobius-write-back'),
                params: {
                    gatewayMethod: 'aletheia_crystallise',
                    term: this.currentTerm,
                    stageNotes: this.accumulatedStageNotes,
                    provenanceHandles: this.accumulatedProvenanceHandles,
                    mutatesGraphCanon: false
                },
                profileGeneration: this.bridge.cachedProfile?.generation ?? null,
                provenanceHandles: this.accumulatedProvenanceHandles,
                vak: null
            });
            this.ingestEtymologyHandles('mobius-write-back', receipt);
            const content = this.extractCandidateArticulation(receipt.artifact);
            const artifactUri = this.generatedCanonCandidateUri(receipt.artifact);
            this.lastCrystallisedArticulation = content;
            this.lastCanonStudioIntent = {
                coordinate: null,
                artifactUri,
                reviewId: null,
                dayNow: null,
                sessionKey: this.sessionKeyFor('mobius-write-back'),
                profileGeneration: receipt.profileGeneration,
                privacyClass: 'public',
                requestedLayout: 'ide-deep',
                requestedExtensionId: EXTENSION_ID,
                requestedContributionId: IDE_SHELL_INTENT_TARGETS.CANON_STUDIO,
                reason: 'Logos Atelier Möbius write-back candidate for Canon Studio review',
                content,
                provenanceHandles: this.accumulatedProvenanceHandles,
                mutatesGraphCanon: false,
                sourceWidgetId: IDE_SHELL_WIDGET_IDS.LOGOS_ATELIER
            };
            await this.commandRegistry.executeCommand(
                CROSS_LAYOUT_INTENT_DISPATCH_COMMAND,
                this.lastCanonStudioIntent
            );
            this.lastToolStatus = 'Crystallised candidate sent to Canon Studio';
        } catch (err) {
            this.lastError = err instanceof Error ? err.message : String(err);
        }
        this.update();
    }

    protected sessionKeyFor(stageId: ScentFollowingStageId): string {
        return `logos-atelier:${stageId}:${this.currentTerm.trim() || 'untitled'}`;
    }

    protected ingestEtymologyHandles(stageId: ScentFollowingStageId, receipt: KernelBridgeCapabilityReceipt): void {
        for (const handle of this.extractEtymologyHandles(receipt)) {
            this.attachProvenance(stageId, handle, receipt.privacyClass);
        }
    }

    protected extractEtymologyHandles(receipt: KernelBridgeCapabilityReceipt): string[] {
        const artifact = asRecord(receipt.artifact);
        const candidates = [
            ...receipt.provenanceHandles,
            ...stringArrayField(artifact, 'provenanceHandles'),
            ...stringArrayField(artifact, 'handles'),
            ...stringArrayField(artifact, 'etymologyHandles'),
            stringField(artifact, 'artifactUri'),
            stringField(artifact, 'uri')
        ];
        return [...new Set(candidates.filter((h): h is string => typeof h === 'string'))]
            .filter(handle => this.isEtymologyHandle(handle));
    }

    protected extractCandidateArticulation(artifact: unknown): string {
        if (typeof artifact === 'string') {
            return artifact;
        }
        const record = asRecord(artifact);
        return stringField(record, 'crystallisedArticulation')
            ?? stringField(record, 'crystallizedArticulation')
            ?? stringField(record, 'candidateCanonicalArticulation')
            ?? stringField(record, 'canonicalArticulation')
            ?? stringField(record, 'content')
            ?? stringField(record, 'text')
            ?? JSON.stringify(artifact, null, 2);
    }

    protected generatedCanonCandidateUri(artifact: unknown): string {
        const uri = stringField(asRecord(artifact), 'artifactUri') ?? stringField(asRecord(artifact), 'uri');
        if (uri && this.isEtymologyHandle(uri)) {
            return uri;
        }
        const term = encodeURIComponent(this.currentTerm.trim() || 'untitled');
        return `etymology://canon-studio/${term}/${Date.now()}`;
    }

    protected asAletheiaThreadTrace(artifact: unknown, fallbackHandles: readonly string[]): AletheiaThreadTrace {
        const record = asRecord(artifact);
        const root = asDispatchTraceNode(record?.threadTrace)
            ?? asDispatchTraceNode(record?.dispatchTrace)
            ?? asDispatchTraceNode(record?.trace)
            ?? null;
        return {
            root,
            provenanceChain: [
                ...fallbackHandles.filter(handle => this.isEtymologyHandle(handle)),
                ...stringArrayField(record, 'provenanceChain')
            ],
            mergeMarkers: stringArrayField(record, 'mergeMarkers')
        };
    }

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate bridge={this.bridge} widgetLabel={LogosAtelierWidget.LABEL}>
                {this.renderAtelier()}
            </IdeShellBridgeGate>
        );
    }

    protected renderAtelier(): React.ReactNode {
        return (
            <div className="ide-shell-widget-root" data-test="logos-atelier-root">
                <header className="ide-shell-widget-header">
                    <h3>{LogosAtelierWidget.LABEL}</h3>
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="aletheia_gnosis_query"
                    />
                    <BridgeReadinessBadge
                        bridge={this.bridge}
                        bindingKey="aletheia_crystallise"
                    />
                </header>
                <section className="ide-shell-widget-detail">
                    <label>
                        Term under exploration:{' '}
                        <input
                            type="text"
                            data-test="logos-atelier-term"
                            value={this.currentTerm}
                            onChange={e => this.setTerm(e.target.value)}
                        />
                    </label>
                    <p data-test="logos-atelier-privacy-dropped">
                        privacy-dropped: {this.privacyDropped}
                    </p>
                    <ReadinessBanner
                        extensionId={EXTENSION_ID}
                        extensionLabel="Logos Atelier Aletheia Tools"
                        snapshot={PENDING_ALETHEIA_GATEWAY_READINESS}
                        declaredBlockers={ALETHEIA_GATEWAY_BLOCKERS}
                        evidenceHandles={this.accumulatedProvenanceHandles}
                        provenance="pending-gateway"
                    />
                    {this.lastError !== null && (
                        <p className="ide-shell-error" data-test="logos-atelier-error">
                            {this.lastError}
                        </p>
                    )}
                    {this.lastToolStatus !== null && (
                        <p data-test="logos-atelier-tool-status">
                            {this.lastToolStatus}
                        </p>
                    )}
                </section>
                {SCENT_FOLLOWING_STAGES.map(stage => (
                    <section
                        key={stage.id}
                        className="ide-shell-widget-detail"
                        data-test={`logos-atelier-stage-${stage.id}`}
                    >
                        <h4>{stage.label}</h4>
                        <p>{stage.purpose}</p>
                        <textarea
                            value={this.stages[stage.id].notes}
                            onChange={e => this.setStageNotes(stage.id, e.target.value)}
                            rows={3}
                            data-test={`logos-atelier-notes-${stage.id}`}
                        />
                        {this.renderStageTools(stage.id)}
                        <p data-test={`logos-atelier-provenance-count-${stage.id}`}>
                            provenance handles: {this.stages[stage.id].provenanceHandles.length}
                        </p>
                        <ul data-test={`logos-atelier-provenance-${stage.id}`}>
                            {this.stages[stage.id].provenanceHandles.map(h => (
                                <li key={h}>
                                    <code>{h}</code>
                                    {stage.id === 'mobius-write-back' && this.lineageBadgesForHandle(h).map(badge => (
                                        <span
                                            key={`${badge.label}:${badge.handle ?? badge.source ?? h}`}
                                            className="ide-shell-aletheia-lineage-badge"
                                            data-test="logos-atelier-lineage-badge"
                                            data-lineage-handle={badge.handle ?? h}
                                        >
                                            {badge.label}
                                        </span>
                                    ))}
                                </li>
                            ))}
                        </ul>
                        {stage.id === 'mobius-write-back' && this.renderMobiusSubagentVetoes()}
                        {stage.id === 'psychoid' && this.renderSubagentTrace()}
                    </section>
                ))}
            </div>
        );
    }

    protected renderStageTools(stageId: ScentFollowingStageId): React.ReactNode {
        const disabled = this.aletheiaGatewayPending();
        if (stageId === 'root' || stageId === 'cognate') {
            return (
                <button
                    type="button"
                    disabled={disabled}
                    data-test={`logos-atelier-${stageId}-gnosis-query`}
                    onClick={() => { void this.runAletheiaGnosisQuery(stageId); }}
                >
                    Query Gnosis
                </button>
            );
        }
        if (stageId === 'drift' || stageId === 'psychoid') {
            return (
                <button
                    type="button"
                    disabled={disabled}
                    data-test={`logos-atelier-${stageId}-thought-route`}
                    onClick={() => { void this.runAletheiaThoughtRoute(stageId); }}
                >
                    Route Thought
                </button>
            );
        }
        if (stageId === 'mobius-write-back') {
            return (
                <button
                    type="button"
                    disabled={disabled}
                    data-test="logos-atelier-crystallise-send"
                    onClick={() => { void this.crystalliseAndSendToCanonStudio(); }}
                >
                    Crystallise + Send to Canon Studio
                </button>
            );
        }
        return null;
    }

    protected renderSubagentTrace(): React.ReactNode {
        const trace = this.latestThreadTrace;
        const subagentNodes = trace?.root ? this.aletheiaTraceNodes(trace.root) : [];
        return (
            <details data-test="logos-atelier-aletheia-subagent-trace">
                <summary>Aletheia subagent trace</summary>
                <button
                    type="button"
                    disabled={this.aletheiaGatewayPending()}
                    data-test="logos-atelier-thread-trace-refresh"
                    onClick={() => { void this.refreshAletheiaThreadTrace(); }}
                >
                    Refresh trace
                </button>
                {trace === null || trace.root === null ? (
                    <p data-test="logos-atelier-thread-trace-empty">
                        pending latest s5'.gnostic.thread_trace for {this.currentTerm || 'current term'}
                    </p>
                ) : (
                    <>
                        <ol data-test="logos-atelier-thread-provenance-chain">
                            {trace.provenanceChain.map(handle => (
                                <li key={handle}><code>{handle}</code></li>
                            ))}
                        </ol>
                        <ul data-test="logos-atelier-thread-merge-markers">
                            {trace.mergeMarkers.map(marker => (
                                <li key={marker}>{marker}</li>
                            ))}
                        </ul>
                        {subagentNodes.map(node => (
                            <AletheiaSubagentTrace
                                key={node.id}
                                subagent={this.aletheiaSubagentForNode(node)}
                                subtrace={node}
                                vetoRecord={node.veto}
                            />
                        ))}
                    </>
                )}
            </details>
        );
    }

    protected renderMobiusSubagentVetoes(): React.ReactNode {
        const vetoNodes = this.aletheiaVetoNodes();
        if (vetoNodes.length === 0) {
            return null;
        }
        return (
            <div data-test="logos-atelier-mobius-subagent-vetoes">
                {vetoNodes.map(node => (
                    <AletheiaSubagentTrace
                        key={`mobius-veto-${node.id}`}
                        subagent={this.aletheiaSubagentForNode(node)}
                        subtrace={node}
                        vetoRecord={node.veto}
                    />
                ))}
            </div>
        );
    }

    protected aletheiaTraceNodes(node: DispatchTraceNode): readonly DispatchTraceNode[] {
        const children = node.children ?? [];
        return [
            ...(isAletheiaSubagentNode(node) ? [node] : []),
            ...children.flatMap(child => [...this.aletheiaTraceNodes(child)])
        ];
    }

    protected aletheiaVetoNodes(): readonly DispatchTraceNode[] {
        const root = this.latestThreadTrace?.root;
        return root ? this.aletheiaTraceNodes(root).filter(node => node.veto !== null && node.veto !== undefined) : [];
    }

    protected lineageBadgesForHandle(handle: string): readonly NonNullable<DispatchTraceNode['lineageBadges']>[number][] {
        const root = this.latestThreadTrace?.root;
        if (!root) {
            return [];
        }
        return this.aletheiaTraceNodes(root)
            .flatMap(node => [...(node.lineageBadges ?? [])])
            .filter(badge => badge.handle === handle);
    }

    protected aletheiaSubagentForNode(node: DispatchTraceNode): AletheiaSubagent {
        const subagent = node.mediatedBy?.aletheiaSubagent ?? node.aletheiaSubagent;
        return subagent as AletheiaSubagent;
    }
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;
}

function stringField(record: Record<string, unknown> | null, key: string): string | null {
    const value = record?.[key];
    return typeof value === 'string' ? value : null;
}

function stringArrayField(record: Record<string, unknown> | null, key: string): string[] {
    const value = record?.[key];
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function numberField(record: Record<string, unknown> | null, key: string): number | null {
    const value = record?.[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asDispatchTraceNode(value: unknown): DispatchTraceNode | null {
    if (Array.isArray(value)) {
        return {
            id: 's5-gnostic-thread-trace',
            label: "s5'.gnostic.thread_trace",
            actor: 'aletheia',
            children: value.map(asDispatchTraceNode).filter((node): node is DispatchTraceNode => node !== null)
        };
    }
    const record = asRecord(value);
    if (record === null) {
        return null;
    }
    const id = stringField(record, 'id') ?? stringField(record, 'nodeId') ?? `trace-${String(record.label ?? 'node')}`;
    const label = stringField(record, 'label') ?? stringField(record, 'name') ?? id;
    const mediatedBy = asRecord(record.mediatedBy);
    const maybeSubagent = stringField(mediatedBy, 'aletheiaSubagent')
        ?? stringField(record, 'aletheiaSubagent')
        ?? stringField(record, 'subagent');
    const maybePsycheFacet = stringField(record, 'psycheFacet');
    return {
        id,
        label,
        actor: stringField(record, 'actor') ?? 'aletheia',
        coordinate: stringField(record, 'coordinate'),
        sourceAnchor: stringField(record, 'sourceAnchor'),
        methodOrSkill: stringField(record, 'methodOrSkill') ?? stringField(record, 'method') ?? stringField(record, 'skill'),
        tickAtInvoke: typeof record.tickAtInvoke === 'number' ? record.tickAtInvoke : null,
        psycheFacet: isPsycheFacet(maybePsycheFacet) ? maybePsycheFacet : null,
        aletheiaSubagent: isAletheiaSubagent(maybeSubagent) ? maybeSubagent : null,
        mediatedBy: isAletheiaSubagent(maybeSubagent) ? { aletheiaSubagent: maybeSubagent } : null,
        veto: asAletheiaVetoRecord(record.veto) ?? asAletheiaVetoRecord(record.vetoRecord),
        lineageBadges: Array.isArray(record.lineageBadges)
            ? record.lineageBadges.map(asAletheiaLineageBadge).filter((badge): badge is NonNullable<DispatchTraceNode['lineageBadges']>[number] => badge !== null)
            : [],
        janusFrame: asJanusFrame(record.janusFrame),
        mediatedRunEvidencePacketId: stringField(record, 'mediatedRunEvidencePacketId'),
        children: Array.isArray(record.children)
            ? record.children.map(asDispatchTraceNode).filter((node): node is DispatchTraceNode => node !== null)
            : []
    };
}

function isAletheiaSubagent(value: string | null): value is AletheiaSubagent {
    return value !== null && (ALETHEIA_SUBAGENTS as readonly string[]).includes(value);
}

function isAletheiaSubagentNode(node: DispatchTraceNode): boolean {
    return isAletheiaSubagent(node.mediatedBy?.aletheiaSubagent ?? node.aletheiaSubagent ?? null);
}

function asAletheiaVetoRecord(value: unknown): DispatchTraceNode['veto'] {
    const record = asRecord(value);
    const reason = stringField(record, 'reason');
    if (!reason) {
        return null;
    }
    return {
        reason,
        raisedAt: numberField(record, 'raisedAt'),
        candidateCanonicalWriteId: stringField(record, 'candidateCanonicalWriteId'),
        nonBlockingHumanGate: record?.nonBlockingHumanGate === false ? false : true
    };
}

function asAletheiaLineageBadge(value: unknown): NonNullable<DispatchTraceNode['lineageBadges']>[number] | null {
    const record = asRecord(value);
    const label = stringField(record, 'label');
    if (!label) {
        return null;
    }
    return {
        label,
        handle: stringField(record, 'handle'),
        source: stringField(record, 'source')
    };
}

function asJanusFrame(value: unknown): DispatchTraceNode['janusFrame'] {
    const record = asRecord(value);
    const prospective = numberField(record, 'prospective');
    const retrospective = numberField(record, 'retrospective');
    if (prospective === null || retrospective === null) {
        return null;
    }
    return {
        prospective,
        retrospective,
        oracleSpreadAliveness: stringField(record, 'oracleSpreadAliveness'),
        kairosWeighting: stringField(record, 'kairosWeighting')
    };
}
