import * as React from 'react';
import {
    allPlanetLUTRows,
    isOuterPlanetIndex,
    M2PlanetLUTRow,
    OUTER_PLANET_DATASET_BADGE,
    OUTER_PLANET_DATASET_FIELD,
    OUTER_PLANET_PSYCHOID_EXTENSION_TARGET,
    PENDING_PSYCHOID_OUTER_PLANET_BADGE,
    PlanetaryViewMode,
    planetLUT
} from '../../common/planetary-lut';
import type { MExtensionReadinessSnapshot, MExtensionReadinessState } from '@pratibimba/m-extension-runtime';
import type { M2PrimeMeaningPacket } from '../../common/meaning-packet';
import {
    M2_BREADCRUMB_PROVENANCE_FIELDS,
    M2_CHI_SURFACE_PLANET_HALO_PROVENANCE_FIELD,
    M2_TREE_LEAF_PROVENANCE_FIELD,
    ProvenanceBadge,
    type ProvenanceReadinessVariant
} from './ProvenanceBadge';

export interface PlanetaryChakralCardProps {
    readonly planetIndex: number;
    readonly viewMode?: PlanetaryViewMode;
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
}

export interface CorrespondenceTreePlanetaryKeyingPanelProps {
    readonly selectedPlanetIndex?: number;
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
}

export interface SeventyTwoFoldBreadcrumbProps {
    readonly planetIndex: number;
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
}

export function PlanetaryChakralCard(props: PlanetaryChakralCardProps): React.ReactElement {
    const row = planetLUT(props.planetIndex);
    const viewMode = props.viewMode ?? 'vibrational';
    return (
        <article
            className="m2-planetary-card"
            data-planet-index={row.index}
            data-planet-view-mode={viewMode}
        >
            <header>
                <h4>{row.name}</h4>
                <span className="m2-planetary-card__source">{row.source}</span>
                {props.packet && (
                    <ProvenanceBadge
                        compact
                        field="planetaryChakralFrame"
                        readiness={props.readiness ?? 'ready_public_current'}
                        provenance={props.packet.meaningPacketProvenanceFor('planetaryChakralFrame')}
                    />
                )}
            </header>
            {viewMode === 'psychoid' ? (
                <PsychoidPlanetaryPanel row={row} />
            ) : (
                <VibrationalPlanetaryPanel row={row} />
            )}
            <OuterPlanetDatasetBadge row={row} />
        </article>
    );
}

export function CorrespondenceTreePlanetaryKeyingPanel(
    props: CorrespondenceTreePlanetaryKeyingPanelProps
): React.ReactElement {
    return (
        <aside className="m2-planetary-keying-panel" aria-label="Planetary keying">
            <h4>Planetary keying</h4>
            <ol>
                {allPlanetLUTRows().map(row => (
                    <li
                        key={row.index}
                        data-planet-key-row
                        data-planet-index={row.index}
                        data-selected={props.selectedPlanetIndex === row.index ? 'true' : 'false'}
                    >
                        <span>{row.name}</span>
                        <span>{row.coustoHz} Hz</span>
                        <span>DR {row.digitalRoot}</span>
                        <span>{row.chakra}</span>
                        <OuterPlanetDatasetBadge row={row} compact />
                        {props.packet && (
                            <ProvenanceBadge
                                compact
                                field={M2_TREE_LEAF_PROVENANCE_FIELD}
                                readiness={props.readiness ?? 'ready_public_current'}
                                provenance={props.packet.meaningPacketProvenanceFor(M2_TREE_LEAF_PROVENANCE_FIELD)}
                            />
                        )}
                    </li>
                ))}
            </ol>
        </aside>
    );
}

export function SeventyTwoFoldBreadcrumb(props: SeventyTwoFoldBreadcrumbProps): React.ReactElement {
    const row = planetLUT(props.planetIndex);
    return (
        <nav className="m2-seventy-two-fold-breadcrumb" aria-label="72-fold path">
            <ol>
                <BreadcrumbStep step={1} label="hexagram" detail="profile.resonance72" packet={props.packet} readiness={props.readiness} />
                <BreadcrumbStep step={2} label="half-decan" detail="kernelBridge.m2.decodeAxisAt" packet={props.packet} readiness={props.readiness} />
                <BreadcrumbStep step={3} label="decan" detail="s2.decanFace" packet={props.packet} readiness={props.readiness} />
                <li data-breadcrumb-step="4" data-planet-index={row.index}>
                    <span>planet</span>
                    <strong>{row.name}</strong>
                    <span>{row.coustoHz} Hz</span>
                    <span>{row.chakra}</span>
                    <OuterPlanetDatasetBadge row={row} compact />
                    {props.packet && (
                        <>
                            <ProvenanceBadge
                                compact
                                field={M2_BREADCRUMB_PROVENANCE_FIELDS[3]}
                                readiness={props.readiness ?? 'ready_public_current'}
                                provenance={props.packet.meaningPacketProvenanceFor(M2_BREADCRUMB_PROVENANCE_FIELDS[3])}
                            />
                            <ProvenanceBadge
                                compact
                                field={M2_CHI_SURFACE_PLANET_HALO_PROVENANCE_FIELD}
                                readiness={props.readiness ?? 'ready_public_current'}
                                provenance={props.packet.meaningPacketProvenanceFor(M2_CHI_SURFACE_PLANET_HALO_PROVENANCE_FIELD)}
                            />
                        </>
                    )}
                </li>
                <BreadcrumbStep step={5} label="chakra" detail={row.chakra} packet={props.packet} readiness={props.readiness} />
                <BreadcrumbStep step={6} label="body-zone" detail="Earth observer center" packet={props.packet} readiness={props.readiness} />
            </ol>
        </nav>
    );
}

function VibrationalPlanetaryPanel({ row }: { readonly row: M2PlanetLUTRow }): React.ReactElement {
    return (
        <dl>
            <dt>Cousto Hz</dt>
            <dd>{row.coustoHz} Hz</dd>
            <dt>Digital root</dt>
            <dd>DR {row.digitalRoot}</dd>
            <dt>Chakra</dt>
            <dd>{row.chakra}</dd>
            <dt>Element</dt>
            <dd>{row.element}</dd>
            <dt>Phase</dt>
            <dd>{row.phase}</dd>
            <dt>Keplerian velocity</dt>
            <dd>{row.keplerianVelocity}</dd>
            <dt>Ananda row</dt>
            <dd>Ananda row {row.anandaRow}</dd>
            <dt>Day</dt>
            <dd>{row.day}</dd>
        </dl>
    );
}

function PsychoidPlanetaryPanel({ row }: { readonly row: M2PlanetLUTRow }): React.ReactElement {
    if (isOuterPlanetIndex(row.index)) {
        return (
            <dl>
                <dt>Psychoid correspondence</dt>
                <dd>
                    <span
                        className="m2-pending-badge"
                        data-pending-psychoid={PENDING_PSYCHOID_OUTER_PLANET_BADGE}
                    >
                        {PENDING_PSYCHOID_OUTER_PLANET_BADGE}
                    </span>
                </dd>
                <dt>Future home</dt>
                <dd>{OUTER_PLANET_PSYCHOID_EXTENSION_TARGET}</dd>
            </dl>
        );
    }

    return (
        <dl>
            <dt>Psychoid correspondence</dt>
            <dd>kernelBridge.m0.psychoidPlanetary(planet_id)</dd>
        </dl>
    );
}

function OuterPlanetDatasetBadge({
    row,
    compact = false
}: {
    readonly row: M2PlanetLUTRow;
    readonly compact?: boolean;
}): React.ReactElement | null {
    if (!isOuterPlanetIndex(row.index)) {
        return null;
    }
    return (
        <span
            className="m2-pending-badge"
            data-pending-field={OUTER_PLANET_DATASET_FIELD}
            data-pending-dataset={OUTER_PLANET_DATASET_BADGE}
            data-compact={compact ? 'true' : 'false'}
        >
            {OUTER_PLANET_DATASET_FIELD}: {OUTER_PLANET_DATASET_BADGE}
        </span>
    );
}

function BreadcrumbStep({
    step,
    label,
    detail,
    packet,
    readiness
}: {
    readonly step: number;
    readonly label: string;
    readonly detail: string;
    readonly packet?: Pick<M2PrimeMeaningPacket, 'meaningPacketProvenanceFor'> | null;
    readonly readiness?: ProvenanceReadinessVariant | MExtensionReadinessState | MExtensionReadinessSnapshot;
}): React.ReactElement {
    const field = M2_BREADCRUMB_PROVENANCE_FIELDS[step - 1] ?? detail;
    return (
        <li data-breadcrumb-step={step}>
            <span>{label}</span>
            <strong>{detail}</strong>
            {packet && (
                <ProvenanceBadge
                    compact
                    field={field}
                    readiness={readiness ?? 'ready_public_current'}
                    provenance={packet.meaningPacketProvenanceFor(field)}
                />
            )}
        </li>
    );
}
