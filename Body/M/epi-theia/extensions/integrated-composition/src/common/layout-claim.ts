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

export interface IntegratedNamedLayout {
    readonly id: 'cosmic-engine.integrated' | 'jiva-siva.integrated';
    readonly pluginId: 'plugin-integrated-1-2-3' | 'plugin-integrated-4-5-0';
    readonly rangeId: '1-2-3' | '4-5-0';
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
