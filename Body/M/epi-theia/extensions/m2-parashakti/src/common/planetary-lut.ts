export type PlanetaryViewMode = 'vibrational' | 'psychoid';
export type M2PlanetIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const OUTER_PLANET_DATASET_BADGE = 'pending-dataset-2-5-8-9-10';
export const OUTER_PLANET_DATASET_FIELD = 's2.outerPlanetGraphNode';
export const PENDING_PSYCHOID_OUTER_PLANET_BADGE = 'pending-psychoid-outer-planet';
export const OUTER_PLANET_PSYCHOID_EXTENSION_TARGET = 'm2-5-transpersonal-extension';

export interface M2PlanetLUTRow {
    readonly index: M2PlanetIndex;
    readonly name: string;
    readonly groupType: number;
    readonly prime: number;
    readonly coustoHz: number;
    readonly keplerianVelocity: number;
    readonly digitalRoot: number;
    readonly chakra: string;
    readonly element: string;
    readonly phase: string;
    readonly anandaRow: number;
    readonly day: string;
    readonly meaningId: string;
    readonly source: 'kernelBridge.m2.planetLUT(idx)';
}

export const M2_PLANET_LUT_SOURCE = 'kernelBridge.m2.planetLUT(idx)' as const;

const M2_PLANET_LUT_ROWS: readonly M2PlanetLUTRow[] = Object.freeze([
    planetRow(0, 'Sun', 0, 0, 126, 35999, 9, 'EARTH-root', 'AGNI', 'FUSED', 0, 'Sunday', '0x0300'),
    planetRow(1, 'Moon', 3, 0, 210, 47270, 3, 'SVADHISTHANA', 'APAS', 'ASCENT', 1, 'Monday', '0x0301'),
    planetRow(2, 'Mercury', 1, 0, 141, 14739, 6, 'VISHUDDHA', 'VAYU', 'DESCENT', 2, 'Wednesday', '0x0302'),
    planetRow(3, 'Venus', 2, 0, 221, 3600, 5, 'ANAHATA', 'APAS', 'DESCENT', 3, 'Friday', '0x0303'),
    planetRow(4, 'Mars', 4, 0, 145, 1886, 1, 'MANIPURA', 'AGNI', 'DESCENT', 4, 'Tuesday', '0x0304'),
    planetRow(5, 'Jupiter', 4, 41, 184, 299, 4, 'MANIPURA', 'AGNI', 'ASCENT', 5, 'Thursday', '0x0305'),
    planetRow(6, 'Saturn', 4, 43, 148, 120, 4, 'MULADHARA', 'PRITHVI', 'DESCENT', 6, 'Saturday', '0x0306'),
    planetRow(7, 'Uranus', 5, 0, 207, 42, 9, 'AJNA', 'AKASHA', 'BEYOND', 7, 'transpersonal', 'MEANING_ID_PREEMPTED'),
    planetRow(8, 'Neptune', 5, 47, 211, 21, 4, 'SAHASRARA', 'APAS', 'BEYOND', 8, 'transpersonal', 'MEANING_ID_PREEMPTED'),
    planetRow(9, 'Pluto', 5, 53, 140, 14, 5, 'MULADHARA', 'PRITHVI', 'BEYOND', 9, 'transpersonal', 'MEANING_ID_PREEMPTED')
]);

export function planetLUT(index: number): M2PlanetLUTRow {
    if (!isPlanetIndex(index)) {
        throw new Error(`M2 planet index out of canonical mod-10 range: ${index}`);
    }
    return M2_PLANET_LUT_ROWS[index];
}

export function allPlanetLUTRows(): readonly M2PlanetLUTRow[] {
    return M2_PLANET_LUT_ROWS;
}

export function isOuterPlanetIndex(index: number): index is 7 | 8 | 9 {
    return index === 7 || index === 8 || index === 9;
}

export function outerPlanetDatasetBadge(index: number): string | null {
    return isOuterPlanetIndex(index) ? OUTER_PLANET_DATASET_BADGE : null;
}

function isPlanetIndex(index: number): index is M2PlanetIndex {
    return Number.isInteger(index) && index >= 0 && index <= 9;
}

function planetRow(
    index: M2PlanetIndex,
    name: string,
    groupType: number,
    prime: number,
    coustoHz: number,
    keplerianVelocity: number,
    digitalRoot: number,
    chakra: string,
    element: string,
    phase: string,
    anandaRow: number,
    day: string,
    meaningId: string
): M2PlanetLUTRow {
    return Object.freeze({
        index,
        name,
        groupType,
        prime,
        coustoHz,
        keplerianVelocity,
        digitalRoot,
        chakra,
        element,
        phase,
        anandaRow,
        day,
        meaningId,
        source: M2_PLANET_LUT_SOURCE
    });
}
