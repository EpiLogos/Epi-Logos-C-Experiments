import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { CommandRegistry } from '@theia/core/lib/common/command';
import {
    KernelBridgeReadinessSnapshot,
    KernelBridgeReadinessSource,
    PENDING_READINESS,
    readinessSeverity
} from '../common/readiness-types';

export const KERNEL_BRIDGE_READINESS_SOURCE = Symbol('KernelBridgeReadinessSource');

@injectable()
export class KernelBridgeReadinessWidget extends ReactWidget {
    static readonly ID = 'kernel-bridge-readiness:widget';
    static readonly LABEL = 'Kernel Bridge Readiness';

    @inject(CommandRegistry) protected readonly commands!: CommandRegistry;
    @inject(KERNEL_BRIDGE_READINESS_SOURCE)
    protected readonly source!: KernelBridgeReadinessSource;

    protected snapshot: KernelBridgeReadinessSnapshot = PENDING_READINESS;
    protected refreshing = false;

    @postConstruct()
    protected init(): void {
        this.id = KernelBridgeReadinessWidget.ID;
        this.title.label = KernelBridgeReadinessWidget.LABEL;
        this.title.caption = KernelBridgeReadinessWidget.LABEL;
        this.title.closable = true;
        this.addClass('kernel-bridge-readiness');
        void this.refresh();
    }

    protected async refresh(): Promise<void> {
        this.refreshing = true;
        this.update();
        try {
            this.snapshot = await this.source.fetch();
        } finally {
            this.refreshing = false;
            this.update();
        }
    }

    protected override render(): React.ReactNode {
        const { state, reason, profileGeneration, gatewayReachable, blockerIds, fetchedAt } =
            this.snapshot;
        const severity = readinessSeverity(state);
        return (
            <div className={`kbr-root kbr-severity-${severity}`}>
                <header className="kbr-header">
                    <h2 className="kbr-title">{KernelBridgeReadinessWidget.LABEL}</h2>
                    <button
                        className="theia-button kbr-refresh"
                        disabled={this.refreshing}
                        onClick={() => void this.refresh()}
                    >
                        {this.refreshing ? 'Refreshing…' : 'Refresh'}
                    </button>
                </header>
                <dl className="kbr-grid">
                    <dt>State</dt>
                    <dd className={`kbr-state kbr-state-${state}`}>{state}</dd>
                    <dt>Reason</dt>
                    <dd>{reason}</dd>
                    <dt>Gateway reachable</dt>
                    <dd>{gatewayReachable ? 'yes' : 'no'}</dd>
                    <dt>Profile generation</dt>
                    <dd>{profileGeneration ?? '—'}</dd>
                    <dt>Source</dt>
                    <dd>{this.source.describe()}</dd>
                    <dt>Last fetched</dt>
                    <dd>
                        {fetchedAt === 0
                            ? 'never'
                            : new Date(fetchedAt).toISOString()}
                    </dd>
                </dl>
                {blockerIds.length > 0 && (
                    <section className="kbr-blockers">
                        <h3>Carried-forward blockers</h3>
                        <ul>
                            {blockerIds.map(id => (
                                <li key={id}>{id}</li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        );
    }
}
