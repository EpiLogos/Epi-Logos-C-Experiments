/**
 * Coordinate: M' M4' (personal coordinate read — Track 25.T25.7)
 * Residency: Body/M/pratibimba-app/src/panes/m4PersonalCoordinate.ts
 * Actualises: the LIVE Q_personal current-state read the sidebar renders —
 *   the SAME `personalPole.resonance` binding as 5.1's per-artifact surface
 *   (via `resonanceIndicatorFromProfile`, the cross-link clause made literal),
 *   the four operative element glyphs off `personalPole.elementalBalance` in
 *   the L2' canonical order (Earth · Water · Air · Fire — Aether and Salt are
 *   frames, not operatives), and the honest-absence law: the public heartbeat
 *   withholds `personalPole` by privacy law (live-wire DECLARED_NOT_EMITTED),
 *   so absence renders as a NAMED pending, never a locally-invented balance.
 * Public surface: OPERATIVE_ELEMENT_ORDER, ElementGlyphRead,
 *   readElementalGlyphs, QUATERNION_DUMP_PATTERN.
 * Does NOT own: the resonance law (m4NaraResonance — one binding, two
 *   surfaces), the medicine chain (medicineView), or the pole producer
 *   (portal-core PersonalPoleProjection).
 */

export interface OperativeElementGlyph {
    /** L2' alchemical id — 1=Earth, 2=Water, 3=Air, 4=Fire. */
    readonly elementId: 1 | 2 | 3 | 4;
    readonly name: 'Earth' | 'Water' | 'Air' | 'Fire';
    readonly glyph: string;
    /** Balance key on `PersonalPoleElementalBalance` (wire camelCase). */
    readonly balanceKey: 'earth' | 'water' | 'air' | 'fire';
}

/** The operative quartet in L2' canonical order (DR-L2-ELEM-2 register:
 *  0=Aether 1=Earth 2=Water 3=Air 4=Fire 5=Salt — the quartet is 1..4). */
export const OPERATIVE_ELEMENT_ORDER: readonly OperativeElementGlyph[] = Object.freeze([
    Object.freeze({ elementId: 1, name: 'Earth', glyph: '🜃', balanceKey: 'earth' } as const),
    Object.freeze({ elementId: 2, name: 'Water', glyph: '🜄', balanceKey: 'water' } as const),
    Object.freeze({ elementId: 3, name: 'Air', glyph: '🜁', balanceKey: 'air' } as const),
    Object.freeze({ elementId: 4, name: 'Fire', glyph: '🜂', balanceKey: 'fire' } as const)
]);

export type ElementGlyphRead =
    | {
          readonly state: 'resolved';
          readonly glyphs: readonly { readonly element: OperativeElementGlyph; readonly intensity: number }[];
      }
    | { readonly state: 'pending'; readonly reason: string };

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

/**
 * The four glyph intensities off the LIVE pole balance, L2' order preserved.
 * Every intensity must be a finite number in [0, 1]-ish range (the kernel
 * emits normalised weights); a partial or mis-typed balance refuses whole —
 * a sidebar showing three real elements and one guess is a lie with detail.
 */
export function readElementalGlyphs(profilePayload: unknown): ElementGlyphRead {
    const harmonicProfile = asRecord(asRecord(profilePayload)?.harmonicProfile);
    const pole = asRecord(harmonicProfile?.personalPole);
    if (!pole) {
        return {
            state: 'pending',
            reason: 'personalPole is withheld from the public tick (protected-local; live-wire DECLARED_NOT_EMITTED)'
        };
    }
    const balance = asRecord(pole.elementalBalance);
    if (!balance) {
        return { state: 'pending', reason: 'personalPole.elementalBalance absent on this generation' };
    }
    const glyphs: { element: OperativeElementGlyph; intensity: number }[] = [];
    for (const element of OPERATIVE_ELEMENT_ORDER) {
        const raw = balance[element.balanceKey];
        if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0) {
            return {
                state: 'pending',
                reason: `elementalBalance.${element.balanceKey} is not a usable intensity — refusing a partial quartet`
            };
        }
        glyphs.push({ element, intensity: raw });
    }
    return { state: 'resolved', glyphs: Object.freeze(glyphs) };
}

/** UX §6.5 "no quaternion-dump" — the pattern the co-located test scans the
 *  rendered DOM against. Named here so the law and its test share one string. */
export const QUATERNION_DUMP_PATTERN = /\b[wxyz]\s*=\s*-?\d/;
