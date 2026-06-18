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

export interface PlanetaryChakralCardProps {
    readonly planetIndex: number;
    readonly viewMode?: PlanetaryViewMode;
}

export interface CorrespondenceTreePlanetaryKeyingPanelProps {
    readonly selectedPlanetIndex?: number;
}

export interface SeventyTwoFoldBreadcrumbProps {
    readonly planetIndex: number;
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
                <BreadcrumbStep step={1} label="hexagram" detail="profile.resonance72" />
                <BreadcrumbStep step={2} label="half-decan" detail="kernelBridge.m2.decodeAxisAt" />
                <BreadcrumbStep step={3} label="decan" detail="s2.decanFace" />
                <li data-breadcrumb-step="4" data-planet-index={row.index}>
                    <span>planet</span>
                    <strong>{row.name}</strong>
                    <span>{row.coustoHz} Hz</span>
                    <span>{row.chakra}</span>
                    <OuterPlanetDatasetBadge row={row} compact />
                </li>
                <BreadcrumbStep step={5} label="chakra" detail={row.chakra} />
                <BreadcrumbStep step={6} label="body-zone" detail="Earth observer center" />
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
    detail
}: {
    readonly step: number;
    readonly label: string;
    readonly detail: string;
}): React.ReactElement {
    return (
        <li data-breadcrumb-step={step}>
            <span>{label}</span>
            <strong>{detail}</strong>
        </li>
    );
}
