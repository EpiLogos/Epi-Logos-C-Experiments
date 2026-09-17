/**
 * Coordinate: M' S5' (CU-ledger pane tests — Tranche 40.T40.5)
 * Actualises: fixture CU rows render with status/category chips; the status
 *   filter narrows; row inspect shows provenance, derivation, and target
 *   landing site; live mode renders the honest pending-wire banner while the
 *   `s5'.canon_update.*` family is unimplemented on the ws seam.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useProvenanceStore } from '../state/stores';
import { CanonUpdateLedgerPane } from './CanonUpdateLedgerPane';
import { normalizeCanonUpdateRow, normalizeCanonUpdateRows, type CanonUpdateRow } from './canonUpdateLedger';

const FIXTURE_ROWS: readonly CanonUpdateRow[] = [
    {
        id: 'CU-ENTITY-7',
        category: 'entity',
        status: 'validated',
        claim: 'Warm Vama Shakti promotion row with daemon provenance',
        targetLandingHint: 'Idea/Bimba/World/Types/…',
        landedMarker: null,
        refusalReason: null,
        surfacedAtMs: 1000,
        updatedAtMs: 2000
    },
    {
        id: 'CU-VOCAB-2',
        category: 'vocab',
        status: 'landed',
        claim: 'Vama Shakti canonical name',
        targetLandingHint: 'Idea/Bimba/Seeds/M/M4-prime/…',
        landedMarker: 'cu-vocab-2-landed',
        refusalReason: null,
        surfacedAtMs: 500,
        updatedAtMs: 3000
    },
    {
        id: 'CU-REL-9',
        category: 'rel',
        status: 'refused',
        claim: 'A relation that contradicted DR-IG-1',
        targetLandingHint: null,
        landedMarker: null,
        refusalReason: 'contradicts relation-family law',
        surfacedAtMs: 800,
        updatedAtMs: 900
    }
];

describe('CanonUpdateLedgerPane', () => {
    const invoke = vi.fn();

    beforeEach(() => {
        invoke.mockReset();
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
    });

    it('renders fixture CU rows with status and category', () => {
        render(<CanonUpdateLedgerPane fixture={FIXTURE_ROWS} />);
        const rows = screen.getAllByTestId('canon-ledger-row');
        expect(rows).toHaveLength(3);
        expect(rows[0].getAttribute('data-status')).toBe('validated');
        expect(rows[1].getAttribute('data-category')).toBe('vocab');
    });

    it('status filter narrows to the selected lifecycle state', () => {
        render(<CanonUpdateLedgerPane fixture={FIXTURE_ROWS} />);
        fireEvent.change(screen.getByTestId('canon-ledger-status-filter'), { target: { value: 'refused' } });
        const rows = screen.getAllByTestId('canon-ledger-row');
        expect(rows).toHaveLength(1);
        expect(rows[0].getAttribute('data-row-id')).toBe('CU-REL-9');
    });

    it('row inspect shows derivation, target landing site, and provenance', () => {
        render(<CanonUpdateLedgerPane fixture={FIXTURE_ROWS} />);
        fireEvent.click(screen.getAllByTestId('canon-ledger-row')[1]);
        const inspect = screen.getByTestId('canon-ledger-inspect');
        expect(inspect.getAttribute('data-row-id')).toBe('CU-VOCAB-2');
        expect(screen.getByTestId('canon-ledger-inspect-derivation').textContent).toContain('vocab');
        expect(screen.getByTestId('canon-ledger-inspect-landing').textContent).toContain('Seeds/M');
        expect(screen.getByTestId('canon-ledger-inspect-provenance').textContent).toContain('cu-vocab-2-landed');
    });

    it('renders the honest pending-wire banner on live mode while the family is unimplemented', async () => {
        invoke.mockRejectedValue(new Error('gateway error: unimplemented'));
        render(<CanonUpdateLedgerPane />);
        expect(await screen.findByTestId('canon-ledger-pending-wire')).toBeTruthy();
    });
});

describe('canonUpdateLedger normalizers', () => {
    it('normalizes the camelCase contract row and snake fallback', () => {
        const camel = normalizeCanonUpdateRow({
            id: 'CU-FORM-1',
            category: 'form',
            status: 'designed',
            claim: 'a claim',
            targetLandingHint: 'World/X.md',
            landedMarker: null,
            refusalReason: null,
            surfacedAtMs: 10,
            updatedAtMs: 20
        });
        expect(camel.category).toBe('form');
        expect(camel.status).toBe('designed');

        const snake = normalizeCanonUpdateRow({
            id: 'CU-X',
            category: 'xref',
            status: 'superseded',
            claim: 'c',
            target_landing_hint: 'Seeds/Y.md',
            surfaced_at_ms: 1,
            updated_at_ms: 2
        });
        expect(snake.targetLandingHint).toBe('Seeds/Y.md');
        expect(normalizeCanonUpdateRows({ rows: [{ id: 'a' }, { id: 'b' }] })).toHaveLength(2);
    });
});
