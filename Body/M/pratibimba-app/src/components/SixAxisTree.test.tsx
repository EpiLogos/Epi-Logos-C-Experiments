import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SixAxisTree } from './SixAxisTree';
import { AXIS_ORDER, OVERLAY_ORDER, decodeAxisAt } from '../engine/axisViews';

describe('SixAxisTree (23.5 — six-axis correspondence tree surfaces the decoder)', () => {
    afterEach(cleanup);

    it('renders one chip per axis and a 72-leaf tree over the invariant', () => {
        render(<SixAxisTree address72={17} />);
        for (const axis of AXIS_ORDER) {
            expect(screen.getByTestId(`axis-chip-${axis}`)).toBeTruthy();
        }
        expect(screen.getByTestId('axis-leaves').querySelectorAll('.axis-leaf')).toHaveLength(72);
        // the active address leaf is highlighted; a non-active one is not
        expect(screen.getByTestId('axis-leaf-17').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('axis-leaf-0').getAttribute('data-active')).toBe('false');
    });

    it('decodes the active address through decodeAxisAt for the selected axis', () => {
        render(<SixAxisTree address72={37} />);
        fireEvent.click(screen.getByTestId('axis-chip-mef'));
        // portal-core law: lens 6 (inverted crossing), position 1 for address 37
        const parts = screen.getByTestId('axis-parts');
        const mef = decodeAxisAt(37, 'mef')!;
        expect(parts.textContent).toContain(String(mef.parts.lens));
        expect(parts.textContent).toContain('isInverted');
        // mef has no LUT-owned fields
        expect(screen.queryByTestId('axis-kernel-sourced')).toBeNull();

        fireEvent.click(screen.getByTestId('axis-chip-maqam'));
        expect(screen.getByTestId('axis-kernel-sourced').textContent).toContain('family');
    });

    it('greys the axis chips under a sonic overlay — overlays are not a seventh axis (DR-M2-2)', () => {
        render(<SixAxisTree address72={17} />);
        for (const overlay of OVERLAY_ORDER) {
            expect(screen.getByTestId(`overlay-tab-${overlay}`)).toBeTruthy();
        }
        fireEvent.click(screen.getByTestId('overlay-tab-asma'));
        expect(screen.getByTestId('axis-chip-decan').getAttribute('data-greyed')).toBe('true');
        // the 99+1 cardinality is surfaced verbatim (never 72)
        expect(screen.getByTestId('overlay-cardinality').textContent).toBe('100');
        expect(screen.queryByTestId('axis-view')).toBeNull();
    });

    it('keeps a multi-axis intersection and swaps the invariant tree for the selected 100-entry overlay', () => {
        render(
            <SixAxisTree
                address72={17}
                correspondenceTree={{
                    mantraOverlay: Array.from({ length: 100 }, (_, index) => ({
                        index,
                        frequencyHz: 144 + index,
                        phase: index < 50 ? 'Matrika' : 'Malini',
                        element: 'Akasha'
                    })),
                    asmaOverlay: Array.from({ length: 100 }, (_, index) => ({
                        index,
                        group: index === 99 ? 'Hidden' : 'Jalal',
                        maskRouting: { internal: index < 36, projective: index >= 36 }
                    })),
                    planetaryKeying: Array.from({ length: 10 }, (_, index) => ({
                        index,
                        name: `planet-${index}`,
                        coustoHz: 100 + index,
                        element: 'Akasha',
                        chakra: index % 8,
                        isOuter: index >= 7
                    }))
                }}
            />
        );

        fireEvent.click(screen.getByTestId('axis-chip-tattva'));
        expect(screen.getByTestId('axis-chip-mef').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('axis-chip-tattva').getAttribute('data-active')).toBe('true');
        expect(screen.getAllByTestId('axis-view')).toHaveLength(2);

        fireEvent.click(screen.getByTestId('overlay-tab-mantra'));
        expect(screen.getByTestId('axis-overlay-leaves').querySelectorAll('.axis-leaf')).toHaveLength(100);
        expect(screen.getByTestId('axis-overlay-leaf-99').textContent).toContain('Malini');

        fireEvent.click(screen.getByTestId('overlay-tab-asma'));
        expect(screen.getByTestId('axis-overlay-leaf-0').textContent).toContain('internal');
        expect(screen.getByTestId('axis-overlay-leaf-99').textContent).toContain('projective');
        expect(screen.getByTestId('planetary-keying').querySelectorAll('[data-testid^="planetary-key-"]')).toHaveLength(10);
        expect(screen.getByTestId('planetary-key-7').getAttribute('data-outer')).toBe('true');
    });

    it('renders honest absence when no active address rides the bus', () => {
        render(<SixAxisTree address72={null} />);
        expect(screen.getByTestId('axis-view').textContent).toContain('awaiting the pentadic trace');
        // out-of-range / null never highlights a leaf
        expect(screen.getByTestId('axis-leaf-0').getAttribute('data-active')).toBe('false');
    });
});
