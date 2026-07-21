/**
 * Coordinate: M' M5' (axiom-translation inspector tests — 26.T26.14)
 * Actualises: the render verification — the four-column chain, the verification
 *   badge state, expandable reasoning, and the honest empty state.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PiAxiomTranslationInspector } from './PiAxiomTranslationInspector';
import type { PiAxiomTranslationSession } from './axiomTranslation';

afterEach(cleanup);

const SESSION: PiAxiomTranslationSession = {
    id: 'axiom-1',
    initiatingDispatchNodeId: 'dispatch-7',
    steps: [
        { id: 's-0', fromForm: 'philosophical-english', toForm: 'formal-notation', inputText: 'All beings return to the ground.', outputText: '∀x Being(x)→Returns(x,g)', reasoningTrace: 'quantify the claim', verifiedBy: 'pi' },
        { id: 's-1', fromForm: 'formal-notation', toForm: 'owl', inputText: '∀x Being(x)→Returns(x,g)', outputText: '<owl:Class/>', reasoningTrace: 'owlify', verifiedBy: 'pi' },
        { id: 's-2', fromForm: 'owl', toForm: 'shacl', inputText: '<owl:Class/>', outputText: '<sh:NodeShape/>', reasoningTrace: 'shaclify', verifiedBy: 'pi' }
    ],
    verifiedBy: 'pending'
};

describe('PiAxiomTranslationInspector (26.T26.14)', () => {
    it('renders the four-column English→Formal→OWL→SHACL chain from history', async () => {
        render(<PiAxiomTranslationInspector readHistory={() => Promise.resolve([SESSION])} />);
        await screen.findByTestId('axiom-session');
        for (const form of ['philosophical-english', 'formal-notation', 'owl', 'shacl']) {
            expect(screen.getByTestId(`axiom-form-${form}`)).toBeTruthy();
        }
        expect(screen.getByTestId('axiom-form-philosophical-english').textContent).toContain(
            'All beings return to the ground.'
        );
        expect(screen.getByTestId('axiom-form-shacl').textContent).toContain('<sh:NodeShape/>');
    });

    it('shows the session verification badge state', async () => {
        render(<PiAxiomTranslationInspector readHistory={() => Promise.resolve([SESSION])} />);
        const badge = await screen.findByTestId('axiom-verification-badge');
        expect(badge.getAttribute('data-state')).toBe('pending');
        expect(screen.getByTestId('axiom-session').getAttribute('data-verified-by')).toBe('pending');
    });

    it('expands a step reasoning trace on click', async () => {
        render(<PiAxiomTranslationInspector readHistory={() => Promise.resolve([SESSION])} />);
        await screen.findByTestId('axiom-session');
        expect(screen.queryByTestId('axiom-reasoning-0')).toBeNull();
        fireEvent.click(screen.getByTestId('axiom-step-toggle-0'));
        expect((await screen.findByTestId('axiom-reasoning-0')).textContent).toContain('quantify the claim');
    });

    it('renders an honest empty state when there is no history', async () => {
        render(<PiAxiomTranslationInspector readHistory={() => Promise.resolve([])} />);
        await screen.findByTestId('axiom-empty');
        expect(screen.queryByTestId('axiom-session')).toBeNull();
    });
});
