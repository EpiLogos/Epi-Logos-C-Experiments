import { FrontendApplicationContribution, StatusBarAlignment, StatusBarEntry } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter } from '../../common/shared-bridge';
import {
    dayNowSummary,
    StateThreadStatusEntryContribution,
    StateThreadStatusEntryDescriptor
} from './state-thread-status-support';

@injectable()
export class DayNowStatusEntry
    extends StateThreadStatusEntryContribution
    implements FrontendApplicationContribution
{
    @inject(SharedBridgeAdapter) protected readonly bridge!: SharedBridgeAdapter;

    protected readonly descriptor: StateThreadStatusEntryDescriptor = {
        id: 'pratibimba.state-thread.day-now',
        name: 'Day Now',
        priority: 180,
        alignment: StatusBarAlignment.LEFT,
        marker: 'day-now'
    };

    protected override createSubscriptions() {
        return [
            this.bridge.onCoordinateContext(() => this.render())
        ];
    }

    protected toStatusBarEntry(): StatusBarEntry {
        const summary = dayNowSummary(this.bridge.currentSnapshot().context.dayNowSessionHandle);

        return {
            text: `$(calendar) ${summary.shortDate}`,
            tooltip: [
                `Day id: ${summary.dayId ?? 'pending'}`,
                `Vault path: ${summary.vaultPath ?? 'pending'}`,
                `Session: ${summary.sessionId ?? 'pending'}`
            ].join('\n'),
            alignment: StatusBarAlignment.LEFT,
            priority: 180
        };
    }
}
