// 08.T3 cosmic engine slice — hand-extended from the 08.T1 scaffold.
// The scaffolder will no longer overwrite this file (see
// scripts/scaffold-integrated-plugins.mjs preserveExistingWidgets entry).
import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    KernelBridgeAPI,
    MExtensionId,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    checkCosmicEnginePanes,
    CompositionCoordinator,
    IntegratedEvidenceProducerId,
    findNamedLayout,
    IntegratedContributorRecord,
    IntegratedEmptyState,
    CompositionProfileProvider,
    COSMIC_ENGINE_LAYOUT,
    PENDING_INTEGRATED_VIEW_STATE,
    buildEmptyState,
    openInReview,
    produceEvidence,
    validateEvidenceEnvelopeForRange,
    useCompositionProfile
} from '@pratibimba/integrated-composition';
import { CosmicEnginePanes } from './cosmic-engine-panes';
import { CosmicEngineComposition } from './cosmic-engine-composition';
import { ThirdSpandaCompositionOverlay } from './third-spanda-overlay';
import { M2PrimeMeaningPacket } from '@pratibimba/m2-parashakti';
import { PLUGIN_ID, CONTRIBUTOR_IDS, buildRoutedM2PacketFromBridge } from '../common';

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
    protected subscriptions: Disposable[] = [];

    /**
     * Optional connector to a live KernelBridgeAPI. Until the kernel-bridge
     * runtime ships (Track 01 T6) the bridge stays null and Open-in-Review
     * resolves to `bridge_unavailable` rather than fabricating a result.
     */
    protected liveBridge: KernelBridgeAPI | null = null;

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

    setLiveBridge(bridge: KernelBridgeAPI | null): void {
        this.liveBridge = bridge;
    }

    protected async handleOpenInReview(
        producerId: IntegratedEvidenceProducerId,
        profile: ReturnType<typeof useCompositionProfile>['profile']
    ): Promise<void> {
        const envelope = produceEvidence(
            producerId,
            {
                view: PENDING_INTEGRATED_VIEW_STATE,
                profile,
                contributorReadinessIds: this.contributorRecords.map(r => r.extensionId)
            },
            `${Date.now()}:${producerId}`
        );
        if (!envelope) {
            return;
        }
        try {
            validateEvidenceEnvelopeForRange(envelope);
        } catch {
            // Drop the envelope on privacy violation; the scrubber test proves
            // this path actually rejects forbidden payloads.
            return;
        }
        void openInReview(this.liveBridge, envelope);
    }

    protected override render(): React.ReactNode {
        const required = CONTRIBUTOR_IDS as readonly MExtensionId[];
        return (
            <CompositionProfileProvider bridge={this.bridge}>
                <CosmicEngineProfileSurface
                    bridge={this.bridge}
                    coordinator={this.coordinator}
                    contributorRecords={this.contributorRecords}
                    required={required}
                    onOpenInReview={(producerId, profile) =>
                        void this.handleOpenInReview(producerId, profile)
                    }
                />
            </CompositionProfileProvider>
        );
    }
}

const CosmicEngineProfileSurface: React.FC<{
    readonly bridge: SharedBridgeAdapter;
    readonly coordinator: CompositionCoordinator;
    readonly contributorRecords: readonly IntegratedContributorRecord[];
    readonly required: readonly MExtensionId[];
    readonly onOpenInReview: (
        producerId: IntegratedEvidenceProducerId,
        profile: ReturnType<typeof useCompositionProfile>['profile']
    ) => void;
}> = ({ bridge, coordinator, contributorRecords, required, onOpenInReview }) => {
    const { profile } = useCompositionProfile();
    const [routedM2Packet, setRoutedM2Packet] =
        React.useState<M2PrimeMeaningPacket | null>(null);
    const present = contributorRecords.map(r => r.extensionId);
    const allContributorsPresent = required.every(id => present.includes(id));

    React.useEffect(() => {
        let cancelled = false;
        if (!profile) {
            setRoutedM2Packet(null);
            return () => {
                cancelled = true;
            };
        }
        const snapshot = bridge.currentSnapshot();
        void buildRoutedM2PacketFromBridge({
            bridge,
            profile,
            readiness: snapshot.readiness,
            context: snapshot.context,
            subject: 'routing-event',
            emittedAt: Date.now()
        }).then(
            packet => {
                if (!cancelled) {
                    setRoutedM2Packet(packet);
                }
            },
            () => {
                if (!cancelled) {
                    setRoutedM2Packet(null);
                }
            }
        );
        return () => {
            cancelled = true;
        };
    }, [bridge, profile]);

    if (!allContributorsPresent || !profile) {
        const aggregate = coordinator.aggregateReadiness(contributorRecords);
        const view = buildEmptyState(
            coordinator.layout,
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

    const panes = checkCosmicEnginePanes(profile);
    return (
        <div className="integrated-widget-root">
            <CosmicEngineComposition />
            <aside
                className="cosmic-engine-mini-inspectors"
                data-test="cosmic-engine-mini-inspectors"
                data-mini-inspector-owners={COSMIC_ENGINE_LAYOUT.miniInspectorOwners.join(',')}
            >
                <CosmicEnginePanes
                    routedM2Packet={routedM2Packet}
                    m3CenterStage={panes.m3CenterStage}
                    m2LeftStage={panes.m2LeftStage}
                    m1RightInspector={panes.m1RightInspector}
                    onOpenInReview={producerId => onOpenInReview(producerId, profile)}
                />
            </aside>
            <ThirdSpandaCompositionOverlay />
        </div>
    );
};
