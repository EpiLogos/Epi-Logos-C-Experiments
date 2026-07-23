/**
 * Coordinate: M' `/` membrane (psyche-facet legend — Track 27.T27.3)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the psyche-facet vocabulary the Dispatch trace badges + legend
 *   render. Psyche facets are Anima's AUTHORIAL registers (DR-M5-1) — the voice
 *   a dispatch speaks in — NOT separate dispatch authorities. Colours ride CSS
 *   classes (`facet-<id>`), never raw hex, per the carrier-token lint.
 * Public surface: PSYCHE_FACETS, PSYCHE_FACET_LABEL, psycheFacetClass,
 *   psycheFacetForAgent.
 * Does NOT own: the facet type (evidenceShapes.ts), dispatch structure.
 */

import type { PsycheFacet } from './evidenceShapes';

/** Legend order (stable) + human labels. */
export const PSYCHE_FACETS: readonly PsycheFacet[] = Object.freeze([
    'sophia',
    'anima',
    'logos',
    'eros',
    'mythos',
    'psyche',
    'nous'
]);

export const PSYCHE_FACET_LABEL: Readonly<Record<PsycheFacet, string>> = Object.freeze({
    sophia: 'Sophia',
    anima: 'Anima',
    logos: 'Logos',
    eros: 'Eros',
    mythos: 'Mythos',
    psyche: 'Psyche',
    nous: 'Nous'
});

/** The CSS class carrying the facet's colour (defined in styles.css). */
export function psycheFacetClass(facet: PsycheFacet): string {
    return `facet-${facet}`;
}

const FACET_IDS = new Set<string>(PSYCHE_FACETS);

/**
 * The psyche facet an agent identity speaks in, when it is a constitutional
 * register (sophia/nous/logos/eros/mythos/psyche/anima). Returns undefined for
 * Pi, gateways, and Aletheia subagents (those carry an aletheia identity, not a
 * psyche facet). Never invents a facet.
 */
export function psycheFacetForAgent(agentId: string): PsycheFacet | undefined {
    const normalised = agentId.toLowerCase();
    return FACET_IDS.has(normalised) ? (normalised as PsycheFacet) : undefined;
}
