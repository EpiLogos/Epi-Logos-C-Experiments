/**
 * Coordinate: M' M2' (six-axes address-view decoder — Tranche 03.T3.3)
 * Actualises: the frozen warehouse's meaning-packet carried six IDENTICAL
 *   address-view stubs (all pointing at `profile.resonance72.lensAnchorIndex`);
 *   this is the carrier-side replacement: six DISTINCT per-axis decoders
 *   mirroring portal-core's `RoutingAxisViews` laws (f_routing.rs — one law,
 *   both sides of the wire). Arithmetic decodes run locally; LUT-dependent
 *   fields (decan rulers, maqam families, elements) are KERNEL-SOURCED via
 *   the routing-trace payload — no renderer-local tables, ever.
 * Does NOT own: the LUTs (epi-lib m2), the routing computation (portal-core
 *   f_routing), the wire emission (kernel-bridge, Track 10/18 seam).
 */

export type Axis72 = 'mef' | 'tattva' | 'decan' | 'shem' | 'maqam' | 'det';

export const AXIS_ORDER: readonly Axis72[] = ['mef', 'tattva', 'decan', 'shem', 'maqam', 'det'];

// ---- Sonic overlays (DR-M2-2 / Tranche 03.6) ----
// The six axes above address the ONE 72-invariant; mantra-100 and
// Asma'ul-Husna 99+1 are SONIC OVERLAYS routed onto it — never axes. The
// frozen warehouse fused `shem-asma` into one address view; that collapse was
// mathematically wrong (72 vs 99+1 cardinality, axis vs overlay role) and is
// ratified apart: `shem` is the 72-cardinality axis in AXIS_ORDER; `asma` is
// an overlay here. Overlay values route through kernel payloads (m2.h LUTs),
// never local tables.

export type SonicOverlay = 'mantra' | 'asma';

export const OVERLAY_ORDER: readonly SonicOverlay[] = ['mantra', 'asma'];

/** Overlay cardinalities per DR-M2-2: mantra 100 (50+50 Matrika/Malini),
 *  Asma'ul-Husna 99+1 — NOT 72; the asymmetry with the axis space is the law. */
export const OVERLAY_CARDINALITY: Readonly<Record<SonicOverlay, number>> = {
    mantra: 100,
    asma: 99 + 1
};

export const AXIS_CARDINALITY = 72;

/** Each axis reads its OWN wire field — the anti-stub law. None aliases
 * `profile.resonance72.lensAnchorIndex`; that path stays MEF-only via the
 * trace's axisViews object. */
export const AXIS_SOURCE_FIELDS: Readonly<Record<Axis72, string>> = {
    mef: 'routingTrace.axisViews.mef',
    tattva: 'routingTrace.axisViews.tattva',
    decan: 'routingTrace.axisViews.decan',
    shem: 'routingTrace.axisViews.shem',
    maqam: 'routingTrace.axisViews.maqam',
    det: 'routingTrace.axisViews.det'
};

export interface AxisDecode {
    readonly axis: Axis72;
    /** Arithmetic address parts derivable locally (portal-core law). */
    readonly parts: Readonly<Record<string, number | boolean>>;
    /** Field names that MUST come from the kernel payload (LUT-owned). */
    readonly kernelSourced: readonly string[];
}

/** Decode the arithmetic face of one axis at address72 (0..71). The
 * formulas are verbatim ports of portal-core's `*AxisView::from_index72`. */
export function decodeAxisAt(address72: number, axis: Axis72): AxisDecode | null {
    if (!Number.isInteger(address72) || address72 < 0 || address72 >= 72) {
        return null;
    }
    switch (axis) {
        case 'mef': {
            const lens = Math.floor(address72 / 6);
            return {
                axis,
                parts: {
                    lens,
                    position: address72 % 6,
                    isInverted: lens >= 6,
                    lFamilyLink: lens % 6
                },
                kernelSourced: []
            };
        }
        case 'tattva':
            return {
                axis,
                parts: { tattvaIndex: Math.floor(address72 / 2), phase: address72 % 2 },
                kernelSourced: []
            };
        case 'decan': {
            const decan36 = Math.floor(address72 / 2);
            return {
                axis,
                parts: {
                    decan36,
                    sign: Math.floor((decan36 % 9) / 3),
                    decan: decan36 % 3,
                    face: address72 % 2
                },
                kernelSourced: ['elementId', 'rulingPlanet']
            };
        }
        case 'shem':
            return {
                axis,
                parts: {
                    shemIdx: address72,
                    choir: Math.floor(address72 / 9),
                    position: address72 % 9
                },
                kernelSourced: ['elementId', 'decanLink']
            };
        case 'maqam':
            return {
                axis,
                parts: { index72: address72 },
                kernelSourced: ['family', 'modeInFamily', 'planetRuler']
            };
        case 'det':
            return {
                axis,
                parts: {
                    index72: address72,
                    compressed64: Math.floor((address72 * 8) / 9)
                },
                kernelSourced: ['det64']
            };
    }
}

/** Re-encode an axis decode back to address72 — the per-axis round-trip. */
export function encodeAxis(decode: AxisDecode): number | null {
    const p = decode.parts;
    switch (decode.axis) {
        case 'mef':
            return (p.lens as number) * 6 + (p.position as number);
        case 'tattva':
            return (p.tattvaIndex as number) * 2 + (p.phase as number);
        case 'decan':
            return (p.decan36 as number) * 2 + (p.face as number);
        case 'shem':
            return (p.choir as number) * 9 + (p.position as number);
        case 'maqam':
        case 'det':
            return p.index72 as number;
    }
}
