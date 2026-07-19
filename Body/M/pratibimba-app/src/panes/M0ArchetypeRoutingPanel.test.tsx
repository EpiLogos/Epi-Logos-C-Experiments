/**
 * Coordinate: M' M0-0' (archetype routing reader behavioral tests, 21.T21.8)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M0 language routing projection gate
 * Actualises: strict consumption of the bussed routing-LUT snapshot for the
 *   selected coordinate's routed M0 archetype; no direct kernel LUT import.
 * Public surface: Vitest suite for M0ArchetypeRoutingPanel.
 * Does NOT own: archetype routing, LUT data, profile transport, or graph reads.
 * Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.8.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    M0ArchetypeRoutingPanel,
    type M0ArchetypeRoutingPanelProps
} from './M0ArchetypeRoutingPanel';
import { readM0ArchetypeRouting } from './m0ArchetypeRouting';
import { M0_VIRTUE_LABELS } from './m0VirtueWitness';

function cachedProfile(snapshot: unknown) {
    return {
        generation: 41,
        cachedAtMs: 0,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: { m0_routing_lut_snapshot: snapshot }
    };
}

describe('M0ArchetypeRoutingPanel', () => {
    afterEach(cleanup);

    it("renders Archetype 7's real bussed DIVINE_ACT rows at the action syntax layer", () => {
        const archetypeLut = Array.from({ length: 10 }, () => [] as unknown[]);
        archetypeLut[7] = [
            {
                id: 0,
                label: 'Creation',
                symbol: 'srshti',
                provenance: 'DIVINE_ACT_LUT projected through m0_routing_lut_snapshot'
            },
            {
                id: 1,
                label: 'Maintenance',
                symbol: 'sthiti',
                provenance: 'DIVINE_ACT_LUT projected through m0_routing_lut_snapshot'
            }
        ];
        const projection = readM0ArchetypeRouting(
            { c_1_archetype_index: 7 },
            cachedProfile({ archetype_lut: archetypeLut })
        );

        render(<M0ArchetypeRoutingPanel projection={projection} />);

        expect(screen.getByTestId('m0-archetype-routing-reader').getAttribute('data-routed-sub-table')).toBe(
            'DIVINE_ACT'
        );
        expect(screen.getByTestId('m0-archetype-routing-reader').getAttribute('data-syntax-layer')).toBe(
            'action'
        );
        expect(screen.getByText('Creation')).toBeTruthy();
        expect(screen.getByText('Maintenance')).toBeTruthy();
    });

    it("renders Archetype 9's real bussed VIRTUE rows at the completion syntax layer", () => {
        const archetypeLut = Array.from({ length: 10 }, () => [] as unknown[]);
        archetypeLut[9] = [
            {
                id: 0,
                label: 'Love/Peace',
                symbol: 'O#',
                provenance: 'VIRTUE_LUT projected through m0_routing_lut_snapshot'
            },
            {
                id: 8,
                label: 'Reality',
                symbol: '(@)',
                provenance: 'VIRTUE_LUT projected through m0_routing_lut_snapshot'
            }
        ];
        const projection = readM0ArchetypeRouting(
            { c_1_archetype_index: 9 },
            cachedProfile({ archetype_lut: archetypeLut })
        );

        render(<M0ArchetypeRoutingPanel projection={projection} />);

        expect(screen.getByTestId('m0-archetype-routing-reader').getAttribute('data-routed-sub-table')).toBe(
            'VIRTUE'
        );
        expect(screen.getByTestId('m0-archetype-routing-reader').getAttribute('data-syntax-layer')).toBe(
            'completion'
        );
        expect(screen.getByText('Love/Peace')).toBeTruthy();
        expect(screen.getByText('Reality')).toBeTruthy();
    });

    it('lazily opens the completion syntax reader with source-ordered virtue rows and witness state', () => {
        const archetypeLut = Array.from({ length: 10 }, () => [] as unknown[]);
        const virtues = [
            'Love/Peace',
            'Truth',
            'Openness/Creativity',
            'Joy/Play',
            'Goodness',
            'Beauty',
            'Life/Nature',
            'Wisdom',
            'Reality'
        ];
        archetypeLut[9] = virtues.map((label, id) => ({
            id,
            label,
            symbol: null,
            provenance: 'VIRTUE_LUT projected through m0_routing_lut_snapshot'
        }));
        const projection = readM0ArchetypeRouting(
            { c_1_archetype_index: 9 },
            cachedProfile({ archetype_lut: archetypeLut })
        );
        const onSeekContemplation = vi.fn();

        const props: M0ArchetypeRoutingPanelProps = {
            projection,
            contemplationPrompt: 'What is completion asking of this reading?',
            virtueWitness: {
                state: 'ready',
                generation: 41,
                witnessBits: [true, false, true, true, false, true, true, true, false],
                virtueLabels: M0_VIRTUE_LABELS,
                coherenceScore: 0.72,
                unsatisfiedConstraints: []
            },
            onSeekContemplation
        };

        render(<M0ArchetypeRoutingPanel {...props} />);

        expect(screen.queryByTestId('m0-syntax-layer-reader')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Syntax layer' }));

        const reader = screen.getByTestId('m0-syntax-layer-reader');
        expect(reader.getAttribute('data-syntax-layer')).toBe('completion');
        expect(
            Array.from(screen.getByTestId('m0-syntax-layer-rows').children).map(row => row.textContent)
        ).toEqual(virtues);
        expect(screen.getByTestId('m0-syntax-layer-witness').getAttribute('data-witnessed')).toBe('6');
        fireEvent.click(screen.getByRole('button', { name: 'Why this question right now?' }));
        expect(onSeekContemplation).toHaveBeenCalledOnce();
    });

    it('blocks an eligible archetype when the profile has not emitted its routing snapshot', () => {
        const projection = readM0ArchetypeRouting({ c_1_archetype_index: 7 }, cachedProfile({}));

        render(<M0ArchetypeRoutingPanel projection={projection} />);

        expect(screen.getByTestId('m0-archetype-routing-reader').getAttribute('data-provenance')).toBe(
            'blocked'
        );
        expect(screen.getByText('Routing snapshot unavailable for this archetype.')).toBeTruthy();
    });
});
