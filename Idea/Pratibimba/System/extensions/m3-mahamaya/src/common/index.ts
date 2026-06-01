// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import {
    CROSS_EXTENSION_ROUTE_CONTRACTS,
    MExtensionContributionContract,
    MExtensionMiniMode,
    REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS
} from '@pratibimba/m-extension-runtime';

export const EXTENSION_ID = 'm3-mahamaya';
export const PRIMARY_VIEW_ID = 'm3.mahamaya.cosmicWheel';
export const ALL_VIEW_IDS = ["m3.mahamaya.cosmicWheel","m3.mahamaya.codonNavigator","m3.mahamaya.traceOverlay"] as const;
export const OPEN_COMMAND_ID = 'm3.openCodon';
export const READ_ONLY_COMMAND_ID = 'm3.openCodon.readOnly';
export const DEPOSIT_ONLY_COMMAND_ID = 'm3.openCodon.depositOnly';
export const ROUTE_PATH = '/m3-mahamaya/codon';
export const PRIVACY_CLASS = 'public_current_with_scalar_oracle_refs_only';
export const OBSERVABILITY_EVENT_TYPES = ["m3.codon_projection","m3.kernel_trace_view"] as const;
export const DECLARED_BLOCKERS = ["Track 01 codon-rotation projection fields","Track 02 canonical M3 library graph nodes","Track 03 native subscription and world_clock path","Authoritative M3 projection/library payload readiness for 64/472 surfaces"] as const;
export const TRACK_08_EXPORTS = ["M3CodonChip","M3WheelMiniView"] as const;
export const TRACK_08_CONTRIBUTION: MExtensionContributionContract = Object.freeze({
    extensionId: EXTENSION_ID,
    track08Exports: TRACK_08_EXPORTS,
    compactViews: Object.freeze([
        Object.freeze({
            exportName: 'M3CodonChip',
            viewId: 'm3.mahamaya.cosmicWheel',
            miniModes: Object.freeze(["badge","mini-view"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        }),
        Object.freeze({
            exportName: 'M3WheelMiniView',
            viewId: 'm3.mahamaya.codonNavigator',
            miniModes: Object.freeze(["badge","mini-view"]) as readonly MExtensionMiniMode[],
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        })
    ]),
    selectionHandlers: Object.freeze([
        Object.freeze({
            exportName: 'm3-mahamayaSelectionHandler',
            inputKind: 'm3-mahamaya.selection',
            outputRoute: ROUTE_PATH
        })
    ]),
    currentStateSelectors: Object.freeze([
        Object.freeze({
            id: 'm3-mahamaya.currentProfile',
            source: 'shared-bridge',
            reads: Object.freeze(['profile', 'readiness', 'coordinateContext'])
        }),
        Object.freeze({
            id: 'm3-mahamaya.currentEvidenceContext',
            source: 'shared-bridge',
            reads: Object.freeze(['coordinateContext', 'profileGeneration', 'privacyClass'])
        })
    ]),
    evidenceSerializers: Object.freeze([
        Object.freeze({
            id: 'm3-mahamaya.evidenceSerializer',
            evidenceKind: 'm3-mahamaya.evidence',
            privacyClass: PRIVACY_CLASS,
            requiredHandles: Object.freeze(["coordinateContext","provenanceHandle"])
        })
    ]),
    miniModes: Object.freeze(["badge","mini-view"]) as readonly MExtensionMiniMode[],
    routeContracts: Object.freeze(
        CROSS_EXTENSION_ROUTE_CONTRACTS.filter(contract =>
            ["m3.scalar-oracle-to-m4.artifact-inspector"].includes(contract.id)
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
        forbiddenImports: Object.freeze(["Body/S/S0","Body/S/S2","Body/S/S3","portal-core","@clockworklabs/spacetimedb-sdk"]),
        bridgeAdapterSymbol: 'SHARED_BRIDGE_ADAPTER'
    })
});

export * from './codon-wheel';
