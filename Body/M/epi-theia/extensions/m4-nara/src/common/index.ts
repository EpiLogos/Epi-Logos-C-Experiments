// Generated from Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json.
// Boundary authority: forbiddenImports / forbiddenImportsFromLayer live in that JSON.
// Do not hand-edit.
import {
    CROSS_EXTENSION_ROUTE_CONTRACTS,
    MExtensionContributionContract,
    MExtensionMiniMode,
    REQUIRED_OBSERVABILITY_PAYLOAD_FIELDS
} from '@pratibimba/m-extension-runtime';
import type { PrimitiveReadinessState } from '@pratibimba/integrated-composition/design-primitives';

export type M4PrimitiveReadinessState = PrimitiveReadinessState;

export const EXTENSION_ID = 'm4-nara';
export const PRIMARY_VIEW_ID = 'm4.nara.dayContainer';
export const ALL_VIEW_IDS = [
    "m4.nara.dayContainer",
    "m4.nara.graphitiBrowser",
    "m4.nara.dayCalendar",
    "m4.nara.sessionBreakdown",
    "m4.nara.journalTimeline",
    "m4.nara.journalEntries",
    "m4.nara.pasuWizard",
    "m4.nara.quintessence",
    "m4.nara.personalField",
    "m4.nara.personalCoordinate",
    "m4.nara.oracleCast",
    "m4.nara.oracleHistory",
    "m4.nara.medicine",
    "m4.nara.transform",
    "m4.nara.lensApplication",
    "m4.nara.logosCycle",
    "m4.nara.pratibimbaCoordinate",
    "m4.nara.kairosWheel",
    "m4.nara.mercuriusRelay",
    "m4.nara.timeAxisSwitcher",
    "m4.nara.sessionCloseCeremony",
    "m4.nara.psycheAnchorCoherence",
    "m4.nara.beingPatternPerspective",
    "m4.nara.dialogicalArena"
] as const;
export const OPEN_COMMAND_ID = 'm4.openArtifact';
export const READ_ONLY_COMMAND_ID = 'm4.openArtifact.readOnly';
export const DEPOSIT_ONLY_COMMAND_ID = 'm4.openArtifact.depositOnly';
export const ROUTE_PATH = '/m4-nara/artifact';

/**
 * Tranche 25.3 — Journal Entries activity-bar wiring (closes 15.3 ORPHAN).
 *
 * The `m4.nara.journalEntries` left-sidebar mode (composed via the
 * `M4JournalTimelineCard` TRACK_08 export) renders a cross-day NOW.md timeline
 * backed by the protected-local `nara.journal.timeline` gateway RPC. The mode is
 * bound to the `daily-0-1` layout slot only; it is hidden under `ide-deep`.
 */
export const JOURNAL_ENTRIES_VIEW_ID = 'm4.nara.journalEntries';
export const JOURNAL_TIMELINE_RPC_METHOD = 'nara.journal.timeline';
export const JOURNAL_ENTRIES_ACTIVITY_BAR_SLOT = 'widget.application-shell-left';
export const JOURNAL_ENTRIES_LAYOUT_SCOPE = 'daily-0-1';
export const PRIVACY_CLASS = 'protected_local';
export const OBSERVABILITY_EVENT_TYPES = ["m4.artifact.created","m4.privacy.blocked"] as const;
export const DECLARED_BLOCKERS = ["Track 03 canonical Nara/Graphiti service path","Track 04 consent and review services","Protected-local M4 data cannot surface outside privacy-filtered bridge payloads"] as const;
const TRACK_08_MINI_MODES = Object.freeze(["badge","compact-card","inspector"]) as readonly MExtensionMiniMode[];
const TRACK_08_VIEW_CONTRIBUTIONS = [
    { exportName: "M4ArtifactHandleChip", viewId: "m4.nara.dayContainer" },
    { exportName: "M4RecognitionMiniView", viewId: "m4.nara.graphitiBrowser" },
    { exportName: "M4DayCalendarChip", viewId: "m4.nara.dayCalendar" },
    { exportName: "M4SessionBreakdownCard", viewId: "m4.nara.sessionBreakdown" },
    { exportName: "M4JournalTimelineCard", viewId: "m4.nara.journalTimeline" },
    { exportName: "M4PasuWizardBadge", viewId: "m4.nara.pasuWizard" },
    { exportName: "M4QuintessenceChip", viewId: "m4.nara.quintessence" },
    { exportName: "M4PersonalCymaticField", viewId: "m4.nara.personalField" },
    { exportName: "M4PersonalCoordinateBadge", viewId: "m4.nara.personalCoordinate" },
    { exportName: "M4OracleCastBadge", viewId: "m4.nara.oracleCast" },
    { exportName: "M4OracleHistoryCard", viewId: "m4.nara.oracleHistory" },
    { exportName: "M4MedicineCard", viewId: "m4.nara.medicine" },
    { exportName: "M4TransformBadge", viewId: "m4.nara.transform" },
    { exportName: "M4LensCard", viewId: "m4.nara.lensApplication" },
    { exportName: "M4LogosChip", viewId: "m4.nara.logosCycle" },
    { exportName: "M4PratibimbaCoordinateBadge", viewId: "m4.nara.pratibimbaCoordinate" },
    { exportName: "M4KairosWheel", viewId: "m4.nara.kairosWheel" },
    { exportName: "M4MercuriusRelayChip", viewId: "m4.nara.mercuriusRelay" },
    { exportName: "M4TimeAxisSwitcherChip", viewId: "m4.nara.timeAxisSwitcher" },
    { exportName: "M4SessionCloseCeremonyCard", viewId: "m4.nara.sessionCloseCeremony" },
    { exportName: "M4PsycheAnchorCoherenceCard", viewId: "m4.nara.psycheAnchorCoherence" },
    { exportName: "M4BeingPatternPerspectiveCard", viewId: "m4.nara.beingPatternPerspective" },
    { exportName: "M4DialogicalArenaCard", viewId: "m4.nara.dialogicalArena" }
] as const;
export const TRACK_08_EXPORTS = [
    "M4ArtifactHandleChip",
    "M4RecognitionMiniView",
    "M4DayCalendarChip",
    "M4SessionBreakdownCard",
    "M4JournalTimelineCard",
    "M4PasuWizardBadge",
    "M4QuintessenceChip",
    "M4PersonalCymaticField",
    "M4PersonalCoordinateBadge",
    "M4OracleCastBadge",
    "M4OracleHistoryCard",
    "M4MedicineCard",
    "M4TransformBadge",
    "M4LensCard",
    "M4LogosChip",
    "M4PratibimbaCoordinateBadge",
    "M4KairosWheel",
    "M4MercuriusRelayChip",
    "M4TimeAxisSwitcherChip",
    "M4SessionCloseCeremonyCard",
    "M4PsycheAnchorCoherenceCard",
    "M4BeingPatternPerspectiveCard",
    "M4DialogicalArenaCard"
] as const;
export const TRACK_08_CONTRIBUTION: MExtensionContributionContract = Object.freeze({
    extensionId: EXTENSION_ID,
    track08Exports: TRACK_08_EXPORTS,
    compactViews: Object.freeze(
        TRACK_08_VIEW_CONTRIBUTIONS.map(view => Object.freeze({
            exportName: view.exportName,
            viewId: view.viewId,
            miniModes: TRACK_08_MINI_MODES,
            requiredSelectors: Object.freeze(["currentProfile","readiness","coordinateContext"])
        }))
    ),
    selectionHandlers: Object.freeze(
        TRACK_08_VIEW_CONTRIBUTIONS.map(view => Object.freeze({
            exportName: `${view.viewId}SelectionHandler`,
            inputKind: `${view.viewId}.selection`,
            outputRoute: ROUTE_PATH
        }))
    ),
    currentStateSelectors: Object.freeze(
        TRACK_08_VIEW_CONTRIBUTIONS.map(view => Object.freeze({
            id: `${view.viewId}.currentProfile`,
            source: 'shared-bridge',
            reads: Object.freeze(['profile', 'readiness', 'coordinateContext'])
        }))
    ),
    evidenceSerializers: Object.freeze(
        TRACK_08_VIEW_CONTRIBUTIONS.map(view => Object.freeze({
            id: `${view.viewId}.evidenceSerializer`,
            evidenceKind: `${view.viewId}.evidence`,
            privacyClass: PRIVACY_CLASS,
            requiredHandles: Object.freeze(["protectedArtifactHandle","dayNowSessionHandle"])
        }))
    ),
    miniModes: TRACK_08_MINI_MODES,
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

export * from './nara-surface';
export {
    isOracleFrame,
    isOracleVakAddress
} from './oracle-frame';
export type {
    OracleFrame,
    OraclePositionSemantics,
    OracleReadingDirection,
    OracleSpreadType,
    OracleVakAddress
} from './oracle-frame';
export {
    isDeckContext,
    isDeckDrawState
} from './deck-context';
export type {
    DeckContext,
    DeckContextRole,
    DeckDrawCardRef,
    DeckDrawState,
    DeckDrawStatus,
    DeckEntropyMode,
    DeckSpreadBinding
} from './deck-context';
export {
    isSymbolicProtein
} from './symbolic-protein';
export type {
    SymbolicProtein,
    SymbolicProteinActivationMarker,
    SymbolicProteinChainNode,
    SymbolicProteinFoldState,
    SymbolicProteinSequenceMode
} from './symbolic-protein';
