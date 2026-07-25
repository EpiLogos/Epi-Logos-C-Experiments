/**
 * Coordinate: M' shell chrome (coordinate-path breadcrumb — 31.T31.6)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): shared M0'/M5' chrome membrane (top-of-editor breadcrumb)
 * Actualises: CCT-11 — the active coordinate shown as a top breadcrumb triad
 *   family → archetype → position; each segment is clickable and retargets to
 *   the reduced coordinate (family only / family+archetype / full). A STATELESS
 *   projection of the coordinate store — no local coordinate state, no clock.
 *   Per-segment tint = the coordinate's family-tier × archetype-grade colour
 *   identity (coordinateFamilyGrade, 30.T30.2), resolved for the LIVE theme and
 *   the coordinate's own domain (30.T30.4 — so an M4 coordinate under a nara
 *   theme carries the nara warm bias). The per-Mn 72-fold (23.7) and
 *   decan-chain (24.7) breadcrumbs stay widget-internal and are NOT this bar.
 * Public surface: CoordinateBreadcrumb.
 * Does NOT own: coordinate selection (state/stores.ts), the cross-layout intent
 *   target ledger (commands/crossLayoutIntent.ts), colour tokens (ui/tokens.ts),
 *   theme resolution (ui/themeMapping.ts) or theme state (state/themeStore.ts),
 *   or graph node names (bridge/graphClient.ts).
 * Contract: [[CHROME-CONTRACT]] + rerun tranche [[31.T31.6]] (consumes
 *   [[30.T30.2]] coordinateFamilyGrade, [[30.T30.4]] theme resolution, and
 *   [[31.T31.10]] cross-layout intent spine).
 */

import { CROSS_LAYOUT_INTENT_COMMAND } from '../commands/crossLayoutIntent';
import { commands } from '../commands/registry';
import { useCoordinateStore, useSessionStore, useTickStore } from '../state/stores';
import { useThemeStore } from '../state/themeStore';
import { decomposeCoordinate } from '../ui/coordinateNames';
import { domainIdForCoordinate, resolveToken, type CanonicalTheme } from '../ui/themeMapping';
import { coordinateFamilyGrade } from '../ui/tokens';

/** Resolve the segment tint for the LIVE theme (30.T30.4). `applied` comes from
 *  the theme store — the reactive path — so a theme switch re-renders this
 *  component; reading `document.dataset.theme` here would leave the tint stale
 *  because nothing this component subscribes to would have moved. The domain
 *  comes from the coordinate being rendered, so an M4 coordinate under a nara
 *  theme takes the nara warm bias — exactly the pair the remap keys off. */
function segmentTint(coordinate: string, applied: CanonicalTheme): string | undefined {
    const grade = coordinateFamilyGrade(coordinate);
    if (!grade) {
        return undefined;
    }
    return resolveToken(
        `family.${grade.family.toLowerCase()}.${grade.grade}`,
        applied,
        domainIdForCoordinate(coordinate)
    );
}

interface BreadcrumbSegment {
    readonly key: 'family' | 'archetype' | 'position';
    readonly label: string;
    readonly title: string;
    /** The reduced coordinate this segment retargets to when clicked. */
    readonly coordinate: string;
}

/** Dispatch a coordinate navigation over the cross-layout intent spine. Uses the
 *  `highlight-coordinate` alias (crossLayoutIntent.ts) so the reduced coordinate
 *  lands in the coordinate store + coordinate-tree without changing session
 *  identity (the routing receipt snapshots identity around the layout switch). */
function retargetCoordinate(coordinate: string): void {
    const session = useSessionStore.getState();
    const privacyClass = session.privacyClass;
    void commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
        coordinate,
        artifactUri: null,
        reviewId: null,
        dayNow: session.dayNow,
        sessionKey: session.sessionKey,
        profileGeneration: useTickStore.getState().generation,
        privacyClass:
            privacyClass === 'public' || privacyClass === 'protected' || privacyClass === 'private'
                ? privacyClass
                : null,
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId: 'highlight-coordinate'
    });
}

export function CoordinateBreadcrumb() {
    const selected = useCoordinateStore(s => s.selected);
    const applied = useThemeStore(s => s.applied);
    const decomposition = selected ? decomposeCoordinate(selected) : null;
    if (!selected || !decomposition) {
        return null;
    }

    const tint = segmentTint(selected, applied);

    const segments: BreadcrumbSegment[] = [
        {
            key: 'family',
            label: decomposition.family,
            title: `${decomposition.familyName} family`,
            coordinate: decomposition.familyCoord
        },
        {
            key: 'archetype',
            label: decomposition.archetypeName,
            title: decomposition.archetypeCoord,
            coordinate: decomposition.archetypeCoord
        }
    ];
    if (decomposition.positionTail) {
        segments.push({
            key: 'position',
            label: decomposition.positionTail,
            title: decomposition.fullCoord,
            coordinate: decomposition.fullCoord
        });
    }

    return (
        <nav
            className="coordinate-breadcrumb"
            data-testid="coordinate-breadcrumb"
            data-active-coordinate={selected}
            aria-label="coordinate path"
        >
            <ol>
                {segments.map((segment, index) => (
                    <li key={segment.key}>
                        {index > 0 ? (
                            <span className="coordinate-breadcrumb-sep" aria-hidden="true">
                                ›
                            </span>
                        ) : null}
                        <button
                            type="button"
                            className="coordinate-breadcrumb-segment"
                            data-testid={`coordinate-breadcrumb-${segment.key}`}
                            data-coordinate={segment.coordinate}
                            title={segment.title}
                            style={tint ? { color: tint } : undefined}
                            onClick={() => retargetCoordinate(segment.coordinate)}
                        >
                            {segment.label}
                        </button>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
