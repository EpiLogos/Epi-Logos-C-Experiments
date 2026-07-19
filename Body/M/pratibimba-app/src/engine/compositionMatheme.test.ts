/**
 * Coordinate: M' M1'+M2'+M3' (composition-contract matheme spine — Track 07.T7.2)
 * Actualises: the 7.2 verification — the integrated 1-2-3 stratification
 *   preserves the matheme spine 137 = 64 + 72 + 1 across the Third Spanda
 *   Equation's five canonical forms + the co-canonical QCD decomposition; the
 *   +1 parent attribution renders M1-5 (DR-M1-1 / DR-M5-2) and NEVER
 *   M0-Anuttara-witness; the translation rule 9₍M2₎ = 8₍M3₎ + 1₍M1₎ is bound to
 *   the live hinge. Behavioural throughout: the parent-attribution and
 *   translation-rule assertions run the REAL carrier producers
 *   (`topologyFromPayload` from the M1 topology pane, `buildPentadicOverlay`
 *   from the pentadic overlay), no fixtures standing in for the real path.
 */

import { describe, expect, it } from 'vitest';
import {
    MATHEME_SPINE,
    THIRD_SPANDA_FORMS,
    QCD_OCTET_SINGLET_FORM,
    TRANSLATION_RULE,
    EXECUTION_ORDER,
    SEVEN_EIGHT_NINE_SPINE,
    PARENT_ATTRIBUTION,
    FORBIDDEN_PARENT_ATTRIBUTION,
    assertParentAttribution,
    assertMathemeSpine
} from './compositionMatheme';
import { topologyFromPayload } from '../panes/m1KleinTopology';
import { buildPentadicOverlay } from './cosmicPentadicOverlay';
import { PENTADIC_TRACE_FIXTURE as PENTADIC_TRACE } from '../test/pentadicTraceFixture';

// A real, spec-consistent pentadic trace (matching the 36.T36.4 fixture the
// kernel producer emits) so the overlay's translation-rule join line is the
// live carrier render, not a hand-built string.

describe('07.T7.2 — 137 = 64 + 72 + 1 composition-contract matheme spine', () => {
    describe('matheme spine preservation', () => {
        it('composes M3(64) + M2(72) + M1(1) = 137, with M2 = 8×9', () => {
            expect(MATHEME_SPINE.m3Codon).toBe(64);
            expect(MATHEME_SPINE.m2Invariant).toBe(72);
            expect(MATHEME_SPINE.m2Invariant).toBe(8 * 9);
            expect(MATHEME_SPINE.m1Parent).toBe(1);
            expect(MATHEME_SPINE.m3Codon + MATHEME_SPINE.m2Invariant + MATHEME_SPINE.m1Parent).toBe(
                137
            );
            expect(MATHEME_SPINE.total).toBe(137);
        });

        it('carries the Third Spanda Equation five canonical forms, each evaluating to 137', () => {
            const ids = THIRD_SPANDA_FORMS.map((f) => f.id);
            // The named authority set: ql_m0_m3_third_spanda_integral_quilting_v2.md
            // frontmatter — (Mersenne / Binary / Octave-field / Spanda-bridge / M-stack).
            expect(ids).toEqual(
                expect.arrayContaining([
                    'm-stack',
                    'spanda-bridge',
                    'octave-field',
                    'binary',
                    'mersenne'
                ])
            );
            expect(THIRD_SPANDA_FORMS).toHaveLength(5);
            for (const form of THIRD_SPANDA_FORMS) {
                expect(form.evaluate(), `${form.id}: ${form.symbol}`).toBe(137);
            }
        });

        it('also asserts the co-canonical QCD octet/singlet form 137 = 128 + 8 + 1 (design-recon 7.2)', () => {
            expect(QCD_OCTET_SINGLET_FORM.symbol).toBe('137 = 128 + 8 + 1');
            expect(QCD_OCTET_SINGLET_FORM.evaluate()).toBe(137);
        });

        it('holds the translation rule 9₍M2₎ = 8₍M3₎ + 1₍M1₎ — the M1 parent sits between the poles', () => {
            expect(TRANSLATION_RULE.m3Gap + TRANSLATION_RULE.m1Parent).toBe(TRANSLATION_RULE.m2Gap);
            expect(TRANSLATION_RULE.m2Gap).toBe(9);
            expect(TRANSLATION_RULE.m1Parent).toBe(MATHEME_SPINE.m1Parent);
        });

        it('traces the execution order 136 → −9 → 127=M₇ → +1 → 128=2⁷ → +9 → 137', () => {
            expect(EXECUTION_ORDER.sum136).toBe(136);
            expect(EXECUTION_ORDER.withdraw9).toBe(127);
            expect(EXECUTION_ORDER.withdraw9).toBe(2 ** 7 - 1);
            expect(EXECUTION_ORDER.parentRestore).toBe(2 ** 7);
            expect(EXECUTION_ORDER.wholenessRestore).toBe(137);
            // The physical measurement face is reference-only, never the 137 spine.
            expect(EXECUTION_ORDER.physicalMeasurementFace).toBeCloseTo(137.036, 2);
            expect(EXECUTION_ORDER.physicalMeasurementFace).not.toBe(137);
        });

        it('renders the 7-8-9 crown spine (M₇=127 · 2⁷=128 · epogdoon-9 gap)', () => {
            expect(SEVEN_EIGHT_NINE_SPINE.seven.mersenne).toBe(127);
            expect(SEVEN_EIGHT_NINE_SPINE.seven.primeIndex).toBe(31); // 31 = M₅ = 2⁵ − 1
            expect(SEVEN_EIGHT_NINE_SPINE.seven.harmonicSeventh).toBeCloseTo(7 / 4, 6);
            expect(SEVEN_EIGHT_NINE_SPINE.eight.binaryClosure).toBe(128);
            expect(SEVEN_EIGHT_NINE_SPINE.nine.gap).toBe(9);
            expect(SEVEN_EIGHT_NINE_SPINE.nine.epogdoonRatio).toBeCloseTo(9 / 8, 6);
        });
    });

    describe('parent attribution — M1-5, never M0-Anuttara-witness (DR-M1-1 / DR-M5-2)', () => {
        it("the real M1 topology producer's parentAttribution resolves to M1-5 on the canonical fallback path", () => {
            // topologyFromPayload is the live carrier render of the kernel
            // M1TopologyProjection.parent_attribution ("M1-5 is the +1 parent").
            const topology = topologyFromPayload({});
            expect(topology.parentAttribution.toLowerCase()).toContain('m1-5');
            expect(topology.parentAttribution).not.toContain(FORBIDDEN_PARENT_ATTRIBUTION);
            expect(assertParentAttribution(topology.parentAttribution)).toBe(PARENT_ATTRIBUTION);
        });

        it('passes the kernel-supplied M1-5 attribution through the contract', () => {
            const topology = topologyFromPayload({
                m1Topology: { parentAttribution: 'M1-5 is the +1 parent' }
            });
            expect(assertParentAttribution(topology.parentAttribution)).toBe('M1-5');
        });

        it('REJECTS a topology slot that renders M0-Anuttara-witness as the +1', () => {
            // If the bus ever regressed to the pre-DR-M1-1 wording, the render
            // would pass the string through — the composition contract catches it.
            const regressed = topologyFromPayload({
                m1Topology: { parentAttribution: 'M0-Anuttara-witness axis is the +1' }
            });
            expect(() => assertParentAttribution(regressed.parentAttribution)).toThrow(
                /M0-Anuttara-witness/
            );
        });

        it('REJECTS an attribution that names neither M1-5 nor the forbidden value', () => {
            expect(() => assertParentAttribution('M2 is the +1 parent')).toThrow(
                /does not resolve to M1-5/
            );
        });
    });

    describe('translation rule bound to the live hinge (real pentadic overlay)', () => {
        it('the real overlay renders 9₍M2₎ = 8₍M3₎ + 1₍M1₎ joined to the live 0/1 hinge', () => {
            const overlay = buildPentadicOverlay({
                tick: 31,
                anuttaraPentadicTrace: PENTADIC_TRACE
            });
            expect(overlay.state).toBe('ready');
            expect(overlay.joinLine).toContain(TRANSLATION_RULE.symbol);
            // "not floated as a standalone identity" — bound to the live hinge.
            expect(overlay.joinLine).toContain('0/1→5');
        });
    });

    describe('assertMathemeSpine — the whole composition contract in one gate', () => {
        it('returns 137 when the live M1-5 attribution is fed in', () => {
            const topology = topologyFromPayload({});
            expect(assertMathemeSpine(topology.parentAttribution)).toBe(137);
        });

        it('throws when the parent attribution regresses to M0-Anuttara-witness', () => {
            expect(() => assertMathemeSpine('M0-Anuttara-witness axis')).toThrow(
                /M0-Anuttara-witness/
            );
        });
    });
});
