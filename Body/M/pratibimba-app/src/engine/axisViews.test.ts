import { describe, expect, it } from 'vitest';
import { AXIS_ORDER, AXIS_SOURCE_FIELDS, decodeAxisAt, encodeAxis, OVERLAY_ORDER, OVERLAY_CARDINALITY, AXIS_CARDINALITY } from './axisViews';

describe('axisViews (Tranche 03.T3.3 — six distinct per-axis decoders)', () => {
    it('gives every axis its OWN source field — the six-identical-stubs law is dead', () => {
        const fields = AXIS_ORDER.map(axis => AXIS_SOURCE_FIELDS[axis]);
        expect(new Set(fields).size).toBe(6);
        for (const field of fields) {
            expect(field).not.toContain('lensAnchorIndex');
        }
    });

    it('round-trips every address72 through every axis', () => {
        for (const axis of AXIS_ORDER) {
            for (let address72 = 0; address72 < 72; address72++) {
                const decode = decodeAxisAt(address72, axis);
                expect(decode, `${axis}@${address72} decodes`).not.toBeNull();
                expect(encodeAxis(decode!)).toBe(address72);
            }
        }
    });

    it('decodes with the portal-core laws, not private arithmetic', () => {
        // MEF: lens 12-fold with inversion crossing at lens 6 (index 36).
        const mef = decodeAxisAt(37, 'mef')!;
        expect(mef.parts).toMatchObject({ lens: 6, position: 1, isInverted: true, lFamilyLink: 0 });
        // Tattva: 36 tattvas × 2 phases.
        expect(decodeAxisAt(7, 'tattva')!.parts).toMatchObject({ tattvaIndex: 3, phase: 1 });
        // Decan: 36 decans × 2 faces; sign/decan nest inside a 9-family.
        expect(decodeAxisAt(25, 'decan')!.parts).toMatchObject({ decan36: 12, sign: 1, decan: 0, face: 1 });
        // Shem: 8 choirs × 9 positions.
        expect(decodeAxisAt(64, 'shem')!.parts).toMatchObject({ choir: 7, position: 1 });
        // Det: the epogdoon 8/9 compression rides the det axis.
        expect(decodeAxisAt(71, 'det')!.parts).toMatchObject({ compressed64: 63 });
    });

    it('declares LUT-owned fields as kernel-sourced — no renderer-local tables', () => {
        expect(decodeAxisAt(0, 'decan')!.kernelSourced).toContain('rulingPlanet');
        expect(decodeAxisAt(0, 'maqam')!.kernelSourced).toContain('family');
        expect(decodeAxisAt(0, 'det')!.kernelSourced).toContain('det64');
        expect(decodeAxisAt(0, 'mef')!.kernelSourced).toHaveLength(0);
    });

    it('rejects out-of-range addresses instead of wrapping silently', () => {
        expect(decodeAxisAt(72, 'mef')).toBeNull();
        expect(decodeAxisAt(-1, 'shem')).toBeNull();
        expect(decodeAxisAt(3.5, 'det')).toBeNull();
    });
});

describe('sonic overlays vs axes (DR-M2-2 / 03.T3.6)', () => {
    it('shem is a real 72-axis; asma is an overlay — the fused shem-asma collapse stays dead', () => {
        expect(AXIS_ORDER).toContain('shem');
        expect(AXIS_ORDER as readonly string[]).not.toContain('asma');
        expect(OVERLAY_ORDER).toContain('asma');
        expect(OVERLAY_ORDER as readonly string[]).not.toContain('shem');
    });

    it('the cardinality asymmetry is the law: axes 72, mantra 100, asma 99+1', () => {
        expect(AXIS_CARDINALITY).toBe(72);
        expect(OVERLAY_CARDINALITY.mantra).toBe(100);
        expect(OVERLAY_CARDINALITY.asma).toBe(100); // 99 + 1 — never 72
        for (const axis of AXIS_ORDER) {
            // every axis round-trips the full 72-space; overlays never enter it
            expect(decodeAxisAt(0, axis)).not.toBeNull();
            expect(decodeAxisAt(71, axis)).not.toBeNull();
            expect(decodeAxisAt(72, axis)).toBeNull();
        }
    });
});
