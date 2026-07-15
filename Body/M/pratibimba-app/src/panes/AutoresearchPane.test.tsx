/** Behavioral proof for the M5' Autoresearch pane - 28.T28.10. */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AutoresearchPane } from './AutoresearchPane';
import { parseImproveHistory, parseImproveStatus, type AutoresearchSnapshot } from './autoresearchModel';

const STATUS_WIRE = {
    loop_state: 'evaluating',
    active_vectors: [{ run_id: 'run-1' }],
    last_run: 700,
    total_runs: 2,
    keep_count: 1,
    discard_count: 0,
    kernel_evidence_count: 3
};

const HISTORY_WIRE = {
    runs: [
        {
            run_id: 'run-1',
            target_family: 'M5',
            target_coordinate: "M5-4'",
            direction: 'Refine recursive review routing',
            typed_candidate: { target_subsystem: 'epii', requires_human: true },
            source_review_item_id: 'review-17',
            loop_state: 'evaluating',
            decision: null,
            updated_at: 700
        },
        {
            run_id: 'run-2',
            target_family: 'M2',
            target_coordinate: "M2-2'",
            direction: 'Re-index relational evidence',
            typed_candidate: { target_subsystem: 'parashakti' },
            source_review_item_id: null,
            loop_state: 'hypothesis',
            decision: 'keep',
            updated_at: 600
        }
    ]
};

const SNAPSHOT: AutoresearchSnapshot = {
    status: parseImproveStatus(STATUS_WIRE),
    candidates: parseImproveHistory(HISTORY_WIRE)
};

afterEach(cleanup);

describe('AutoresearchPane', () => {
    it('strictly consumes the real S5 status/history shape without inventing pass state', () => {
        expect(SNAPSHOT.status.activeStage).toBe('Orchestrate');
        expect(SNAPSHOT.status.recomposePass).toBeNull();
        expect(SNAPSHOT.status.dryRunEnforced).toBe(true);
        expect(SNAPSHOT.candidates[0].capacity).toBe('epii-self-referential');
        expect(() => parseImproveStatus({ ...STATUS_WIRE, loop_state: 'mocked' })).toThrow('loop state');
        expect(() => parseImproveHistory({ runs: [{ run_id: 'broken' }] })).toThrow('direction');
    });

    it('renders concept law, active Mobius stage, dry-run law, and the honest missing pass ordinal', () => {
        render(<AutoresearchPane fixture={SNAPSHOT} />);
        expect(screen.getByTestId('autoresearch-as-concept').textContent).toContain('forbidden_authority');
        expect(screen.getByText('Orchestrate').getAttribute('aria-current')).toBe('step');
        expect(screen.getByTestId('autoresearch-dry-run').textContent).toContain('enforced');
        expect(screen.getByTestId('autoresearch-recompose-pass').textContent).toContain('not projected');
    });

    it('filters by all six-capacity vocabulary and discloses the non-bypassable human gate', () => {
        render(<AutoresearchPane fixture={SNAPSHOT} />);
        expect(screen.getAllByTestId('autoresearch-candidate')).toHaveLength(2);
        fireEvent.change(screen.getByTestId('autoresearch-capacity-filter'), {
            target: { value: 'epii-self-referential' }
        });
        expect(screen.getAllByTestId('autoresearch-candidate')).toHaveLength(1);
        expect(screen.getByTestId('autoresearch-human-gate').textContent).toContain('agent transitions blocked');
    });

    it('routes a candidate review id through the Review-pane click-through', () => {
        const openReview = vi.fn();
        render(<AutoresearchPane fixture={SNAPSHOT} onOpenReview={openReview} />);
        fireEvent.click(screen.getByTestId('autoresearch-open-review'));
        expect(openReview).toHaveBeenCalledWith('review-17');
    });
});
