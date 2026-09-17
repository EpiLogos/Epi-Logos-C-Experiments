import { FrontendApplicationContribution, StatusBarAlignment, StatusBarEntry } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter } from '../../common/shared-bridge';
import {
    StateThreadStatusEntryContribution,
    StateThreadStatusEntryDescriptor
} from './state-thread-status-support';

@injectable()
export class ProfileGenerationStatusEntry
    extends StateThreadStatusEntryContribution
    implements FrontendApplicationContribution
{
    @inject(SharedBridgeAdapter) protected readonly bridge!: SharedBridgeAdapter;

    protected readonly descriptor: StateThreadStatusEntryDescriptor = {
        id: 'pratibimba.state-thread.profile-generation',
        name: 'Profile Generation',
        priority: 150,
        alignment: StatusBarAlignment.RIGHT,
        marker: 'profile-generation'
    };

    protected override createSubscriptions() {
        return [
            this.bridge.onProfile(() => this.render()),
            this.bridge.onCoordinateContext(() => this.render())
        ];
    }

    protected toStatusBarEntry(): StatusBarEntry {
        const snapshot = this.bridge.currentSnapshot();
        const generation = snapshot.profile?.generation ?? snapshot.context.profileGeneration;

        return {
            text: `$(versions) gen: ${generation ?? 'pending'}`,
            tooltip: `Profile generation: ${generation ?? 'pending'}`,
            alignment: StatusBarAlignment.RIGHT,
            priority: 150
        };
    }
}
