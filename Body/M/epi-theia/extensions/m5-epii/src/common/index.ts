// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import {
    CROSS_EXTENSION_ROUTE_CONTRACTS,
    MExtensionContributionContract,
    MExtensionMiniMode,
    REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS
} from '@pratibimba/m-extension-runtime';

export const EXTENSION_ID = 'm5-epii';
export const PRIMARY_VIEW_ID = 'm5.epii.reviewQueue';
export const ALL_VIEW_IDS = ["m5.epii.reviewQueue","m5.epii.spineStateInspector","m5.epii.metaConversation"] as const;
export const OPEN_COMMAND_ID = 'm5.openReview';
export const READ_ONLY_COMMAND_ID = 'm5.openReview.readOnly';
export const DEPOSIT_ONLY_COMMAND_ID = 'm5.openReview.depositOnly';
export const ROUTE_PATH = '/m5-epii/review';
export const PRIVACY_CLASS = 'governed_review_metadata_only';
export const OBSERVABILITY_EVENT_TYPES = ["m5.review.transition","m5.spine.event"] as const;
export const DECLARED_BLOCKERS = ["Track 04 persisted review/improve state","Track 09 bounded agent capability and route metadata","Ownership split between ide-shell control room and deep m5-epii views"] as const;
export const TRACK_08_EXPORTS = ["M5ReviewQueueBadge","M5SpineStatePanel"] as const;
export const TRACK_08_CONTRIBUTION: MExtensionContributionContract = Object.freeze({
    extensionId: EXTENSION_ID,
    track08Exports: TRACK_08_EXPORTS,
    compactViews: Object.freeze([
        Object.freeze({
            exportName: 'M5ReviewQueueBadge',
            viewId: 'm5.epii.reviewQueue',
            miniModes: Object.freeze(["badge","compact-card","inspector"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        }),
        Object.freeze({
            exportName: 'M5SpineStatePanel',
            viewId: 'm5.epii.spineStateInspector',
            miniModes: Object.freeze(["badge","compact-card","inspector"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        })
    ]),
    selectionHandlers: Object.freeze([
        Object.freeze({
            exportName: 'm5-epiiSelectionHandler',
            inputKind: 'm5-epii.selection',
            outputRoute: ROUTE_PATH
        })
    ]),
    currentStateSelectors: Object.freeze([
        Object.freeze({
            id: 'm5-epii.currentProfile',
            source: 'shared-bridge',
            reads: Object.freeze(['profile', 'readiness', 'coordinateContext'])
        }),
        Object.freeze({
            id: 'm5-epii.currentEvidenceContext',
            source: 'shared-bridge',
            reads: Object.freeze(['coordinateContext', 'profileGeneration', 'privacyClass'])
        })
    ]),
    evidenceSerializers: Object.freeze([
        Object.freeze({
            id: 'm5-epii.evidenceSerializer',
            evidenceKind: 'm5-epii.evidence',
            privacyClass: PRIVACY_CLASS,
            requiredHandles: Object.freeze(["reviewItemHandle","provenanceHandle"])
        })
    ]),
    miniModes: Object.freeze(["badge","compact-card","inspector"]) as readonly MExtensionMiniMode[],
    routeContracts: Object.freeze(
        CROSS_EXTENSION_ROUTE_CONTRACTS.filter(contract =>
            false
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
        forbiddenImports: Object.freeze(["Body/S/S0","Body/S/S2","Body/S/S3","Body/S/S5","epii-review-core"]),
        bridgeAdapterSymbol: 'SHARED_BRIDGE_ADAPTER'
    })
});

export * from './epii-surface';
