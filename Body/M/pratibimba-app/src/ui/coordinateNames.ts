/**
 * Coordinate: M' shell-0 (coordinate-name vocabulary — Track 31)
 * Residency: Body/M/pratibimba-app/src/ui/coordinateNames.ts
 * Actualises: the canonical family + archetype NAME source for chrome that
 *   renders a coordinate as human labels — the coordinate-path breadcrumb
 *   (31.T31.6). Names are the CLAUDE.md §II.C canon: the six coordinate
 *   families (P Position … C Category) and each family's #0–#5 archetype
 *   manifestations (M0 Anuttara … M5 Epii). The colour identity of a coordinate
 *   lives in tokens.ts (coordinateFamilyGrade); this file names it.
 * Public surface: FAMILY_NAMES, ARCHETYPE_NAMES, decomposeCoordinate,
 *   CoordinateDecomposition.
 * Does NOT own: colour tokens (ui/tokens.ts), the graph node-label authority
 *   (bridge/graphClient.ts `s2.graph.node` — deeper position names), or
 *   coordinate selection (state/stores.ts).
 * Contract: [[M'-SYSTEM-SPEC]] + rerun tranche [[31.T31.6]]; names per
 *   [[Epi-Logos C Architecture]] §II.C.
 */

import { coordinateFamilyGrade, type ArchetypeGrade, type FamilyLetter } from './tokens';

/** The six coordinate families' domain names (CLAUDE.md §II.C). */
export const FAMILY_NAMES: Record<FamilyLetter, string> = {
    P: 'Position',
    S: 'Stack',
    T: 'Thought',
    M: 'Subsystem',
    L: 'Lens',
    C: 'Category'
};

type SixNames = readonly [string, string, string, string, string, string];

/** Each family's #0–#5 archetype manifestations (CLAUDE.md §II.C); index = grade. */
export const ARCHETYPE_NAMES: Record<FamilyLetter, SixNames> = {
    P: ['Ground', 'Definition', 'Operation', 'Pattern', 'Context', 'Integration'],
    S: ['Terminal', 'Obsidian', 'GraphDB', 'Gateway', 'Agent Runtime', 'World Boundary'],
    T: ['Seed', 'Spec', 'Form', 'Process', 'Pattern', 'Insight'],
    M: ['Anuttara', 'Paramasiva', 'Parashakti', 'Mahamaya', 'Nara', 'Epii'],
    L: ['Literal', 'Functional', 'Structural', 'Archetypal', 'Paradigmatic', 'Integral'],
    C: ['Bimba', 'Form', 'Entity', 'Process', 'Type', 'Pratibimba']
};

export interface CoordinateDecomposition {
    readonly family: FamilyLetter;
    readonly grade: ArchetypeGrade;
    /** The family domain name (e.g. 'Subsystem'). */
    readonly familyName: string;
    /** The #0–#5 archetype manifestation name (e.g. 'Nara'). */
    readonly archetypeName: string;
    /** The coordinate tail after the family+archetype token, sans a single
     *  leading separator (e.g. 'M4-3' → '3', 'M3-1-0-13' → '1-0-13', 'M4' → ''). */
    readonly positionTail: string;
    /** Reduced coordinate carrying the family only (e.g. 'M'). */
    readonly familyCoord: string;
    /** Reduced coordinate carrying family+archetype (e.g. 'M4'). */
    readonly archetypeCoord: string;
    /** The full coordinate as selected (trimmed). */
    readonly fullCoord: string;
}

/**
 * Decompose a Bimba coordinate into its family → archetype → position naming
 * for the breadcrumb triad. Returns null for a coordinate outside the six
 * families (a bare `#4` raw archetype or a reflective `cpf`), mirroring
 * coordinateFamilyGrade. The family+archetype token is the leading two
 * characters (`[PSTMLC][0-5]`); everything after it is the position tail.
 */
export function decomposeCoordinate(coordinate: string): CoordinateDecomposition | null {
    const cfg = coordinateFamilyGrade(coordinate);
    if (!cfg) {
        return null;
    }
    const trimmed = coordinate.trim();
    const positionTail = trimmed.slice(2).replace(/^[-.]/, '');
    return {
        family: cfg.family,
        grade: cfg.grade,
        familyName: FAMILY_NAMES[cfg.family],
        archetypeName: ARCHETYPE_NAMES[cfg.family][cfg.grade],
        positionTail,
        familyCoord: cfg.family,
        archetypeCoord: `${cfg.family}${cfg.grade}`,
        fullCoord: trimmed
    };
}
