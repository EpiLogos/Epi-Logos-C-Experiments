/** Behavioral proof for the M5' Autoresearch pane - 28.T28.10. */

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AutoresearchPane } from './AutoresearchPane';

// The accept chain drives the live Hen canon-write seam through the gateway
// membrane: s5'.review.submit -> s5'.review.resolve -> s1'.q_articulation.accept.
// Mock the holder so the sequence + params are observable without a live gateway.
const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('../bridge/gatewayHolder', () => ({
    gateway: () => ({ invoke }),
    gatewayReady: () => true
}));
import {
    parseImproveHistory,
    parseImproveStatus,
    parseQReviewQueue,
    profileVakCf,
    type AutoresearchSnapshot
} from './autoresearchModel';

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

const Q_REVIEW_WIRE = {
    day_id: '15-07-2026',
    graph_revision: 7,
    generated_by: 'epii_self_referential_read',
    entries: [
        {
            target_coordinate: 'M5-1',
            q_key: 'q_5_i0_integration_template',
            reason_class: 'articulation_gap',
            evidence_refs: [
                {
                    kind: 'cluster_peer_q_key_ratio',
                    uri: 'bimba://cluster/M/5/L5#q_5_i0_integration_template',
                    coordinate: 'M5-1',
                    summary: '1/1 peers carry q_5_i0_integration_template'
                }
            ],
            priority: 0,
            source_detector: 'epii-q-articulation-gap-detector',
            review_surface: {
                portal_plugin_id: 'epii',
                theia_workspace: 'review',
                vak_cf: '(4.5/0)',
                vak_cp: '4.5',
                kind: 'm5_continuity_review',
                pair_composition_action: 'compose_return_with_next_cycle'
            }
        }
    ]
};

const SNAPSHOT: AutoresearchSnapshot = {
    status: parseImproveStatus(STATUS_WIRE),
    candidates: parseImproveHistory(HISTORY_WIRE),
    qReviewEntries: parseQReviewQueue(Q_REVIEW_WIRE).entries,
    qReviewGraphRevision: 7
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

    it('strictly decodes persisted QReview entries and preserves their declared VAK routing', () => {
        const queue = parseQReviewQueue(Q_REVIEW_WIRE);
        expect(queue.dayId).toBe('15-07-2026');
        expect(queue.entries[0]).toMatchObject({
            targetCoordinate: 'M5-1',
            qKey: 'q_5_i0_integration_template',
            vakCf: '(4.5/0)',
            pairCompositionAction: 'compose_return_with_next_cycle'
        });
        expect(() =>
            parseQReviewQueue({
                ...Q_REVIEW_WIRE,
                entries: [{ ...Q_REVIEW_WIRE.entries[0], target_coordinate: '' }]
            })
        ).toThrow('target_coordinate');
    });

    it('extracts the active VAK CF from either kernel profile wire spelling', () => {
        expect(profileVakCf({ harmonicProfile: { vakAddress: { cf: '(4.5/0)' } } })).toBe('(4.5/0)');
        expect(profileVakCf({ harmonic_profile: { vak_address: { cf: '(5/0)' } } })).toBe('(5/0)');
        expect(profileVakCf({ harmonicProfile: { vakAddress: { cf: '' } } })).toBeNull();
    });

    it('renders concept law, active Mobius stage, dry-run law, and the honest missing pass ordinal', () => {
        render(<AutoresearchPane fixture={SNAPSHOT} />);
        expect(screen.getByTestId('autoresearch-as-concept').textContent).toContain('forbidden_authority');
        expect(screen.getByText('Orchestrate').getAttribute('aria-current')).toBe('step');
        expect(screen.getByTestId('autoresearch-dry-run').textContent).toContain('enforced');
        expect(screen.getByTestId('autoresearch-recompose-pass').textContent).toContain('not projected');
        expect(screen.getByTestId('autoresearch-q-review-entry').getAttribute('data-vak-cf')).toBe('(4.5/0)');
        expect(screen.getByTestId('autoresearch-q-review-queue').textContent).toContain('compose_return_with_next_cycle');
    });

    it('mounts the shared bridge-readiness badge at its s5′.improve.history binding (28.11d)', () => {
        render(<AutoresearchPane fixture={SNAPSHOT} />);
        // No readiness reported for this binding → the honest bridge_unavailable
        // wrapping shell (28.11a), rendered inline at the datum (15.6).
        const badge = document.querySelector('[data-binding="s5\'.improve.history"]');
        expect(badge).not.toBeNull();
        expect(badge?.getAttribute('data-readiness')).toBe('bridge_unavailable');
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

    it('renders six runtime capacity panes from the live snapshot and selects a pane workload', () => {
        render(<AutoresearchPane fixture={SNAPSHOT} />);

        const panes = within(screen.getByTestId('autoresearch-capacity-matrix')).getAllByRole('button');
        expect(panes).toHaveLength(6);
        expect(screen.getByTestId('autoresearch-capacity-pane-epii-self-referential').textContent).toContain('1 candidate');
        expect(screen.getByTestId('autoresearch-capacity-pane-epii-self-referential').textContent).toContain('1 human gate');
        expect(screen.getByTestId('autoresearch-capacity-pane-nara-anima-dialogic').textContent).toContain('0 candidates');

        fireEvent.click(screen.getByTestId('autoresearch-capacity-pane-epii-self-referential'));
        expect(screen.getAllByTestId('autoresearch-candidate')).toHaveLength(1);
        expect((screen.getByTestId('autoresearch-capacity-filter') as HTMLSelectElement).value).toBe('epii-self-referential');
    });

    it('routes a candidate review id through the Review-pane click-through', () => {
        const openReview = vi.fn();
        render(<AutoresearchPane fixture={SNAPSHOT} onOpenReview={openReview} />);
        fireEvent.click(screen.getByTestId('autoresearch-open-review'));
        expect(openReview).toHaveBeenCalledWith('review-17');
    });

    it('opens a VAK-seated pair workspace and composes with the Sophia aphoristic skill', async () => {
        render(<AutoresearchPane fixture={SNAPSHOT} />);

        fireEvent.click(screen.getByTestId('autoresearch-open-pair-composition'));
        expect(screen.getByTestId('q-pair-workspace')).toBeTruthy();
        expect(screen.getByTestId('q-pair-vak').textContent).toContain('(4.5/0) / 4.5');

        fireEvent.change(screen.getByLabelText('Rationale'), {
            target: { value: 'integration gathers crossings and releases a governed return' }
        });
        fireEvent.change(screen.getByLabelText('Opening question'), {
            target: { value: 'Which crossing still lacks a return path?' }
        });
        fireEvent.click(screen.getByTestId('q-pair-compose'));

        await waitFor(() => {
            expect((screen.getByLabelText('Candidate articulation') as HTMLTextAreaElement).value).toBe(
                'Like a river lock, integration gathers crossings and releases a governed return.'
            );
        });
    });

    it('drives the live Hen canon-write seam: submit -> resolve -> q_articulation.accept', async () => {
        invoke.mockReset();
        invoke.mockImplementation(async (method: string) => {
            if (method === "s5'.review.submit") {
                return { artifact: { item: { item_id: 'review-88' } } };
            }
            if (method === "s5'.review.resolve") {
                return { artifact: { resolved: true } };
            }
            if (method === "s1'.q_articulation.accept") {
                return {
                    artifact: {
                        coordinate: 'M5-1',
                        q_key: 'q_5_i0_integration_template',
                        graph_revision: 8,
                        review_epoch: 8
                    }
                };
            }
            throw new Error(`unexpected gateway method ${method}`);
        });

        render(<AutoresearchPane fixture={SNAPSHOT} />);
        fireEvent.click(screen.getByTestId('autoresearch-open-pair-composition'));
        fireEvent.change(screen.getByLabelText('Rationale'), {
            target: { value: 'integration gathers crossings and releases a governed return' }
        });
        fireEvent.change(screen.getByLabelText('Opening question'), {
            target: { value: 'Which crossing still lacks a return path?' }
        });
        fireEvent.click(screen.getByTestId('q-pair-compose'));
        await waitFor(() => {
            expect((screen.getByLabelText('Candidate articulation') as HTMLTextAreaElement).value).not.toBe('');
        });

        fireEvent.click(screen.getByTestId('q-pair-accept'));

        // The seam fires in order and terminates in the Hen promotion receipt.
        await waitFor(() => {
            expect(screen.getByTestId('q-pair-receipt').textContent).toContain(
                'Hen promoted q_5_i0_integration_template at graph revision 8'
            );
        });
        const methods = invoke.mock.calls.map(call => call[0]);
        expect(methods).toEqual([
            "s5'.review.submit",
            "s5'.review.resolve",
            "s1'.q_articulation.accept"
        ]);
        // The accept carries the real target + the approved review ref + the reviewed graph revision.
        const acceptParams = invoke.mock.calls.find(call => call[0] === "s1'.q_articulation.accept")?.[1] as Record<string, unknown>;
        expect(acceptParams).toMatchObject({
            coordinate: 'M5-1',
            qKey: 'q_5_i0_integration_template',
            acceptedReviewRef: 'review-88',
            expectedGraphRevision: 7
        });
        // The resolve step must record a human decision before the write is dispatched.
        const resolveParams = invoke.mock.calls.find(call => call[0] === "s5'.review.resolve")?.[1] as Record<string, unknown>;
        expect(resolveParams).toMatchObject({ item_id: 'review-88', decision: 'approve', resolved_by: 'human' });
    });
});
