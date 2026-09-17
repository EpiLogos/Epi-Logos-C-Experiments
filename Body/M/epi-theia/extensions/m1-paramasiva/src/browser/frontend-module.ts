// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import * as React from 'react';
import { ContainerModule, injectable, interfaces, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import {
    WidgetFactory,
    FrontendApplicationContribution,
    bindViewContribution
} from '@theia/core/lib/browser';
import type { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser/keybinding';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    EMPTY_STATE_REGISTRY,
    EmptyStateRegistry,
    MathemeHarmonicProfileBoundary,
    MObservabilityPublisher,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER,
    parseExtensionRoute,
    registerIntentTarget
} from '@pratibimba/m-extension-runtime';
import { M1ParamasivaWidget } from './m1-paramasiva-widget';
import {
    M1ParamasivaEmptyState,
    M1ParamasivaEmptyStateWidget
} from './empty-state';
import {
    kleinFlipEventFromProfile,
    M1KleinFlipEventBar,
    M1KleinFlipEventStrip,
    M1_KLEIN_FLIP_EVENT_STRIP_VIEW_ID,
    mergeKleinFlipEventTrail
} from './m1-klein-flip-event-strip';
import {
    EXTENSION_ID,
    OPEN_COMMAND_ID,
    READ_ONLY_COMMAND_ID,
    DEPOSIT_ONLY_COMMAND_ID,
    ROUTE_PATH,
    OBSERVABILITY_EVENT_TYPES
} from '../common';

export const M1_PARAMASIVA_PUBLISHER = Symbol(
    'm1-paramasiva.observabilityPublisher'
);
const AUDIO_BUS_INSPECTOR_COMMAND_ID = OPEN_COMMAND_ID + '?view=audioBusInspector';

@injectable()
export class M1ParamasivaContribution
    extends AbstractViewContribution<M1ParamasivaWidget>
    implements CommandContribution, FrontendApplicationContribution, KeybindingContribution
{
    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    constructor() {
        super({
            widgetId: M1ParamasivaWidget.ID,
            widgetName: M1ParamasivaWidget.LABEL,
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
            { execute: () => this.openClockInstrumentView() }
        );
        commands.registerCommand(
            { id: 'm1-paramasiva.openCoordinate', label: `${EXTENSION_ID}: open coordinate` },
            { execute: () => this.openClockInstrumentView() }
        );
        commands.registerCommand(
            {
                id: AUDIO_BUS_INSPECTOR_COMMAND_ID,
                label: `${EXTENSION_ID}: open audio bus inspector`
            },
            { execute: () => this.openAudioBusInspectorView() }
        );
        commands.registerCommand(
            { id: READ_ONLY_COMMAND_ID, label: `${EXTENSION_ID}: open read-only` },
            { execute: () => this.openClockInstrumentView() }
        );
        commands.registerCommand(
            { id: DEPOSIT_ONLY_COMMAND_ID, label: `${EXTENSION_ID}: open deposit-only` },
            { execute: () => this.openClockInstrumentView() }
        );
        // Route handler: deep links of the form epi-logos://ide/m1-paramasiva/walk?...
        commands.registerCommand(
            { id: `${EXTENSION_ID}.handleRoute`, label: `${EXTENSION_ID}: handle route` },
            {
                execute: (raw: string) => {
                    const route = parseExtensionRoute(raw);
                    if (!route || route.extensionId !== EXTENSION_ID) {
                        return undefined;
                    }
                    return route.query.view === 'audioBusInspector'
                        ? this.openAudioBusInspectorView()
                        : this.openClockInstrumentView();
                }
            }
        );
        // 31.2 / CC-02 command-palette catalog — stage-1 wave-C commands for
        // m1-paramasiva (22.x). Dispatch routes through the shared bridge only.
        commands.registerCommand({ id: 'm1-paramasiva.mersenne-proof.reveal', label: `${EXTENSION_ID}: reveal Mersenne proof` }, { execute: () => this.dispatchPaletteCommand('m1-paramasiva.mersenne-proof.reveal') });
        commands.registerCommand({ id: 'm1-paramasiva.vortex.face-mode.toggle', label: `${EXTENSION_ID}: toggle vortex face mode` }, { execute: () => this.dispatchPaletteCommand('m1-paramasiva.vortex.face-mode.toggle') });
        commands.registerCommand({ id: 'm1-paramasiva.K2-instrument.focus', label: `${EXTENSION_ID}: focus K2 instrument` }, { execute: () => this.dispatchPaletteCommand('m1-paramasiva.K2-instrument.focus') });
        commands.registerCommand({ id: 'm1-paramasiva.coordinate-tree.contribute', label: `${EXTENSION_ID}: contribute coordinate tree` }, { execute: () => this.dispatchPaletteCommand('m1-paramasiva.coordinate-tree.contribute') });
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'walk',
            'M1 Paramasiva: Open Walk',
            () => this.openClockInstrumentView()
        );
        registerIntentTarget(
            commands,
            EXTENSION_ID,
            'schema',
            'M1 Paramasiva: Open Schema Walk',
            () => this.openClockInstrumentView()
        );
    }

    override registerKeybindings(keybindings: KeybindingRegistry): void {
        super.registerKeybindings(keybindings);
        keybindings.registerKeybinding({
            command: 'm1-paramasiva.openCoordinate',
            keybinding: 'cmd+shift+1'
        });
        keybindings.registerKeybinding({
            command: 'm1-paramasiva.vortex.face-mode.toggle',
            keybinding: 'cmd+alt+f'
        });
        keybindings.registerKeybinding({
            command: 'm1-paramasiva.mersenne-proof.reveal',
            keybinding: 'cmd+alt+p',
            when: 'epi-logos.ui.developerMode === true'
        });
    }

    /**
     * 31.2 / CC-02: command-palette entries route through the shared bridge so
     * the OmniPanel parity layer can observe and forward the dispatch. Feature
     * behaviour lands in the owning feature tranche (22.x).
     */
    protected dispatchPaletteCommand(commandId: string, params: Record<string, unknown> = {}): void {
        this.bridge.updateCurrentStateSelectorPayload(commandId, {
            commandId,
            extensionId: EXTENSION_ID,
            ...params
        });
    }

    protected async openClockInstrumentView(): Promise<M1ParamasivaWidget> {
        const widget = await this.openView({ activate: true, reveal: true });
        widget.setActiveView('clockInstrument');
        return widget;
    }

    protected async openAudioBusInspectorView(): Promise<M1ParamasivaWidget> {
        const widget = await this.openView({ activate: true, reveal: true });
        widget.setActiveView('audioBusInspector');
        return widget;
    }
}

@injectable()
class M1ParamasivaPublisher implements MObservabilityPublisher {
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
class M1ParamasivaEmptyStateRegistration implements FrontendApplicationContribution {
    @inject(EMPTY_STATE_REGISTRY)
    protected readonly emptyStates!: EmptyStateRegistry;

    protected disposable?: Disposable;

    onStart(): void {
        this.disposable = this.emptyStates.register({
            extensionId: EXTENSION_ID,
            viewId: 'm1-paramasiva.primary',
            activationCondition: snapshot => snapshot.state !== 'ready_public_current',
            component: M1ParamasivaEmptyState
        });
    }

    onStop(): void {
        this.disposable?.dispose();
        this.disposable = undefined;
    }
}

@injectable()
export class M1KleinFlipEventStripWidget extends ReactWidget {
    static readonly ID = M1_KLEIN_FLIP_EVENT_STRIP_VIEW_ID;
    static readonly LABEL = 'M1 — Klein-flip event strip';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected events: M1KleinFlipEventBar[] = [];
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M1KleinFlipEventStripWidget.ID;
        this.title.label = M1KleinFlipEventStripWidget.LABEL;
        this.title.caption = M1KleinFlipEventStripWidget.LABEL;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                const nextEvent = profile
                    ? kleinFlipEventFromProfile(profile, this.events.length, Date.now())
                    : null;
                this.events = mergeKleinFlipEventTrail(this.events, nextEvent).slice(-32);
                this.update();
            })
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        return React.createElement(M1KleinFlipEventStrip, {
            profile: this.profile,
            events: this.events
        });
    }
}

export default new ContainerModule(bind => {
    bind(M1ParamasivaWidget).toSelf();
    bind(M1ParamasivaEmptyStateWidget).toSelf();
    bind(M1KleinFlipEventStripWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: M1ParamasivaWidget.ID,
            createWidget: () => createWidget(ctx.container)
        }))
        .inSingletonScope();
    bind(WidgetFactory)
        .toDynamicValue(ctx => ({
            id: M1KleinFlipEventStripWidget.ID,
            createWidget: () => createKleinFlipEventStripWidget(ctx.container)
        }))
        .inSingletonScope();
    bindViewContribution(bind, M1ParamasivaContribution);
    bind(FrontendApplicationContribution).toService(M1ParamasivaContribution);

    bind(M1ParamasivaPublisher).toSelf().inSingletonScope();
    bind(M1_PARAMASIVA_PUBLISHER).toService(
        M1ParamasivaPublisher
    );
    bind(M1ParamasivaEmptyStateRegistration).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(M1ParamasivaEmptyStateRegistration);

    // ROUTE_PATH reference keeps the constant load-bearing; route resolution
    // happens via the registered command above.
    void ROUTE_PATH;
});

function createWidget(container: interfaces.Container): M1ParamasivaWidget {
    const child = container.createChild();
    child.bind(M1ParamasivaWidget).toSelf();
    return child.get(M1ParamasivaWidget);
}

function createKleinFlipEventStripWidget(container: interfaces.Container): M1KleinFlipEventStripWidget {
    const child = container.createChild();
    child.bind(M1KleinFlipEventStripWidget).toSelf();
    return child.get(M1KleinFlipEventStripWidget);
}
