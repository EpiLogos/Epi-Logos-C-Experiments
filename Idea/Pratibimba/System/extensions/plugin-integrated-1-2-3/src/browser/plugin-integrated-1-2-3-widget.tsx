// 08.T3 cosmic engine slice — hand-extended from the 08.T1 scaffold.
// The scaffolder will no longer overwrite this file (see
// scripts/scaffold-integrated-plugins.mjs preserveExistingWidgets entry).
import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    MExtensionId,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    checkCosmicEnginePanes,
    CompositionCoordinator,
    findNamedLayout,
    IntegratedContributorRecord,
    IntegratedEmptyState,
    buildEmptyState
} from '@pratibimba/integrated-composition';
import { CosmicEnginePanes } from './cosmic-engine-panes';
import { PLUGIN_ID, CONTRIBUTOR_IDS } from '../common';

@injectable()
export class PluginIntegrated123Widget extends ReactWidget {
    static readonly ID = 'plugin-integrated-1-2-3.primary';
    static readonly LABEL = 'Cosmic Engine';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected coordinator: CompositionCoordinator = new CompositionCoordinator(
        findNamedLayout('plugin-integrated-1-2-3')
    );
    protected contributorRecords: readonly IntegratedContributorRecord[] = [];
    protected currentProfile: MathemeHarmonicProfileBoundary | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = PluginIntegrated123Widget.ID;
        this.title.label = PluginIntegrated123Widget.LABEL;
        this.title.caption = PluginIntegrated123Widget.LABEL;
        this.title.closable = true;
        this.addClass('integrated-widget');
        this.addClass('integrated-widget-' + PLUGIN_ID);

        this.subscriptions.push(
            this.bridge.onReadiness(() => this.update())
        );
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.currentProfile = profile;
                this.update();
            })
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
        const required = CONTRIBUTOR_IDS as readonly MExtensionId[];
        const present = this.contributorRecords.map(r => r.extensionId);
        const allContributorsPresent = required.every(id => present.includes(id));

        // When any required contributor is missing OR the bridge has not yet
        // produced a profile, fall back to the empty-state. The empty state
        // names the missing owner per 08.T1's "no fake demo data" rule.
        if (!allContributorsPresent || !this.currentProfile) {
            const aggregate = this.coordinator.aggregateReadiness(this.contributorRecords);
            const view = buildEmptyState(
                this.coordinator.layout,
                aggregate,
                required,
                present
            );
            return (
                <div className="integrated-widget-root">
                    <IntegratedEmptyState
                        view={view}
                        title={PluginIntegrated123Widget.LABEL}
                    />
                </div>
            );
        }

        // Bridge profile is available — compute pane availability and render
        // the cosmic engine. CosmicEnginePanes itself decides per-pane whether
        // to show data or a typed readiness blocker.
        const panes = checkCosmicEnginePanes(this.currentProfile);
        return (
            <div className="integrated-widget-root">
                <CosmicEnginePanes
                    profile={this.currentProfile}
                    m3CenterStage={panes.m3CenterStage}
                    m2LeftStage={panes.m2LeftStage}
                    m1RightInspector={panes.m1RightInspector}
                />
            </div>
        );
    }
}
