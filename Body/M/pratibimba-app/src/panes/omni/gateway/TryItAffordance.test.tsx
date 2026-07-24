/**
 * Coordinate: M' `/` membrane (Gateway try-it tests — Track 27.T27.7)
 * Actualises: the inline try-it opens in place (not a modal), dispatches the
 *   capability through `gateway().invoke(name, params)`, and renders the real
 *   `receipt.artifact` verbatim — or the honest error on bad JSON / a rejected
 *   invoke. It never fabricates a response.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../../../bridge/gatewayHolder';
import { TryItAffordance } from './TryItAffordance';

afterEach(() => {
    cleanup();
    setGateway(null);
});

describe('TryItAffordance — inline capability dispatch', () => {
    it('is closed until opened, then reveals the params field and run control', () => {
        render(<TryItAffordance capabilityName="dispatch_agent" />);
        expect(screen.queryByTestId('try-it-params')).toBeNull();
        fireEvent.click(screen.getByTestId('try-it-toggle'));
        expect(screen.getByTestId('try-it-params')).toBeTruthy();
        expect(screen.getByTestId('try-it-run')).toBeTruthy();
    });

    it('dispatches through the gateway and renders the receipt artifact inline', async () => {
        const invoke = vi.fn().mockResolvedValue({ artifact: { ok: true, echoed: 'ping' } });
        setGateway({ invoke } as never);
        render(<TryItAffordance capabilityName="dispatch_agent" />);

        fireEvent.click(screen.getByTestId('try-it-toggle'));
        fireEvent.change(screen.getByTestId('try-it-params'), { target: { value: '{"message":"ping"}' } });
        fireEvent.click(screen.getByTestId('try-it-run'));

        const result = await screen.findByTestId('try-it-result');
        expect(result.textContent).toContain('echoed');
        expect(result.textContent).toContain('ping');
        expect(invoke).toHaveBeenCalledWith('dispatch_agent', { message: 'ping' });
    });

    it('shows an honest error on invalid JSON and never dispatches', () => {
        const invoke = vi.fn();
        setGateway({ invoke } as never);
        render(<TryItAffordance capabilityName="dispatch_agent" />);

        fireEvent.click(screen.getByTestId('try-it-toggle'));
        fireEvent.change(screen.getByTestId('try-it-params'), { target: { value: '{ not json' } });
        fireEvent.click(screen.getByTestId('try-it-run'));

        expect(screen.getByTestId('try-it-error').textContent).toContain('invalid JSON');
        expect(invoke).not.toHaveBeenCalled();
        expect(screen.queryByTestId('try-it-result')).toBeNull();
    });

    it('surfaces a rejected invoke as an inline error, not a fabricated result', async () => {
        const invoke = vi.fn().mockRejectedValue(new Error('gateway refused: not entitled'));
        setGateway({ invoke } as never);
        render(<TryItAffordance capabilityName="dispatch_agent" />);

        fireEvent.click(screen.getByTestId('try-it-toggle'));
        fireEvent.click(screen.getByTestId('try-it-run'));

        const error = await screen.findByTestId('try-it-error');
        expect(error.textContent).toContain('gateway refused');
        expect(screen.queryByTestId('try-it-result')).toBeNull();
    });
});
