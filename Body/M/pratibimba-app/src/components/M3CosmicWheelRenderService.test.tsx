/**
 * Coordinate: M' M3' (cosmic-wheel render service tests — Track 24.T24.1)
 * Actualises: the tranche's verification as behavioral tests — the 64-cell
 *   ring renders at `full`, the active cell is highlighted at the bussed
 *   codonId, the readiness guard falls through to the pending banner, the
 *   component is a pure function of `surface` (no store import), and the
 *   arcana ring renders SLOTS with an honest pending marker (no local
 *   arcana table).
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    buildM3WheelSurface,
    M3CosmicWheelRenderService
} from './M3CosmicWheelRenderService';

const WIRE_PAYLOAD = {
    harmonicProfile: {
        codonRotationProjection: {
            codon: 'CTC',
            codonClass: 'non-dual',
            codonId: 38,
            datasetLutState: 'materialized-kernel-lut',
            rotation: 2,
            rotationDegrees: 90,
            rotationalStateCount: 7
        },
        mahamaya: {
            hexagramId: 10,
            tarotMinorId: null,
            tarotShadowCodon: null
        },
        tick12: 4,
        degree720: 415
    }
};

afterEach(cleanup);

describe('buildM3WheelSurface', () => {
    it('builds a ready surface from the wire shape', () => {
        const surface = buildM3WheelSurface({ payload: WIRE_PAYLOAD, generation: 9 });
        expect(surface.readiness.surfaceReady).toBe(true);
        expect(surface.activeProjection?.codonId).toBe(38);
        expect(surface.activeProjection?.codonClass).toBe('non-dual');
        expect(surface.activeProjection?.rotationalStateCount).toBe(7);
        expect(surface.activeProjection?.hexagramId).toBe(10);
        expect(surface.majorArcana).toBe('pending-major-arcana-map');
        expect(surface.tick12).toBe(4);
        expect(surface.degree720).toBe(415);
        expect(surface.generation).toBe(9);
    });

    it('is pending when the codon-rotation projection is absent — never fabricated', () => {
        const surface = buildM3WheelSurface({ payload: { harmonicProfile: {} }, generation: 1 });
        expect(surface.readiness.surfaceReady).toBe(false);
        expect(surface.readiness.reason).toBe('pending-codon-rotation-projection');
        expect(surface.activeProjection).toBeNull();
    });
});

describe('M3CosmicWheelRenderService', () => {
    const ready = () => buildM3WheelSurface({ payload: WIRE_PAYLOAD, generation: 9 });

    it('renders the 64-cell ring at full with the active cell highlighted', () => {
        render(<M3CosmicWheelRenderService surface={ready()} mode="full" />);
        for (let i = 0; i < 64; i++) {
            expect(screen.getByTestId(`m3-wheel-cell-${i}`)).toBeTruthy();
        }
        expect(screen.getByTestId('m3-wheel-cell-38').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m3-wheel-cell-37').getAttribute('data-active')).toBe('false');
        expect(screen.getByTestId('m3-wheel-active-label').textContent).toBe('CTC');
        const arrow = screen.getByTestId('m3-wheel-rotation-arrow');
        expect(arrow.getAttribute('data-rotation')).toBe('2');
        expect(arrow.getAttribute('data-rotation-states')).toBe('7');
        expect(screen.getByTestId('m3-wheel-quintessence')).toBeTruthy();
        expect(screen.getByTestId('m3-wheel-quintessence-pending')).toBeTruthy();
    });

    it('renders arcana SLOTS with the honest pending marker (no local arcana table)', () => {
        render(<M3CosmicWheelRenderService surface={ready()} mode="full" />);
        expect(screen.getByTestId('m3-wheel-arcana-ring').children.length).toBe(22);
        expect(screen.getByTestId('m3-wheel-arcana-pending').textContent).toContain(
            'pending-major-arcana-map'
        );
    });

    it('scales down by mode: badge drops labels and the arcana ring', () => {
        render(<M3CosmicWheelRenderService surface={ready()} mode="badge" />);
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-mode')).toBe('badge');
        expect(screen.getByTestId('m3-wheel-cell-0')).toBeTruthy();
        expect(screen.queryByTestId('m3-wheel-arcana-ring')).toBeNull();
        expect(screen.queryByTestId('m3-wheel-active-label')).toBeNull();
        expect(screen.queryByTestId('m3-wheel-quintessence')).toBeNull();
        cleanup();
        render(<M3CosmicWheelRenderService surface={ready()} mode="mini-view" />);
        expect(screen.getByTestId('m3-wheel-arcana-ring')).toBeTruthy();
        expect(screen.queryByTestId('m3-wheel-active-label')).toBeNull();
    });

    it('refuses to render when the surface is not ready — pending banner only', () => {
        const pending = buildM3WheelSurface({ payload: {}, generation: 0 });
        render(<M3CosmicWheelRenderService surface={pending} mode="full" />);
        expect(screen.getByTestId('m3-wheel-pending').textContent).toContain(
            'pending-codon-rotation-projection'
        );
        expect(screen.queryByTestId('m3-cosmic-wheel')).toBeNull();
        expect(screen.queryByTestId('m3-wheel-cell-0')).toBeNull();
    });

    it('invokes the tickHandler with the bussed tick and degree720 — no internal timer', () => {
        const tickHandler = vi.fn();
        render(
            <M3CosmicWheelRenderService surface={ready()} mode="full" tickHandler={tickHandler} />
        );
        expect(tickHandler).toHaveBeenCalledWith(4, 415);
    });
});
