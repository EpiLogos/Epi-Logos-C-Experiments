// 08.T5 jiva-siva slice — hand-extended from the 08.T1 scaffold.
// The scaffolder will no longer overwrite this file (see
// scripts/scaffold-integrated-plugins.mjs PRESERVE_HANDWRITTEN).
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
    checkJivaSivaPanes,
    CompositionCoordinator,
    ConsentAction,
    ConsentGate,
    findNamedLayout,
    IntegratedContributorRecord,
    IntegratedEmptyState,
    buildEmptyState
} from '@pratibimba/integrated-composition';
import { JivaSivaPanes } from './jiva-siva-panes';
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
    protected consentGate: ConsentGate = new ConsentGate();
    protected contributorRecords: readonly IntegratedContributorRecord[] = [];
    protected currentProfile: MathemeHarmonicProfileBoundary | null = null;
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

    /** Hook for the S5 consent service to deliver records into the gate. */
    consentGateRef(): ConsentGate {
        return this.consentGate;
    }

    protected handleDeepOpen(action: ConsentAction): void {
        // Single chokepoint for protected deep actions. The gate throws on
        // missing/expired consent — we surface the failure but never bypass.
        try {
            this.consentGate.require(action);
            // When the gate accepts, the actual deep-open routine lives in a
            // Track 04-owned service that is not yet plumbed. For 08.T5 we
            // log and return — the public default view never reaches this
            // branch unless a real consent record has been installed.
        } catch {
            // Drop silently in the UI; the disabled state already explains
            // why the button is unavailable.
        }
    }

    protected override render(): React.ReactNode {
        const required = CONTRIBUTOR_IDS as readonly MExtensionId[];
        const present = this.contributorRecords.map(r => r.extensionId);
        const allContributorsPresent = required.every(id => present.includes(id));

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
                        title={PluginIntegrated450Widget.LABEL}
                    />
                </div>
            );
        }

        const panes = checkJivaSivaPanes(this.currentProfile);
        return (
            <div className="integrated-widget-root">
                <JivaSivaPanes
                    profile={this.currentProfile}
                    m4Foreground={panes.m4Foreground}
                    m0Backdrop={panes.m0Backdrop}
                    m5Side={panes.m5Side}
                    onDeepOpen={action => this.handleDeepOpen(action)}
                    isActionPermitted={action => this.consentGate.isPermitted(action)}
                />
            </div>
        );
    }
}
