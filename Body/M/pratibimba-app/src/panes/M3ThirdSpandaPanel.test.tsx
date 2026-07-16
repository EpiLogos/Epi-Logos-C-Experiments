import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { M3ThirdSpandaPanel } from './M3ThirdSpandaPanel';
import {
    QCD_OCTET_SINGLET_FORM,
    THIRD_SPANDA_FORMS
} from '../engine/compositionMatheme';

afterEach(cleanup);

describe('M3ThirdSpandaPanel', () => {
    it('renders every canonical form (five + QCD) and each evaluates to 137', () => {
        render(<M3ThirdSpandaPanel />);
        const allForms = [...THIRD_SPANDA_FORMS, QCD_OCTET_SINGLET_FORM];
        expect(allForms).toHaveLength(6);
        for (const form of allForms) {
            const el = screen.getByTestId(`m3-spanda-form-${form.id}`);
            expect(el.textContent).toContain(form.symbol);
            expect(el.textContent).toContain('= 137');
            expect(form.evaluate()).toBe(137);
        }
    });

    it('renders the 137 = 64 + 72 + 1 spine with the M1-5 parent (never M0-Anuttara)', () => {
        render(<M3ThirdSpandaPanel />);
        const spine = screen.getByTestId('m3-spanda-spine').textContent ?? '';
        expect(spine).toContain('137');
        expect(spine).toContain('M₃(64)');
        expect(spine).toContain('M₂(72)');
        expect(spine).toContain('M1-5');
        expect(spine).not.toContain('M0-Anuttara');
    });

    it('renders the execution-order trace 136 → 127=M₇ → 128 → 137', () => {
        render(<M3ThirdSpandaPanel />);
        const trace = screen.getByTestId('m3-spanda-execution-trace').textContent ?? '';
        expect(trace).toContain('136');
        expect(trace).toContain('127 = M₇');
        expect(trace).toContain('128 = 2⁷');
        expect(trace).toContain('137');
    });

    it('renders the translation rule with its QCD analogue', () => {
        render(<M3ThirdSpandaPanel />);
        const t = screen.getByTestId('m3-spanda-translation').textContent ?? '';
        expect(t).toContain('9₍M2₎ = 8₍M3₎ + 1₍M1₎');
        expect(t).toContain('3 ⊗ 3̄ = 8 ⊕ 1');
    });

    it('honours the measurement-face caveat and never claims a QL-derived alpha', () => {
        render(<M3ThirdSpandaPanel />);
        const face = screen.getByTestId('m3-spanda-measurement-face').textContent ?? '';
        expect(face).toContain('integer skeleton');
        expect(face).toContain('measurement-face');
        expect(face).toContain('source-warrant');
        // Forbidden register — the panel must not claim computation.
        const whole = document.body.textContent ?? '';
        expect(whole).not.toContain('QL derives alpha');
        expect(whole).not.toContain('electroweak mixing computed');
    });

    it('renders the recognition-context warrant as honest-pending', () => {
        render(<M3ThirdSpandaPanel />);
        expect(screen.getByTestId('m3-spanda-recognition-warrant').textContent).toContain(
            'pending-recognition-context-warrant'
        );
    });
});
