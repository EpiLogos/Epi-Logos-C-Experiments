// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import {
    CROSS_EXTENSION_ROUTE_CONTRACTS,
    MExtensionContributionContract,
    MExtensionMiniMode,
    REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS
} from '@pratibimba/m-extension-runtime';

export const EXTENSION_ID = 'm2-parashakti';
export const PRIMARY_VIEW_ID = 'm2.parashakti.meaningPacket';
export const ALL_VIEW_IDS = ["m2.parashakti.meaningPacket","m2.parashakti.cymaticEngine","m2.parashakti.correspondenceTree"] as const;
export const OPEN_COMMAND_ID = 'm2.openMeaningPacket';
export const READ_ONLY_COMMAND_ID = 'm2.openMeaningPacket.readOnly';
export const DEPOSIT_ONLY_COMMAND_ID = 'm2.openMeaningPacket.depositOnly';
export const ROUTE_PATH = '/m2-parashakti/meaning-packet';
export const PRIVACY_CLASS = 'public_current_with_pending_private_projection_blocks';
export const OBSERVABILITY_EVENT_TYPES = ["m2.meaning_packet","m2.routing_trace","m2.klein_flip"] as const;
export const DECLARED_BLOCKERS = ["Track 01 resonance72, planetary-chakral, audio bus, and kleinFlipState fields","Track 02 correspondence provenance and mapping law","Track 03 Kerykeion and world_clock provider path"] as const;
export const TRACK_08_EXPORTS = ["M2MeaningPacketCard","M2CymaticMiniView"] as const;
export const TRACK_08_CONTRIBUTION: MExtensionContributionContract = Object.freeze({
    extensionId: EXTENSION_ID,
    track08Exports: TRACK_08_EXPORTS,
    compactViews: Object.freeze([
        Object.freeze({
            exportName: 'M2MeaningPacketCard',
            viewId: 'm2.parashakti.meaningPacket',
            miniModes: Object.freeze(["compact-card","mini-view"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        }),
        Object.freeze({
            exportName: 'M2CymaticMiniView',
            viewId: 'm2.parashakti.cymaticEngine',
            miniModes: Object.freeze(["compact-card","mini-view"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        })
    ]),
    selectionHandlers: Object.freeze([
        Object.freeze({
            exportName: 'm2-parashaktiSelectionHandler',
            inputKind: 'm2-parashakti.selection',
            outputRoute: ROUTE_PATH
        })
    ]),
    currentStateSelectors: Object.freeze([
        Object.freeze({
            id: 'm2-parashakti.currentProfile',
            source: 'shared-bridge',
            reads: Object.freeze(['profile', 'readiness', 'coordinateContext'])
        }),
        Object.freeze({
            id: 'm2-parashakti.currentEvidenceContext',
            source: 'shared-bridge',
            reads: Object.freeze(['coordinateContext', 'profileGeneration', 'privacyClass'])
        })
    ]),
    evidenceSerializers: Object.freeze([
        Object.freeze({
            id: 'm2-parashakti.evidenceSerializer',
            evidenceKind: 'm2-parashakti.evidence',
            privacyClass: PRIVACY_CLASS,
            requiredHandles: Object.freeze(["coordinateContext","provenanceHandle"])
        })
    ]),
    miniModes: Object.freeze(["compact-card","mini-view"]) as readonly MExtensionMiniMode[],
    routeContracts: Object.freeze(
        CROSS_EXTENSION_ROUTE_CONTRACTS.filter(contract =>
            ["m2.det-evidence-to-m3.codon-projection"].includes(contract.id)
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
        forbiddenImports: Object.freeze(["Body/S/S0","Body/S/S2","Body/S/S3","@clockworklabs/spacetimedb-sdk","neo4j-driver"]),
        bridgeAdapterSymbol: 'SHARED_BRIDGE_ADAPTER'
    })
});
