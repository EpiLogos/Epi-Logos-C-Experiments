/**
 * Coordinate: M' M4' (BeingPattern perspective card tests — rerun 25.T25.22)
 * Actualises: the spec's own verification line, driven from WIRE-SHAPED
 *   fixtures — every fixture key mirrors the producer's real serialisation
 *   (`being_pattern_bridge_handle_payload` over
 *   `portal_core::PasuBeingPatternProjection`), so a green test here is a
 *   statement about the live contract and not about a second format invented
 *   on this side. All seven `MonoPolyOperator` modes render on the dial; all
 *   six `PerspectiveRole` modes on the strip; the six `NaraFamilyRole`
 *   variants render ONLY when present; the privacy guard refuses raw
 *   quaternion / Graphiti / natal / journal bodies AND the substrate's own
 *   forbidden set (nothing enters the DOM); `ActualisingOne` shows the
 *   review-risk banner whose only actions are the emit-review-only candidate
 *   arm and the review fold — never an accept; an empty roster renders the
 *   producer's own sentence instead of a defaulted reading; and the card never
 *   calls `observe`, because authoring the reading is not its job.
 * Does NOT own: the producer (S3 gateway), the host pane, or review resolution.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../../bridge/gatewayHolder';
import { publishProfileTick, resetProfileTicks } from '../../composition/profileTickSubscription';
import {
    FORBIDDEN_BODY_KEYS,
    MONO_POLY_OPERATORS,
    NARA_FAMILY_ROLES,
    PERSPECTIVE_ROLES,
    PERSPECTIVE_STRIP_LABELS,
    beingPatternFixture,
    beingPatternStreamFixture,
    parseBeingPatternProjection,
    parseBeingPatternStream
} from './beingPatternProjection';
import {
    BEING_PATTERN_REVIEW_CANDIDATE_RPC,
    BEING_PATTERN_SUBSCRIBE_RPC,
    M4BeingPatternPerspectiveCard
} from './M4BeingPatternPerspectiveCard';

afterEach(() => {
    cleanup();
    resetProfileTicks();
});

/** A stand-in for the one GatewayClient, recording every method it is asked
 *  for — so "the card never calls observe" is a fact about the calls, not a
 *  claim about the source text. */
function gatewayAnswering(
    replies: Readonly<Record<string, unknown>>
): { invoke: ReturnType<typeof vi.fn>; connected: boolean } {
    return {
        connected: true,
        invoke: vi.fn((method: string) => {
            if (!(method in replies)) {
                return Promise.reject(new Error(`unexpected method: ${method}`));
            }
            return Promise.resolve({ artifact: replies[method] });
        })
    };
}

function gatewayRefusing(message: string): { invoke: ReturnType<typeof vi.fn>; connected: boolean } {
    return { connected: true, invoke: vi.fn(() => Promise.reject(new Error(message))) };
}

function subscribeReturning(...entities: Record<string, unknown>[]) {
    return gatewayAnswering({
        [BEING_PATTERN_SUBSCRIBE_RPC]: beingPatternStreamFixture(entities)
    });
}

describe('M4BeingPatternPerspectiveCard (25.T25.22) — the live CCT-21 read', () => {
    beforeEach(() => {
        setGateway(subscribeReturning(beingPatternFixture()) as never);
    });

    it('reads the stream through subscribe, and NEVER observes — the reading is not the card’s to author', async () => {
        const client = subscribeReturning(beingPatternFixture());
        setGateway(client as never);
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-pattern-reading')).toBeTruthy());
        const methods = client.invoke.mock.calls.map(call => call[0]);
        expect(methods).toContain(BEING_PATTERN_SUBSCRIBE_RPC);
        expect(methods).not.toContain("s3'.being_pattern.observe");
        expect(methods).not.toContain("s3'.being_pattern.project");
        expect(screen.getByTestId('being-reading-source').textContent).toContain(
            BEING_PATTERN_SUBSCRIBE_RPC
        );
    });

    it('renders every MonoPolyOperator mode from the wire payload, with its reading', async () => {
        for (const operator of MONO_POLY_OPERATORS) {
            setGateway(subscribeReturning(beingPatternFixture({ monopolyOperator: operator })) as never);
            render(<M4BeingPatternPerspectiveCard />);
            await waitFor(() => expect(screen.getByTestId('being-pattern-reading')).toBeTruthy());
            expect(screen.getByTestId(`being-dial-${operator}`).getAttribute('aria-current')).toBe(
                'true'
            );
            // every stop is drawn — the dial shows the whole space of readings
            for (const stop of MONO_POLY_OPERATORS) {
                expect(screen.getByTestId(`being-dial-${stop}`)).toBeTruthy();
            }
            cleanup();
        }
    });

    it('renders every PerspectiveRole on the I/You/You-and-I/They/We/We-I strip', async () => {
        for (const role of PERSPECTIVE_ROLES) {
            setGateway(subscribeReturning(beingPatternFixture({ perspectiveRole: role })) as never);
            render(<M4BeingPatternPerspectiveCard />);
            await waitFor(() => expect(screen.getByTestId('being-pattern-reading')).toBeTruthy());
            const stop = screen.getByTestId(`being-perspective-${role}`);
            expect(stop.getAttribute('aria-current')).toBe('true');
            expect(stop.textContent).toBe(PERSPECTIVE_STRIP_LABELS[role]);
            cleanup();
        }
    });

    it('family overlay chips render ONLY when the reading applies the lens — all six variants', async () => {
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-pattern-reading')).toBeTruthy());
        expect(screen.queryByTestId('being-family-overlay')).toBeNull();
        cleanup();
        for (const role of NARA_FAMILY_ROLES) {
            setGateway(subscribeReturning(beingPatternFixture({ naraFamilyRole: role })) as never);
            render(<M4BeingPatternPerspectiveCard />);
            await waitFor(() => expect(screen.getByTestId('being-family-overlay')).toBeTruthy());
            expect(screen.getByTestId(`being-family-${role}`).textContent).toBe(role);
            cleanup();
        }
    });

    it('renders the public-safe scalars the wire really carries — clock, elements, counts', async () => {
        const edge = {
            edgeId: 'edge:user-being:school-being:9',
            sourceEntityId: 'user-being',
            targetEntityId: 'school-being',
            edgeKind: 'aspect-like',
            aspectLabel: 'trine',
            generation: 9,
            canonStatus: 'live-only-review-required'
        };
        setGateway(
            subscribeReturning(
                beingPatternFixture({ streamGeneration: 9, relationEdges: [edge] })
            ) as never
        );
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-pattern-reading')).toBeTruthy());
        // the producer's clockAddress is {degree360, tick12, hexagram, line,
        // source} — NOT a display string; a consumer that guessed the shape
        // would render an em-dash here and look fine.
        expect(screen.getByTestId('being-clock-address').textContent).toContain('137°');
        expect(screen.getByTestId('being-clock-address').textContent).toContain('tick 5');
        expect(screen.getByTestId('being-clock-address').textContent).toContain('hex 42.3');
        // …and elementalWeights is the four-field object, not an array of pairs
        const elements = screen.getByTestId('being-elemental-weights').textContent ?? '';
        expect(elements).toContain('fire:0.30');
        expect(elements).toContain('earth:0.10');
        expect(screen.getByTestId('being-relation-edge-count').textContent).toBe('1');
        expect(screen.getByTestId('being-verifier-ref-count').textContent).toBe('1');
        expect(screen.getByTestId('being-bioquaternion-count').textContent).toBe('1');
        expect(screen.getByTestId('being-stream-generation').textContent).toBe('9');
        // the live edge declares itself NON-canonical on the surface
        expect(screen.getByTestId(`being-edge-canon-${edge.edgeId}`).textContent).toBe(
            'live-only-review-required'
        );
    });

    it('an empty roster renders the producer’s own sentence, never a defaulted reading', async () => {
        setGateway(subscribeReturning() as never);
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-pattern-empty')).toBeTruthy());
        expect(screen.getByTestId('being-pattern-empty').textContent).toContain(
            'no entity observed yet'
        );
        expect(screen.queryByTestId('being-pattern-reading')).toBeNull();
        expect(screen.queryByTestId('being-pattern-dial')).toBeNull();
    });

    it('a roster of many is selectable, and the first is read until one is chosen', async () => {
        setGateway(
            subscribeReturning(
                beingPatternFixture({ entityId: 'user-being', perspectiveRole: 'FirstPerson' }),
                beingPatternFixture({ entityId: 'school-being', perspectiveRole: 'ThirdPerson' })
            ) as never
        );
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-entity-roster')).toBeTruthy());
        expect(screen.getByTestId('being-entity-ref').textContent).toContain('user-being');
        expect(screen.getByTestId('being-perspective-FirstPerson').getAttribute('aria-current')).toBe(
            'true'
        );
        fireEvent.click(screen.getByTestId('being-entity-school-being'));
        await waitFor(() =>
            expect(screen.getByTestId('being-entity-ref').textContent).toContain('school-being')
        );
        expect(screen.getByTestId('being-perspective-ThirdPerson').getAttribute('aria-current')).toBe(
            'true'
        );
    });

    it('prefers the 18.10 profile handle when the heartbeat attaches one, and says so', async () => {
        const client = subscribeReturning(beingPatternFixture({ monopolyOperator: 'Mono' }));
        setGateway(client as never);
        publishProfileTick({
            generation: 4,
            cachedAtMs: 0,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'public',
            profile: {
                pasuBeingPattern: beingPatternFixture({ monopolyOperator: 'PotentiatingMany' })
            }
        } as never);
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-pattern-reading')).toBeTruthy());
        expect(screen.getByTestId('being-dial-PotentiatingMany').getAttribute('aria-current')).toBe(
            'true'
        );
        expect(screen.getByTestId('being-reading-source').textContent).toContain('profile tick handle');
        // and the gateway is not consulted at all when the tick already carries it
        expect(client.invoke).not.toHaveBeenCalled();
    });
});

describe('25.T25.22 — the privacy guard is fail-closed on the wire', () => {
    it('a payload carrying a raw protected body is REFUSED and nothing of it enters the DOM', async () => {
        const poisoned = { ...beingPatternFixture(), q_identity: { secret: 'RAW QUATERNION BODY' } };
        setGateway(subscribeReturning(poisoned) as never);
        const { container } = render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-pattern-refused')).toBeTruthy());
        expect(screen.queryByTestId('being-pattern-reading')).toBeNull();
        expect(container.textContent).not.toContain('RAW QUATERNION BODY');
    });

    it('refuses EVERY forbidden key — the §25.22 list and the substrate’s own — at any depth', () => {
        for (const key of FORBIDDEN_BODY_KEYS) {
            const poisoned = {
                ...beingPatternFixture(),
                observerAnchor: {
                    observerEntityId: 'user-being',
                    observerRole: 'FirstPerson',
                    anchorRef: 'observer:earth-centred:user-being',
                    [key]: 'RAW BODY'
                }
            };
            expect(parseBeingPatternProjection(poisoned).kind, key).toBe('refused');
        }
        expect(FORBIDDEN_BODY_KEYS.length).toBeGreaterThan(20);
    });

    it('one poisoned entity refuses the WHOLE roster — a partial render would hide it', () => {
        const stream = beingPatternStreamFixture([
            beingPatternFixture({ entityId: 'clean-being' }),
            { ...beingPatternFixture({ entityId: 'dirty-being' }), episodeBody: 'RAW BODY' }
        ]);
        const parsed = parseBeingPatternStream(stream);
        expect(parsed.kind).toBe('refused');
        if (parsed.kind === 'refused') {
            expect(parsed.reason).toContain('episodeBody');
        }
    });

    it('refuses a defaulted reading: an unknown operator never renders a dial', async () => {
        setGateway(
            subscribeReturning({ ...beingPatternFixture(), monopolyOperator: 'NotAMode' }) as never
        );
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-pattern-refused')).toBeTruthy());
        expect(screen.queryByTestId('being-pattern-dial')).toBeNull();
    });

    it('an unknown reviewRisk or family variant refuses rather than silently narrowing', () => {
        expect(
            parseBeingPatternProjection({ ...beingPatternFixture(), reviewRisk: 'probably-fine' }).kind
        ).toBe('refused');
        expect(
            parseBeingPatternProjection({ ...beingPatternFixture(), naraFamilyRole: 'Uncle' }).kind
        ).toBe('refused');
    });
});

describe('25.T25.22 — the ActualisingOne review gate', () => {
    const actualising = () => beingPatternFixture({ monopolyOperator: 'ActualisingOne' });

    it('shows the banner and offers NO accept — only the candidate arm and the review fold', async () => {
        setGateway(subscribeReturning(actualising()) as never);
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-review-risk')).toBeTruthy());
        const card = screen.getByTestId('being-pattern-perspective');
        const buttons = [...card.querySelectorAll('button')];
        expect(buttons.map(b => b.getAttribute('data-testid'))).toEqual([
            'being-review-open-candidate',
            'being-review-open'
        ]);
        for (const button of buttons) {
            expect(button.textContent ?? '').not.toMatch(/accept|apply|promote/i);
        }
        expect(screen.getByTestId('being-review-risk').textContent).toContain(
            BEING_PATTERN_REVIEW_CANDIDATE_RPC
        );
    });

    it('opening a candidate goes through the emit-review-only arm and reports s2Mutated: false', async () => {
        const client = gatewayAnswering({
            [BEING_PATTERN_SUBSCRIBE_RPC]: beingPatternStreamFixture([actualising()]),
            [BEING_PATTERN_REVIEW_CANDIDATE_RPC]: {
                method: BEING_PATTERN_REVIEW_CANDIDATE_RPC,
                generation: 8,
                candidate: {
                    candidateId: 'being-pattern:user-being:7',
                    generation: 8,
                    entityIds: ['user-being'],
                    monopolyOperator: 'ActualisingOne',
                    reviewRisk: 'forced-unification',
                    verifierRefs: []
                },
                reviewRisk: 'forced-unification',
                status: 'emitted-review-only',
                canonPromotionPath: 'M5 review + M0 witness -> Hen/S2 write path',
                s2Mutated: false
            }
        });
        setGateway(client as never);
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-review-open-candidate')).toBeTruthy());
        fireEvent.click(screen.getByTestId('being-review-open-candidate'));
        await waitFor(() => expect(screen.getByTestId('being-review-emission')).toBeTruthy());
        expect(screen.getByTestId('being-review-status').textContent).toBe('emitted-review-only');
        expect(screen.getByTestId('being-review-s2-mutated').textContent).toBe('no');
        expect(screen.getByTestId('being-review-candidate-id').textContent).toBe(
            'being-pattern:user-being:7'
        );
        // the arm was called with ActualisingOne — the only operator it admits
        const call = client.invoke.mock.calls.find(
            entry => entry[0] === BEING_PATTERN_REVIEW_CANDIDATE_RPC
        );
        expect((call?.[1] as Record<string, unknown>).monopolyOperator).toBe('ActualisingOne');
        expect((call?.[1] as Record<string, unknown>).entityIds).toEqual(['user-being']);
    });

    it('a refused candidate emission is reported, never swallowed', async () => {
        const client = gatewayAnswering({
            [BEING_PATTERN_SUBSCRIBE_RPC]: beingPatternStreamFixture([actualising()])
        });
        setGateway(client as never);
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-review-open-candidate')).toBeTruthy());
        fireEvent.click(screen.getByTestId('being-review-open-candidate'));
        await waitFor(() => expect(screen.getByTestId('being-review-error')).toBeTruthy());
        expect(screen.queryByTestId('being-review-emission')).toBeNull();
    });

    it('a non-ActualisingOne reading has NO review affordance at all', async () => {
        setGateway(subscribeReturning(beingPatternFixture({ monopolyOperator: 'MonoPoly' })) as never);
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-pattern-reading')).toBeTruthy());
        expect(screen.queryByTestId('being-review-risk')).toBeNull();
        expect(screen.getByTestId('being-pattern-perspective').querySelectorAll('button')).toHaveLength(
            0
        );
    });
});

describe('25.T25.22 — a dark stream renders nothing in its place', () => {
    it('names the method that did not answer', async () => {
        setGateway(gatewayRefusing(`unknown method: ${BEING_PATTERN_SUBSCRIBE_RPC}`) as never);
        render(<M4BeingPatternPerspectiveCard />);
        await waitFor(() => expect(screen.getByTestId('being-pattern-dark')).toBeTruthy());
        expect(screen.getByTestId('being-pattern-dark').textContent).toContain(
            BEING_PATTERN_SUBSCRIBE_RPC
        );
        expect(screen.queryByTestId('being-pattern-reading')).toBeNull();
    });
});
