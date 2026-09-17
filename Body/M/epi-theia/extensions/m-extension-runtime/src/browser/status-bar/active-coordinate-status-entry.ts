import { FrontendApplicationContribution, StatusBarAlignment, StatusBarEntry } from '@theia/core/lib/browser';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import { inject, injectable } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter } from '../../common/shared-bridge';
import {
    compact,
    coordinateParts,
    firstCoordinate,
    StateThreadStatusEntryContribution,
    StateThreadStatusEntryDescriptor
} from './state-thread-status-support';

export const JUMP_TO_COORDINATE_COMMAND = 'pratibimba.state-thread.jump-to-coordinate';

@injectable()
export class ActiveCoordinateStatusEntry
    extends StateThreadStatusEntryContribution
    implements FrontendApplicationContribution, CommandContribution
{
    @inject(SharedBridgeAdapter) protected readonly bridge!: SharedBridgeAdapter;
    @inject(CommandRegistry) protected readonly commands!: CommandRegistry;

    protected readonly descriptor: StateThreadStatusEntryDescriptor = {
        id: 'pratibimba.state-thread.active-coordinate',
        name: 'Active Coordinate',
        priority: 190,
        alignment: StatusBarAlignment.LEFT,
        marker: 'active-coordinate'
    };

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand({
            id: JUMP_TO_COORDINATE_COMMAND,
            label: 'Pratibimba: Jump to Active Coordinate'
        }, {
            execute: () => this.jumpToCoordinate()
        });
    }

    protected override createSubscriptions() {
        return [
            this.bridge.onCoordinateContext(() => this.render())
        ];
    }

    protected toStatusBarEntry(): StatusBarEntry {
        const context = this.bridge.currentSnapshot().context;
        const coordinate = firstCoordinate(context);
        const parts = coordinateParts(coordinate);

        return {
            text: `$(symbol-namespace) ${compact(coordinate)}`,
            tooltip: [
                `Coordinate: ${coordinate ?? 'pending'}`,
                `Family: ${parts.family}`,
                `Archetype: ${parts.archetype}`,
                `Position: ${parts.position}`
            ].join('\n'),
            alignment: StatusBarAlignment.LEFT,
            priority: 190,
            command: 'pratibimba.state-thread.jump-to-coordinate'
        };
    }

    protected async jumpToCoordinate(): Promise<void> {
        const context = this.bridge.currentSnapshot().context;
        const coordinate = firstCoordinate(context);
        if (!coordinate) {
            return;
        }

        this.bridge.publish({
            type: 'state-thread.jump-to-coordinate',
            extensionId: 'm-extension-runtime',
            emittedAt: Date.now(),
            payload: {
                coordinate,
                profileGeneration: context.profileGeneration,
                privacyClass: context.privacyClass
            }
        });

        if (this.commands.isEnabled('pratibimba.ide-shell-m0-m5.coordinate-tree.toggle')) {
            await this.commands.executeCommand('pratibimba.ide-shell-m0-m5.coordinate-tree.toggle', { coordinate });
        }
    }
}
