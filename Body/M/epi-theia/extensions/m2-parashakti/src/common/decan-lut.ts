import { M2_PLANET_LUT_SOURCE, planetLUT } from './planetary-lut';

export type M2DecanFace = 0 | 1;

export interface M2DecanFaceRow {
    readonly address72: number;
    readonly primaryIndex: number;
    readonly coordinate: `#2-3-${number}`;
    readonly elementId: number;
    readonly elementName: string;
    readonly signIndex: number;
    readonly signName: string;
    readonly decanIndexInSign: number;
    readonly decanNumber: 1 | 2 | 3;
    readonly face: M2DecanFace;
    readonly faceName: 'light' | 'shadow';
    readonly rulingPlanet: number;
    readonly rulingPlanetName: string;
    readonly meaningId: string;
    readonly source: typeof M2_DECAN_DESC_SOURCE;
    readonly planetSource: typeof M2_PLANET_LUT_SOURCE;
}

export const M2_DECAN_DESC_SOURCE = 'kernelBridge.m2.decodeAxisAt(address72, "decan-face")' as const;

const DECAN_ELEMENT_GROUPS = Object.freeze([
    Object.freeze({
        elementId: 2,
        elementName: 'AGNI',
        signNames: Object.freeze(['Aries', 'Leo', 'Sagittarius'] as const),
        rulerCycles: Object.freeze([
            Object.freeze([4, 0, 5] as const),
            Object.freeze([0, 5, 4] as const),
            Object.freeze([5, 4, 0] as const)
        ]),
        meaningBase: 0x0200
    }),
    Object.freeze({
        elementId: 4,
        elementName: 'PRITHVI',
        signNames: Object.freeze(['Taurus', 'Virgo', 'Capricorn'] as const),
        rulerCycles: Object.freeze([
            Object.freeze([3, 2, 6] as const),
            Object.freeze([2, 6, 3] as const),
            Object.freeze([6, 3, 2] as const)
        ]),
        meaningBase: 0x0220
    }),
    Object.freeze({
        elementId: 1,
        elementName: 'VAYU',
        signNames: Object.freeze(['Gemini', 'Libra', 'Aquarius'] as const),
        rulerCycles: Object.freeze([
            Object.freeze([2, 3, 6] as const),
            Object.freeze([3, 6, 2] as const),
            Object.freeze([6, 2, 3] as const)
        ]),
        meaningBase: 0x0240
    }),
    Object.freeze({
        elementId: 3,
        elementName: 'APAS',
        signNames: Object.freeze(['Cancer', 'Scorpio', 'Pisces'] as const),
        rulerCycles: Object.freeze([
            Object.freeze([1, 4, 5] as const),
            Object.freeze([4, 5, 1] as const),
            Object.freeze([5, 1, 4] as const)
        ]),
        meaningBase: 0x0260
    })
] as const);

export const M2_DECAN_FACE_ROWS: readonly M2DecanFaceRow[] = Object.freeze(buildDecanRows());

export function decanFaceAt(address72: number): M2DecanFaceRow {
    const normalized = normalizeAddress72(address72);
    return M2_DECAN_FACE_ROWS[normalized];
}

export function allDecanFaces(): readonly M2DecanFaceRow[] {
    return M2_DECAN_FACE_ROWS;
}

export function primaryDecanFaces(): readonly M2DecanFaceRow[] {
    return M2_DECAN_FACE_ROWS.filter(row => row.face === 0);
}

export function shadowDecanFaces(): readonly M2DecanFaceRow[] {
    return M2_DECAN_FACE_ROWS.filter(row => row.face === 1);
}

export function decanPrimaryIndexFromAddress(address72: number): number {
    return Math.floor(normalizeAddress72(address72) / 2);
}

function buildDecanRows(): M2DecanFaceRow[] {
    const rows: M2DecanFaceRow[] = [];
    for (let elementGroupIndex = 0; elementGroupIndex < DECAN_ELEMENT_GROUPS.length; elementGroupIndex += 1) {
        const group = DECAN_ELEMENT_GROUPS[elementGroupIndex];
        for (let signIndex = 0; signIndex < 3; signIndex += 1) {
            for (let decanIndex = 0; decanIndex < 3; decanIndex += 1) {
                for (let face = 0; face < 2; face += 1) {
                    const address72 = elementGroupIndex * 18 + signIndex * 6 + decanIndex * 2 + face;
                    const primaryIndex = elementGroupIndex * 9 + signIndex * 3 + decanIndex;
                    const rulingPlanet = group.rulerCycles[signIndex][decanIndex];
                    rows.push(
                        Object.freeze({
                            address72,
                            primaryIndex,
                            coordinate: `#2-3-${primaryIndex}`,
                            elementId: group.elementId,
                            elementName: group.elementName,
                            signIndex,
                            signName: group.signNames[signIndex],
                            decanIndexInSign: decanIndex,
                            decanNumber: (decanIndex + 1) as 1 | 2 | 3,
                            face: face as M2DecanFace,
                            faceName: face === 0 ? 'light' : 'shadow',
                            rulingPlanet,
                            rulingPlanetName: planetLUT(rulingPlanet).name,
                            meaningId: toMeaningId(group.meaningBase + signIndex * 6 + decanIndex * 2 + face),
                            source: M2_DECAN_DESC_SOURCE,
                            planetSource: M2_PLANET_LUT_SOURCE
                        })
                    );
                }
            }
        }
    }
    return rows;
}

function normalizeAddress72(value: number): number {
    const rounded = Math.trunc(value);
    return ((rounded % 72) + 72) % 72;
}

function toMeaningId(value: number): string {
    return `0x${value.toString(16).toUpperCase().padStart(4, '0')}`;
}
