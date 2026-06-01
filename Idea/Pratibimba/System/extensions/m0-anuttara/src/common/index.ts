// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import {
    CROSS_EXTENSION_ROUTE_CONTRACTS,
    MExtensionContributionContract,
    MExtensionMiniMode,
    REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS
} from '@pratibimba/m-extension-runtime';

export const EXTENSION_ID = 'm0-anuttara';
export const PRIMARY_VIEW_ID = 'm0.anuttara.languageMap';
export const ALL_VIEW_IDS = ["m0.anuttara.languageMap","m0.anuttara.owlShaclInspector","m0.anuttara.rVirtuePanel"] as const;
export const OPEN_COMMAND_ID = 'm0.openCoordinate';
export const READ_ONLY_COMMAND_ID = 'm0.openCoordinate.readOnly';
export const DEPOSIT_ONLY_COMMAND_ID = 'm0.openCoordinate.depositOnly';
export const ROUTE_PATH = '/m0-anuttara/coordinate';
export const PRIVACY_CLASS = 'public_current_with_graph_provenance';
export const OBSERVABILITY_EVENT_TYPES = ["m0.graph.provenance","m0.review.requested"] as const;
export const DECLARED_BLOCKERS = ["Track 02 T7/T8 coordinate-native graph API parity","Track 01 profile and pointer anchors","Shell-vs-individual ownership split for graph viewer and canon studio"] as const;
export const TRACK_08_EXPORTS = ["M0CoordinateSummaryCard","M0SelectionHandler"] as const;
export const TRACK_08_CONTRIBUTION: MExtensionContributionContract = Object.freeze({
    extensionId: EXTENSION_ID,
    track08Exports: TRACK_08_EXPORTS,
    compactViews: Object.freeze([
        Object.freeze({
            exportName: 'M0CoordinateSummaryCard',
            viewId: 'm0.anuttara.languageMap',
            miniModes: Object.freeze(["compact-card","mini-view","inspector"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        })
    ]),
    selectionHandlers: Object.freeze([
        Object.freeze({
            exportName: 'M0SelectionHandler',
            inputKind: 'm0-anuttara.selection',
            outputRoute: ROUTE_PATH
        })
    ]),
    currentStateSelectors: Object.freeze([
        Object.freeze({
            id: 'm0-anuttara.currentProfile',
            source: 'shared-bridge',
            reads: Object.freeze(['profile', 'readiness', 'coordinateContext'])
        }),
        Object.freeze({
            id: 'm0-anuttara.currentEvidenceContext',
            source: 'shared-bridge',
            reads: Object.freeze(['coordinateContext', 'profileGeneration', 'privacyClass'])
        })
    ]),
    evidenceSerializers: Object.freeze([
        Object.freeze({
            id: 'm0-anuttara.evidenceSerializer',
            evidenceKind: 'm0-anuttara.evidence',
            privacyClass: PRIVACY_CLASS,
            requiredHandles: Object.freeze(["coordinateContext","provenanceHandle"])
        })
    ]),
    miniModes: Object.freeze(["compact-card","mini-view","inspector"]) as readonly MExtensionMiniMode[],
    routeContracts: Object.freeze(
        CROSS_EXTENSION_ROUTE_CONTRACTS.filter(contract =>
            ["m0.coordinate-to-m1.walk"].includes(contract.id)
        )
    ),
    observabilityEvents: Object.freeze(
        OBSERVABILITY_EVENT_TYPES.map(type =>
            Object.freeze({
                type,
                sourceExtensionId: EXTENSION_ID,
                requiredFields: REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS,
                privacyClass: PRIVACY_CLASS,
                evidenceHandleRequired: true,
                provenanceHandleRequired: true
            })
        )
    ),
    compositionBoundary: Object.freeze({
        track07Owns: Object.freeze([
            'individual extension commands',
            'stand-alone compact contributions',
            'bridge-mediated current-state selectors',
            'extension-owned evidence serializers'
        ]),
        track08Owns: Object.freeze([
            'integrated screen real estate',
            'multi-extension choreography',
            'plugin-level inhibition policy',
            'mini-mode placement and arbitration'
        ]),
        forbiddenImports: Object.freeze(["Body/S/S0","Body/S/S2","Body/S/S3","Body/S/S5","neo4j-driver"]),
        bridgeAdapterSymbol: 'SHARED_BRIDGE_ADAPTER'
    })
});
