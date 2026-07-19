import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    M1SessionCloseReader,
    readM1SessionCloseBundle
} from './m1SessionCloseReader';

afterEach(cleanup);

describe('T22.5 M1 session-close reader parse', () => {
    it('strictly parses only the aggregate close bundle and unpacks the 9-bit witness mask LSB-first', () => {
        const parsed = readM1SessionCloseBundle({
            session_id: 'sess-789',
            close_ref: 'close-789',
            m1_closure: {
                closed: true,
                generator_step: 7,
                positions_traversed: [true, true, true, true, true, true, true, true, true, true, true, true]
            },
            audio_octet: {
                octave_returned: true,
                traversed: [true, true, true, true, true, true, true, true]
            },
            virtue_witness_vector: 0b101101011,
            coherence_score: 0.82,
            provenance: {
                privacy_class: 'protected_local',
                source_method: 'nara.session_close',
                persisted_at: '2026-07-18T12:00:00Z',
                persisted_at_ms: 1_752_840_000_000,
                pasu_scoped: true
            }
        });

        expect(parsed.state).toBe('ready');
        if (parsed.state !== 'ready') {
            throw new Error('expected ready parse');
        }
        expect(parsed.witnessBits.filter(Boolean)).toHaveLength(6);
        expect(parsed.witnessBits[0]).toBe(true);
        expect(parsed.witnessBits[2]).toBe(false);
        expect(parsed.virtueLabels[0]).toContain('Love/Peace');
    });

    it('rejects forbidden full-body close payload fields instead of silently consuming them', () => {
        const parsed = readM1SessionCloseBundle({
            session_id: 'sess-789',
            close_ref: 'close-789',
            m1_closure: {
                closed: true,
                generator_step: 7,
                positions_traversed: [true, true, true, true, true, true, true, true, true, true, true, true]
            },
            audio_octet: {
                octave_returned: true,
                traversed: [true, true, true, true, true, true, true, true]
            },
            virtue_witness_vector: 0b101101011,
            coherence_score: 0.82,
            trajectory: [{ tick_id: 'forbidden' }]
        });

        expect(parsed.state).toBe('blocked');
        if (parsed.state !== 'blocked') {
            throw new Error('expected blocked parse');
        }
        expect(parsed.reason).toContain('forbidden');
    });
});

describe('T22.5 M1 session-close reader render', () => {
    it('renders the canonical rows, 12-position closure, eight audio pips, and 6-lit/3-dark virtue labels for mask 0b101101011', () => {
        const parsed = readM1SessionCloseBundle({
            session_id: 'sess-789',
            close_ref: 'close-789',
            m1_closure: {
                closed: true,
                generator_step: 7,
                positions_traversed: [true, true, true, true, true, true, true, true, true, true, true, true]
            },
            audio_octet: {
                octave_returned: true,
                traversed: [true, true, true, true, true, true, true, true]
            },
            virtue_witness_vector: 0b101101011,
            coherence_score: 0.82,
            provenance: {
                privacy_class: 'protected_local',
                source_method: 'nara.session_close',
                persisted_at: '2026-07-18T12:00:00Z',
                persisted_at_ms: 1_752_840_000_000,
                pasu_scoped: true
            }
        });
        if (parsed.state !== 'ready') {
            throw new Error('expected ready parse');
        }

        render(<M1SessionCloseReader close={parsed} />);

        expect(screen.getByTestId('m1-session-close-reader')).toBeTruthy();
        expect(screen.getByTestId('m1-session-close-question-7').textContent).toContain('twelve positions');
        expect(screen.getByTestId('m1-session-close-question-8').textContent).toContain('octave-closure');
        expect(screen.getByTestId('m1-session-close-question-9').textContent).toContain('nine virtue-poles');
        expect(screen.getByTestId('m1-session-close-m1-count').textContent).toContain('12/12');
        expect(screen.getByTestId('m1-session-close-m1-count').textContent).toContain('+7 mod 12');
        expect(screen.getByTestId('m1-session-close-audio-count').textContent).toContain('8/8');
        expect(screen.getByTestId('m1-session-close-audio-count').textContent).toContain('octave returned');
        expect(screen.getByTestId('m1-session-close-virtue-count').textContent).toContain('6/9');
        expect(screen.getByTestId('m1-session-close-virtue-count').textContent).toContain('67%');
        expect(screen.getAllByTestId('m1-session-close-virtue-pip')).toHaveLength(9);
        expect(screen.getAllByTestId('m1-session-close-virtue-pip-lit')).toHaveLength(6);
        expect(screen.getAllByTestId('m1-session-close-virtue-pip-dark')).toHaveLength(3);
        expect(screen.getByText(/Love\/Peace/)).toBeTruthy();
        expect(screen.getByText(/Reality/)).toBeTruthy();
    });
});
