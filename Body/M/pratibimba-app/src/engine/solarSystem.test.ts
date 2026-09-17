import { describe, expect, it } from 'vitest';
import { PLANET_ORDER } from './cosmicMath';
import {
    decanLabel,
    dominantQuaternionElement,
    elementCssColour,
    ELEMENT_NAMES,
    nextPlanetSelection,
    PLANET_GLYPHS,
    planetLabelText,
    planetSelectionAddress,
    planetTooltip,
    quintessenceChipText,
    quintessenceTooltip,
    resonanceMeaning,
    ZODIAC_GLYPHS,
    ZODIAC_NAMES
} from './solarSystem';

describe('solar-system presentation law (E5)', () => {
    it('glyph tables are positional over the kernel canon: 10 planets (Mercury=2, Venus=3), 12 signs', () => {
        expect(PLANET_GLYPHS).toHaveLength(PLANET_ORDER.length);
        expect(PLANET_ORDER[2]).toBe('Mercury');
        expect(PLANET_GLYPHS[2]).toBe('☿');
        expect(PLANET_ORDER[3]).toBe('Venus');
        expect(PLANET_GLYPHS[3]).toBe('♀');
        expect(ZODIAC_GLYPHS).toHaveLength(12);
        expect(ZODIAC_NAMES).toHaveLength(12);
        expect(ELEMENT_NAMES).toHaveLength(5);
    });

    it('reads decan36 as sign + face: 0 = Aries I, 11 = Cancer III, 35 = Pisces III', () => {
        expect(decanLabel(0)).toBe('Aries I');
        expect(decanLabel(11)).toBe('Cancer III');
        expect(decanLabel(35)).toBe('Pisces III');
    });

    it('labels a body with glyph, canonical name, and the live FRACTIONAL degree', () => {
        expect(planetLabelText(3, 210.437)).toBe('♀ Venus · 210.4°');
        expect(planetLabelText(0, 100.59298706054688)).toBe('☉ Sun · 100.6°');
    });

    it('surfaces the §5.2 resonance MEANING, not just a pulse', () => {
        // Venus home at Aries III (decan 2, Chaldean ruler Venus=3) — the
        // E1-pinned resonance law; fixtures stay kernel-lawful
        const venus = { planetId: 3, degree: 25.2, decan36: 2, decanRuler: 3, isResonance: true };
        const meaning = resonanceMeaning(venus);
        expect(meaning).toContain('Venus');
        expect(meaning).toContain('Aries III');
        expect(meaning).toContain('Chaldean ruler');
        const tooltip = planetTooltip(venus);
        expect(tooltip).toContain('25.200°');
        expect(tooltip).toContain(meaning);
    });

    it('carries the retrograde badge and kernel element identity into the tooltip', () => {
        // decan 30 = Aquarius I, Chaldean ruler Venus=3 (f_routing law)
        const saturn = {
            planetId: 6,
            degree: 300.1,
            decan36: 30,
            decanRuler: 3,
            retrograde: true,
            elementId: 4,
            keplerianVel: 120,
            isResonance: false
        };
        const tooltip = planetTooltip(saturn);
        expect(tooltip).toContain('retrograde ℞');
        expect(tooltip).toContain('Prithvi');
        expect(tooltip).toContain('Aquarius I'); // decan 30 = 300° = Aquarius first face
    });

    it('element css colour mirrors the scene table; unknown ids fall to dim ink', () => {
        expect(elementCssColour(0)).toBe('#8f6fd8');
        expect(elementCssColour(4)).toBe('#9b7a4b');
        expect(elementCssColour(undefined)).toBe('#9a8fb8');
    });

    it('selection publishes a self-describing provisional address (canon address is an Architect OPEN)', () => {
        expect(planetSelectionAddress(3)).toBe('planet:Venus');
        expect(planetSelectionAddress(99)).toBe('planet:99');
    });

    it('renders the quintessence ground reading: address, weight, enrichment arc, resonance honesty', () => {
        const identity = {
            natalDegree: 217,
            quintessenceWeight: 0.62,
            layerCount: 5,
            partial: false,
            hashPreview: '9f3a1c2b',
            quintessenceQuaternion: [0.61, 0.45, 0.42, 0.5] // w=Earth dominant
        };
        expect(quintessenceChipText(identity)).toBe('⊛ 9f3a1c2b · natal 217°');
        const full = quintessenceTooltip({ identity, qCosmic: [1, 0, 0, 0], resonance: 0.713 });
        expect(full).toContain('natal ground 217°');
        expect(full).toContain('quintessence 0.62 · 5/5 layers');
        expect(full).not.toContain('enriching');
        expect(full).toContain('ground element Earth');
        expect(full).toContain('resonance 0.713 (kernel scalar)');

        const partial = quintessenceTooltip({
            identity: {
                ...identity,
                layerCount: 3,
                partial: true,
                quintessenceQuaternion: [0.2, 0.9, 0.3, 0.2] // x=Fire dominant
            },
            qCosmic: null,
            resonance: null
        });
        expect(partial).toContain('3/5 layers — enriching');
        expect(partial).toContain('ground element Fire');
        expect(partial).toContain('resonance pending'); // never computed locally
        expect(dominantQuaternionElement([0.1, 0.2, 0.8, 0.3])).toBe('Water');
    });

    it('selection toggles: re-clicking the selected body deselects, clicking another switches', () => {
        const venus = { planetId: 3, degree: 25.2 };
        const mars = { planetId: 4, degree: 100.0 };
        expect(nextPlanetSelection(null, venus)).toBe(venus);
        expect(nextPlanetSelection(venus, venus)).toBeNull();
        expect(nextPlanetSelection(venus, mars)).toBe(mars);
    });
});
