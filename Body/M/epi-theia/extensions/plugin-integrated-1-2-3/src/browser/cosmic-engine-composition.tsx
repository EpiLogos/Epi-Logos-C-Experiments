import * as React from 'react';
import type { MathemeHarmonicProfileBoundary } from '../../../m-extension-runtime/lib/common/profile';
import type { MExtensionId } from '../../../m-extension-runtime/lib/common/contribution-contracts';
import type {
    M3CodonRotationProjectionForLensRing
} from '../../../m3-mahamaya/lib/browser/composition/M3CodonRotationProjectionForLensRing';
import type { M2CymaticFrame } from '../../../m2-parashakti/lib/common/meaning-packet';
import type {
    IntegratedEmptyStateReason,
    IntegratedEmptyStateView
} from '../../../integrated-composition/lib/common/empty-state';
import type {
    IntegratedGeometricClaim
} from '../../../integrated-composition/lib/common/layout-claim';
import { IntegratedEmptyState } from '../../../integrated-composition/lib/browser/integrated-empty-state';
import type {
    InhabitedBimbaEntityState,
    BeingPatternRelationEdge
} from '@pratibimba/integrated-composition/integrated-readiness';
import {
    readCurrentInhabitedBimbaField
} from '@pratibimba/integrated-composition/integrated-readiness';
import {
    useCompositionProfile
} from '@pratibimba/integrated-composition/composition-profile-context';

declare const require: (id: string) => unknown;

export type CosmicCompositionBlockerId =
    | 'pending-k2-surface'
    | 'pending-cymatic-mount-point'
    | 'pending-codon-rotation-export'
    | 'pending-ananda-vortex';

export interface K2SurfaceHandle {
    readonly handleClass: 'k2-surface-handle';
    readonly extensionId: 'm1-paramasiva-played-torus';
    readonly handle: string;
    readonly renderer: 'played-torus';
    readonly privacyClass: 'public_current';
    readonly generation: number;
}

export interface CosmicCompositionSlotOccupant {
    readonly geometricSlot: 'surface' | 'texture' | 'cell-state';
    readonly extensionId: 'm1-paramasiva-played-torus' | 'm2-parashakti' | 'm3-mahamaya';
    readonly handleClass: 'k2-surface-handle' | 'cymatic-mount-point' | 'codon-rotation-export';
}

export interface CosmicCompositionModel {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly k2SurfaceHandle: K2SurfaceHandle | null;
    readonly cymaticFrame: M2CymaticFrame | null;
    readonly codonProjection: M3CodonRotationProjectionForLensRing | null;
    readonly blockers: readonly CosmicCompositionBlockerId[];
    readonly slotOccupants: readonly CosmicCompositionSlotOccupant[];
    readonly geometricClaims: readonly IntegratedGeometricClaim[];
}

export interface CosmicEngineCompositionProps {}

const K2_SURFACE_CLAIM = Object.freeze({
    geometricSlot: 'surface',
    handleClass: 'k2-surface-handle',
    extensionId: 'm1-paramasiva-played-torus',
    priority: 100,
    privacyClass: 'public_current',
    reason: 'Track 22.2 K2 played-torus surface handle owns the full-bleed Cosmic Engine surface.'
}) as unknown as IntegratedGeometricClaim;

const TEXTURE_CLAIM: IntegratedGeometricClaim = Object.freeze({
    geometricSlot: 'texture',
    handleClass: 'cymatic-mount-point',
    extensionId: 'm2-parashakti',
    priority: 90,
    privacyClass: 'public_current_with_pending_private_projection_blocks',
    reason: 'Track 23.10 M2 cymatic mount reads the profile bus and textures the K2 surface.'
});

const CELL_STATE_CLAIM: IntegratedGeometricClaim = Object.freeze({
    geometricSlot: 'cell-state',
    handleClass: 'codon-rotation-export',
    extensionId: 'm3-mahamaya',
    priority: 90,
    privacyClass: 'public_current_with_scalar_oracle_refs_only',
    reason: 'Track 24.13 M3 codon-rotation export projects cell-state onto K2 lens-ring cells.'
});

export const CosmicEngineComposition: React.FC<CosmicEngineCompositionProps> = () => {
    const { profile: compositionProfile } = useCompositionProfile();
    const model = React.useMemo(
        () => buildCosmicCompositionModel(compositionProfile),
        [compositionProfile]
    );
    return (
        <section
            className="cosmic-engine-composition"
            data-test="cosmic-engine-composition"
            data-blockers={model.blockers.join(',')}
        >
            <div
                className="cosmic-engine-editor-surface"
                data-test="cosmic-engine-editor-surface"
                data-editor-surface="cosmic-engine-composition"
            >
                <K2PlayedTorusSurface model={model} />
                <CymaticTextureMount surfaceHandle={model.k2SurfaceHandle} frame={model.cymaticFrame} />
                <CodonCellStateProjection
                    surfaceHandle={model.k2SurfaceHandle}
                    projection={model.codonProjection}
                />
                <MathemeOverlay137 />
                <LegacyBeingPatternOverlay profile={compositionProfile} />
                {model.blockers.length > 0 ? (
                    <IntegratedEmptyState
                        view={buildCompositionBlockerView(model.blockers)}
                        title="Cosmic Engine Composition"
                    />
                ) : null}
            </div>
        </section>
    );
};

export const K2PlayedTorusSurface: React.FC<{
    readonly model: CosmicCompositionModel;
}> = ({ model }) => {
    return (
        <section
            className="cosmic-k2-played-torus-surface"
            data-test="cosmic-geometric-slot"
            data-geometric-slot="surface"
            data-slot-occupant="m1-paramasiva-played-torus"
            data-handle-class="k2-surface-handle"
            data-surface-handle={model.k2SurfaceHandle?.handle ?? 'pending-k2-surface'}
        >
            <div className="cosmic-k2-vortex-field" data-test="k2-played-torus-surface">
                <span data-test="k2-surface-generation">
                    {model.k2SurfaceHandle?.generation ?? 'pending'}
                </span>
            </div>
        </section>
    );
};

export const CymaticTextureMount: React.FC<{
    readonly surfaceHandle: K2SurfaceHandle | null;
    readonly frame: M2CymaticFrame | null;
}> = ({ surfaceHandle, frame }) => {
    return (
        <section
            className="cosmic-cymatic-texture-mount"
            data-test="cosmic-geometric-slot"
            data-geometric-slot="texture"
            data-slot-occupant="m2-parashakti"
            data-handle-class="cymatic-mount-point"
            data-surface-handle={surfaceHandle?.handle ?? 'pending-k2-surface'}
            data-address72={frame?.address72 ?? 'pending-cymatic-mount-point'}
            data-wave-samples={frame?.sampleCount ?? 0}
        >
            {frame ? (
                <ol className="cosmic-cymatic-wave-points" data-test="m2-cymatic-wave-points">
                    {frame.wavePoints.slice(0, 12).map((point, index) => (
                        <li key={index} style={{ transform: `scaleY(${Math.max(0.08, Math.abs(point))})` }}>
                            {point}
                        </li>
                    ))}
                </ol>
            ) : null}
        </section>
    );
};

export const CodonCellStateProjection: React.FC<{
    readonly surfaceHandle: K2SurfaceHandle | null;
    readonly projection: M3CodonRotationProjectionForLensRing | null;
}> = ({ surfaceHandle, projection }) => {
    return (
        <section
            className="cosmic-codon-cell-state-projection"
            data-test="cosmic-geometric-slot"
            data-geometric-slot="cell-state"
            data-slot-occupant="m3-mahamaya"
            data-handle-class="codon-rotation-export"
            data-surface-handle={surfaceHandle?.handle ?? 'pending-k2-surface'}
            data-rotation-phase={projection?.rotationPhase ?? 'pending-codon-rotation-export'}
        >
            {projection?.cells.map(cell => (
                <span
                    key={`${cell.ringIndex}:${cell.cellIndex}`}
                    className="cosmic-codon-cell"
                    data-test="m3-codon-cell"
                    data-ring-index={cell.ringIndex}
                    data-cell-index={cell.cellIndex}
                    data-position-label={cell.positionLabel}
                    style={{ borderColor: cell.colourHsla }}
                >
                    {cell.codonTriple ?? cell.positionLabel}
                </span>
            ))}
        </section>
    );
};

export const MathemeOverlay137: React.FC = () => {
    return (
        <aside className="cosmic-matheme-overlay-137" data-test="matheme-overlay-137">
            <span>137</span>
            <small>64 + 72 + 1</small>
        </aside>
    );
};

export function buildCosmicCompositionModel(
    profile: MathemeHarmonicProfileBoundary | null
): CosmicCompositionModel {
    const blockers = new Set<CosmicCompositionBlockerId>();
    const k2SurfaceHandle = readK2SurfaceHandle(profile);
    if (!k2SurfaceHandle) {
        blockers.add('pending-k2-surface');
    }
    if (!readAnandaVortexReady(profile)) {
        blockers.add('pending-ananda-vortex');
    }

    const cymaticFrame = readCymaticFrame(profile);
    if (!cymaticFrame) {
        blockers.add('pending-cymatic-mount-point');
    }

    const codonProjection = readCodonProjection(profile);
    if (!codonProjection) {
        blockers.add('pending-codon-rotation-export');
    }

    return Object.freeze({
        profile,
        k2SurfaceHandle,
        cymaticFrame,
        codonProjection,
        blockers: Object.freeze([...blockers]),
        slotOccupants: Object.freeze([
            Object.freeze({
                geometricSlot: 'surface',
                extensionId: 'm1-paramasiva-played-torus',
                handleClass: 'k2-surface-handle'
            }),
            Object.freeze({
                geometricSlot: 'texture',
                extensionId: 'm2-parashakti',
                handleClass: 'cymatic-mount-point'
            }),
            Object.freeze({
                geometricSlot: 'cell-state',
                extensionId: 'm3-mahamaya',
                handleClass: 'codon-rotation-export'
            })
        ]),
        geometricClaims: Object.freeze([
            K2_SURFACE_CLAIM,
            TEXTURE_CLAIM,
            CELL_STATE_CLAIM
        ])
    });
}

function readK2SurfaceHandle(profile: MathemeHarmonicProfileBoundary | null): K2SurfaceHandle | null {
    const raw = objectValue(
        profile?.payload['k2SurfaceHandle'] ??
        profile?.payload['k2_surface_handle'] ??
        profile?.payload['playedTorusSurfaceHandle']
    );
    const handle = stringValue(raw?.handle ?? raw?.handleId ?? raw?.rendererHandle);
    if (!profile || !handle) {
        return null;
    }
    return Object.freeze({
        handleClass: 'k2-surface-handle',
        extensionId: 'm1-paramasiva-played-torus',
        handle,
        renderer: 'played-torus',
        privacyClass: 'public_current',
        generation: profile.generation
    });
}

function readAnandaVortexReady(profile: MathemeHarmonicProfileBoundary | null): boolean {
    if (!profile) {
        return false;
    }
    return Boolean(
        profile.payload['anandaVortexMatrix'] ??
        profile.payload['ananda_vortex_matrix'] ??
        profile.payload['vortexMatrixFamilies']
    );
}

function readCymaticFrame(profile: MathemeHarmonicProfileBoundary | null): M2CymaticFrame | null {
    if (!profile || !objectValue(profile.payload['compositionMountPoint'])) {
        return null;
    }
    try {
        const { renderM2CymaticFrame } = require(
            '../../../m2-parashakti/lib/common/meaning-packet'
        ) as typeof import('../../../m2-parashakti/lib/common/meaning-packet');
        return renderM2CymaticFrame({ profile, scope: 'cosmic-public' });
    } catch {
        return null;
    }
}

function readCodonProjection(
    profile: MathemeHarmonicProfileBoundary | null
): M3CodonRotationProjectionForLensRing | null {
    if (!profile) {
        return null;
    }
    const exported = readExportedCodonProjection(profile);
    if (exported) {
        return exported;
    }
    return null;
}

function readExportedCodonProjection(
    profile: MathemeHarmonicProfileBoundary
): M3CodonRotationProjectionForLensRing | null {
    const raw = objectValue(
        profile.payload['m3CodonRotationProjectionForLensRing'] ??
        profile.payload['codonRotationProjectionForLensRing'] ??
        profile.payload['codon_rotation_composition_export']
    );
    const cells = Array.isArray(raw?.cells) ? raw.cells : null;
    const activeRingIndex = raw?.activeRingIndex;
    const rotationPhase = raw?.rotationPhase;
    if (!cells || typeof activeRingIndex !== 'number' || typeof rotationPhase !== 'number') {
        return null;
    }
    const descriptors = cells
        .map(cell => objectValue(cell))
        .filter((cell): cell is Readonly<Record<string, unknown>> => Boolean(cell))
        .map(cell => {
            const ringIndex = cell.ringIndex;
            const cellIndex = cell.cellIndex;
            const positionLabel = cell.positionLabel;
            const colourHsla = cell.colourHsla;
            if (
                typeof ringIndex !== 'number' ||
                typeof cellIndex !== 'number' ||
                typeof positionLabel !== 'string' ||
                typeof colourHsla !== 'string'
            ) {
                return null;
            }
            return Object.freeze({
                ringIndex,
                cellIndex,
                positionLabel,
                codonTriple: stringValue(cell.codonTriple) ?? undefined,
                aminoAcid: stringValue(cell.aminoAcid) ?? undefined,
                colourHsla
            });
        })
        .filter((cell): cell is NonNullable<typeof cell> => Boolean(cell));
    if (descriptors.length === 0) {
        return null;
    }
    return Object.freeze({
        cells: Object.freeze(descriptors),
        activeRingIndex,
        rotationPhase
    });
}

function buildCompositionBlockerView(
    blockers: readonly CosmicCompositionBlockerId[]
): IntegratedEmptyStateView {
    const reasons: IntegratedEmptyStateReason[] = blockers.map(blocker => {
        const detail = BLOCKER_DETAILS[blocker];
        return Object.freeze({
            contributorId: detail.contributorId,
            readinessState: 'authority_payload_missing',
            ownerTrack: detail.ownerTrack,
            blockerId: blocker,
            humanReason: detail.humanReason
        });
    });
    return Object.freeze({
        pluginId: 'plugin-integrated-1-2-3',
        layoutId: 'cosmic-engine.integrated',
        overall: 'authority_payload_missing',
        reasons: Object.freeze(reasons),
        missingContributors: Object.freeze([])
    });
}

const BLOCKER_DETAILS: Readonly<Record<CosmicCompositionBlockerId, {
    readonly contributorId: MExtensionId;
    readonly ownerTrack: string;
    readonly humanReason: string;
}>> = Object.freeze({
    'pending-k2-surface': Object.freeze({
        contributorId: 'm1-paramasiva',
        ownerTrack: 'Track 22.2',
        humanReason: 'K2SurfaceHandle from m1-paramasiva-played-torus is not yet available to the composition.'
    }),
    'pending-cymatic-mount-point': Object.freeze({
        contributorId: 'm2-parashakti',
        ownerTrack: 'Track 23.10',
        humanReason: 'M2 compositionMountPoint or deterministic cymatic frame is not ready.'
    }),
    'pending-codon-rotation-export': Object.freeze({
        contributorId: 'm3-mahamaya',
        ownerTrack: 'Track 24.13',
        humanReason: 'M3 codon-rotation export for K2 lens-ring cells is not ready.'
    }),
    'pending-ananda-vortex': Object.freeze({
        contributorId: 'm1-paramasiva',
        ownerTrack: 'Track 10.10',
        humanReason: 'Ananda vortex matrix families for the K2 cross-fade are not ready.'
    })
});

function objectValue(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

// Compatibility export retained for the pre-existing local overlay test.
export interface CosmicBeingPatternMarker {
    readonly entityId: string;
    readonly entityKind: string;
    readonly monopolyOperator: InhabitedBimbaEntityState['monopolyOperator'];
    readonly visualState:
        | 'single'
        | 'distinct-many'
        | 'suggested-contour'
        | 'review-warning'
        | 'held-many-in-one';
    readonly degree360: number | null;
    readonly reviewRisk: InhabitedBimbaEntityState['reviewRisk'];
}

export interface CosmicBeingPatternRelationAspect {
    readonly edgeId: string;
    readonly sourceEntityId: string;
    readonly targetEntityId: string;
    readonly aspectLabel: string | null;
    readonly planetaryLensAspect: string | null;
}

export interface CosmicBeingPatternOverlayModel {
    readonly observer: 'Earth';
    readonly orbiterCount: number | null;
    readonly orbiterSource: string | null;
    readonly markers: readonly CosmicBeingPatternMarker[];
    readonly relationAspects: readonly CosmicBeingPatternRelationAspect[];
}

export function deriveCosmicBeingPatternOverlay(
    profile: MathemeHarmonicProfileBoundary | null
): CosmicBeingPatternOverlayModel {
    const field = readCurrentInhabitedBimbaField(profile);
    const orbiterProjection = readOrbiterProjection(profile);
    return Object.freeze({
        observer: 'Earth',
        orbiterCount: orbiterProjection.orbiterCount,
        orbiterSource: orbiterProjection.source,
        markers: Object.freeze(field.entities.map(markerFromEntity)),
        relationAspects: Object.freeze(field.relationEdges.map(aspectFromRelation))
    });
}

const LegacyBeingPatternOverlay: React.FC<{
    readonly profile: MathemeHarmonicProfileBoundary | null;
}> = ({ profile }) => {
    const overlay = deriveCosmicBeingPatternOverlay(profile);
    if (overlay.markers.length === 0 && overlay.relationAspects.length === 0) {
        return null;
    }
    return (
        <div
            className="cosmic-being-pattern-field"
            data-test="cosmic-being-pattern-field"
            data-observer={overlay.observer}
        >
            {overlay.markers.map(marker => (
                <span
                    key={marker.entityId}
                    data-test="being-pattern-marker"
                    data-entity-id={marker.entityId}
                    data-monopoly-operator={marker.monopolyOperator}
                    data-review-risk={marker.reviewRisk ?? undefined}
                />
            ))}
            {overlay.relationAspects.map(aspect => (
                <span key={aspect.edgeId} data-test="being-pattern-aspect">
                    {aspect.planetaryLensAspect ?? aspect.aspectLabel ?? aspect.edgeId}
                </span>
            ))}
        </div>
    );
};

function markerFromEntity(entity: InhabitedBimbaEntityState): CosmicBeingPatternMarker {
    return Object.freeze({
        entityId: entity.entityRef.entityId,
        entityKind: entity.entityRef.entityKind,
        monopolyOperator: entity.monopolyOperator,
        visualState: visualStateForOperator(entity.monopolyOperator),
        degree360: readDegree(entity.clockAddress),
        reviewRisk: entity.reviewRisk
    });
}

function aspectFromRelation(
    relation: BeingPatternRelationEdge
): CosmicBeingPatternRelationAspect {
    return Object.freeze({
        edgeId: relation.edgeId,
        sourceEntityId: relation.sourceEntityId,
        targetEntityId: relation.targetEntityId,
        aspectLabel: relation.aspectLabel ?? null,
        planetaryLensAspect: readPlanetaryLensAspect(relation.m2M3Relation)
    });
}

function visualStateForOperator(
    operator: InhabitedBimbaEntityState['monopolyOperator']
): CosmicBeingPatternMarker['visualState'] {
    switch (operator) {
        case 'Mono':
            return 'single';
        case 'Poly':
        case 'ActuallyMany':
        case 'PotentiatingMany':
            return 'distinct-many';
        case 'PotentiallyOne':
            return 'suggested-contour';
        case 'ActualisingOne':
            return 'review-warning';
        case 'MonoPoly':
            return 'held-many-in-one';
    }
}

function readDegree(clockAddress: Readonly<Record<string, unknown>>): number | null {
    const degree = clockAddress['degree360'];
    return typeof degree === 'number' && Number.isFinite(degree) ? degree : null;
}

function readPlanetaryLensAspect(relation: Readonly<Record<string, unknown>> | undefined): string | null {
    if (!relation) {
        return null;
    }
    const value = relation['planetaryLensAspect'];
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function readOrbiterProjection(profile: MathemeHarmonicProfileBoundary | null): {
    readonly orbiterCount: number | null;
    readonly source: string | null;
} {
    const raw =
        profile?.payload['m2EarthCentredOrbiterProjection'] ??
        profile?.payload['m2_earth_centred_orbiter_projection'];
    const record = objectValue(raw);
    if (!record) {
        return { orbiterCount: null, source: null };
    }
    const count = record['orbiterCount'];
    const source = record['source'];
    return {
        orbiterCount: typeof count === 'number' && Number.isFinite(count) ? count : null,
        source: typeof source === 'string' ? source : null
    };
}
