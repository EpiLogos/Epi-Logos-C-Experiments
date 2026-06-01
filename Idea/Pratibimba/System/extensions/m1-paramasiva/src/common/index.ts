// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import {
    CROSS_EXTENSION_ROUTE_CONTRACTS,
    MExtensionContributionContract,
    MExtensionMiniMode,
    REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS
} from '@pratibimba/m-extension-runtime';

export const EXTENSION_ID = 'm1-paramasiva';
export const PRIMARY_VIEW_ID = 'm1.paramasiva.clockInstrument';
export const ALL_VIEW_IDS = ["m1.paramasiva.clockInstrument","m1.paramasiva.kleinTopology","m1.paramasiva.audioBusInspector"] as const;
export const OPEN_COMMAND_ID = 'm1.startWalk';
export const READ_ONLY_COMMAND_ID = 'm1.startWalk.readOnly';
export const DEPOSIT_ONLY_COMMAND_ID = 'm1.startWalk.depositOnly';
export const ROUTE_PATH = '/m1-paramasiva/walk';
export const PRIVACY_CLASS = 'public_current_audio_metadata_only';
export const OBSERVABILITY_EVENT_TYPES = ["m1.walk.step","m1.klein_flip.source"] as const;
export const DECLARED_BLOCKERS = ["Track 01 profile fields and audio bus","Track 02 typed harmonic pointer relation descriptors","M1/M2 authority split on audio-genesis must stay explicit in UI provenance"] as const;
export const TRACK_08_EXPORTS = ["M1WalkStrip","M1TopologyMiniView"] as const;
export const TRACK_08_CONTRIBUTION: MExtensionContributionContract = Object.freeze({
    extensionId: EXTENSION_ID,
    track08Exports: TRACK_08_EXPORTS,
    compactViews: Object.freeze([
        Object.freeze({
            exportName: 'M1WalkStrip',
            viewId: 'm1.paramasiva.clockInstrument',
            miniModes: Object.freeze(["compact-card","mini-view"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        }),
        Object.freeze({
            exportName: 'M1TopologyMiniView',
            viewId: 'm1.paramasiva.kleinTopology',
            miniModes: Object.freeze(["compact-card","mini-view"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        })
    ]),
    selectionHandlers: Object.freeze([
        Object.freeze({
            exportName: 'm1-paramasivaSelectionHandler',
            inputKind: 'm1-paramasiva.selection',
            outputRoute: ROUTE_PATH
        })
    ]),
    currentStateSelectors: Object.freeze([
        Object.freeze({
            id: 'm1-paramasiva.currentProfile',
            source: 'shared-bridge',
            reads: Object.freeze(['profile', 'readiness', 'coordinateContext'])
        }),
        Object.freeze({
            id: 'm1-paramasiva.currentEvidenceContext',
            source: 'shared-bridge',
            reads: Object.freeze(['coordinateContext', 'profileGeneration', 'privacyClass'])
        })
    ]),
    evidenceSerializers: Object.freeze([
        Object.freeze({
            id: 'm1-paramasiva.evidenceSerializer',
            evidenceKind: 'm1-paramasiva.evidence',
            privacyClass: PRIVACY_CLASS,
            requiredHandles: Object.freeze(["coordinateContext","provenanceHandle"])
        })
    ]),
    miniModes: Object.freeze(["compact-card","mini-view"]) as readonly MExtensionMiniMode[],
    routeContracts: Object.freeze(
        CROSS_EXTENSION_ROUTE_CONTRACTS.filter(contract =>
            ["m1.walk-to-m2.meaning-packet"].includes(contract.id)
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
        forbiddenImports: Object.freeze(["Body/S/S0","Body/S/S2","Body/S/S3","@clockworklabs/spacetimedb-sdk","portal-core"]),
        bridgeAdapterSymbol: 'SHARED_BRIDGE_ADAPTER'
    })
});
