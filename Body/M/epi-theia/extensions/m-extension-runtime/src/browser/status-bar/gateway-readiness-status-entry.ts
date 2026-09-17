import { FrontendApplicationContribution, StatusBarAlignment, StatusBarEntry } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter } from '../../common/shared-bridge';
import {
    connectionIcon,
    connectionLabel,
    StateThreadStatusEntryContribution,
    StateThreadStatusEntryDescriptor
} from './state-thread-status-support';

@injectable()
export class GatewayReadinessStatusEntry
    extends StateThreadStatusEntryContribution
    implements FrontendApplicationContribution
{
    @inject(SharedBridgeAdapter) protected readonly bridge!: SharedBridgeAdapter;

    protected readonly descriptor: StateThreadStatusEntryDescriptor = {
        id: 'pratibimba.state-thread.gateway-readiness',
        name: 'Gateway Readiness',
        priority: 160,
        alignment: StatusBarAlignment.RIGHT,
        marker: 'gateway-readiness'
    };

    protected override createSubscriptions() {
        return [
            this.bridge.onConnectionStatus(() => this.render())
        ];
    }

    protected toStatusBarEntry(): StatusBarEntry {
        const status = this.bridge.currentSnapshot().status;

        return {
            text: `${connectionIcon(status)} gateway`,
            tooltip: `Gateway readiness: ${connectionLabel(status)}\nmode: ${status.mode}\nreason: ${status.reason}`,
            alignment: StatusBarAlignment.RIGHT,
            priority: 160
        };
    }
}
