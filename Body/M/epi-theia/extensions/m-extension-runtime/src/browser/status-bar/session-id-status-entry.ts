import { FrontendApplicationContribution, StatusBarAlignment, StatusBarEntry } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter } from '../../common/shared-bridge';
import {
    compact,
    dayNowSummary,
    StateThreadStatusEntryContribution,
    StateThreadStatusEntryDescriptor
} from './state-thread-status-support';

@injectable()
export class SessionIdStatusEntry
    extends StateThreadStatusEntryContribution
    implements FrontendApplicationContribution
{
    @inject(SharedBridgeAdapter) protected readonly bridge!: SharedBridgeAdapter;

    protected readonly descriptor: StateThreadStatusEntryDescriptor = {
        id: 'pratibimba.state-thread.session-id',
        name: 'Session ID',
        priority: 170,
        alignment: StatusBarAlignment.LEFT,
        marker: 'session-id'
    };

    protected override createSubscriptions() {
        return [
            this.bridge.onCoordinateContext(() => this.render())
        ];
    }

    protected toStatusBarEntry(): StatusBarEntry {
        const summary = dayNowSummary(this.bridge.currentSnapshot().context.dayNowSessionHandle);
        const sessionId = summary.sessionId;

        return {
            text: `$(key) ${compact(sessionId, 8)}`,
            tooltip: `Session id: ${sessionId ?? 'pending'}`,
            alignment: StatusBarAlignment.LEFT,
            priority: 170
        };
    }
}
