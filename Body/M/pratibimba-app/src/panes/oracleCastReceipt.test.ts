import { describe, expect, it } from 'vitest';
import { parseOracleCastReceipt } from './oracleCastReceipt';

const lineValues = [6, 7, 8, 9, 7, 8] as const;

function fixture() {
    return {
        castId: 7,
        spreadId: 'oracle-spread-7',
        system: 'iching',
        castAt: 1_700_000_000,
        hygiene: 'clear',
        output: 'I-Ching Cast #7',
        draw: {
            lines: lineValues.map((value, index) => ({
                lineIndex: index + 1,
                value,
                lineType: ['old-yin', 'young-yang', 'young-yin', 'old-yang', 'young-yang', 'young-yin'][index],
                moving: value === 6 || value === 9,
                nucleotide: ['A', 'C', 'G', 'T', 'C', 'G'][index],
                codonRef: `m3-codon://ACG#line-${index + 1}`
            })),
            primaryHexagramId: 12,
            relatingHexagramId: 18,
            nuclearHexagramId: 4,
            torusPosition: 2,
            body: { dynamics: 'Head/Lungs', bodyZones: ['head'] }
        },
        positions: lineValues.map((_, index) => ({
            positionIndex: index,
            cardId: 11,
            cardKind: 'hexagram',
            liveState: index === 0 ? 'muting' : 'generating',
            targetAspect: null
        })),
        envelope: { cp_position_refs: ['CP4.3.1'] },
        spacetimePublished: false
    };
}

describe('parseOracleCastReceipt', () => {
    it('strict-reads the six line/nucleotide/codon receipt', () => {
        const receipt = parseOracleCastReceipt(fixture());
        expect(receipt.draw.kind).toBe('iching');
        if (receipt.draw.kind !== 'iching') throw new Error('fixture is I-Ching');
        expect(receipt.draw.lines.map(line => line.value)).toEqual(lineValues);
        expect(receipt.draw.lines.filter(line => line.moving).map(line => line.lineIndex)).toEqual([1, 4]);
        expect(receipt.positions[0].liveState).toBe('muting');
    });

    it('refuses draw/position cardinality drift', () => {
        const value = fixture();
        value.positions.pop();
        expect(() => parseOracleCastReceipt(value)).toThrow('positions cardinality');
    });

    it('refuses a locally invented correspondence source', () => {
        const value = fixture() as Record<string, unknown>;
        value.system = 'thoth';
        value.draw = {
            spreadSize: 3,
            cards: [0, 1, 2].map(positionIndex => ({
                positionIndex,
                cardId: positionIndex,
                reversed: false,
                cardKind: 'tarot-major',
                label: 'The Fool',
                codonRef: 'm3-codon://ATG',
                codonBinding: 'primary',
                suit: null,
                rank: null,
                decan: null,
                planet: null,
                element: null,
                chakra: null,
                bodyZones: [],
                chainSource: 'browser-lut'
            }))
        };
        value.positions = (value.positions as unknown[]).slice(0, 3).map((position, index) => ({
            ...(position as object),
            positionIndex: index,
            cardId: index,
            cardKind: 'tarot-major'
        }));
        expect(() => parseOracleCastReceipt(value)).toThrow('chainSource');
    });

    it('accepts a Major Arcana card whose kernel codon set is empty', () => {
        const value = fixture() as Record<string, unknown>;
        value.system = 'thoth';
        value.draw = {
            spreadSize: 3,
            cards: [0, 1, 2].map(positionIndex => ({
                positionIndex,
                cardId: positionIndex,
                reversed: false,
                cardKind: 'tarot-major',
                label: ['The Fool', 'The Magician', 'The High Priestess'][positionIndex],
                codonRef: positionIndex === 2 ? null : `m3-codon://AT${positionIndex}`,
                codonBinding: positionIndex === 2 ? 'unbound' : 'primary',
                suit: null,
                rank: null,
                decan: null,
                planet: null,
                element: null,
                chakra: null,
                bodyZones: [],
                chainSource: 'kernel-oracle-luts'
            }))
        };
        value.positions = (value.positions as unknown[]).slice(0, 3).map((position, index) => ({
            ...(position as object),
            positionIndex: index,
            cardId: index,
            cardKind: 'tarot-major'
        }));

        const receipt = parseOracleCastReceipt(value);
        if (receipt.draw.kind !== 'tarot') throw new Error('fixture is Tarot');
        expect(receipt.draw.cards[2].codonRef).toBeNull();
        expect(receipt.draw.cards[2].codonBinding).toBe('unbound');
    });
});
