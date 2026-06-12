import { FrontendApplicationContribution, StatusBarAlignment, StatusBarEntry } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter } from '../../common/shared-bridge';
import {
    profileField,
    StateThreadStatusEntryContribution,
    StateThreadStatusEntryDescriptor
} from './state-thread-status-support';

@injectable()
export class ProfileTickStatusEntry
    extends StateThreadStatusEntryContribution
    implements FrontendApplicationContribution
{
    @inject(SharedBridgeAdapter) protected readonly bridge!: SharedBridgeAdapter;

    protected readonly descriptor: StateThreadStatusEntryDescriptor = {
        id: 'pratibimba.state-thread.profile-tick',
        name: 'Profile Tick',
        priority: 140,
        alignment: StatusBarAlignment.RIGHT,
        marker: 'profile-tick'
    };

    protected override createSubscriptions() {
        return [
            this.bridge.onProfile(() => this.render())
        ];
    }

    protected toStatusBarEntry(): StatusBarEntry {
        const profile = this.bridge.currentSnapshot().profile;
        const tick12 = profileField(profile, ['tick12', 'tick.12', 'tick.twelve']) ?? 'tick--';
        const position6 = profileField(profile, ['position6', 'position.6', 'position.six']) ?? 'pos--';
        const operation = profileField(profile, ['Ananda_Matrix_Op', 'anandaMatrixOp', 'operation']) ?? 'op--';
        const lastTick = profileField(profile, ['lastTickTimestamp', 'last_tick_timestamp', 'tick.timestamp']) ?? 'pending';
        const slerpPhase = profileField(profile, ['slerpPhase', 'slerp.phase']) ?? 'pending';

        return {
            text: `$(pulse) ${tick12} / ${position6} / ${operation}`,
            tooltip: [
                `Profile generation: ${profile?.generation ?? 'pending'}`,
                `Last tick: ${lastTick}`,
                `Slerp phase: ${slerpPhase}`
            ].join('\n'),
            alignment: StatusBarAlignment.RIGHT,
            priority: 140
        };
    }
}
