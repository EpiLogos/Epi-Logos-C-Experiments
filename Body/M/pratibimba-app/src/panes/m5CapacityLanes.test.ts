/**
 * Coordinate: M' M5' (operational-capacity lanes model tests — Track 26.T26.2)
 * Actualises: the pure per-capacity lane derivation the observatory affordance
 *   renders — six lanes always, dispatch + human-gate counts grouped from
 *   `s5'.improve.history`, last-activity = newest `updated_at` per capacity
 *   (null when idle), and the subsystem vak coordinate each lane routes the
 *   Pi-monitor to. No synthesis: absence is zero/null, never fabricated.
 */

import { describe, expect, it } from 'vitest';
import { parseImproveHistory } from './autoresearchModel';
import { buildCapacityLanes, CAPACITY_COORDINATE } from './m5CapacityLanes';

const HISTORY_WIRE = {
    runs: [
        {
            run_id: 'run-1',
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
            target_coordinate: "M5-5'",
            direction: 'Second epii recursion pass',
            typed_candidate: { target_subsystem: 'epii' },
            source_review_item_id: null,
            loop_state: 'hypothesis',
            decision: 'keep',
            updated_at: 900
        },
        {
            run_id: 'run-3',
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

describe('buildCapacityLanes', () => {
    it('always yields the six operational-capacity lanes in canonical order', () => {
        const lanes = buildCapacityLanes([]);
        expect(lanes.map(lane => lane.id)).toEqual([
            'anuttara-construction',
            'paramasiva-cpt-rag',
            'parashakti-graph-relational-ml',
            'mahamaya-process-reward-rl',
            'nara-anima-dialogic',
            'epii-self-referential'
        ]);
        expect(lanes.every(lane => lane.dispatchCount === 0 && lane.lastActivityMs === null)).toBe(true);
    });

    it('counts dispatches + human gates per capacity from the improve history', () => {
        const lanes = buildCapacityLanes(parseImproveHistory(HISTORY_WIRE));
        const epii = lanes.find(lane => lane.id === 'epii-self-referential');
        expect(epii?.dispatchCount).toBe(2);
        expect(epii?.humanGateCount).toBe(1);
        const parashakti = lanes.find(lane => lane.id === 'parashakti-graph-relational-ml');
        expect(parashakti?.dispatchCount).toBe(1);
        expect(parashakti?.humanGateCount).toBe(0);
        expect(lanes.find(lane => lane.id === 'nara-anima-dialogic')?.dispatchCount).toBe(0);
    });

    it('reads last-activity as the newest updated_at across a capacity, null when idle', () => {
        const lanes = buildCapacityLanes(parseImproveHistory(HISTORY_WIRE));
        expect(lanes.find(lane => lane.id === 'epii-self-referential')?.lastActivityMs).toBe(900);
        expect(lanes.find(lane => lane.id === 'parashakti-graph-relational-ml')?.lastActivityMs).toBe(600);
        expect(lanes.find(lane => lane.id === 'nara-anima-dialogic')?.lastActivityMs).toBeNull();
    });

    it('routes each lane to its subsystem vak coordinate for the Pi-monitor', () => {
        expect(CAPACITY_COORDINATE['epii-self-referential']).toBe("M5'");
        expect(CAPACITY_COORDINATE['anuttara-construction']).toBe('M0');
        const lanes = buildCapacityLanes([]);
        expect(lanes.find(lane => lane.id === 'nara-anima-dialogic')?.coordinate).toBe('M4');
    });

    it('returns frozen lanes so a rendering cannot mutate the derivation', () => {
        const lanes = buildCapacityLanes([]);
        expect(Object.isFrozen(lanes)).toBe(true);
        expect(Object.isFrozen(lanes[0])).toBe(true);
    });
});
