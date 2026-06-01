// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import {
    CROSS_EXTENSION_ROUTE_CONTRACTS,
    MExtensionContributionContract,
    MExtensionMiniMode,
    REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS
} from '@pratibimba/m-extension-runtime';

export const EXTENSION_ID = 'm4-nara';
export const PRIMARY_VIEW_ID = 'm4.nara.dayContainer';
export const ALL_VIEW_IDS = ["m4.nara.dayContainer","m4.nara.graphitiBrowser","m4.nara.personalField"] as const;
export const OPEN_COMMAND_ID = 'm4.openArtifact';
export const READ_ONLY_COMMAND_ID = 'm4.openArtifact.readOnly';
export const DEPOSIT_ONLY_COMMAND_ID = 'm4.openArtifact.depositOnly';
export const ROUTE_PATH = '/m4-nara/artifact';
export const PRIVACY_CLASS = 'protected_local_handle_only';
export const OBSERVABILITY_EVENT_TYPES = ["m4.artifact.created","m4.privacy.blocked"] as const;
export const DECLARED_BLOCKERS = ["Track 03 canonical Nara/Graphiti service path","Track 04 consent and review services","Protected-local M4 data cannot surface outside privacy-filtered bridge payloads"] as const;
export const TRACK_08_EXPORTS = ["M4ArtifactHandleChip","M4RecognitionMiniView"] as const;
export const TRACK_08_CONTRIBUTION: MExtensionContributionContract = Object.freeze({
    extensionId: EXTENSION_ID,
    track08Exports: TRACK_08_EXPORTS,
    compactViews: Object.freeze([
        Object.freeze({
            exportName: 'M4ArtifactHandleChip',
            viewId: 'm4.nara.dayContainer',
            miniModes: Object.freeze(["badge","compact-card","inspector"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        }),
        Object.freeze({
            exportName: 'M4RecognitionMiniView',
            viewId: 'm4.nara.graphitiBrowser',
            miniModes: Object.freeze(["badge","compact-card","inspector"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        })
    ]),
    selectionHandlers: Object.freeze([
        Object.freeze({
            exportName: 'm4-naraSelectionHandler',
            inputKind: 'm4-nara.selection',
            outputRoute: ROUTE_PATH
        })
    ]),
    currentStateSelectors: Object.freeze([
        Object.freeze({
            id: 'm4-nara.currentProfile',
            source: 'shared-bridge',
            reads: Object.freeze(['profile', 'readiness', 'coordinateContext'])
        }),
        Object.freeze({
            id: 'm4-nara.currentEvidenceContext',
            source: 'shared-bridge',
            reads: Object.freeze(['coordinateContext', 'profileGeneration', 'privacyClass'])
        })
    ]),
    evidenceSerializers: Object.freeze([
        Object.freeze({
            id: 'm4-nara.evidenceSerializer',
            evidenceKind: 'm4-nara.evidence',
            privacyClass: PRIVACY_CLASS,
            requiredHandles: Object.freeze(["protectedArtifactHandle","dayNowSessionHandle"])
        })
    ]),
    miniModes: Object.freeze(["badge","compact-card","inspector"]) as readonly MExtensionMiniMode[],
    routeContracts: Object.freeze(
        CROSS_EXTENSION_ROUTE_CONTRACTS.filter(contract =>
            ["m4.reviewed-insight-to-m5.review-item"].includes(contract.id)
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
