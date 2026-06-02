import { CoordinateContext, PrivacyClass } from './coordinate-context';
import { MObservabilityEvent } from './observability';
import { MathemeHarmonicProfileBoundary } from './profile';
import { MExtensionReadinessSnapshot } from './readiness';
import { SharedBridgeAdapter } from './shared-bridge';

export type MExtensionId =
    | 'm0-anuttara'
    | 'm1-paramasiva'
    | 'm2-parashakti'
    | 'm3-mahamaya'
    | 'm4-nara'
    | 'm5-epii';

export type MExtensionMiniMode = 'badge' | 'compact-card' | 'mini-view' | 'inspector';

export interface MExtensionCompactViewContribution {
    readonly exportName: string;
    readonly viewId: string;
    readonly miniModes: readonly MExtensionMiniMode[];
    readonly requiredSelectors: readonly string[];
}

export interface MExtensionSelectionHandlerContribution {
    readonly exportName: string;
    readonly inputKind: string;
    readonly outputRoute: string;
}

export interface MExtensionStateSelectorContribution {
    readonly id: string;
    readonly source: 'shared-bridge';
    readonly reads: readonly string[];
}

export interface MExtensionEvidenceSerializerContribution {
    readonly id: string;
    readonly evidenceKind: string;
    readonly privacyClass: PrivacyClass;
    readonly requiredHandles: readonly string[];
}

export interface MExtensionRouteContract {
    readonly id: string;
    readonly fromExtensionId: MExtensionId;
    readonly toExtensionId: MExtensionId;
    readonly inputKind: string;
    readonly outputKind: string;
    readonly routePath: string;
    readonly requiredContext: readonly string[];
}

export interface MExtensionObservabilityEventContract {
    readonly type: string;
    readonly sourceExtensionId: MExtensionId;
    readonly requiredFields: readonly string[];
    readonly privacyClass: PrivacyClass;
    readonly evidenceHandleRequired: boolean;
    readonly provenanceHandleRequired: boolean;
}

export interface MExtensionContributionContract {
    readonly extensionId: MExtensionId;
    readonly track08Exports: readonly string[];
    readonly compactViews: readonly MExtensionCompactViewContribution[];
    readonly selectionHandlers: readonly MExtensionSelectionHandlerContribution[];
    readonly currentStateSelectors: readonly MExtensionStateSelectorContribution[];
    readonly evidenceSerializers: readonly MExtensionEvidenceSerializerContribution[];
    readonly miniModes: readonly MExtensionMiniMode[];
    readonly routeContracts: readonly MExtensionRouteContract[];
    readonly observabilityEvents: readonly MExtensionObservabilityEventContract[];
    readonly compositionBoundary: {
        readonly track07Owns: readonly string[];
        readonly track08Owns: readonly string[];
        readonly forbiddenImports: readonly string[];
        readonly bridgeAdapterSymbol: 'SHARED_BRIDGE_ADAPTER';
    };
}

export interface ContributionRuntimeSnapshot {
    readonly contribution: MExtensionContributionContract;
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly coordinateContext: CoordinateContext;
}

export interface MExtensionContributionRuntime {
    readonly contribution: MExtensionContributionContract;
    readonly bridge: SharedBridgeAdapter;
    snapshot(): ContributionRuntimeSnapshot;
}

export function createMExtensionContributionRuntime(
    contribution: MExtensionContributionContract,
    bridge: SharedBridgeAdapter
): MExtensionContributionRuntime {
    return Object.freeze({
        contribution,
        bridge,
        snapshot: () => {
            const current = bridge.currentSnapshot();
            return Object.freeze({
                contribution,
                profile: current.profile,
                readiness: current.readiness,
                coordinateContext: current.context
            });
        }
    });
}

export function validateContributionEvent(
    contribution: MExtensionContributionContract,
    event: MObservabilityEvent
): void {
    const eventContract = contribution.observabilityEvents.find(item => item.type === event.type);
    if (!eventContract) {
        throw new Error(`${contribution.extensionId} cannot emit undeclared event ${event.type}`);
    }
    if (event.extensionId !== contribution.extensionId) {
        throw new Error(
            `${contribution.extensionId} cannot emit event for foreign extension ${event.extensionId}`
        );
    }
    for (const field of eventContract.requiredFields) {
        if (!(field in event.payload)) {
            throw new Error(`${event.type} missing required payload field ${field}`);
        }
    }
}

export const CROSS_EXTENSION_ROUTE_CONTRACTS: readonly MExtensionRouteContract[] = Object.freeze([
    Object.freeze({
        id: 'm0.coordinate-to-m1.walk',
        fromExtensionId: 'm0-anuttara',
        toExtensionId: 'm1-paramasiva',
        inputKind: 'm0.coordinate.selection',
        outputKind: 'm1.walk.request',
        routePath: '/m1-paramasiva/walk',
        requiredContext: Object.freeze(['coordinateContext', 'profileGeneration', 'pointerAnchor'])
    }),
    Object.freeze({
        id: 'm1.walk-to-m2.meaning-packet',
        fromExtensionId: 'm1-paramasiva',
        toExtensionId: 'm2-parashakti',
        inputKind: 'm1.lens-mode.walk',
        outputKind: 'm2.meaning-packet.request',
        routePath: '/m2-parashakti/meaning-packet',
        requiredContext: Object.freeze(['lens', 'mode', 'profileGeneration', 'pointerAnchor'])
    }),
    Object.freeze({
        id: 'm2.det-evidence-to-m3.codon-projection',
        fromExtensionId: 'm2-parashakti',
        toExtensionId: 'm3-mahamaya',
        inputKind: 'm2.det.evidence',
        outputKind: 'm3.codon-projection.request',
        routePath: '/m3-mahamaya/codon',
        requiredContext: Object.freeze(['evidenceHandle', 'coordinateContext', 'privacyClass'])
    }),
    Object.freeze({
        id: 'm3.scalar-oracle-to-m4.artifact-inspector',
        fromExtensionId: 'm3-mahamaya',
        toExtensionId: 'm4-nara',
        inputKind: 'm3.scalar-oracle.refs',
        outputKind: 'm4.protected-artifact.inspect',
        routePath: '/m4-nara/artifact',
        requiredContext: Object.freeze(['scalarOracleRefs', 'dayNowSessionHandle', 'privacyClass'])
    }),
    Object.freeze({
        id: 'm4.reviewed-insight-to-m5.review-item',
        fromExtensionId: 'm4-nara',
        toExtensionId: 'm5-epii',
        inputKind: 'm4.reviewed-insight.handle',
        outputKind: 'm5.review-item.request',
        routePath: '/m5-epii/review',
        requiredContext: Object.freeze(['reviewedInsightHandle', 'reviewSource', 'privacyClass'])
    })
]);

export const REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS = Object.freeze([
    'sourceExtension',
    'coordinateContext',
    'profileGeneration',
    'privacyClass',
    'evidenceHandles',
    'provenanceHandles'
] as const);
