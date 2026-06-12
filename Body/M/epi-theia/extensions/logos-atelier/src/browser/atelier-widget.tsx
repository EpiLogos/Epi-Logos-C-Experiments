import * as React from 'react';
import { injectable, inject, postConstruct, interfaces } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import {
    FrontendApplicationContribution,
    WidgetFactory,
    bindViewContribution
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { ContainerModule } from '@theia/core/shared/inversify';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI,
    type KernelBridgeCapabilityReceipt
} from '@pratibimba/kernel-bridge';
import { BridgeReadinessBadge } from '@pratibimba/m-extension-runtime/lib/common/bridge-readiness';
import {
    EXTENSION_ID,
    LOGOS_ATELIER_OPEN_COMMAND_ID,
    LOGOS_ATELIER_WIDGET_ID,
    SCENT_FOLLOWING_STAGES,
    type ScentFollowingStage,
    type ScentFollowingStageId,
    type AtelierStageArtifact,
    type MobiusWriteBackProposal,
    buildAtelierGatewayParams,
    buildMobiusWriteBackProposal,
    etymologyUriFor,
    isAtelierPrivacySafe
} from '../common/atelier-surface';

type StageStatus = 'idle' | 'running' | 'complete' | 'blocked';

interface AtelierStageViewState {
    readonly status: StageStatus;
    readonly notes: string;
    readonly provenanceHandles: readonly string[];
    readonly privacyClass: string | null;
}

const INITIAL_STAGE_STATE: Readonly<Record<ScentFollowingStageId, AtelierStageViewState>> =
    Object.freeze(createInitialStageState());

@injectable()
export class LogosAtelierWidget extends ReactWidget {
    static readonly ID = LOGOS_ATELIER_WIDGET_ID;
    static readonly LABEL = 'Logos Atelier';

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    protected term = '';
    protected seedText = '';
    protected stageState: Record<ScentFollowingStageId, AtelierStageViewState> = {
        ...INITIAL_STAGE_STATE
    };
    protected evidence: AtelierStageArtifact[] = [];
    protected writeBackProposal: MobiusWriteBackProposal | null = null;
    protected privacyDropped = 0;
    protected lastError: string | null = null;
    protected running = false;

    @postConstruct()
    protected init(): void {
        this.id = LogosAtelierWidget.ID;
        this.title.label = LogosAtelierWidget.LABEL;
        this.title.caption = 'Etymology scent-following through Aletheia';
        this.title.closable = true;
        this.addClass('logos-atelier');
    }

    setTerm(term: string): void {
        this.term = term;
        this.writeBackProposal = null;
        this.update();
    }

    setSeedText(seedText: string): void {
        this.seedText = seedText;
        this.writeBackProposal = null;
        this.update();
    }

    async runScentFollowingPipeline(): Promise<void> {
        const trimmed = this.term.trim();
        if (trimmed.length === 0 || this.running) {
            return;
        }
        this.running = true;
        this.lastError = null;
        this.writeBackProposal = null;
        this.evidence = [];
        this.stageState = { ...INITIAL_STAGE_STATE };
        this.update();

        try {
            for (const stage of SCENT_FOLLOWING_STAGES) {
                await this.invokeStage(stage);
            }
            this.writeBackProposal = buildMobiusWriteBackProposal(this.term, this.evidence);
        } catch (err) {
            this.lastError = err instanceof Error ? err.message : String(err);
        } finally {
            this.running = false;
            this.update();
        }
    }

    protected async invokeStage(stage: ScentFollowingStage): Promise<void> {
        this.setStageStatus(stage.id, 'running');
        const params = buildAtelierGatewayParams(stage, {
            term: this.term,
            seedText: this.seedText,
            priorArtifacts: this.evidence,
            profileGeneration: this.bridge.cachedProfile?.generation ?? null,
            sessionKey: this.sessionKey
        });
        const receipt: KernelBridgeCapabilityReceipt = await this.bridge.invokeCapability({
            method: 'invokeGatewayRpc',
            sessionKey: this.sessionKey,
            params,
            profileGeneration: this.bridge.cachedProfile?.generation ?? null,
            provenanceHandles: this.evidence.flatMap(item => [...item.provenanceHandles]),
            vak: null
        });

        if (!isAtelierPrivacySafe(receipt.privacyClass)) {
            this.privacyDropped += 1;
            this.setStageStatus(stage.id, 'blocked', receipt.privacyClass);
            throw new Error(`Privacy class "${receipt.privacyClass}" rejected by Logos Atelier`);
        }

        const artifact: AtelierStageArtifact = Object.freeze({
            stageId: stage.id,
            gatewayMethod: stage.gatewayMethod,
            tool: stage.tool,
            artifact: receipt.artifact,
            privacyClass: receipt.privacyClass,
            provenanceHandles: Object.freeze([...receipt.provenanceHandles])
        });
        this.evidence = [...this.evidence, artifact];
        this.stageState[stage.id] = {
            status: 'complete',
            notes: summariseArtifact(receipt.artifact),
            provenanceHandles: artifact.provenanceHandles,
            privacyClass: receipt.privacyClass
        };
        this.update();
    }

    protected get sessionKey(): string {
        const termKey = this.term.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return `${EXTENSION_ID}:${termKey || 'pending'}`;
    }

    protected setStageStatus(
        stageId: ScentFollowingStageId,
        status: StageStatus,
        privacyClass: string | null = null
    ): void {
        const current = this.stageState[stageId];
        this.stageState[stageId] = {
            ...current,
            status,
            privacyClass
        };
        this.update();
    }

    protected override render(): React.ReactNode {
        const canRun = this.term.trim().length > 0 && !this.running;
        return (
            <div className="logos-atelier-root" data-test="logos-atelier-root">
                <header className="logos-atelier-header">
                    <h3>{LogosAtelierWidget.LABEL}</h3>
                    <div className="logos-atelier-readiness">
                        <BridgeReadinessBadge bridge={this.bridge} bindingKey="aletheia_gnosis_query" />
                        <BridgeReadinessBadge bridge={this.bridge} bindingKey="aletheia_thought_route" />
                        <BridgeReadinessBadge bridge={this.bridge} bindingKey="aletheia_crystallise" />
                    </div>
                </header>
                <section className="logos-atelier-controls">
                    <label>
                        Term
                        <input
                            type="text"
                            value={this.term}
                            data-test="logos-atelier-term"
                            onChange={event => this.setTerm(event.currentTarget.value)}
                        />
                    </label>
                    <label>
                        Seed context
                        <textarea
                            rows={3}
                            value={this.seedText}
                            data-test="logos-atelier-seed"
                            onChange={event => this.setSeedText(event.currentTarget.value)}
                        />
                    </label>
                    <button
                        type="button"
                        disabled={!canRun}
                        data-test="logos-atelier-run"
                        onClick={() => void this.runScentFollowingPipeline()}
                    >
                        Run scent pipeline
                    </button>
                    <p data-test="logos-atelier-namespace">
                        {this.term.trim().length > 0 ? etymologyUriFor(this.term) : 'etymology://'}
                    </p>
                </section>
                <section className="logos-atelier-lineage" data-test="logos-atelier-lineage">
                    Anima dispatches Aletheia crystallisation; guardians surface as evidence lineage only:
                    Anansi / Janus / Moirai / Mercurius / Agora / Zeithoven.
                </section>
                {this.lastError && (
                    <p className="logos-atelier-error" data-test="logos-atelier-error">
                        {this.lastError}
                    </p>
                )}
                <p data-test="logos-atelier-privacy-dropped">privacy-dropped: {this.privacyDropped}</p>
                <ol className="logos-atelier-stages">
                    {SCENT_FOLLOWING_STAGES.map(stage => this.renderStage(stage))}
                </ol>
                {this.writeBackProposal && (
                    <section className="logos-atelier-proposal" data-test="logos-atelier-write-back-proposal">
                        <h4>Mobius write-back proposal</h4>
                        <code>{this.writeBackProposal.etymologyUri}</code>
                        <p>{this.writeBackProposal.proposedTool} via {this.writeBackProposal.proposedGatewayMethod}</p>
                    </section>
                )}
            </div>
        );
    }

    protected renderStage(stage: ScentFollowingStage): React.ReactNode {
        const state = this.stageState[stage.id];
        return (
            <li key={stage.id} data-test={`logos-atelier-stage-${stage.id}`}>
                <header>
                    <strong>{stage.label}</strong>
                    <span data-test={`logos-atelier-stage-status-${stage.id}`}>{state.status}</span>
                </header>
                <p>
                    {stage.tool} via {stage.gatewayMethod}
                </p>
                <p data-test={`logos-atelier-stage-notes-${stage.id}`}>{state.notes}</p>
                <p data-test={`logos-atelier-stage-privacy-${stage.id}`}>
                    privacy: {state.privacyClass ?? 'pending'}
                </p>
                <ul data-test={`logos-atelier-stage-provenance-${stage.id}`}>
                    {state.provenanceHandles.map(handle => (
                        <li key={handle}>
                            <code>{handle}</code>
                        </li>
                    ))}
                </ul>
            </li>
        );
    }
}

@injectable()
export class LogosAtelierContribution
    extends AbstractViewContribution<LogosAtelierWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: LogosAtelierWidget.ID,
            widgetName: LogosAtelierWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: LOGOS_ATELIER_OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // The Atelier is opened explicitly by command or intent; it does not
        // auto-open into every Theia workspace.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: LOGOS_ATELIER_OPEN_COMMAND_ID, label: 'Logos Atelier: Open' },
            {
                execute: async (term?: string) => {
                    const widget = await this.openView({ activate: true, reveal: true });
                    if (typeof term === 'string' && term.trim().length > 0) {
                        widget.setTerm(term);
                    }
                    return widget;
                }
            }
        );
    }
}

export default new ContainerModule(bind => {
    bind(LogosAtelierWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: LogosAtelierWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, LogosAtelierContribution);
    bind(FrontendApplicationContribution).toService(LogosAtelierContribution);
});

function createWidget(container: interfaces.Container): LogosAtelierWidget {
    const child = container.createChild();
    child.bind(LogosAtelierWidget).toSelf();
    return child.get(LogosAtelierWidget);
}

function createInitialStageState(): Record<ScentFollowingStageId, AtelierStageViewState> {
    return Object.fromEntries(
        SCENT_FOLLOWING_STAGES.map(stage => [
            stage.id,
            {
                status: 'idle',
                notes: '',
                provenanceHandles: [],
                privacyClass: null
            }
        ])
    ) as unknown as Record<ScentFollowingStageId, AtelierStageViewState>;
}

function summariseArtifact(artifact: unknown): string {
    if (artifact === null || artifact === undefined) {
        return 'artifact received';
    }
    if (typeof artifact === 'string') {
        return artifact.slice(0, 240);
    }
    if (typeof artifact === 'object') {
        const candidate = artifact as { summary?: unknown; title?: unknown; label?: unknown; content?: unknown };
        for (const key of ['summary', 'title', 'label', 'content'] as const) {
            const value = candidate[key];
            if (typeof value === 'string' && value.trim().length > 0) {
                return value.slice(0, 240);
            }
        }
        return JSON.stringify(artifact).slice(0, 240);
    }
    return String(artifact);
}
