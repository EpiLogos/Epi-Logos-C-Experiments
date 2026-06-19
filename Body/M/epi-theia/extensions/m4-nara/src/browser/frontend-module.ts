// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import '../../style/privacy-chrome.css';
import '../../style/dialogical-arena.css';
import { ContainerModule, injectable, interfaces, inject } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry, CommandService } from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution,
    bindViewContribution
} from '@theia/core/lib/browser';
import { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser/keybinding';
import { PreferenceService, PreferenceScope } from '@theia/core/lib/browser/preferences';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import {
    MObservabilityPublisher,
    Disposable,
    EMPTY_STATE_REGISTRY,
    EmptyStateRegistry,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER,
    ColdStartOrchestrator,
    parseExtensionRoute,
    registerIntentTarget
} from '@pratibimba/m-extension-runtime';
import {
    OPEN_PASU_WIZARD_COMMAND,
    PASU_SKIPPED_PREFERENCE,
    PasuWizardMode,
    createPasuIdentityGate,
    launchPasuWizard,
    runPasuWizardComplete,
    runPasuWizardSkip
} from './onboarding/identity-wizard';
import { M4NaraCanvasEditorWidget } from './canvas-editor';
import {
    M4NaraEmptyState,
    M4NaraEmptyStateWidget
} from './empty-state';
import { HighlightService } from './services/highlight-service';
import { LensApplicationWidget } from './widgets/lens-application';
import { LogosCycleWidget } from './widgets/logos-cycle';
import { AmbientStateStripWidget } from './widgets/ambient-state-strip';
import { TuningBarWidget } from './widgets/tuning-bar';
import { KairosDisplayWidget } from './widgets/kairos-display';
import {
    JournalEntriesSidebarWidget,
    M4JournalEntriesContribution
} from './widgets/journal-entries-sidebar';
import {
    DialogicalArenaWidget,
    DIALOGICAL_ARENA_VIEW_ID
} from './widgets/dialogical-arena';
import { M4NaraWidget } from './m4-nara-widget';
import {
    EXTENSION_ID,
    OPEN_COMMAND_ID,
    READ_ONLY_COMMAND_ID,
    DEPOSIT_ONLY_COMMAND_ID,
    ROUTE_PATH,
    OBSERVABILITY_EVENT_TYPES
} from '../common';

export const M4_NARA_PUBLISHER = Symbol(
    'm4-nara.observabilityPublisher'
);

@injectable()
export class M4NaraContribution
    extends AbstractViewContribution<M4NaraWidget>
    implements CommandContribution, FrontendApplicationContribution, KeybindingContribution
{
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    constructor() {
        super({
            widgetId: M4NaraWidget.ID,
            widgetName: M4NaraWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // M-extensions register without auto-opening; the user (or a deep link)
        // triggers the view via OPEN_COMMAND_ID.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open primary view` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        commands.registerCommand(
            { id: 'm4-nara.openCoordinate', label: `${EXTENSION_ID}: open coordinate` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        commands.registerCommand(
            { id: READ_ONLY_COMMAND_ID, label: `${EXTENSION_ID}: open read-only` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        commands.registerCommand(
            { id: DEPOSIT_ONLY_COMMAND_ID, label: `${EXTENSION_ID}: open deposit-only` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        // Route handler: deep links of the form epi-logos://ide/m4-nara/artifact?...
        commands.registerCommand(
            { id: `${EXTENSION_ID}.handleRoute`, label: `${EXTENSION_ID}: handle route` },
            {
                execute: (raw: string) => {
                    const route = parseExtensionRoute(raw);
                    if (!route || route.extensionId !== EXTENSION_ID) {
                        return undefined;
                    }
                    return this.openView({ activate: true, reveal: true });
                }
            }
        );
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'artifact',
            'M4 Nara: Open Artifact',
            () => this.openView({ activate: true, reveal: true })
        );
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'journal',
            'M4 Nara: Start Journal Entry',
            () => this.openView({ activate: true, reveal: true })
        );
        // 31.2 / CC-02 command-palette catalog — stage-1 wave-C commands for
        // m4-nara (25.x). Dispatch routes through the shared bridge only.
        commands.registerCommand({ id: 'm4-nara.day-calendar.focus', label: `${EXTENSION_ID}: focus day calendar` }, { execute: () => this.dispatchPaletteCommand('m4-nara.day-calendar.focus') });
        commands.registerCommand({ id: 'm4-nara.pasu-identity.open', label: `${EXTENSION_ID}: open PASU identity` }, { execute: () => this.dispatchPaletteCommand('m4-nara.pasu-identity.open') });
        commands.registerCommand({ id: 'm4-nara.quintessence.display', label: `${EXTENSION_ID}: display quintessence` }, { execute: () => this.dispatchPaletteCommand('m4-nara.quintessence.display') });
        commands.registerCommand({ id: 'm4-nara.personal-cymatic.focus', label: `${EXTENSION_ID}: focus personal cymatic` }, { execute: () => this.dispatchPaletteCommand('m4-nara.personal-cymatic.focus') });
        commands.registerCommand({ id: 'm4-nara.oracle.cast', label: `${EXTENSION_ID}: cast oracle (I-Ching + Tarot)` }, { execute: () => this.dispatchPaletteCommand('m4-nara.oracle.cast') });
        commands.registerCommand({ id: 'm4-nara.oracle.history.open', label: `${EXTENSION_ID}: open oracle history` }, { execute: () => this.dispatchPaletteCommand('m4-nara.oracle.history.open') });
        commands.registerCommand({ id: 'm4-nara.medicine.focus', label: `${EXTENSION_ID}: focus medicine` }, { execute: () => this.dispatchPaletteCommand('m4-nara.medicine.focus') });
        commands.registerCommand({ id: 'm4-nara.transform.open', label: `${EXTENSION_ID}: open transform (Bohm / Talking Circle / Diamond)` }, { execute: () => this.dispatchPaletteCommand('m4-nara.transform.open') });
        commands.registerCommand({ id: 'm4-nara.lens.apply', label: `${EXTENSION_ID}: apply lens` }, { execute: () => this.dispatchPaletteCommand('m4-nara.lens.apply') });
        commands.registerCommand({ id: 'm4-nara.logos.stage-advance', label: `${EXTENSION_ID}: advance logos stage` }, { execute: () => this.dispatchPaletteCommand('m4-nara.logos.stage-advance') });
        commands.registerCommand({ id: 'm4-nara.pratibimba.consent-gate', label: `${EXTENSION_ID}: open pratibimba consent gate` }, { execute: () => this.dispatchPaletteCommand('m4-nara.pratibimba.consent-gate') });
        commands.registerCommand({ id: 'm4-nara.kairos.refresh', label: `${EXTENSION_ID}: refresh kairos` }, { execute: () => this.dispatchPaletteCommand('m4-nara.kairos.refresh') });
        commands.registerCommand({ id: 'm4-nara.time-axis.cycle', label: `${EXTENSION_ID}: cycle time axis` }, { execute: () => this.dispatchPaletteCommand('m4-nara.time-axis.cycle') });
        commands.registerCommand({ id: 'm4-nara.canvas-highlight.daily-note', label: `${EXTENSION_ID}: highlight daily note` }, { execute: () => this.dispatchPaletteCommand('m4-nara.canvas-highlight.daily-note', { category: 'daily-note' }) });
        commands.registerCommand({ id: 'm4-nara.canvas-highlight.oracle', label: `${EXTENSION_ID}: highlight oracle` }, { execute: () => this.dispatchPaletteCommand('m4-nara.canvas-highlight.oracle', { category: 'oracle' }) });
        commands.registerCommand({ id: 'm4-nara.canvas-highlight.expand', label: `${EXTENSION_ID}: expand canvas highlight` }, { execute: () => this.dispatchPaletteCommand('m4-nara.canvas-highlight.expand', { category: 'expand' }) });
        commands.registerCommand({ id: 'm4-nara.canvas-highlight.dream', label: `${EXTENSION_ID}: highlight dream` }, { execute: () => this.dispatchPaletteCommand('m4-nara.canvas-highlight.dream', { category: 'dream' }) });
    }

    override registerKeybindings(keybindings: KeybindingRegistry): void {
        super.registerKeybindings(keybindings);
        keybindings.registerKeybinding({
            command: 'm4-nara.openCoordinate',
            keybinding: 'cmd+shift+4'
        });
        keybindings.registerKeybinding({
            command: 'm4-nara.day-calendar.focus',
            keybinding: 'cmd+shift+d'
        });
        keybindings.registerKeybinding({
            command: 'm4-nara.oracle.cast',
            keybinding: 'cmd+alt+o'
        });
        keybindings.registerKeybinding({
            command: 'm4-nara.canvas-highlight.daily-note',
            keybinding: 'cmd+h d'
        });
        keybindings.registerKeybinding({
            command: 'm4-nara.canvas-highlight.oracle',
            keybinding: 'cmd+h o'
        });
        keybindings.registerKeybinding({
            command: 'm4-nara.canvas-highlight.expand',
            keybinding: 'cmd+h e'
        });
        keybindings.registerKeybinding({
            command: 'm4-nara.canvas-highlight.dream',
            keybinding: 'cmd+h m'
        });
    }

    /**
     * 31.2 / CC-02: command-palette entries route through the shared bridge so
     * the OmniPanel parity layer can observe and forward the dispatch. Feature
     * behaviour lands in the owning feature tranche (25.x).
     */
    protected dispatchPaletteCommand(commandId: string, params: Record<string, unknown> = {}): void {
        this.bridge.updateCurrentStateSelectorPayload(commandId, {
            commandId,
            extensionId: EXTENSION_ID,
            ...params
        });
    }
}

@injectable()
export class M4LensApplicationContribution
    extends AbstractViewContribution<LensApplicationWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    static readonly OPEN_COMMAND_ID = `${EXTENSION_ID}.openLensApplication`;

    constructor() {
        super({
            widgetId: LensApplicationWidget.ID,
            widgetName: LensApplicationWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: M4LensApplicationContribution.OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; composition or command routing opens it.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: M4LensApplicationContribution.OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open lens application` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }
}

@injectable()
export class M4LogosCycleContribution
    extends AbstractViewContribution<LogosCycleWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    static readonly OPEN_COMMAND_ID = `${EXTENSION_ID}.openLogosCycle`;

    constructor() {
        super({
            widgetId: LogosCycleWidget.ID,
            widgetName: LogosCycleWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: M4LogosCycleContribution.OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; composition or command routing opens it.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: M4LogosCycleContribution.OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open logos cycle` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'logos',
            'M4 Nara: Logos Cycle',
            () => this.openView({ activate: true, reveal: true })
        );
    }
}

@injectable()
export class M4AmbientStateStripContribution
    extends AbstractViewContribution<AmbientStateStripWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    static readonly OPEN_COMMAND_ID = `${EXTENSION_ID}.openAmbientStateStrip`;

    constructor() {
        super({
            widgetId: AmbientStateStripWidget.ID,
            widgetName: AmbientStateStripWidget.LABEL,
            defaultWidgetOptions: { area: 'top' },
            toggleCommandId: M4AmbientStateStripContribution.OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; composition or command routing opens it.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: M4AmbientStateStripContribution.OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open ambient state strip` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }
}

@injectable()
export class M4TuningBarContribution
    extends AbstractViewContribution<TuningBarWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    static readonly OPEN_COMMAND_ID = `${EXTENSION_ID}.openTuningBar`;

    constructor() {
        super({
            widgetId: TuningBarWidget.ID,
            widgetName: TuningBarWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: M4TuningBarContribution.OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; composition or command routing opens it.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: M4TuningBarContribution.OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open tuning bar` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }
}

@injectable()
export class M4KairosWheelContribution
    extends AbstractViewContribution<KairosDisplayWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    static readonly OPEN_COMMAND_ID = `${EXTENSION_ID}.openKairosWheel`;

    constructor() {
        super({
            widgetId: KairosDisplayWidget.ID,
            widgetName: KairosDisplayWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: M4KairosWheelContribution.OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; composition or command routing opens it.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: M4KairosWheelContribution.OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open kairos wheel` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }
}

@injectable()
export class M4DialogicalArenaContribution
    extends AbstractViewContribution<DialogicalArenaWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    static readonly OPEN_COMMAND_ID = `${EXTENSION_ID}.openDialogicalArena`;

    constructor() {
        super({
            widgetId: DialogicalArenaWidget.ID,
            widgetName: DialogicalArenaWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: M4DialogicalArenaContribution.OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; composition or command routing opens it.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: M4DialogicalArenaContribution.OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open dialogical arena` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'dialogical-arena',
            'M4 Nara: Dialogical Arena',
            () => this.openView({ activate: true, reveal: true })
        );
    }
}

/**
 * Task 32.2 — PASU-absence detection orchestration.
 *
 * Registers the `m4.openPasuWizard` command and installs a pre-stage-6 identity
 * gate on the {@link ColdStartOrchestrator} (32.1). When the readiness gate
 * clears, the orchestrator fires the gate, which probes `nara.pasu.show` and —
 * if PASU is absent — suspends the optional kairos stage and opens the PASU
 * wizard (widget owned by Tranche 25.4). Wizard skip/completion resumes stage 6.
 *
 * This contribution owns only the orchestration: the wizard UI, its steps, and
 * its per-step skip affordances belong to 25.4, which registers its launcher via
 * {@link setPasuWizardLauncher}.
 */
@injectable()
export class M4IdentityWizardContribution
    implements CommandContribution, FrontendApplicationContribution
{
    @inject(ColdStartOrchestrator)
    protected readonly orchestrator!: ColdStartOrchestrator;

    @inject(SharedBridgeAdapter)
    protected readonly adapter!: SharedBridgeAdapter;

    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    @inject(CommandService)
    protected readonly commands!: CommandService;

    private gateDisposable?: { dispose(): void };

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(
            { id: OPEN_PASU_WIZARD_COMMAND, label: `${EXTENSION_ID}: open PASU identity wizard` },
            { execute: (args?: { mode?: PasuWizardMode }) => this.openWizard(args?.mode ?? 'full') }
        );
    }

    onStart(): void {
        this.gateDisposable = this.orchestrator.registerStage6Gate(
            createPasuIdentityGate({
                invokeGatewayRpc: (method, params) => this.adapter.invokeGatewayRpc(method, params),
                suspendStage6: () => this.orchestrator.suspendStage6(),
                resumeStage6: mode => this.orchestrator.resumeStage6(mode),
                openWizard: mode => {
                    void this.commands.executeCommand(OPEN_PASU_WIZARD_COMMAND, { mode });
                }
            })
        );
    }

    onStop(): void {
        this.gateDisposable?.dispose();
        this.gateDisposable = undefined;
    }

    private openWizard(mode: PasuWizardMode): void {
        const resolveServices = {
            setPreference: (key: string, value: unknown) =>
                this.preferences.set(key, value, PreferenceScope.User),
            getSkippedSteps: () => this.preferences.get<string[]>(PASU_SKIPPED_PREFERENCE, []),
            resumeStage6: (resumeMode: Parameters<ColdStartOrchestrator['resumeStage6']>[0]) =>
                this.orchestrator.resumeStage6(resumeMode)
        };

        const launched = launchPasuWizard({
            mode,
            skip: () => runPasuWizardSkip(resolveServices),
            complete: () => runPasuWizardComplete(resolveServices)
        });

        if (!launched) {
            // 25.4 wizard launcher not registered — never trap cold-start; the
            // orchestrator advances stage 6 on the FR-3 graceful stub.
            this.orchestrator.resumeStage6('fr3-stub');
        }
    }
}

@injectable()
class M4NaraPublisher implements MObservabilityPublisher {
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    publish(event: { type: string; extensionId: string; emittedAt: number; payload: Readonly<Record<string, unknown>> }): void {
        if (!OBSERVABILITY_EVENT_TYPES.includes(event.type as (typeof OBSERVABILITY_EVENT_TYPES)[number])) {
            throw new Error(
                `${EXTENSION_ID} cannot publish unlisted observability event type: ${event.type}`
            );
        }
        if (event.extensionId !== EXTENSION_ID) {
            throw new Error(
                `${EXTENSION_ID} publisher refusing event from foreign extensionId ${event.extensionId}`
            );
        }
        this.bridge.publish(event);
    }
}

@injectable()
class M4NaraEmptyStateRegistration implements FrontendApplicationContribution {
    @inject(EMPTY_STATE_REGISTRY)
    protected readonly emptyStates!: EmptyStateRegistry;

    protected disposable?: Disposable;

    onStart(): void {
        this.disposable = this.emptyStates.register({
            extensionId: EXTENSION_ID,
            viewId: 'm4-nara.primary',
            activationCondition: snapshot => snapshot.state !== 'ready_public_current',
            component: M4NaraEmptyState
        });
    }

    onStop(): void {
        this.disposable?.dispose();
        this.disposable = undefined;
    }
}

export default new ContainerModule(bind => {
    bind(HighlightService).toSelf().inSingletonScope();
    bind(M4NaraWidget).toSelf();
    bind(M4NaraEmptyStateWidget).toSelf();
    bind(M4NaraCanvasEditorWidget).toSelf();
    bind(LensApplicationWidget).toSelf();
    bind(LogosCycleWidget).toSelf();
    bind(AmbientStateStripWidget).toSelf();
    bind(TuningBarWidget).toSelf();
    bind(KairosDisplayWidget).toSelf();
    bind(JournalEntriesSidebarWidget).toSelf();
    bind(DialogicalArenaWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: M4NaraWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: LensApplicationWidget.ID,
            createWidget: () => createLensApplicationWidget(ctx.container)
        }))
        .inSingletonScope();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: LogosCycleWidget.ID,
            createWidget: () => createLogosCycleWidget(ctx.container)
        }))
        .inSingletonScope();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: AmbientStateStripWidget.ID,
            createWidget: () => createAmbientStateStripWidget(ctx.container)
        }))
        .inSingletonScope();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: TuningBarWidget.ID,
            createWidget: () => createTuningBarWidget(ctx.container)
        }))
        .inSingletonScope();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: KairosDisplayWidget.ID,
            createWidget: () => createKairosDisplayWidget(ctx.container)
        }))
        .inSingletonScope();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: JournalEntriesSidebarWidget.ID,
            createWidget: () => createJournalEntriesSidebarWidget(ctx.container)
        }))
        .inSingletonScope();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: DialogicalArenaWidget.ID,
            createWidget: () => createDialogicalArenaWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, M4NaraContribution);
    bind(FrontendApplicationContribution).toService(M4NaraContribution);
    bindViewContribution(bind, M4LensApplicationContribution);
    bind(FrontendApplicationContribution).toService(M4LensApplicationContribution);
    bindViewContribution(bind, M4LogosCycleContribution);
    bind(FrontendApplicationContribution).toService(M4LogosCycleContribution);
    bindViewContribution(bind, M4AmbientStateStripContribution);
    bind(FrontendApplicationContribution).toService(M4AmbientStateStripContribution);
    bindViewContribution(bind, M4TuningBarContribution);
    bind(FrontendApplicationContribution).toService(M4TuningBarContribution);
    bindViewContribution(bind, M4KairosWheelContribution);
    bind(FrontendApplicationContribution).toService(M4KairosWheelContribution);
    bindViewContribution(bind, M4DialogicalArenaContribution);
    bind(FrontendApplicationContribution).toService(M4DialogicalArenaContribution);

    // Tranche 25.3 — Journal Entries activity-bar mode (daily-0-1 left slot).
    bindViewContribution(bind, M4JournalEntriesContribution);
    bind(FrontendApplicationContribution).toService(M4JournalEntriesContribution);
    bind(CommandContribution).toService(M4JournalEntriesContribution);

    // Task 32.2 — PASU-absence detection orchestration. Registers the
    // m4.openPasuWizard command and the pre-stage-6 identity gate.
    bind(M4IdentityWizardContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(M4IdentityWizardContribution);
    bind(FrontendApplicationContribution).toService(M4IdentityWizardContribution);

    bind(M4NaraPublisher).toSelf().inSingletonScope();
    bind(M4_NARA_PUBLISHER).toService(
        M4NaraPublisher
    );
    bind(M4NaraEmptyStateRegistration).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(M4NaraEmptyStateRegistration);

    // ROUTE_PATH reference keeps the constant load-bearing; route resolution
    // happens via the registered command above.
    void ROUTE_PATH;
    void DIALOGICAL_ARENA_VIEW_ID;
});

function createWidget(container: interfaces.Container): M4NaraWidget {
    const child = container.createChild();
    child.bind(M4NaraWidget).toSelf();
    return child.get(M4NaraWidget);
}

function createLensApplicationWidget(container: interfaces.Container): LensApplicationWidget {
    const child = container.createChild();
    child.bind(LensApplicationWidget).toSelf();
    return child.get(LensApplicationWidget);
}

function createLogosCycleWidget(container: interfaces.Container): LogosCycleWidget {
    const child = container.createChild();
    child.bind(LogosCycleWidget).toSelf();
    return child.get(LogosCycleWidget);
}

function createAmbientStateStripWidget(container: interfaces.Container): AmbientStateStripWidget {
    const child = container.createChild();
    child.bind(AmbientStateStripWidget).toSelf();
    return child.get(AmbientStateStripWidget);
}

function createTuningBarWidget(container: interfaces.Container): TuningBarWidget {
    const child = container.createChild();
    child.bind(TuningBarWidget).toSelf();
    return child.get(TuningBarWidget);
}

function createKairosDisplayWidget(container: interfaces.Container): KairosDisplayWidget {
    const child = container.createChild();
    child.bind(KairosDisplayWidget).toSelf();
    return child.get(KairosDisplayWidget);
}

function createJournalEntriesSidebarWidget(container: interfaces.Container): JournalEntriesSidebarWidget {
    const child = container.createChild();
    child.bind(JournalEntriesSidebarWidget).toSelf();
    return child.get(JournalEntriesSidebarWidget);
}

function createDialogicalArenaWidget(container: interfaces.Container): DialogicalArenaWidget {
    const child = container.createChild();
    child.bind(DialogicalArenaWidget).toSelf();
    return child.get(DialogicalArenaWidget);
}
