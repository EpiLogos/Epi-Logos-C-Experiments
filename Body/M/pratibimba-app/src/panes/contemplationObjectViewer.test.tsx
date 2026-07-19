import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    ContemplationObjectViewer,
    readContemplationObjectProjection
} from './contemplationObjectViewer';

afterEach(cleanup);

const projection = {
    session_id: 'sess-contemplation',
    close_ref: 'close-contemplation',
    contemplation_ref: 'contemplation-opaque-1',
    triplet: {
        llm: {
            position: "4'",
            loaded_agent_count: 4,
            psyche_anchor_coherent: true,
            matched_anchor_codon_count: 1
        },
        ebm: {
            position: "5'",
            gradient_magnitude: 0.18,
            gauge_trio_coherent: true,
            coherence_scores: { square_0_5: 0.9, square_1_4: 0.8, square_2_3: 0.7 }
        },
        verifier: {
            position: "0'",
            virtue_witness_vector: [true, true, false, true, false, true, true, false, true],
            coherence_score: 0.82,
            arch9_wholeness: false,
            syntax_layers_witnessed: true
        }
    },
    provenance: {
        privacy_class: 'protected_local',
        source_method: 'nara.session_close',
        persisted_at: '2026-07-19T12:00:00Z',
        persisted_at_ms: 1_752_940_800_000,
        pasu_scoped: true
    }
};

describe('T26.12 contemplation object viewer', () => {
    it('renders only the PASU-scoped aggregate projection and its opaque references', () => {
        const parsed = readContemplationObjectProjection(projection);
        expect(parsed.state).toBe('ready');
        if (parsed.state !== 'ready') throw new Error('expected guarded contemplation projection');

        render(<ContemplationObjectViewer contemplation={parsed} />);

        expect(screen.getByTestId('contemplation-object-viewer')).toBeTruthy();
        expect(screen.getByTestId('contemplation-object-ref').textContent).toContain(
            'contemplation-opaque-1'
        );
        expect(screen.getByTestId('contemplation-object-agent-count').textContent).toContain('4');
        expect(screen.getByTestId('contemplation-object-virtue-count').textContent).toContain('6/9');
        expect(screen.getByTestId('contemplation-object-gauge').textContent).toContain('coherent');
    });

    it('fails closed when a raw contemplation body field appears in the viewer payload', () => {
        const parsed = readContemplationObjectProjection({
            ...projection,
            trajectory: [{ tick_id: 'private' }]
        });

        expect(parsed.state).toBe('blocked');
        if (parsed.state !== 'blocked') throw new Error('expected raw body rejection');
        expect(parsed.reason).toContain('forbidden');
    });
});
