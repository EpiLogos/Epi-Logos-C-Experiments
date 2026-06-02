import { ContainerModule, injectable, interfaces, inject } from '@theia/core/shared/inversify';
import {
    CommandContribution,
    CommandRegistry
} from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution,
    bindViewContribution
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { registerIntentTarget } from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, IDE_SHELL_INTENT_TARGETS } from '../common/contract';
import { BimbaGraphViewerWidget } from './bimba-graph-viewer-widget';
import { CanonStudioWidget } from './canon-studio-widget';
import { AgenticControlRoomWidget } from './agentic-control-room-widget';
import { CoordinateTreeWidget } from './coordinate-tree-widget';
import { LogosAtelierWidget } from './logos-atelier-widget';
import { EvidencePaneWidget } from './evidence-pane-widget';
import { ReviewPaneWidget } from './review-pane-widget';
import { AutoresearchPaneWidget } from './autoresearch-pane-widget';

/**
 * Frontend module for `@pratibimba/ide-shell-m0-m5` — Track 05 T4.
 *
 * Wires the M0/M5 chrome widgets as Theia view contributions and registers
 * intent target commands so `CrossLayoutIntentDispatcher` can route the
 * canonical kinds (open-canon-studio-file, open-graph-node, etc.) into the
 * IDE shell.
 *
 * All widgets default to a Theia area appropriate for the deep IDE layout;
 * the layout descriptor (pratibimba-layouts/IDE_DEEP_DESCRIPTOR) names them
 * so the layout switcher reveals them when the deep IDE mode summons.
 *
 * The vault-bridge gate + capability matrix loader are exposed through a
 * rebindable `IdeShellM0M5Config` service so tests can inject fixtures.
 */

export const IDE_SHELL_CONFIG = Symbol('IdeShellM0M5Config');

export interface IdeShellM0M5Config {
    readonly loadCapabilityMatrix: () => Promise<unknown>;
    readonly vaultBridgeAvailable: (commands: CommandRegistry) => boolean;
    readonly vaultBridgeWrite: (
        commands: CommandRegistry,
        uri: string,
        content: string
    ) => Promise<void>;
}

const DEFAULT_CAPABILITY_MATRIX_URL = './capability-matrix.json';

@injectable()
export class DefaultIdeShellM0M5Config implements IdeShellM0M5Config {
    async loadCapabilityMatrix(): Promise<unknown> {
        const resp = await fetch(DEFAULT_CAPABILITY_MATRIX_URL);
        if (!resp.ok) {
            throw new Error(
                `ide-shell: failed to load capability matrix (${resp.status} ${resp.statusText})`
            );
        }
        return resp.json();
    }
    vaultBridgeAvailable(commands: CommandRegistry): boolean {
        return commands.getCommand(CanonStudioWidget.VAULT_BRIDGE_WRITE_COMMAND) !== undefined;
    }
    async vaultBridgeWrite(
        commands: CommandRegistry,
        uri: string,
        content: string
    ): Promise<void> {
        const cmd = commands.getCommand(CanonStudioWidget.VAULT_BRIDGE_WRITE_COMMAND);
        if (cmd === undefined) {
            throw new Error('no vault-bridge registered');
        }
        await commands.executeCommand(CanonStudioWidget.VAULT_BRIDGE_WRITE_COMMAND, { uri, content });
    }
}

@injectable()
export class IdeShellGraphContribution
    extends AbstractViewContribution<BimbaGraphViewerWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: BimbaGraphViewerWidget.ID,
            widgetName: BimbaGraphViewerWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: `pratibimba.${EXTENSION_ID}.${IDE_SHELL_INTENT_TARGETS.BIMBA_GRAPH}.toggle`
        });
    }

    async onStart(): Promise<void> { /* lazy-open via intent */ }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            IDE_SHELL_INTENT_TARGETS.BIMBA_GRAPH,
            'IDE Shell: Open Bimba Graph Viewer',
            intent => this.handleOpenGraph(intent)
        );
    }

    protected async handleOpenGraph(intent: unknown): Promise<void> {
        const widget = await this.openView({ activate: true, reveal: true });
        const i = intent as { coordinate?: string } | undefined;
        if (widget && i?.coordinate) {
            await widget.openCoordinate(i.coordinate);
        }
    }
}

@injectable()
export class IdeShellCanonStudioContribution
    extends AbstractViewContribution<CanonStudioWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    @inject(CommandRegistry) protected readonly commandRegistry!: CommandRegistry;
    @inject(IDE_SHELL_CONFIG) protected readonly config!: IdeShellM0M5Config;

    constructor() {
        super({
            widgetId: CanonStudioWidget.ID,
            widgetName: CanonStudioWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: `pratibimba.${EXTENSION_ID}.${IDE_SHELL_INTENT_TARGETS.CANON_STUDIO}.toggle`
        });
    }

    async onStart(): Promise<void> { /* lazy-open via intent */ }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            IDE_SHELL_INTENT_TARGETS.CANON_STUDIO,
            'IDE Shell: Open Canon Studio',
            intent => this.handleOpenCanonStudio(intent)
        );
    }

    protected async handleOpenCanonStudio(intent: unknown): Promise<void> {
        const widget = await this.openView({ activate: true, reveal: true });
        if (widget) {
            widget.vaultBridgeAvailable = () => this.config.vaultBridgeAvailable(this.commandRegistry);
            widget.vaultBridgeWrite = (uri, content) =>
                this.config.vaultBridgeWrite(this.commandRegistry, uri, content);
            const i = intent as
                | { artifactUri?: string | null; privacyClass?: string }
                | undefined;
            if (i?.artifactUri) {
                widget.openFile(i.artifactUri, '', i.privacyClass);
            }
        }
    }
}

@injectable()
export class IdeShellAgenticControlRoomContribution
    extends AbstractViewContribution<AgenticControlRoomWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    @inject(IDE_SHELL_CONFIG) protected readonly config!: IdeShellM0M5Config;

    constructor() {
        super({
            widgetId: AgenticControlRoomWidget.ID,
            widgetName: AgenticControlRoomWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: `pratibimba.${EXTENSION_ID}.${IDE_SHELL_INTENT_TARGETS.AGENTIC_CONTROL_ROOM}.toggle`
        });
    }

    async onStart(): Promise<void> { /* lazy-open via intent */ }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            IDE_SHELL_INTENT_TARGETS.AGENTIC_CONTROL_ROOM,
            'IDE Shell: Open Agentic Control Room',
            intent => this.handleOpen(intent)
        );
    }

    protected async handleOpen(intent: unknown): Promise<void> {
        const widget = await this.openView({ activate: true, reveal: true });
        if (widget) {
            widget.loadCapabilityMatrixSource = () => this.config.loadCapabilityMatrix();
            await widget.refreshMatrix();
            const i = intent as
                | {
                      coordinate?: string | null;
                      dayNow?: string | null;
                      sessionKey?: string | null;
                      profileGeneration?: number | null;
                  }
                | undefined;
            if (i) {
                widget.applyIntent(i);
            }
        }
    }
}

@injectable()
export class IdeShellEvidencePaneContribution
    extends AbstractViewContribution<EvidencePaneWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: EvidencePaneWidget.ID,
            widgetName: EvidencePaneWidget.LABEL,
            defaultWidgetOptions: { area: 'right' },
            toggleCommandId: `pratibimba.${EXTENSION_ID}.${IDE_SHELL_INTENT_TARGETS.EVIDENCE_PANEL}.toggle`
        });
    }

    async onStart(): Promise<void> { /* lazy-open via intent */ }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            IDE_SHELL_INTENT_TARGETS.EVIDENCE_PANEL,
            'IDE Shell: Open Evidence Pane',
            () => this.openView({ activate: true, reveal: true })
        );
    }
}

@injectable()
export class IdeShellCoordinateTreeContribution
    extends AbstractViewContribution<CoordinateTreeWidget>
    implements FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: CoordinateTreeWidget.ID,
            widgetName: CoordinateTreeWidget.LABEL,
            defaultWidgetOptions: { area: 'left' },
            toggleCommandId: `pratibimba.${EXTENSION_ID}.coordinate-tree.toggle`
        });
    }

    async onStart(): Promise<void> { /* lazy-open via intent */ }
}

@injectable()
export class IdeShellLogosAtelierContribution
    extends AbstractViewContribution<LogosAtelierWidget>
    implements FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: LogosAtelierWidget.ID,
            widgetName: LogosAtelierWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: `pratibimba.${EXTENSION_ID}.logos-atelier.toggle`
        });
    }

    async onStart(): Promise<void> { /* lazy-open via intent */ }
}

@injectable()
export class IdeShellReviewPaneContribution
    extends AbstractViewContribution<ReviewPaneWidget>
    implements FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: ReviewPaneWidget.ID,
            widgetName: ReviewPaneWidget.LABEL,
            defaultWidgetOptions: { area: 'right' },
            toggleCommandId: `pratibimba.${EXTENSION_ID}.review-pane.toggle`
        });
    }

    async onStart(): Promise<void> { /* lazy-open via intent */ }
}

@injectable()
export class IdeShellAutoresearchPaneContribution
    extends AbstractViewContribution<AutoresearchPaneWidget>
    implements FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: AutoresearchPaneWidget.ID,
            widgetName: AutoresearchPaneWidget.LABEL,
            defaultWidgetOptions: { area: 'right' },
            toggleCommandId: `pratibimba.${EXTENSION_ID}.autoresearch-pane.toggle`
        });
    }

    async onStart(): Promise<void> { /* lazy-open via intent */ }
}

export default new ContainerModule(bind => {
    // Config (rebindable by tests).
    bind(DefaultIdeShellM0M5Config).toSelf().inSingletonScope();
    bind<IdeShellM0M5Config>(IDE_SHELL_CONFIG).toService(DefaultIdeShellM0M5Config);

    // Bimba Graph Viewer.
    bind(BimbaGraphViewerWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: BimbaGraphViewerWidget.ID,
            createWidget: () => createSimpleWidget(ctx.container, BimbaGraphViewerWidget)
        }))
        .inSingletonScope();
    bindViewContribution(bind, IdeShellGraphContribution);
    bind(FrontendApplicationContribution).toService(IdeShellGraphContribution);

    // Canon Studio.
    bind(CanonStudioWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: CanonStudioWidget.ID,
            createWidget: () => createSimpleWidget(ctx.container, CanonStudioWidget)
        }))
        .inSingletonScope();
    bindViewContribution(bind, IdeShellCanonStudioContribution);
    bind(FrontendApplicationContribution).toService(IdeShellCanonStudioContribution);

    // Agentic Control Room.
    bind(AgenticControlRoomWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: AgenticControlRoomWidget.ID,
            createWidget: () => createSimpleWidget(ctx.container, AgenticControlRoomWidget)
        }))
        .inSingletonScope();
    bindViewContribution(bind, IdeShellAgenticControlRoomContribution);
    bind(FrontendApplicationContribution).toService(IdeShellAgenticControlRoomContribution);

    // Evidence Pane.
    bind(EvidencePaneWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: EvidencePaneWidget.ID,
            createWidget: () => createSimpleWidget(ctx.container, EvidencePaneWidget)
        }))
        .inSingletonScope();
    bindViewContribution(bind, IdeShellEvidencePaneContribution);
    bind(FrontendApplicationContribution).toService(IdeShellEvidencePaneContribution);

    // Coordinate Tree.
    bind(CoordinateTreeWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: CoordinateTreeWidget.ID,
            createWidget: () => createSimpleWidget(ctx.container, CoordinateTreeWidget)
        }))
        .inSingletonScope();
    bindViewContribution(bind, IdeShellCoordinateTreeContribution);
    bind(FrontendApplicationContribution).toService(IdeShellCoordinateTreeContribution);

    // Logos Atelier.
    bind(LogosAtelierWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: LogosAtelierWidget.ID,
            createWidget: () => createSimpleWidget(ctx.container, LogosAtelierWidget)
        }))
        .inSingletonScope();
    bindViewContribution(bind, IdeShellLogosAtelierContribution);
    bind(FrontendApplicationContribution).toService(IdeShellLogosAtelierContribution);

    // Review Pane.
    bind(ReviewPaneWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: ReviewPaneWidget.ID,
            createWidget: () => createSimpleWidget(ctx.container, ReviewPaneWidget)
        }))
        .inSingletonScope();
    bindViewContribution(bind, IdeShellReviewPaneContribution);
    bind(FrontendApplicationContribution).toService(IdeShellReviewPaneContribution);

    // Autoresearch Pane.
    bind(AutoresearchPaneWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: AutoresearchPaneWidget.ID,
            createWidget: () => createSimpleWidget(ctx.container, AutoresearchPaneWidget)
        }))
        .inSingletonScope();
    bindViewContribution(bind, IdeShellAutoresearchPaneContribution);
    bind(FrontendApplicationContribution).toService(IdeShellAutoresearchPaneContribution);
});

function createSimpleWidget<T>(
    container: interfaces.Container,
    Ctor: interfaces.Newable<T>
): T {
    const child = container.createChild();
    child.bind(Ctor).toSelf();
    return child.get(Ctor);
}
