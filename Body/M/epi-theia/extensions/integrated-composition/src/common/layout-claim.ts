import {
    MExtensionContributionContract,
    MExtensionId,
    MExtensionMiniMode,
    MExtensionReadinessSnapshot,
    PrivacyClass
} from '@pratibimba/m-extension-runtime';

/**
 * Layout slots arbitrated by the composition coordinator. These match the
 * five composition concerns named in 07.T1 verification step:
 * center-stage, side-panel, mini-inspector, audio, selection, evidence-panel.
 *
 * `audio` and `selection` are global singletons — at most one owner per
 * composition. `mini-inspector` is a multi-slot mount where each individual
 * extension may dock its mini-mode while the integrated plugin is active
 * (per Theia plan §5: individual extensions inhibited OR operate in mini-mode).
 */
export type IntegratedLayoutSlot =
    | 'center-stage'
    | 'side-panel'
    | 'mini-inspector'
    | 'audio-bus'
    | 'selection-owner'
    | 'evidence-panel';

export type LayoutClaimResolution =
    | 'granted'
    | 'mini-mode'
    | 'inhibited'
    | 'blocked-conflict';

export interface IntegratedLayoutClaim {
    readonly extensionId: MExtensionId;
    readonly slot: IntegratedLayoutSlot;
    /** higher wins when arbitrating singleton slots */
    readonly priority: number;
    /** preferred mini-mode shape if this claim is downgraded */
    readonly miniModeFallback: MExtensionMiniMode | null;
    readonly privacyClass: PrivacyClass;
    /** plain-language reason this extension wants this slot */
    readonly reason: string;
}

export interface ResolvedLayoutClaim {
    readonly claim: IntegratedLayoutClaim;
    readonly resolution: LayoutClaimResolution;
    /** when resolution !== 'granted', the chosen mini-mode (or null if inhibited/blocked) */
    readonly grantedMiniMode: MExtensionMiniMode | null;
    /** singleton-slot conflict info — non-empty when resolution === 'blocked-conflict' */
    readonly conflictingExtensionId: MExtensionId | null;
    /** specific reason the claim was not granted at full priority */
    readonly conflictReason: string | null;
}

export type IntegratedHostLayoutId = 'daily-0-1' | 'ide-deep';
export type IntegratedShellId = 'shell-0' | 'shell-1' | 'ide-deep';
export type IntegratedDailyShellFace = '0-cosmic' | '1-personal' | null;
export type IntegratedSurfaceRole = 'cosmic-composition' | 'personal-flow-writing';

export interface IntegratedNamedLayout {
    readonly id: 'cosmic-engine.integrated' | 'jiva-siva.integrated';
    readonly pluginId: 'plugin-integrated-1-2-3' | 'plugin-integrated-4-5-0';
    readonly rangeId: '1-2-3' | '4-5-0';
    /** Workspace layout that hosts this integrated composition. DR-TS-1 keeps both compositions inside daily-0-1. */
    readonly hostLayoutId: IntegratedHostLayoutId;
    /** Shell side inside the host layout, not a third workspace layout. */
    readonly shellId: IntegratedShellId;
    /** Daily 0/1 face claimed by this composition; null for non-daily hosts. */
    readonly dailyShellFace: IntegratedDailyShellFace;
    /** Product-surface role for routing and tests that need the personal flow-writing distinction. */
    readonly surfaceRole: IntegratedSurfaceRole;
    readonly centerStageOwner: MExtensionId;
    readonly sidePanelOwner: MExtensionId;
    readonly evidencePanelOwner: MExtensionId;
    readonly audioBusOwner: MExtensionId | null;
    readonly selectionOwner: MExtensionId;
    readonly miniInspectorOwners: readonly MExtensionId[];
    readonly persistOnReload: boolean;
}

export interface IntegratedContributorRecord {
    readonly extensionId: MExtensionId;
    readonly contribution: MExtensionContributionContract;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly claims: readonly IntegratedLayoutClaim[];
    readonly geometricClaims?: readonly IntegratedGeometricClaim[];
}

export interface IntegratedReadinessAggregate {
    /** overall composition readiness — collapses to worst severity across contributors */
    readonly overall: MExtensionReadinessSnapshot['state'];
    readonly contributorReadinesses: readonly {
        readonly extensionId: MExtensionId;
        readonly state: MExtensionReadinessSnapshot['state'];
        readonly reason: string;
    }[];
    readonly blockingContributorIds: readonly MExtensionId[];
}

/**
 * The named layouts referenced by 08.T1 verification: defines who owns each
 * singleton slot at the composition level so the coordinator can resolve
 * conflicting claims deterministically.
 */
export const COSMIC_ENGINE_LAYOUT: IntegratedNamedLayout = Object.freeze({
    id: 'cosmic-engine.integrated',
    pluginId: 'plugin-integrated-1-2-3',
    rangeId: '1-2-3',
    hostLayoutId: 'daily-0-1',
    shellId: 'shell-0',
    dailyShellFace: '0-cosmic',
    surfaceRole: 'cosmic-composition',
    // Per 08.T3 plan body: "M3 cosmic wheel center, M2 lens/cymatic/
    // planetary-chakral backdrop or left stage, M1 torus/path/audio-walk
    // inspector as side or lower stage."
    centerStageOwner: 'm3-mahamaya',
    sidePanelOwner: 'm1-paramasiva',
    // M2 produces the DET / meaning-packet evidence stream; the M2 left-stage
    // visual is rendered by the cosmic engine widget itself, not via the
    // evidence-panel slot.
    evidencePanelOwner: 'm2-parashakti',
    // M1-1' writes the shared audio bus per M1'-SPEC; M2 renders, does not write.
    audioBusOwner: 'm1-paramasiva',
    selectionOwner: 'm1-paramasiva',
    // All three contributors may also dock as mini-inspectors per 08.T3
    // deliverable 4 ("mini-inspector choreography for M1 route preview,
    // M2 meaning packet, and M3 codon provenance without letting any one
    // inspector take over the whole workspace by default").
    miniInspectorOwners: Object.freeze([
        'm1-paramasiva',
        'm2-parashakti',
        'm3-mahamaya'
    ] as MExtensionId[]) as readonly MExtensionId[],
    persistOnReload: true
});

export const JIVA_SIVA_LAYOUT: IntegratedNamedLayout = Object.freeze({
    id: 'jiva-siva.integrated',
    pluginId: 'plugin-integrated-4-5-0',
    rangeId: '4-5-0',
    hostLayoutId: 'daily-0-1',
    shellId: 'shell-1',
    dailyShellFace: '1-personal',
    surfaceRole: 'personal-flow-writing',
    centerStageOwner: 'm4-nara',
    sidePanelOwner: 'm5-epii',
    evidencePanelOwner: 'm5-epii',
    audioBusOwner: null,
    selectionOwner: 'm4-nara',
    miniInspectorOwners: Object.freeze([
        'm0-anuttara',
        'm5-epii'
    ] as MExtensionId[]) as readonly MExtensionId[],
    persistOnReload: true
});

export const NAMED_LAYOUTS: readonly IntegratedNamedLayout[] = Object.freeze([
    COSMIC_ENGINE_LAYOUT,
    JIVA_SIVA_LAYOUT
]);

export function findNamedLayout(
    pluginId: IntegratedNamedLayout['pluginId']
): IntegratedNamedLayout {
    const layout = NAMED_LAYOUTS.find(l => l.pluginId === pluginId);
    if (!layout) {
        throw new Error(`No named layout registered for ${pluginId}`);
    }
    return layout;
}

// ============================================================================
// GEOMETRIC COMPOSITION (29.T29.1)
// ============================================================================
//
// The geometric coordinator is a PEER to the widget-region coordinator above,
// not a refinement of it. Where IntegratedLayoutSlot arbitrates Theia widget
// regions (center-stage, side-panel, mini-inspector, ...), the geometric slots
// arbitrate the *played geometry* layers of the integrated composition surface
// — the rendered 3D/cymatic/cell-state substrate and the jiva-siva composition
// zones drawn on top of it.
//
// Cross-arbitration boundary: the widget-region coordinator and the geometric
// coordinator do NOT arbitrate each other's slots. A claim on a geometric slot
// never displaces a widget-region owner and vice versa; the two coordinators
// run independently and resolve only the slot family they own.

/**
 * Geometric layers arbitrated by the {@link GeometricCompositionCoordinator}.
 * Peer to {@link IntegratedLayoutSlot} but scoped to the played-geometry
 * surface rather than Theia widget regions.
 *
 * - `surface` / `texture` / `cell-state` / `grounding` are the cosmic-engine
 *   substrate layers (the played torus, its cymatic texturing, the Mahamaya
 *   cell-state field, and the shared grounding plane).
 * - `left-composition` / `center-composition` / `right-composition` are the
 *   jiva-siva composition zones drawn over the substrate.
 * - `composition-ambient` / `composition-status` are the shared overlays
 *   (ambient field and status readout) framing the composition zones.
 */
export type IntegratedGeometricSlot =
    | 'surface'
    | 'texture'
    | 'cell-state'
    | 'grounding'
    | 'left-composition'
    | 'center-composition'
    | 'right-composition'
    | 'composition-ambient'
    | 'composition-status';

export const PERSONAL_GEOMETRIC_SLOTS = Object.freeze([
    'left-composition',
    'center-composition',
    'right-composition',
    'grounding',
    'composition-ambient',
    'composition-status'
] as const) as readonly IntegratedGeometricSlot[];

export type PersonalGeometricSlot = typeof PERSONAL_GEOMETRIC_SLOTS[number];

export const FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC = Object.freeze([
    'raw-quaternion',
    'raw-audio-octet',
    'plaintext-journal',
    'graphiti-episode-body',
    'raw-natal-chart'
] as const);

export type ForbiddenGeometricHandleClass =
    typeof FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC[number];

export const ALLOWED_HANDLE_CLASSES_ON_GEOMETRIC = Object.freeze([
    'opaque-handle',
    'public-summary',
    'visual-state',
    'psychoid-renderer-handle',
    'recognition-surface',
    'r-virtue-witness',
    'cymatic-mount-point',
    'codon-rotation-export'
] as const);

export type AllowedGeometricHandleClass =
    typeof ALLOWED_HANDLE_CLASSES_ON_GEOMETRIC[number];

export type IntegratedGeometricHandleClass =
    | ForbiddenGeometricHandleClass
    | AllowedGeometricHandleClass
    | (string & {});

/**
 * A claim for a geometric layer. Peer to {@link IntegratedLayoutClaim}; the
 * geometric coordinator resolves these into {@link ResolvedLayoutClaim} values
 * so callers reuse the existing resolution vocabulary.
 */
export interface IntegratedGeometricClaim {
    readonly extensionId: MExtensionId;
    readonly geometricSlot: IntegratedGeometricSlot;
    readonly handleClass: IntegratedGeometricHandleClass;
    /** higher wins when arbitrating a contested geometric layer */
    readonly priority: number;
    readonly privacyClass: PrivacyClass;
    /** plain-language reason this extension wants this geometric layer */
    readonly reason: string;
}

/**
 * Arbitrates the played-geometry surface independently of the widget-region
 * coordinator. Peer authority — it owns the geometric slot family only.
 *
 * A claim whose {@link IntegratedGeometricClaim.handleClass} resolves to a
 * raw-body handle class is REJECTED on personal geometric slots: the rejection
 * carries named provenance (the offending extensionId + geometric slot) so the
 * surface never renders un-scrubbed raw-body geometry.
 */
export interface GeometricCompositionCoordinator {
    /** Submit a claim; reuses the {@link ResolvedLayoutClaim} resolution type. */
    submitClaim(claim: IntegratedGeometricClaim): ResolvedLayoutClaim;
    /** The current owner of a geometric slot, or null if unclaimed. */
    resolveSlot(slot: IntegratedGeometricSlot): MExtensionId | null;
    readonly activeClaims: readonly ResolvedLayoutClaim[];
}

/**
 * Geometric layout for the cosmic-engine (1-2-3) integrated plugin. Cross-link
 * rules per 29.T29.1:
 *
 * - `surface`    → m1-paramasiva  (the played torus geometry)
 * - `texture`    → m2-parashakti  (cymatic texturing of the surface)
 * - `cell-state` → m3-mahamaya    (the codon / cell-state field)
 *
 * `grounding` is the shared plane and is not owned by a single M-extension in
 * the cosmic-engine layout (the composition surface itself renders it).
 */
export const COSMIC_ENGINE_GEOMETRIC_LAYOUT: Readonly<
    Partial<Record<IntegratedGeometricSlot, MExtensionId>>
> = Object.freeze({
    surface: 'm1-paramasiva',
    texture: 'm2-parashakti',
    'cell-state': 'm3-mahamaya'
});

/**
 * Geometric layout for the jiva-siva (4-5-0) integrated plugin. Cross-link
 * rules per 29.T29.1:
 *
 * - `left-composition`   → m4-nara   (jiva pole)
 * - `center-composition` → m4-nara   (jiva pole)
 * - `right-composition`  → m5-epii   (siva pole)
 */
export const JIVA_SIVA_GEOMETRIC_LAYOUT: Readonly<
    Partial<Record<IntegratedGeometricSlot, MExtensionId>>
> = Object.freeze({
    'left-composition': 'm4-nara',
    'center-composition': 'm4-nara',
    'right-composition': 'm5-epii'
});
