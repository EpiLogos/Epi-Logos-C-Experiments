import { inject, injectable } from '@theia/core/shared/inversify';
import {
    CommandContribution,
    CommandRegistry
} from '@theia/core/lib/common';
import {
    FrontendApplicationContribution,
    PreferenceService
} from '@theia/core/lib/browser';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { BackendStudioWidget } from './backend-studio-widget';
import {
    BACKEND_STUDIO_ACTIVITY_BAR_SLOT,
    BACKEND_STUDIO_LABEL,
    BACKEND_STUDIO_OPEN_SOURCE_COMMAND,
    BACKEND_STUDIO_WIDGET_ID,
    BackendStudioService
} from './backend-studio-service';

export const BACKEND_STUDIO_LAYOUT_PREFERENCE = 'epi-logos.layout.active';

// Activity-bar target widget id: pratibimba.ide-shell.backend-studio.
export const BACKEND_STUDIO_ACTIVITY_BAR_MODE = Object.freeze({
    id: 'backend-studio',
    label: BACKEND_STUDIO_LABEL,
    iconClass: 'codicon-terminal',
    widgetId: BACKEND_STUDIO_WIDGET_ID,
    availableInLayouts: Object.freeze(['ide-deep'])
});

export interface BackendStudioOpenSourceCommandArg {
    readonly coordinate: string;
    readonly sourceAnchor: string;
}

@injectable()
export class BackendStudioContribution
    extends AbstractViewContribution<BackendStudioWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    @inject(BackendStudioService)
    protected readonly service!: BackendStudioService;

    constructor() {
        super({
            widgetId: BACKEND_STUDIO_WIDGET_ID,
            viewContainerId: BACKEND_STUDIO_ACTIVITY_BAR_SLOT,
            widgetName: BACKEND_STUDIO_LABEL,
            defaultWidgetOptions: { area: 'left' },
            toggleCommandId: 'pratibimba.ide-shell.activity-bar.set-mode.backend-studio'
        });
    }

    async onStart(): Promise<void> {
        this.service.registerLanguageServers();
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            {
                id: BACKEND_STUDIO_OPEN_SOURCE_COMMAND,
                label: 'Backend Studio: Open Source'
            },
            {
                execute: async (
                    coordinateOrArg: string | BackendStudioOpenSourceCommandArg,
                    maybeSourceAnchor?: string
                ) => {
                    const { coordinate, sourceAnchor } = normalizeOpenSourceArgs(
                        coordinateOrArg,
                        maybeSourceAnchor
                    );
                    if (!this.isBackendStudioVisible()) {
                        return {
                            openedUri: null,
                            blockedReason: 'Backend Studio is visible only when epi-logos.layout.active = ide-deep'
                        };
                    }
                    await this.openView({ activate: true, reveal: true });
                    return this.service.openSource(coordinate, sourceAnchor);
                }
            }
        );
    }

    override async openView(args?: Parameters<AbstractViewContribution<BackendStudioWidget>['openView']>[0]): Promise<BackendStudioWidget> {
        if (!this.isBackendStudioVisible()) {
            throw new Error('Backend Studio is visible only when epi-logos.layout.active = ide-deep');
        }
        return super.openView(args);
    }

    isBackendStudioVisible(): boolean {
        return this.preferences.get<string>(BACKEND_STUDIO_LAYOUT_PREFERENCE, 'daily-0-1') === 'ide-deep';
    }
}

function normalizeOpenSourceArgs(
    coordinateOrArg: string | BackendStudioOpenSourceCommandArg,
    maybeSourceAnchor?: string
): BackendStudioOpenSourceCommandArg {
    if (typeof coordinateOrArg === 'string') {
        return {
            coordinate: coordinateOrArg,
            sourceAnchor: maybeSourceAnchor ?? ''
        };
    }
    return coordinateOrArg;
}
