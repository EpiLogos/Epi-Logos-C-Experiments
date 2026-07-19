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
import { QuintessenceIndicator } from './QuintessenceIndicator';

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

const CHARGE_QUATERNION = {
    pp: 1,
    mm: 2,
    mp: 3,
    pm: 4,
    chargeQuaternionInvariant: true,
    fourX: 10
};

const WIRE_WITH_CHARGE = {
    harmonicProfile: {
        ...WIRE_PAYLOAD.harmonicProfile,
        mahamaya: {
            ...WIRE_PAYLOAD.harmonicProfile.mahamaya,
            chargeQuaternion: CHARGE_QUATERNION
        }
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

    it('reads the authority-provided charge quaternion without recomputing its invariant', () => {
        const surface = buildM3WheelSurface({ payload: WIRE_WITH_CHARGE, generation: 10 });
        expect(surface.chargeQuaternion).toEqual(CHARGE_QUATERNION);
        expect(surface.quintessenceState).toBe('ready');
        expect(surface.readiness.surfaceReady).toBe(true);

        const authorityViolation = buildM3WheelSurface({
            payload: {
                harmonicProfile: {
                    ...WIRE_WITH_CHARGE.harmonicProfile,
                    mahamaya: {
                        ...WIRE_WITH_CHARGE.harmonicProfile.mahamaya,
                        chargeQuaternion: {
                            ...CHARGE_QUATERNION,
                            chargeQuaternionInvariant: false
                        }
                    }
                }
            },
            generation: 11
        });
        expect(authorityViolation.quintessenceState).toBe(
            'authority_payload_invariant_violation'
        );
        expect(authorityViolation.readiness).toEqual({
            surfaceReady: false,
            reason: 'authority_payload_missing'
        });
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

    it('renders the four-petal Quintessence balance and low-variance Akasha core', () => {
        const charged = buildM3WheelSurface({ payload: WIRE_WITH_CHARGE, generation: 10 });
        const balanced = buildM3WheelSurface({
            payload: {
                harmonicProfile: {
                    ...WIRE_WITH_CHARGE.harmonicProfile,
                    mahamaya: {
                        ...WIRE_WITH_CHARGE.harmonicProfile.mahamaya,
                        chargeQuaternion: {
                            pp: 2,
                            mm: 2,
                            mp: 2,
                            pm: 2,
                            chargeQuaternionInvariant: true,
                            fourX: 8
                        }
                    }
                }
            },
            generation: 11
        });

        const { rerender } = render(
            <svg>
                <QuintessenceIndicator surface={charged} cx={50} cy={50} radius={20} />
            </svg>
        );
        expect(
            screen
                .getAllByTestId('m3-quintessence-petal')
                .map(petal => petal.getAttribute('data-strength'))
        ).toEqual(['0.25', '0.5', '0.75', '1']);
        expect(
            screen
                .getAllByTestId('m3-quintessence-petal')
                .map(petal => Number(petal.getAttribute('ry')))
        ).toEqual([2.75, 5.5, 8.25, 11]);
        const unbalancedCore = Number(
            screen.getByTestId('m3-quintessence-core').getAttribute('data-balance')
        );

        rerender(
            <svg>
                <QuintessenceIndicator surface={balanced} cx={50} cy={50} radius={20} />
            </svg>
        );
        expect(screen.getByTestId('m3-quintessence-core').getAttribute('data-balance')).toBe('1');
        expect(
            Number(screen.getByTestId('m3-quintessence-core').getAttribute('data-balance'))
        ).toBeGreaterThan(unbalancedCore);
    });

    it('renders the authority invariant violation instead of a healthy Akasha core', () => {
        const surface = buildM3WheelSurface({
            payload: {
                harmonicProfile: {
                    ...WIRE_WITH_CHARGE.harmonicProfile,
                    mahamaya: {
                        ...WIRE_WITH_CHARGE.harmonicProfile.mahamaya,
                        chargeQuaternion: {
                            ...CHARGE_QUATERNION,
                            chargeQuaternionInvariant: false
                        }
                    }
                }
            },
            generation: 12
        });
        render(<M3CosmicWheelRenderService surface={surface} mode="full" />);
        expect(screen.getByTestId('m3-quintessence-invariant-violation').textContent).toContain(
            'authority_payload_invariant_violation'
        );
        expect(screen.getByTestId('m3-cosmic-wheel').getAttribute('data-readiness')).toBe(
            'authority_payload_missing'
        );
    });

    it('renders arcana SLOTS with the honest pending marker (no local arcana table)', () => {
        render(<M3CosmicWheelRenderService surface={ready()} mode="full" />);
        expect(screen.getByTestId('m3-wheel-arcana-ring').children.length).toBe(22);
        expect(screen.getByTestId('m3-wheel-arcana-pending').textContent).toContain(
            'pending-major-arcana-map'
        );
    });

    it('renders one semantic surface at three fidelities', () => {
        render(<M3CosmicWheelRenderService surface={ready()} mode="badge" />);
        const badge = screen.getByTestId('m3-cosmic-wheel');
        expect(badge.getAttribute('data-mode')).toBe('badge');
        expect(badge.getAttribute('data-codon-id')).toBe('38');
        expect(badge.getAttribute('data-rotation')).toBe('2');
        expect(badge.getAttribute('data-rotation-states')).toBe('7');
        expect(screen.getByTestId('m3-wheel-badge-line').textContent).toContain('38 · 2/7');
        expect(screen.getByTestId('m3-wheel-quintessence-dot')).toBeTruthy();
        expect(screen.queryByTestId('m3-wheel-cell-0')).toBeNull();
        expect(screen.queryByTestId('m3-wheel-arcana-ring')).toBeNull();
        expect(screen.queryByTestId('m3-wheel-active-label')).toBeNull();

        cleanup();
        render(<M3CosmicWheelRenderService surface={ready()} mode="mini-view" />);
        const mini = screen.getByTestId('m3-cosmic-wheel');
        expect(mini.getAttribute('data-codon-id')).toBe('38');
        expect(mini.getAttribute('data-rotation')).toBe('2');
        expect(mini.getAttribute('data-rotation-states')).toBe('7');
        expect(screen.getAllByTestId(/m3-wheel-cell-/)).toHaveLength(64);
        expect(screen.getByTestId('m3-wheel-cell-38').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m3-wheel-arcana-slot-0').textContent).toContain(
            'Major Arcana slot 1'
        );
        expect(screen.queryByTestId('m3-wheel-active-label')).toBeNull();
        expect(screen.queryByTestId('m3-wheel-arcana-pending')).toBeNull();

        cleanup();
        render(<M3CosmicWheelRenderService surface={ready()} mode="full" />);
        const full = screen.getByTestId('m3-cosmic-wheel');
        expect(full.getAttribute('data-codon-id')).toBe('38');
        expect(full.getAttribute('data-rotation')).toBe('2');
        expect(full.getAttribute('data-rotation-states')).toBe('7');
        expect(screen.getByTestId('m3-wheel-active-label').textContent).toBe('CTC');
        expect(screen.getByTestId('m3-wheel-arcana-pending')).toBeTruthy();
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
