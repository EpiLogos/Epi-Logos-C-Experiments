// Generated from contracts/08-t0-composition-contract-preflight.json. Do not hand-edit.
import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    CompositionCoordinator,
    findNamedLayout,
    IntegratedContributorRecord,
    IntegratedEmptyState,
    buildEmptyState
} from '@pratibimba/integrated-composition';
import { PLUGIN_ID, CONTRIBUTOR_IDS } from '../common';

@injectable()
export class PluginIntegrated450Widget extends ReactWidget {
    static readonly ID = 'plugin-integrated-4-5-0.primary';
    static readonly LABEL = 'Jiva-Siva';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected coordinator: CompositionCoordinator = new CompositionCoordinator(
        findNamedLayout('plugin-integrated-4-5-0')
    );
    protected contributorRecords: readonly IntegratedContributorRecord[] = [];
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = PluginIntegrated450Widget.ID;
        this.title.label = PluginIntegrated450Widget.LABEL;
        this.title.caption = PluginIntegrated450Widget.LABEL;
        this.title.closable = true;
        this.addClass('integrated-widget');
        this.addClass('integrated-widget-' + PLUGIN_ID);

        this.subscriptions.push(
            this.bridge.onReadiness(() => this.update())
        );
        this.subscriptions.push(
            this.bridge.onProfile(() => this.update())
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try { sub.dispose(); } catch { /* best-effort */ }
        }
        super.dispose();
    }

    setContributors(records: readonly IntegratedContributorRecord[]): void {
        this.contributorRecords = records;
        this.update();
    }

    protected override render(): React.ReactNode {
        const aggregate = this.coordinator.aggregateReadiness(this.contributorRecords);
        const view = buildEmptyState(
            this.coordinator.layout,
            aggregate,
            CONTRIBUTOR_IDS as readonly any[] as readonly import('@pratibimba/m-extension-runtime').MExtensionId[],
            this.contributorRecords.map(r => r.extensionId)
        );
        return (
            <div className="integrated-widget-root">
                <IntegratedEmptyState view={view} title={PluginIntegrated450Widget.LABEL} />
            </div>
        );
    }
}
