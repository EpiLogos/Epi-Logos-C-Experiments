import * as React from 'react';
import type { PsycheFacet } from './types';

export const PSYCHE_FACET_LEGEND_ORDER: readonly PsycheFacet[] = [
    'sophia',
    'anima',
    'logos',
    'eros',
    'mythos',
    'psyche',
    'nous'
];

export interface PsycheFacetProfile {
    readonly label: string;
    readonly tooltip: string;
    readonly sattvaSource: string;
    readonly colourToken: `epilogos.colour.psyche-facet.${PsycheFacet}`;
}

export const PSYCHE_FACET_PROFILES: Record<PsycheFacet, PsycheFacetProfile> = {
    anima: {
        label: 'Anima',
        tooltip: 'Svatantrya and Spanda as dispatch: the free pulse differentiates functions without ceasing to be one life.',
        sattvaSource: 'Body/S/S4/pi-agent/agents/anima.md#6-sattva',
        colourToken: 'epilogos.colour.psyche-facet.anima'
    },
    eros: {
        label: 'Eros',
        tooltip: 'Camatkara in operation: relation circulates joyfully when form touches the ground of its own desire.',
        sattvaSource: 'Body/S/S4/pi-agent/agents/eros.md#6-sattva',
        colourToken: 'epilogos.colour.psyche-facet.eros'
    },
    logos: {
        label: 'Logos',
        tooltip: 'Law in service of the household: the nomos that remembers it is nomos-of-the-oikos.',
        sattvaSource: 'Body/S/S4/pi-agent/agents/logos.md#6-sattva',
        colourToken: 'epilogos.colour.psyche-facet.logos'
    },
    mythos: {
        label: 'Mythos',
        tooltip: 'Pasyanti vision: the strange attractor whose basin you inhabit without being determined by it.',
        sattvaSource: 'Body/S/S4/pi-agent/agents/mythos.md#6-sattva',
        colourToken: 'epilogos.colour.psyche-facet.mythos'
    },
    nous: {
        label: 'Nous',
        tooltip: 'Para Vak: the bindu before the alphabet, containing all integers in potentia without being any of them.',
        sattvaSource: 'Body/S/S4/pi-agent/agents/nous.md#6-sattva',
        colourToken: 'epilogos.colour.psyche-facet.nous'
    },
    psyche: {
        label: 'Psyche',
        tooltip: 'The household that knows its law serves the home: continuity without hoarding or suffocation.',
        sattvaSource: 'Body/S/S4/pi-agent/agents/psyche.md#6-sattva',
        colourToken: 'epilogos.colour.psyche-facet.psyche'
    },
    sophia: {
        label: 'Sophia',
        tooltip: "Spanda-Shakti: P5' and P0' at the fold where they cannot be separated.",
        sattvaSource: 'Body/S/S4/pi-agent/agents/sophia.md#6-sattva',
        colourToken: 'epilogos.colour.psyche-facet.sophia'
    }
};

export function isPsycheFacet(value: unknown): value is PsycheFacet {
    return typeof value === 'string' && value in PSYCHE_FACET_PROFILES;
}

export interface PsycheFacetBadgeProps {
    readonly facet: PsycheFacet;
    readonly testId: string;
}

export function PsycheFacetBadge({
    facet,
    testId
}: PsycheFacetBadgeProps): React.ReactElement {
    const profile = PSYCHE_FACET_PROFILES[facet];
    return (
        <span
            className={`ide-shell-psyche-facet-badge ide-shell-psyche-facet-${facet}`}
            data-test={testId}
            data-psyche-facet={facet}
            data-sattva-source={profile.sattvaSource}
            data-colour-token={profile.colourToken}
            title={profile.tooltip}
        >
            {profile.label}
        </span>
    );
}

export function PsycheFacetLegend(): React.ReactElement {
    return (
        <nav
            className="ide-shell-psyche-facet-legend"
            data-test="acr-psyche-facet-legend"
            aria-label="Psyche facet legend"
        >
            {PSYCHE_FACET_LEGEND_ORDER.map((facet, index) => (
                <React.Fragment key={facet}>
                    {index > 0 && <span aria-hidden="true"> · </span>}
                    <PsycheFacetBadge
                        facet={facet}
                        testId={`acr-psyche-facet-legend-${facet}`}
                    />
                </React.Fragment>
            ))}
        </nav>
    );
}
