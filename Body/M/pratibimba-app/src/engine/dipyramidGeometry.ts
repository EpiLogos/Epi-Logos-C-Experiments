/**
 * Coordinate: M' M4-5' (dipyramid 6+6 geometry law — Track 08.T8.7)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: the DR-IG-6 CORRECTED dipyramid topology as the labeled vertex
 *   fixture every M4-5' psychoid renderer must consume — the full 6+6 = 12
 *   P/P' positions simultaneously: P5 (top apex) / P5' (bottom apex) as the
 *   synthesis poles, P1–P4 + P1'–P4' as INTERLEAVED base vertices (mirror law
 *   x + y' = 5 pairs them across the equator), and P0/P0' as the central
 *   axis-point (white/black 0/1 ground) projected through the pole-to-pole
 *   axis. Deliberately non-regular (apex height ≠ half-base). The retired
 *   mis-specification ("6 vertices = 6 QL positions") must never render.
 * Does NOT own: the psychoid field renderer (M4-5' surface, Track 05/24),
 *   protected personal content (DR-M4-3), the lens-ring backdrop.
 */

export interface DipyramidVertex {
    readonly label: string;
    readonly role: 'apex' | 'base' | 'axis-point';
    readonly series: 'P' | "P'";
    readonly position: readonly [number, number, number];
    /** The x + y' = 5 mirror partner (DR-IG-6 interleave law). */
    readonly mirrorLabel: string;
}

/** Non-regular proportions per the QL site research (apex ≠ half-base). */
export const DIPYRAMID_APEX_HEIGHT = 1.25;
export const DIPYRAMID_HALF_BASE = 0.85;

/** Build the canonical labeled 6+6 dipyramid. */
export function buildDipyramid6Plus6(): readonly DipyramidVertex[] {
    const vertices: DipyramidVertex[] = [
        {
            label: 'P5',
            role: 'apex',
            series: 'P',
            position: [0, DIPYRAMID_APEX_HEIGHT, 0],
            mirrorLabel: "P0'"
        },
        {
            label: "P5'",
            role: 'apex',
            series: "P'",
            position: [0, -DIPYRAMID_APEX_HEIGHT, 0],
            mirrorLabel: 'P0'
        }
    ];
    // P1..P4 base + P1'..P4' inverted base, INTERLEAVED around the equator
    // (eight base vertices at 45° steps, alternating series), paired by the
    // mirror law x + y' = 5.
    for (let i = 1; i <= 4; i++) {
        const angleP = ((i - 1) / 4) * Math.PI * 2;
        const angleInv = angleP + Math.PI / 4; // interleave, never collapse
        vertices.push({
            label: `P${i}`,
            role: 'base',
            series: 'P',
            position: [
                DIPYRAMID_HALF_BASE * Math.cos(angleP),
                0,
                DIPYRAMID_HALF_BASE * Math.sin(angleP)
            ],
            mirrorLabel: `P${5 - i}'`
        });
        vertices.push({
            label: `P${i}'`,
            role: 'base',
            series: "P'",
            position: [
                DIPYRAMID_HALF_BASE * Math.cos(angleInv),
                0,
                DIPYRAMID_HALF_BASE * Math.sin(angleInv)
            ],
            mirrorLabel: `P${5 - i}`
        });
    }
    // P0/P0' — ONE central axis-point (0/1 ground), projected through the poles
    vertices.push({
        label: "P0/P0'",
        role: 'axis-point',
        series: 'P',
        position: [0, 0, 0],
        mirrorLabel: "P5/P5'"
    });
    return Object.freeze(vertices);
}
