import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ShadowDecanSurface, type ShadowDecanSurfaceProjection } from './ShadowDecanSurface';

function descriptor(decanIndex: number, provenance: 'kernel-lut' | 'live-graph') {
    return {
        decanIndex,
        coordinate: `M2-3-${decanIndex}`,
        label: `Decan ${decanIndex + 1}`,
        tarotCard: `${decanIndex + 2} of Wands`,
        sourceHandle: `${provenance}://decan/${decanIndex}`,
        provenance
    } as const;
}

function projection(overrides: Partial<ShadowDecanSurfaceProjection> = {}): ShadowDecanSurfaceProjection {
    return {
        coordinate: '#2-3',
        primaryDecans: Array.from({ length: 36 }, (_, index) => descriptor(index, 'kernel-lut')),
        lightDecans: Array.from({ length: 36 }, (_, index) => descriptor(index, 'kernel-lut')),
        primaryDescriptors: [],
        shadowProperDescriptors: [],
        tarotReversedMeanings: [],
        tarotReversedMeaning: {
            coordinate: '#3-4',
            requiredGatewayMethod: 'kernelBridge.m3.tarotReversedMeaning',
            state: 'pending',
            reason: 'provider not registered'
        },
        pending: { shadowDecanGraph: true, tarotReversedMeaning: true },
        visibleCellCount: 72,
        ...overrides
    };
}

describe('ShadowDecanSurface', () => {
    afterEach(cleanup);

    it('keeps the 72 kernel-backed faces visible while graph and M3 authorities are pending', () => {
        render(<ShadowDecanSurface selectedAddress72={17} projection={projection()} />);

        const surface = screen.getByTestId('shadow-decan-surface');
        expect(surface.getAttribute('data-visible-cell-count')).toBe('72');
        expect(surface.querySelectorAll('[data-shadow-decan-cell]').length).toBe(72);
        expect(surface.querySelectorAll('[data-shadow-decan-cell="shadow-proper"]').length).toBe(0);
        expect(screen.getByTestId('pending-shadow-decan-graph')).toBeTruthy();
        expect(screen.getByTestId('pending-tarot-reversed-meaning')).toBeTruthy();
    });

    it('exposes the full 108 cells and M3 cross-references only when each authority is complete', () => {
        const shadowProperDescriptors = Array.from({ length: 36 }, (_, index) => descriptor(index, 'live-graph'));
        const tarotReversedMeanings = Array.from({ length: 36 }, (_, decanIndex) => ({
            decanIndex,
            coordinate: '#3-4',
            reversedMeaning: `Reversed meaning ${decanIndex + 1}`,
            sourceHandle: `m3://tarot/${decanIndex}`
        }));
        render(
            <ShadowDecanSurface
                selectedAddress72={17}
                projection={projection({
                    shadowProperDescriptors,
                    tarotReversedMeanings,
                    pending: { shadowDecanGraph: false, tarotReversedMeaning: false },
                    visibleCellCount: 108
                })}
            />
        );

        const surface = screen.getByTestId('shadow-decan-surface');
        expect(surface.getAttribute('data-visible-cell-count')).toBe('108');
        expect(surface.querySelectorAll('[data-shadow-decan-cell]').length).toBe(108);
        expect(surface.querySelectorAll('[data-shadow-decan-cell="shadow-proper"]').length).toBe(36);
        expect(surface.querySelectorAll('[data-tarot-reversed-meaning]').length).toBe(36);
        expect(screen.queryByTestId('pending-shadow-decan-graph')).toBeNull();
        expect(screen.queryByTestId('pending-tarot-reversed-meaning')).toBeNull();
    });
});
