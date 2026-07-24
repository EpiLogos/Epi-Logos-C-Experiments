/**
 * Coordinate: M' `/` membrane (Gateway capability list tests — Track 27.T27.7)
 * Actualises: the capability list renders one row per snapshot capability with
 *   a parity readout, privacy-gates try-it to `standard` capabilities, and
 *   raises selection. The parity cell renders ✓ for a declared capability and
 *   ✗ for one absent from the snapshot — the gateway snapshot is the sole
 *   authority; nothing is invented.
 */

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CapabilityListView } from './CapabilityListView';
import { CapabilityCheckCell } from './CapabilityCheckCell';
import {
    parseMediationCapabilitySnapshot,
    S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    S4_MEDIATION_ROUTE_METHOD
} from '../omnipanelCapabilities';

const SNAPSHOT = parseMediationCapabilitySnapshot({
    owner: "S4'",
    method: S4_MEDIATION_CAPABILITIES_LIST_METHOD,
    routesThrough: S4_MEDIATION_ROUTE_METHOD,
    dispatchTools: ['dispatch_agent', 'dispatch_moirai_night_pass'],
    aletheiaModeInternalTools: ['dispatch_moirai_night_pass', 'aletheia_crystallise'],
    capabilities: [
        { name: 'dispatch_agent', entitlementClass: 'standard' },
        { name: 'dispatch_moirai_night_pass', entitlementClass: 'aletheia-mode-internal' },
        { name: 'aletheia_crystallise', entitlementClass: 'aletheia-mode-internal' }
    ]
});

afterEach(cleanup);

describe('CapabilityListView — parity + privacy-gated try-it', () => {
    it('renders one row per declared capability with its entitlement badge', () => {
        render(<CapabilityListView snapshot={SNAPSHOT} selectedCapabilityName={null} onSelect={() => {}} />);
        const rows = screen.getAllByTestId('capability-row');
        expect(rows).toHaveLength(3);
        const standardRow = screen.getByText('dispatch_agent').closest('[data-testid="capability-row"]') as HTMLElement;
        expect(within(standardRow).getByTestId('capability-entitlement').textContent).toBe('standard');
    });

    it('shows the parity ✓ for every declared capability (gateway-allowed)', () => {
        render(<CapabilityListView snapshot={SNAPSHOT} selectedCapabilityName={null} onSelect={() => {}} />);
        const cells = screen.getAllByTestId('capability-check-cell');
        expect(cells).toHaveLength(3);
        expect(cells.every(cell => cell.getAttribute('data-allowed') === 'true')).toBe(true);
        expect(cells.every(cell => cell.textContent === '✓')).toBe(true);
    });

    it('privacy-gates try-it to standard capabilities only', () => {
        render(<CapabilityListView snapshot={SNAPSHOT} selectedCapabilityName={null} onSelect={() => {}} />);
        const standardRow = screen.getByText('dispatch_agent').closest('[data-testid="capability-row"]') as HTMLElement;
        const internalRow = screen.getByText('dispatch_moirai_night_pass').closest('[data-testid="capability-row"]') as HTMLElement;
        expect(within(standardRow).queryByTestId('try-it-affordance')).toBeTruthy();
        expect(within(internalRow).queryByTestId('try-it-affordance')).toBeNull();
    });

    it('raises selection with the chosen capability name and marks it selected', () => {
        const onSelect = vi.fn();
        const { rerender } = render(
            <CapabilityListView snapshot={SNAPSHOT} selectedCapabilityName={null} onSelect={onSelect} />
        );
        fireEvent.click(screen.getByText('aletheia_crystallise'));
        expect(onSelect).toHaveBeenCalledWith('aletheia_crystallise');

        rerender(
            <CapabilityListView snapshot={SNAPSHOT} selectedCapabilityName="aletheia_crystallise" onSelect={onSelect} />
        );
        const selectedRow = screen.getByText('aletheia_crystallise').closest('[data-testid="capability-row"]') as HTMLElement;
        expect(selectedRow.getAttribute('aria-selected')).toBe('true');
    });

    it('CapabilityCheckCell renders ✗ for a capability absent from the snapshot', () => {
        render(<CapabilityCheckCell capabilityName="not_a_declared_capability" snapshot={SNAPSHOT} />);
        const cell = screen.getByTestId('capability-check-cell');
        expect(cell.getAttribute('data-allowed')).toBe('false');
        expect(cell.textContent).toBe('✗');
    });
});
