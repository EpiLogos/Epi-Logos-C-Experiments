import type {
    MathemeHarmonicProfileBoundary,
    MExtensionId
} from '@pratibimba/m-extension-runtime';
import { CompositionCoordinator } from './composition-coordinator';
import {
    COSMIC_ENGINE_GEOMETRIC_LAYOUT,
    COSMIC_ENGINE_LAYOUT,
    FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC,
    IntegratedContributorRecord,
    IntegratedGeometricClaim,
    IntegratedGeometricSlot,
    IntegratedNamedLayout,
    JIVA_SIVA_GEOMETRIC_LAYOUT,
    JIVA_SIVA_LAYOUT,
    LayoutClaimResolution,
    ResolvedLayoutClaim
} from './layout-claim';
import {
    buildIntegratedReadiness,
    IntegratedReadiness
} from './integrated-readiness';

export type JuxtapositionRejectionReason =
    | 'contribution-declares-side-by-side-slot'
    | 'contribution-has-no-claim'
    | 'contribution-has-no-mini-mode-fallback-and-no-geometric-claim'
    | 'contribution-declares-raw-body-on-geometric-slot';

export interface JuxtapositionRejection {
    readonly compositionId: IntegratedReadiness['compositionId'];
    readonly rejections: readonly {
        readonly extensionId: MExtensionId;
        readonly reason: JuxtapositionRejectionReason;
        readonly humanReason: string;
    }[];
}

export interface ResolvedGeometricClaim {
    readonly claim: IntegratedGeometricClaim;
    readonly resolution: LayoutClaimResolution;
    readonly conflictingExtensionId: MExtensionId | null;
    readonly conflictReason: string | null;
}

export interface MountedComposition {
    readonly compositionId: IntegratedReadiness['compositionId'];
    readonly grantedGeometricClaims: readonly ResolvedGeometricClaim[];
    readonly grantedWidgetClaims: readonly ResolvedLayoutClaim[];
    readonly readiness: IntegratedReadiness;
}

export type CompositionLoadResult =
    | { readonly ok: true; readonly mounted: MountedComposition }
    | { readonly ok: false; readonly rejection: JuxtapositionRejection };

const FORBIDDEN_GEOMETRIC_HANDLE_CLASS_SET: ReadonlySet<string> = new Set(
    FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC
);

type GeometricOwnerMap = Readonly<Partial<Record<IntegratedGeometricSlot, MExtensionId>>>;

interface CompactViewSlotProbe {
    readonly slot?: string;
}

export function compositionLoad(
    compositionId: IntegratedReadiness['compositionId'],
    contributors: readonly IntegratedContributorRecord[],
    profile: MathemeHarmonicProfileBoundary | null
): CompositionLoadResult {
    const layout = layoutForComposition(compositionId);
    const hardRejections = rejectJuxtapositionContributions(
        compositionId,
        contributors
    );
    if (hardRejections.rejections.length > 0) {
        return Object.freeze({
            ok: false,
            rejection: hardRejections
        });
    }

    const widgetCoordinator = new CompositionCoordinator(layout);
    const widgetClaims = widgetCoordinator.resolveClaims(contributors);
    const geometricClaims = resolveGeometricClaims(
        contributors,
        geometricOwnersForComposition(compositionId)
    );
    const readiness = buildIntegratedReadiness(compositionId, contributors, profile);

    return Object.freeze({
        ok: true,
        mounted: Object.freeze({
            compositionId,
            grantedGeometricClaims: Object.freeze(
                geometricClaims.filter(claim => claim.resolution === 'granted')
            ),
            grantedWidgetClaims: Object.freeze(
                widgetClaims.filter(claim => claim.resolution === 'granted')
            ),
            readiness
        })
    });
}

function layoutForComposition(
    compositionId: IntegratedReadiness['compositionId']
): IntegratedNamedLayout {
    switch (compositionId) {
        case 'cosmic-engine.integrated':
            return COSMIC_ENGINE_LAYOUT;
        case 'jiva-siva.integrated':
            return JIVA_SIVA_LAYOUT;
    }
}

function geometricOwnersForComposition(
    compositionId: IntegratedReadiness['compositionId']
): GeometricOwnerMap {
    switch (compositionId) {
        case 'cosmic-engine.integrated':
            return COSMIC_ENGINE_GEOMETRIC_LAYOUT;
        case 'jiva-siva.integrated':
            return JIVA_SIVA_GEOMETRIC_LAYOUT;
    }
}

function rejectJuxtapositionContributions(
    compositionId: IntegratedReadiness['compositionId'],
    contributors: readonly IntegratedContributorRecord[]
): JuxtapositionRejection {
    const rejections: JuxtapositionRejection['rejections'][number][] = [];
    for (const contributor of contributors) {
        const declaresSideBySideSlot = contributor.contribution.compactViews.some(
            view => (view as CompactViewSlotProbe).slot === 'side-by-side'
        );
        if (declaresSideBySideSlot) {
            rejections.push(Object.freeze({
                extensionId: contributor.extensionId,
                reason: 'contribution-declares-side-by-side-slot',
                humanReason: `${contributor.extensionId} declares compactViews slot side-by-side; integrated compositions must mount one composed surface instead of juxtaposed widget panes.`
            }));
        }

        if (hasNoMountClaim(contributor)) {
            rejections.push(Object.freeze({
                extensionId: contributor.extensionId,
                reason: 'contribution-has-no-claim',
                humanReason: `${contributor.extensionId} has no layout or geometric claim for this integrated composition and no mini-mode fallback declared on its contribution contract.`
            }));
        }

        if (hasNoGeometricClaimAndNoWidgetFallback(contributor)) {
            rejections.push(Object.freeze({
                extensionId: contributor.extensionId,
                reason: 'contribution-has-no-mini-mode-fallback-and-no-geometric-claim',
                humanReason: `${contributor.extensionId} declares widget-region claim(s) without miniModeFallback and has no geometric claim; runtime degradation would have no safe fallback surface.`
            }));
        }

        if (
            compositionId === 'jiva-siva.integrated' &&
            declaresRawBodyOnGeometricSlot(contributor)
        ) {
            const rawClaim = contributor.geometricClaims?.find(claim =>
                FORBIDDEN_GEOMETRIC_HANDLE_CLASS_SET.has(claim.handleClass)
            );
            rejections.push(Object.freeze({
                extensionId: contributor.extensionId,
                reason: 'contribution-declares-raw-body-on-geometric-slot',
                humanReason: `${contributor.extensionId} declares raw-body handleClass=${rawClaim?.handleClass ?? 'unknown'} on geometricSlot=${rawClaim?.geometricSlot ?? 'unknown'} under ${compositionId}; personal composition surfaces accept opaque handles only.`
            }));
        }
    }
    return Object.freeze({
        compositionId,
        rejections: Object.freeze(rejections)
    });
}

function hasNoMountClaim(contributor: IntegratedContributorRecord): boolean {
    return (
        contributor.claims.length === 0 &&
        (contributor.geometricClaims?.length ?? 0) === 0 &&
        contributor.contribution.miniModes.length === 0
    );
}

function hasNoGeometricClaimAndNoWidgetFallback(
    contributor: IntegratedContributorRecord
): boolean {
    return (
        contributor.claims.length > 0 &&
        (contributor.geometricClaims?.length ?? 0) === 0 &&
        contributor.claims.every(claim => claim.miniModeFallback === null)
    );
}

function declaresRawBodyOnGeometricSlot(
    contributor: IntegratedContributorRecord
): boolean {
    return (contributor.geometricClaims ?? []).some(claim =>
        FORBIDDEN_GEOMETRIC_HANDLE_CLASS_SET.has(claim.handleClass)
    );
}

function resolveGeometricClaims(
    contributors: readonly IntegratedContributorRecord[],
    namedOwners: GeometricOwnerMap
): readonly ResolvedGeometricClaim[] {
    const allClaims = contributors.flatMap(contributor =>
        (contributor.geometricClaims ?? []).map(claim => ({ contributor, claim }))
    );
    const slots = Array.from(new Set(allClaims.map(entry => entry.claim.geometricSlot)));
    const resolved: ResolvedGeometricClaim[] = [];

    for (const slot of slots) {
        const slotClaims = allClaims.filter(entry => entry.claim.geometricSlot === slot);
        const namedOwner = namedOwners[slot] ?? null;
        const namedClaim = namedOwner
            ? slotClaims.find(entry => entry.claim.extensionId === namedOwner) ?? null
            : null;
        const sorted = [...slotClaims].sort(
            (a, b) => b.claim.priority - a.claim.priority
        );
        const winner = namedClaim ?? sorted[0];
        const runnerUp = sorted.find(entry => entry !== winner) ?? null;
        const conflict =
            !namedClaim &&
            runnerUp &&
            runnerUp.claim.priority === winner.claim.priority
                ? runnerUp
                : null;

        for (const candidate of slotClaims) {
            if (candidate === winner && !conflict) {
                resolved.push(Object.freeze({
                    claim: candidate.claim,
                    resolution: 'granted',
                    conflictingExtensionId: null,
                    conflictReason: null
                }));
                continue;
            }
            if (candidate === winner && conflict) {
                resolved.push(Object.freeze({
                    claim: candidate.claim,
                    resolution: 'blocked-conflict',
                    conflictingExtensionId: conflict.claim.extensionId,
                    conflictReason: `geometric slot ${slot} has equal-priority claims from ${winner.claim.extensionId} and ${conflict.claim.extensionId}; the integrated plugin must surface this conflict rather than silently pick a winner`
                }));
                continue;
            }
            resolved.push(Object.freeze({
                claim: candidate.claim,
                resolution: 'inhibited',
                conflictingExtensionId: winner.claim.extensionId,
                conflictReason: `${slot} owned by ${winner.claim.extensionId}; ${candidate.claim.extensionId} inhibited for this geometric layer`
            }));
        }
    }

    return Object.freeze(resolved);
}
