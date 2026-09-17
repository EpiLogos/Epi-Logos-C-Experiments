/**
 * 29.T29.9 — the contemplation flow across the 4-5-0 slots.
 *
 * The describe blocks are the tranche's own lettered acceptance points. Three of
 * them are RETARGETED against the wire that actually exists, and each says so
 * where it sits: the brief's trigger event, its 16-byte wisdom-delta tape and
 * its three gauge-coverage bars have no source on any gateway surface, so what
 * is proven here is the reading the wire really carries plus a refusal to
 * fabricate the rest.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
    buildContemplationFlowDirective,
    contemplationSlotsLanded,
    emitContemplationComplete,
    formatContemplationReading,
    readContemplateSessionCloseResponse,
    CONTEMPLATION_FLOW_RPCS,
    CONTEMPLATION_SLOT_POSITIONS,
    CONTEMPLATION_UNAVAILABLE,
    type ContemplationFlowDirective
} from './contemplationFlowDirector';
import { compositionEventsFromEntries } from '../composition/compositionEvents';
import { useEventsStore } from '../state/eventsStore';
import { M0_VIRTUE_LABELS } from '../panes/m0VirtueWitness';

/**
 * The wire shape `nara.contemplate_session_close` returns for the canonical
 * synthetic object in `Body/S/S3/gateway/tests/contemplation_rpc_dispatches.rs`
 * (session `session-close-19-t19-6`). Field names are the serde snake_case the
 * gateway really emits; `gateway_contemplation_live.test` proves the same parse
 * against the running gateway rather than against this literal.
 */
function liveResponse(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        method: CONTEMPLATION_FLOW_RPCS.live,
        session_id: 'session-close-19-t19-6',
        wisdom_delta:
            "4'-5'-0' contemplation closed for q_Nara: recognition-state integrates close-of-session contour. " +
            'gauge-trio=true, arch-9=true, Mobius-return-gradient=0.041231, psyche-anchor=false, ' +
            'syntax-layers=true, verifier-round-trips=1.',
        triplet: {
            llm: {
                position: "4'",
                pi_instance_id: 'deterministic-pi-4p',
                loaded_agents: ['Nous', 'Moirai', 'Sophia', 'Psyche'],
                recognition_state: 'recognition-state integrates close-of-session contour',
                psyche_anchor_coherent: false,
                matched_anchor_codons: ['I', 'V'],
                anchor_card_readings: [
                    { card: 'The Fool', codon: 'I', matched: true },
                    { card: 'The Hierophant', codon: 'V', matched: true },
                    { card: 'The Star', codon: null, matched: false }
                ]
            },
            ebm: {
                position: "5'",
                per_tick_energy: [0.02, 0.014, 0.008],
                gradient: [0.03, -0.02, 0.01, 0.004],
                gradient_magnitude: 0.041231,
                gauge_trio_coherent: true,
                coherence_scores: { square_0_5: 0.91, square_1_4: 0.74, square_2_3: 0.66 }
            },
            verifier: {
                position: "0'",
                virtue_witness_vector: [true, true, true, true, true, false, true, false, true],
                unsatisfied_constraints: ['#R0-0/1/A-T7-pending?'],
                coherence_score: 0.82,
                arch9_wholeness: true,
                syntax_layers_witnessed: true
            }
        },
        symbolic_round_trips: [
            {
                raw: '#R0-0/1/A-T7-pending?',
                parsed: { coordinate: 'R0-0/1/A', tranche: 'T7', status: 'pending' },
                parser_skill: 'anuttara-symbolic-parse',
                llm_response: 'The seventh archetype is still awaiting its witness.',
                anima_reverification_route: 'anima.reverify',
                routed_back_through_anima: true
            }
        ],
        ...overrides
    };
}

function readyDirective(overrides: Record<string, unknown> = {}): ContemplationFlowDirective {
    return buildContemplationFlowDirective(readContemplateSessionCloseResponse(liveResponse(overrides)));
}

describe('(a) the LLM-Nara reading lands on the 4-prime LEFT slot as a recognition inscription', () => {
    it('carries the recognition_state the gateway composed, attributed to the Pi instance', () => {
        const directive = readyDirective();
        expect(directive.state).toBe('ready');
        expect(directive.left.position).toBe(CONTEMPLATION_SLOT_POSITIONS.llm);
        expect(directive.left.reading).toBe('recognition-state integrates close-of-session contour');
        expect(directive.left.authoredBy).toBe('deterministic-pi-4p');
    });

    it('names the 11.11 recognition category rather than restating its gold', () => {
        const directive = readyDirective();
        expect(directive.left.highlightCategory).toBe('recognition');
        // The colour belongs to the register row, never to this directive.
        expect(JSON.stringify(directive)).not.toMatch(/#d4a574/i);
    });

    it('carries the tarot psyche-anchor ribbon per card, including the unmatched draw', () => {
        const directive = readyDirective();
        expect(directive.left.ribbon).toHaveLength(3);
        expect(directive.left.ribbon[0]).toEqual({ card: 'The Fool', codon: 'I', matched: true });
        expect(directive.left.ribbon[2]).toEqual({ card: 'The Star', codon: null, matched: false });
        // The verdict is the gateway's, not a recount of the ribbon.
        expect(directive.left.anchorCoherent).toBe(false);
    });
});

describe('(b) the EBM evaluation lands on the 5-prime RIGHT slot, read verbatim', () => {
    it('copies the three Klein-V4 tritone squares through without re-scoring them', () => {
        const directive = readyDirective();
        expect(directive.right.position).toBe(CONTEMPLATION_SLOT_POSITIONS.ebm);
        expect(directive.right.squareCoherence).toEqual([0.91, 0.74, 0.66]);
        expect(directive.right.gradientMagnitude).toBe(0.041231);
        expect(directive.right.perTickEnergy).toEqual([0.02, 0.014, 0.008]);
    });

    it('refuses a square coherence outside the unit interval instead of clamping it', () => {
        const response = liveResponse();
        (response.triplet as Record<string, Record<string, unknown>>).ebm.coherence_scores = {
            square_0_5: 1.4,
            square_1_4: 0.74,
            square_2_3: 0.66
        };
        const read = readContemplateSessionCloseResponse(response);
        expect(read.state).toBe('blocked');
    });
});

describe('(c) the nine virtue lamps read the witness vector, dim until witnessed', () => {
    it('lights each lamp from its own bit, labelled from the M0 virtue register', () => {
        const directive = readyDirective();
        expect(directive.under.lamps).toHaveLength(9);
        expect(directive.under.lamps.map(lamp => lamp.label)).toEqual([...M0_VIRTUE_LABELS]);
        expect(directive.under.lamps.map(lamp => lamp.lit)).toEqual([
            true, true, true, true, true, false, true, false, true
        ]);
    });

    it('starts every lamp dim before any close has been contemplated', () => {
        const directive = buildContemplationFlowDirective(null);
        expect(directive.state).toBe('awaiting-close');
        expect(directive.under.lamps.every(lamp => !lamp.lit)).toBe(true);
        expect(directive.under.coherenceScore).toBeNull();
    });

    it('reads arch-9 wholeness from the gateway, never re-derived off a bit index', () => {
        // The frozen epi-theia director read this off virtueBits[0] (Love/Peace)
        // while the gateway reads bit 8 (Reality — Completion). Reading the
        // composed field verbatim is what keeps the two from disagreeing.
        const response = liveResponse();
        const verifier = (response.triplet as Record<string, Record<string, unknown>>).verifier;
        verifier.virtue_witness_vector = [false, true, true, true, true, false, true, false, true];
        verifier.arch9_wholeness = true;
        const directive = buildContemplationFlowDirective(readContemplateSessionCloseResponse(response));
        expect(directive.under.lamps[0].lit).toBe(false);
        expect(directive.under.arch9Wholeness).toBe(true);
    });

    it('refuses a witness vector that is not nine bits wide', () => {
        const response = liveResponse();
        (response.triplet as Record<string, Record<string, unknown>>).verifier.virtue_witness_vector = [
            true, false, true
        ];
        expect(readContemplateSessionCloseResponse(response).state).toBe('blocked');
    });
});

describe('(d) the symbolic-coordinate questions render as chips carrying their own answer', () => {
    it('surfaces the round trip the gateway already made through anuttara-symbolic-parse', () => {
        const directive = readyDirective();
        expect(directive.under.questions).toHaveLength(1);
        const question = directive.under.questions[0];
        expect(question.raw).toBe('#R0-0/1/A-T7-pending?');
        expect(question.coordinate).toBe('R0-0/1/A');
        expect(question.tranche).toBe('T7');
        expect(question.status).toBe('pending');
        expect(question.parserSkill).toBe('anuttara-symbolic-parse');
        expect(question.llmResponse).toBe('The seventh archetype is still awaiting its witness.');
        expect(question.reverificationRoute).toBe('anima.reverify');
        expect(question.routedBackThroughAnima).toBe(true);
    });
});

describe('(e) what the wire does not carry is named, not fabricated', () => {
    it('names all six spec-ahead asks that have no source on this response', () => {
        const directive = readyDirective();
        expect(directive.unavailable).toEqual([
            'wisdom-delta-byte-tape',
            'gauge-trio-coverage-fractions',
            'four-charge-balance',
            'resonance-72-overlay',
            'mobius-quaternion-arrow',
            'canvas-inscription-write'
        ]);
        // Every ask carries a stated reason; an unexplained gap is a silent one.
        expect(CONTEMPLATION_UNAVAILABLE.every(entry => entry.reason.length > 20)).toBe(true);
    });

    it('keeps wisdom_delta the prose sentence it is, with no byte tape derived from it', () => {
        const directive = readyDirective();
        expect(directive.wisdomDelta).toContain("4'-5'-0' contemplation closed");
        expect(directive).not.toHaveProperty('wisdomDeltaBytes');
        expect(JSON.stringify(directive)).not.toMatch(/\b(byteTrail|xor|quintessenceHash)\b/i);
    });

    it('keeps the gauge trio the boolean verdict it is, with no coverage fraction invented', () => {
        const directive = readyDirective();
        expect(directive.right.gaugeTrioCoherent).toBe(true);
        expect(JSON.stringify(directive.right)).not.toMatch(/\b(coverage|sigmaX|sigmaY|sigmaZ|bars)\b/i);
    });

    it('carries no four-charge balance and no quaternion arrow', () => {
        const serialised = JSON.stringify(readyDirective());
        expect(serialised).not.toMatch(/\b(pp|nn|np|pn|outer|s3Shadow|quaternionArrow)\b/);
    });
});

describe('(f) composition.contemplation.complete fires once the three slots land', () => {
    beforeEach(() => {
        useEventsStore.setState({ events: [] });
    });

    function contemplationEvents() {
        return compositionEventsFromEntries(useEventsStore.getState().events).filter(
            event => event.type === 'composition.contemplation.complete'
        );
    }

    it('emits through the real store once every slot carries its reading', () => {
        const directive = readyDirective();
        expect(contemplationSlotsLanded(directive)).toBe(true);
        const fired = emitContemplationComplete(
            'jiva-siva.integrated',
            directive,
            31,
            '2026-07-28T21:30:00.000Z'
        );
        expect(fired).toBe(true);

        const events = contemplationEvents();
        expect(events).toHaveLength(1);
        expect(events[0].compositionId).toBe('jiva-siva.integrated');
        expect(events[0].profileGeneration).toBe(31);
        expect(events[0].payload).toEqual({
            sessionId: 'session-close-19-t19-6',
            slots: ["4'", "5'", "0'"],
            lampsLit: 7,
            questions: 1,
            arch9Wholeness: true,
            unavailable: [
                'wisdom-delta-byte-tape',
                'gauge-trio-coverage-fractions',
                'four-charge-balance',
                'resonance-72-overlay',
                'mobius-quaternion-arrow',
                'canvas-inscription-write'
            ]
        });
    });

    it('stays silent while no close has been contemplated', () => {
        const fired = emitContemplationComplete(
            'jiva-siva.integrated',
            buildContemplationFlowDirective(null),
            31,
            '2026-07-28T21:30:00.000Z'
        );
        expect(fired).toBe(false);
        expect(contemplationEvents()).toHaveLength(0);
    });

    it('stays silent when the response was refused', () => {
        const blocked = buildContemplationFlowDirective(
            readContemplateSessionCloseResponse({ method: 'nara.contemplate_session_close' })
        );
        expect(blocked.state).toBe('blocked');
        expect(
            emitContemplationComplete(
                'jiva-siva.integrated',
                blocked,
                31,
                '2026-07-28T21:30:00.000Z'
            )
        ).toBe(false);
        expect(contemplationEvents()).toHaveLength(0);
    });
});

describe('the parser holds the response to its own shape', () => {
    it('accepts the canonical synthetic close whole', () => {
        const read = readContemplateSessionCloseResponse(liveResponse());
        expect(read.state).toBe('ready');
    });

    it('refuses a response that names some other method', () => {
        const read = readContemplateSessionCloseResponse(liveResponse({ method: 'nara.session_close' }));
        expect(read).toEqual({
            state: 'blocked',
            reason: 'contemplation response must name nara.contemplate_session_close'
        });
    });

    it('refuses an unknown field rather than ignoring it', () => {
        const read = readContemplateSessionCloseResponse(liveResponse({ graphiti_relation: 'x' }));
        expect(read.state).toBe('blocked');
    });

    it('refuses a triplet stamped at the wrong geometry', () => {
        const response = liveResponse();
        (response.triplet as Record<string, Record<string, unknown>>).llm.position = "2'";
        const read = readContemplateSessionCloseResponse(response);
        expect(read).toEqual({ state: 'blocked', reason: "llm reading must sit at 4'" });
    });

    it('refuses the PERSISTED projection, which is a different shape entirely', () => {
        // `nara.session_close.contemplation.read` returns counts, not bodies —
        // feeding it here would silently read an aggregate as a live close.
        const projection = {
            session_id: 'session-close-19-t19-6',
            close_ref: 'close-1',
            contemplation_ref: 'contemplation-1',
            triplet: {
                llm: {
                    position: "4'",
                    loaded_agent_count: 4,
                    psyche_anchor_coherent: false,
                    matched_anchor_codon_count: 2
                },
                ebm: {
                    position: "5'",
                    gradient_magnitude: 0.041231,
                    gauge_trio_coherent: true,
                    coherence_scores: { square_0_5: 0.91, square_1_4: 0.74, square_2_3: 0.66 }
                },
                verifier: {
                    position: "0'",
                    virtue_witness_vector: [true, true, true, true, true, false, true, false, true],
                    coherence_score: 0.82,
                    arch9_wholeness: true,
                    syntax_layers_witnessed: true
                }
            },
            provenance: { privacy_class: 'protected-local' }
        };
        expect(readContemplateSessionCloseResponse(projection).state).toBe('blocked');
    });

    it('freezes the directive so no consumer can edit the reading it was handed', () => {
        const directive = readyDirective();
        expect(Object.isFrozen(directive)).toBe(true);
        expect(Object.isFrozen(directive.under.lamps)).toBe(true);
    });
});

describe('the reading summary states what landed and what this wire cannot carry', () => {
    it('names what the wire does not carry alongside what it does', () => {
        const reading = formatContemplationReading(readyDirective());
        expect(reading).toContain("4' recognition-state integrates close-of-session contour");
        expect(reading).toContain("0' 7/9 virtues witnessed");
        expect(reading).toContain('not on this wire: wisdom-delta-byte-tape');
    });

    it('says plainly when nothing has been contemplated', () => {
        expect(formatContemplationReading(buildContemplationFlowDirective(null))).toBe(
            'no session close has been contemplated yet'
        );
    });
});
