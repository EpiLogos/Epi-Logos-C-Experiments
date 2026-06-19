import { FrontendApplicationContribution, StatusBarAlignment, StatusBarEntry } from '@theia/core/lib/browser';
import { PreferenceService } from '@theia/core/lib/browser/preferences';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import { inject, injectable } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter } from '../../common/shared-bridge';
import {
    profileField,
    StateThreadStatusEntryContribution,
    StateThreadStatusEntryDescriptor
} from './state-thread-status-support';

export const PROFILE_TICK_VISIBLE_PREFERENCE = 'epi-logos.profile.tick.visible';
export const OPEN_PROFILE_TICK_DIAGNOSTICS_COMMAND = 'pratibimba.state-thread.open-profile-tick-history';

@injectable()
export class ProfileTickStatusEntry
    extends StateThreadStatusEntryContribution
    implements FrontendApplicationContribution, CommandContribution
{
    @inject(SharedBridgeAdapter) protected readonly bridge!: SharedBridgeAdapter;
    @inject(PreferenceService) protected readonly preferences!: PreferenceService;
    @inject(CommandRegistry) protected readonly commands!: CommandRegistry;

    protected readonly descriptor: StateThreadStatusEntryDescriptor = {
        id: 'pratibimba.state-thread.profile-tick',
        name: 'Profile Tick',
        priority: 140,
        alignment: StatusBarAlignment.RIGHT,
        marker: 'profile-tick'
    };

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand({
            id: OPEN_PROFILE_TICK_DIAGNOSTICS_COMMAND,
            label: 'Pratibimba: Open Profile-Tick History'
        }, {
            execute: () => this.openProfileTickHistory()
        });
    }

    protected override createSubscriptions() {
        return [
            this.bridge.onProfile(() => this.render()),
            this.preferences.onPreferenceChanged(change => {
                if (change.preferenceName === PROFILE_TICK_VISIBLE_PREFERENCE) {
                    this.render();
                }
            })
        ];
    }

    protected override render(): void {
        if (this.preferences.get<boolean>(PROFILE_TICK_VISIBLE_PREFERENCE, true) !== true) {
            void this.statusBar.removeElement(this.descriptor.id);
            return;
        }
        super.render();
    }

    protected toStatusBarEntry(): StatusBarEntry {
        const profile = this.bridge.currentSnapshot().profile;
        const tick = profileField(profile, [
            'tick',
            'profileTick',
            'profile_tick',
            'tickNumber',
            'tick.number'
        ]) ?? 'pending';
        const lastTick = profileField(profile, ['lastTickTimestamp', 'last_tick_timestamp', 'tick.timestamp']) ?? 'pending';

        return {
            text: `tick:${tick} gen:${profile?.generation ?? 'pending'}`,
            tooltip: [
                `Last tick fired: ${lastTick}`,
                `Profile generation: ${profile?.generation ?? 'pending'}`
            ].join('\n'),
            alignment: StatusBarAlignment.RIGHT,
            priority: 140,
            command: OPEN_PROFILE_TICK_DIAGNOSTICS_COMMAND
        };
    }

    protected async openProfileTickHistory(): Promise<void> {
        await this.commands.executeCommand('omnipanel.openTab', 'diagnostics', {
            focus: 'profile-tick-history'
        });
    }
}
