/**
 * Coordinate: M' M5' (axiom-translation parser tests — 26.T26.14)
 * Actualises: the fail-closed contract for s5'.epii.axiom_translation_history —
 *   canonical forms only, a contiguous English→Formal→OWL→SHACL chain, and a
 *   pi/human/pending session verification.
 */

import { describe, expect, it } from 'vitest';
import { parseAxiomTranslationHistory } from './axiomTranslation';

const CHAIN = [
    { id: 's-0', fromForm: 'philosophical-english', toForm: 'formal-notation', inputText: 'All beings return to the ground.', outputText: '∀x Being(x) → Returns(x, ground)', reasoningTrace: 'quantify', verifiedBy: 'pi' },
    { id: 's-1', fromForm: 'formal-notation', toForm: 'owl', inputText: '∀x Being(x) → Returns(x, ground)', outputText: '<owl:Class .../>', reasoningTrace: 'owlify', verifiedBy: 'pi' },
    { id: 's-2', fromForm: 'owl', toForm: 'shacl', inputText: '<owl:Class .../>', outputText: '<sh:NodeShape .../>', reasoningTrace: 'shaclify', verifiedBy: 'pi' }
];

const SESSION = { id: 'axiom-1', initiatingDispatchNodeId: 'dispatch-7', steps: CHAIN, verifiedBy: 'pending' };

describe('parseAxiomTranslationHistory (26.T26.14)', () => {
    it('parses a full English→Formal→OWL→SHACL session', () => {
        const sessions = parseAxiomTranslationHistory({ sessions: [SESSION] });
        expect(sessions).toHaveLength(1);
        expect(sessions[0].id).toBe('axiom-1');
        expect(sessions[0].verifiedBy).toBe('pending');
        expect(sessions[0].steps.map(s => s.toForm)).toEqual(['formal-notation', 'owl', 'shacl']);
    });

    it('accepts an empty history', () => {
        expect(parseAxiomTranslationHistory({ sessions: [] })).toHaveLength(0);
    });

    it('rejects a missing sessions array', () => {
        expect(() => parseAxiomTranslationHistory({})).toThrow(/sessions array/);
    });

    it('rejects a non-canonical axiom form', () => {
        const bad = { ...SESSION, steps: [{ ...CHAIN[0], toForm: 'json-ld' }] };
        expect(() => parseAxiomTranslationHistory({ sessions: [bad] })).toThrow(/canonical axiom form/);
    });

    it('rejects a broken chain (step input form does not follow the prior output)', () => {
        const broken = { ...SESSION, steps: [CHAIN[0], { ...CHAIN[2] }] }; // formal→... then owl→shacl
        expect(() => parseAxiomTranslationHistory({ sessions: [broken] })).toThrow(/chain breaks/);
    });

    it('rejects an invalid session verification', () => {
        const bad = { ...SESSION, verifiedBy: 'maybe' };
        expect(() => parseAxiomTranslationHistory({ sessions: [bad] })).toThrow(/pi, human, or pending/);
    });

    it('rejects a session with no steps', () => {
        const bad = { ...SESSION, steps: [] };
        expect(() => parseAxiomTranslationHistory({ sessions: [bad] })).toThrow(/at least one/);
    });
});
