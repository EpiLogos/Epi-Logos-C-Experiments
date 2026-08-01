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
    M3CosmicWheelRenderService,
    surfaceBlockers,
    TCT_BLOCKER,
    TCT_CODON_ID,
    TCT_ROTATIONAL_STATE_COUNT
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
        phaseSpace: {
            fibonacciGround: {
                digitLut: [
                    0, 1, 1, 2, 3, 5, 8, 3, 1, 4, 5, 9, 4, 3, 7, 0, 7, 7, 4, 1,
                    5, 6, 1, 7, 8, 5, 3, 8, 1, 9, 0, 9, 9, 8, 7, 5, 2, 7, 9, 6,
                    5, 1, 6, 7, 3, 0, 3, 3, 6, 9, 5, 4, 9, 3, 2, 5, 7, 2, 9, 1
                ],
                backboneDegrees: Array.from({ length: 24 }, (_, index) => index * 15)
            }
        },
        livePlanets: [
            { planetId: 0, fibonacciPosition: 16 }
        ],
        quintessence: {
            natalFibonacciPosition: 36
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
        // 24.T24.6: this payload's `mahamaya` predates the WC-M3-SA-2 mirror —
        // the key is ABSENT, which is `pending`, not "no card".
        expect(surface.majorArcana).toEqual({
            kind: 'pending',
            reason: 'pending-profile-field:mahamaya.tarotMajorArcanaCardId'
        });
        // …while `tarotMinorId` IS on the wire as an explicit `null`: the kernel
        // answering "this codon is one of the 8 outside the 56-card cover".
        expect(surface.minorArcana).toEqual({
            kind: 'no-arcana',
            reason: 'no-minor-arcana:outside-56-card-cover'
        });
        expect(surface.tick12).toBe(4);
        expect(surface.degree720).toBe(415);
        expect(surface.generation).toBe(9);
        expect(surface.fibonacciGround?.wedges).toHaveLength(60);
        expect(surface.fibonacciGround?.backboneDegrees).toHaveLength(24);
        expect(surface.fibonacciGround?.natalSunPosition).toBe(36);
        expect(surface.fibonacciGround?.liveSunPosition).toBe(16);
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
            reason: 'authority_payload_missing',
            // 24.T24.9: a bad charge payload is a missing AUTHORITY, not a
            // violated M3 invariant — the blocker list stays empty.
            blockers: []
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

    it('renders the backend-authored Level-0 ground outside the wheel', () => {
        render(<M3CosmicWheelRenderService surface={ready()} mode="full" />);
        expect(screen.getAllByTestId(/m3-fibonacci-wedge-/)).toHaveLength(60);
        expect(screen.getAllByTestId(/m3-fibonacci-cardinal-/)).toHaveLength(4);
        expect(screen.getAllByTestId(/m3-fibonacci-zodiacal-/)).toHaveLength(8);
        expect(screen.getAllByTestId(/m3-fibonacci-backbone-/)).toHaveLength(24);
        expect(screen.getByTestId('m3-fibonacci-natal-sun').getAttribute('data-position')).toBe(
            '36'
        );
        expect(screen.getByTestId('m3-fibonacci-live-sun').getAttribute('data-position')).toBe(
            '16'
        );
        expect(screen.getByTestId('m3-fibonacci-ground-ring').getAttribute('data-layer-order')).toBe(
            'fibonacci-ground,backbone,lens-annulus,walk,torus-core'
        );
    });

    it('layers the 385-node cosmic clock over the full wheel with honest edge provenance', () => {
        render(
            <M3CosmicWheelRenderService
                surface={ready()}
                mode="full"
                clockMode="flat-clock-debug"
            />
        );

        expect(screen.getAllByTestId(/^m3-clock-degree-\d+$/)).toHaveLength(360);
        expect(screen.getAllByTestId(/^m3-clock-amino-\d+$/)).toHaveLength(24);
        expect(screen.getByTestId('m3-clock-axis-mundi')).toBeTruthy();
        expect(
            screen.getByTestId('m3-cosmic-clock-depth-overlay').getAttribute('data-node-count')
        ).toBe('385');
        expect(
            screen
                .getByTestId('m3-clock-aspect-pending')
                .querySelector('[data-testid="provenance-pending"]')
                ?.getAttribute('title')
        ).toBe('pending-profile-field:cosmicClock.aspectEdges');
        expect(
            screen
                .getByTestId('m3-clock-hop-pending')
                .querySelector('[data-testid="provenance-pending"]')
                ?.getAttribute('title')
        ).toBe('pending-profile-field:cosmicClock.hopEdges');
    });

    it('renders honest pending ground when the backend lane is absent', () => {
        const surface = buildM3WheelSurface({
            payload: {
                harmonicProfile: {
                    ...WIRE_PAYLOAD.harmonicProfile,
                    phaseSpace: undefined,
                    livePlanets: undefined,
                    quintessence: undefined
                }
            },
            generation: 13
        });
        render(<M3CosmicWheelRenderService surface={surface} mode="full" />);
        expect(screen.getByTestId('m3-fibonacci-ground-pending').textContent).toContain(
            'pending-profile-field:phaseSpace.fibonacciGround'
        );
        expect(screen.queryByTestId('m3-fibonacci-wedge-0')).toBeNull();
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

    it('leaves the arcana ring unlit and NAMES why when the card id is absent', () => {
        render(<M3CosmicWheelRenderService surface={ready()} mode="full" />);
        expect(screen.getByTestId('m3-wheel-arcana-ring').children.length).toBe(22);
        expect(screen.getByTestId('m3-wheel-arcana-pending').textContent).toContain(
            'pending-profile-field:mahamaya.tarotMajorArcanaCardId'
        );
        expect(
            screen.getAllByTestId(/m3-wheel-arcana-slot-/).some(
                slot => slot.getAttribute('data-active') === 'true'
            )
        ).toBe(false);
    });

    it('lights the arcana slot the bus names — 24.T24.6, no local arcana table', () => {
        const surface = buildM3WheelSurface({
            payload: {
                harmonicProfile: {
                    ...WIRE_PAYLOAD.harmonicProfile,
                    mahamaya: {
                        ...WIRE_PAYLOAD.harmonicProfile.mahamaya,
                        tarotMajorArcanaCardId: 14,
                        tarotMinorId: 30
                    }
                }
            },
            generation: 3
        });
        expect(surface.majorArcana).toEqual({ kind: 'card', cardId: 14 });
        expect(surface.minorArcana).toEqual({ kind: 'card', cardId: 30 });

        render(<M3CosmicWheelRenderService surface={surface} mode="full" />);
        expect(screen.getByTestId('m3-wheel-arcana-slot-14').getAttribute('data-active')).toBe(
            'true'
        );
        expect(screen.getByTestId('m3-wheel-arcana-slot-13').getAttribute('data-active')).toBe(
            'false'
        );
        expect(screen.getByTestId('m3-wheel-arcana-pending').textContent).toContain(
            'arcana ring: card 14 lit'
        );
    });

    it('separates "STOP codon, no arcana" from "field never arrived"', () => {
        const stopCodon = buildM3WheelSurface({
            payload: {
                harmonicProfile: {
                    ...WIRE_PAYLOAD.harmonicProfile,
                    mahamaya: {
                        ...WIRE_PAYLOAD.harmonicProfile.mahamaya,
                        tarotMajorArcanaCardId: null
                    }
                }
            },
            generation: 4
        });
        expect(stopCodon.majorArcana).toEqual({
            kind: 'no-arcana',
            reason: 'no-major-arcana:stop-codon'
        });
        render(<M3CosmicWheelRenderService surface={stopCodon} mode="full" />);
        expect(screen.getByTestId('m3-wheel-arcana-pending').textContent).toContain(
            'no-major-arcana:stop-codon'
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

// ============================================================================
// 24.T24.9 — TCT / Nine-of-Wands surfacing rule (DR-WC-M3-1 ← DR-M3-1).
//
// Note the codon: TCT is 0x19, NOT the 0x35 the tranche brief names. 0x35 is
// GTT; the register corrected that literal on 2026-07-10 after the substrate
// pin test caught it. These fixtures assert the rule watches the RIGHT codon —
// a rule aimed at 0x35 would pass forever without ever checking anything.
// ============================================================================

function withCodon(codonId: number, rotationalStateCount: number) {
    return buildM3WheelSurface({
        payload: {
            harmonicProfile: {
                ...WIRE_PAYLOAD.harmonicProfile,
                codonRotationProjection: {
                    ...WIRE_PAYLOAD.harmonicProfile.codonRotationProjection,
                    codonId,
                    rotationalStateCount
                }
            }
        },
        generation: 21
    });
}

describe('24.T24.9 — the TCT rotational-state invariant', () => {
    it('names TCT as 0x19, the runtime codon — not the brief\'s 0x35 typo', () => {
        expect(TCT_CODON_ID).toBe(0x19);
        expect(TCT_ROTATIONAL_STATE_COUNT).toBe(7);
    });

    it('TCT-7 passes: the surface stays ready and carries no blocker', () => {
        const surface = withCodon(TCT_CODON_ID, 7);
        expect(surfaceBlockers(surface.activeProjection)).toEqual([]);
        expect(surface.readiness.blockers).toEqual([]);
        expect(surface.readiness.surfaceReady).toBe(true);
        expect(surface.readiness.reason).toBeNull();
    });

    it('TCT-8 is REFUSED: the dataset\'s superseded 8-count raises the blocker', () => {
        const surface = withCodon(TCT_CODON_ID, 8);
        expect(surfaceBlockers(surface.activeProjection)).toEqual([TCT_BLOCKER]);
        expect(surface.readiness.blockers).toEqual([TCT_BLOCKER]);
        // A broken invariant is not a pending — the surface is not ready.
        expect(surface.readiness.surfaceReady).toBe(false);
        expect(surface.readiness.reason).toBe(TCT_BLOCKER);
    });

    it('renders the blocker rather than quietly drawing a wrong denominator', () => {
        render(<M3CosmicWheelRenderService surface={withCodon(TCT_CODON_ID, 8)} mode="full" />);
        const wheel = screen.getByTestId('m3-cosmic-wheel');
        expect(wheel.getAttribute('data-blockers')).toBe(TCT_BLOCKER);
        expect(wheel.getAttribute('data-readiness')).toBe(TCT_BLOCKER);
        expect(screen.getByTestId(`m3-wheel-blocker-${TCT_BLOCKER}`).textContent).toContain(
            TCT_BLOCKER
        );
        // The evidence is still on screen — the wheel is not hidden, it is flagged.
        expect(wheel.getAttribute('data-rotation-states')).toBe('8');
    });

    it('watches ONLY TCT — 0x35 (GTT) with 8 states is not a violation', () => {
        // If the rule had been written against the brief's 0x35 literal, this
        // fixture would fail: GTT is an ordinary codon whose state count the
        // TCT law says nothing about.
        const gtt = withCodon(0x35, 8);
        expect(gtt.readiness.blockers).toEqual([]);
        expect(gtt.readiness.surfaceReady).toBe(true);
    });

    it('cannot judge what the bus did not send — an absent count is no blocker', () => {
        const surface = buildM3WheelSurface({
            payload: {
                harmonicProfile: {
                    ...WIRE_PAYLOAD.harmonicProfile,
                    codonRotationProjection: {
                        ...WIRE_PAYLOAD.harmonicProfile.codonRotationProjection,
                        codonId: TCT_CODON_ID,
                        rotationalStateCount: null
                    }
                }
            },
            generation: 22
        });
        expect(surface.activeProjection?.rotationalStateCount).toBeNull();
        expect(surface.readiness.blockers).toEqual([]);
    });
});

// ============================================================================
// 24.T60 — the 60-position Fibonacci Ground outer ring (24.19 render contract
// item 1).
//
// The ring's whole discipline is that its digits are BACKEND-AUTHORED: the
// Pisano table is kernel law and the renderer must hold none. Counting 60
// wedges does not test that — a ring labelled with indices, zeros, or a
// locally-derived Pisano sequence counts 60 just as well. These fixtures pin
// the digits to the payload, position by position, so a local table cannot
// pass.
// ============================================================================

describe('24.T60 — the 60-position outer ring is a projection of the bussed LUT', () => {
    const ready = () => buildM3WheelSurface({ payload: WIRE_PAYLOAD, generation: 9 });
    const groundOf = () => WIRE_PAYLOAD.harmonicProfile.phaseSpace.fibonacciGround;

    it('renders each wedge with the payload digit at that position', () => {
        const digitLut = groundOf().digitLut;
        expect(digitLut).toHaveLength(60);
        render(<M3CosmicWheelRenderService surface={ready()} mode="full" />);

        for (let position = 0; position < 60; position++) {
            const wedge = screen.getByTestId(`m3-fibonacci-wedge-${position}`);
            expect(wedge.getAttribute('data-position')).toBe(String(position));
            expect(wedge.getAttribute('data-digit')).toBe(String(digitLut[position]));
        }
        // And the labels are those digits, not the positions — a ring that
        // printed its own index would satisfy every count-based assertion.
        expect(
            screen.getByTestId('m3-fibonacci-wedge-7').textContent
        ).toBe(String(digitLut[7]));
    });

    it('follows the payload when the LUT changes — no baked sequence', () => {
        // Same shape, different digits. A renderer-local Pisano table would
        // keep printing the old sequence and fail here.
        const rotated = groundOf().digitLut.map(digit => (digit + 1) % 10);
        const surface = buildM3WheelSurface({
            payload: {
                harmonicProfile: {
                    ...WIRE_PAYLOAD.harmonicProfile,
                    phaseSpace: {
                        fibonacciGround: { ...groundOf(), digitLut: rotated }
                    }
                }
            },
            generation: 31
        });
        render(<M3CosmicWheelRenderService surface={surface} mode="full" />);
        for (const position of [0, 13, 41, 59]) {
            expect(
                screen.getByTestId(`m3-fibonacci-wedge-${position}`).getAttribute('data-digit')
            ).toBe(String(rotated[position]));
        }
    });

    it('refuses the whole ring when the LUT is the wrong length — no partial ring', () => {
        const surface = buildM3WheelSurface({
            payload: {
                harmonicProfile: {
                    ...WIRE_PAYLOAD.harmonicProfile,
                    phaseSpace: {
                        fibonacciGround: {
                            ...groundOf(),
                            digitLut: groundOf().digitLut.slice(0, 59)
                        }
                    }
                }
            },
            generation: 32
        });
        expect(surface.fibonacciGround).toBeNull();
        render(<M3CosmicWheelRenderService surface={surface} mode="full" />);
        expect(screen.queryByTestId('m3-fibonacci-wedge-0')).toBeNull();
        expect(screen.getByTestId('m3-fibonacci-ground-pending').textContent).toContain(
            'pending-profile-field:phaseSpace.fibonacciGround'
        );
    });

    it('marks the natal Sun as a RING and the live Sun as a DOT', () => {
        // The spec reads natal-to-live as a geometric distance between two
        // DIFFERENT marks (gold ring vs silver dot). If both rendered the same
        // way the reading would be unavailable, so the distinction is contract.
        render(<M3CosmicWheelRenderService surface={ready()} mode="full" />);
        const natal = screen.getByTestId('m3-fibonacci-natal-sun');
        const live = screen.getByTestId('m3-fibonacci-live-sun');
        expect(natal.getAttribute('class')).toBe('m3-fibonacci-natal-sun');
        expect(live.getAttribute('class')).toBe('m3-fibonacci-live-sun');
        expect(natal.getAttribute('data-position')).toBe('36');
        expect(live.getAttribute('data-position')).toBe('16');
        // Two distinct positions ⇒ two distinct marks on the ring.
        expect(natal.getAttribute('cx')).not.toBe(live.getAttribute('cx'));
    });

    it('anchors cardinals and zodiacals at the contract positions', () => {
        render(<M3CosmicWheelRenderService surface={ready()} mode="full" />);
        for (const position of [0, 15, 30, 45]) {
            expect(screen.getByTestId(`m3-fibonacci-cardinal-${position}`)).toBeTruthy();
        }
        for (const position of [5, 10, 20, 25, 35, 40, 50, 55]) {
            expect(screen.getByTestId(`m3-fibonacci-zodiacal-${position}`)).toBeTruthy();
        }
        // 24 backbone ticks, origin emphasised.
        expect(screen.getAllByTestId(/m3-fibonacci-backbone-/)).toHaveLength(24);
        expect(screen.getByTestId('m3-fibonacci-backbone-0').getAttribute('class')).toContain(
            'm3-fibonacci-backbone-origin'
        );
    });
});
