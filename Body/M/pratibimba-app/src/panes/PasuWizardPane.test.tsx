/**
 * Coordinate: M4' personal identity acceptance (25.T25.4 — PASU wizard)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: proves the six-step wizard seeds from nara.pasu.show, writes each
 *   scalar via nara.pasu.set (round-trip), preserves draft across back/next,
 *   supports skip-step and skip-wizard, and finishes via onComplete.
 * Contract: rerun tranche [[25.T25.4]] (DR-WC-M4-3)
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    PasuWizardPane,
    PASU_SET_RPC,
    PASU_SHOW_RPC,
    PASU_WIZARD_STEPS,
    type PasuWizardGateway
} from './PasuWizardPane';

function gatewayWithRecord(record: Record<string, unknown> = {}): {
    gateway: PasuWizardGateway;
    sets: Array<{ key: string; value: string }>;
} {
    const sets: Array<{ key: string; value: string }> = [];
    const gateway: PasuWizardGateway = {
        invoke: vi.fn(async (method: string, params: Record<string, unknown>) => {
            if (method === PASU_SHOW_RPC) {
                return record;
            }
            if (method === PASU_SET_RPC) {
                sets.push({ key: String(params.key), value: String(params.value) });
                return { key: params.key, receipt: `set ${String(params.key)}` };
            }
            throw new Error(`unexpected method ${method}`);
        })
    };
    return { gateway, sets };
}

afterEach(cleanup);

describe('25.T25.4 PasuWizardPane', () => {
    it('writes a typed value via nara.pasu.set and advances to the next step', async () => {
        const { gateway, sets } = gatewayWithRecord();
        render(<PasuWizardPane gateway={gateway} />);
        await waitFor(() => expect(screen.getByTestId('pasu-wizard-input')).toBeTruthy());

        fireEvent.change(screen.getByTestId('pasu-wizard-input'), { target: { value: '1990-03-14' } });
        fireEvent.click(screen.getByTestId('pasu-wizard-next'));

        await waitFor(() => expect(sets).toContainEqual({ key: 'c_0_birth_date', value: '1990-03-14' }));
        await waitFor(() =>
            expect(screen.getByTestId('pasu-wizard').getAttribute('data-step-key')).toBe('c_0_birth_location')
        );
    });

    it('round-trips all six identity scalars through nara.pasu.set then finishes', async () => {
        const { gateway, sets } = gatewayWithRecord();
        const onComplete = vi.fn();
        render(<PasuWizardPane gateway={gateway} onComplete={onComplete} />);
        await waitFor(() => expect(screen.getByTestId('pasu-wizard-input')).toBeTruthy());

        for (const step of PASU_WIZARD_STEPS) {
            fireEvent.change(screen.getByTestId('pasu-wizard-input'), { target: { value: `v-${step.key}` } });
            fireEvent.click(screen.getByTestId('pasu-wizard-next'));
            await waitFor(() => expect(sets.some(s => s.key === step.key)).toBe(true));
        }
        expect(sets.map(s => s.key)).toEqual(PASU_WIZARD_STEPS.map(s => s.key));
        await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
    });

    it('seeds the draft from the existing handle-only record', async () => {
        const { gateway } = gatewayWithRecord({ c_0_birth_date: '1985-07-07' });
        render(<PasuWizardPane gateway={gateway} />);
        await waitFor(() =>
            expect((screen.getByTestId('pasu-wizard-input') as HTMLInputElement).value).toBe('1985-07-07')
        );
    });

    it('preserves draft across back/next (session-scope stepper)', async () => {
        const { gateway } = gatewayWithRecord();
        render(<PasuWizardPane gateway={gateway} />);
        await waitFor(() => expect(screen.getByTestId('pasu-wizard-input')).toBeTruthy());

        fireEvent.change(screen.getByTestId('pasu-wizard-input'), { target: { value: 'first-value' } });
        fireEvent.click(screen.getByTestId('pasu-wizard-skip-step')); // advance without saving
        await waitFor(() =>
            expect(screen.getByTestId('pasu-wizard').getAttribute('data-step-index')).toBe('1')
        );
        fireEvent.click(screen.getByTestId('pasu-wizard-back'));
        await waitFor(() =>
            expect((screen.getByTestId('pasu-wizard-input') as HTMLInputElement).value).toBe('first-value')
        );
    });

    it('skip-step advances without writing; skip-wizard fires onSkipWizard', async () => {
        const { gateway, sets } = gatewayWithRecord();
        const onSkipWizard = vi.fn();
        render(<PasuWizardPane gateway={gateway} onSkipWizard={onSkipWizard} />);
        await waitFor(() => expect(screen.getByTestId('pasu-wizard-input')).toBeTruthy());

        fireEvent.click(screen.getByTestId('pasu-wizard-skip-step'));
        await waitFor(() =>
            expect(screen.getByTestId('pasu-wizard').getAttribute('data-step-index')).toBe('1')
        );
        expect(sets).toHaveLength(0);

        fireEvent.click(screen.getByTestId('pasu-wizard-skip-all'));
        expect(onSkipWizard).toHaveBeenCalledOnce();
    });

    // 25.T25.18 correction: this asserted `…-handle-only`, which contradicted
    // the class the brief ASSIGNS this widget — 25-m4-nara-frontend-deep.md:91,
    // "View id: `m4.nara.pasuWizard` (new). Privacy chrome:
    // `mext-privacy-protected-local`". The pane had hand-written the wrong
    // class and the test encoded it. Both now read the spec.
    it('carries the protected-local privacy chrome the brief assigns it (25.4)', async () => {
        const { gateway } = gatewayWithRecord();
        render(<PasuWizardPane gateway={gateway} />);
        await waitFor(() =>
            expect(screen.getByTestId('pasu-wizard').className).toContain('mext-privacy-protected-local')
        );
        expect(screen.getByTestId('pasu-wizard').className).not.toContain(
            'mext-privacy-protected-local-handle-only'
        );
        expect(screen.getByTestId('pasu-wizard').title).toMatch(/^protected_local — /);
    });
});
