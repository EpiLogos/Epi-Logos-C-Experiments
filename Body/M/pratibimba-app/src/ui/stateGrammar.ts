/**
 * Coordinate: M' shell-0 (empty/loading/pending/blocked state grammar — 30.T30.6)
 * Residency: Body/M/pratibimba-app/src/ui/stateGrammar.ts
 * Position (#n): #4 — the frame a binding renders WITHIN when it has no datum
 * Actualises: the pure law behind the 30.6 state-grammar primitives, split out
 *   from the React surface so it is testable without a DOM: the loading-pulse
 *   phase/opacity (Foundation principle 2 — the phase comes from the profile
 *   tick, never a local JS clock), and the ONE tooltip composition every
 *   readiness primitive shares (`id + reason + ownerTrack`), so the badge, the
 *   chip and the overlay cannot drift apart in what they tell the user.
 * Public surface: loadingPulsePhase, loadingPulseOpacity, readinessTooltip,
 *   readinessAriaLabel, emptyStateAriaLabel, readinessIdCssVar,
 *   readinessIdColour.
 * Does NOT own: the taxonomy (ui/bridgeReadiness), the per-id colour
 *   (ui/tokens READINESS_ID_COLOURS), the pulse period (ui/motionTokens
 *   LOADING_PULSE), the reduced-motion rule (ui/accessibility + styles.css),
 *   or any rendering (ui/primitives.tsx).
 * Contract: [[CHROME-CONTRACT]] §6; rerun tranche [[30.T30.6]]; a11y per
 *   [[30.T30.5]] (`loadingPulse` is CONTINUOUS motion — it stops entirely
 *   under `prefers-reduced-motion`, and the text equivalent carries the wait).
 */

import { LOADING_PULSE } from './motionTokens';
import {
    readinessMeaning,
    readinessOwnerTrack,
    type BridgeReadinessId
} from './bridgeReadiness';

/** The 12-tick cycle the profile heartbeat advances through. */
const TICK_CYCLE = 12;

/**
 * The pulse phase in [0, 1) for a profile tick.
 *
 * The pulse "advances in sync with `tick12`" (30.6): one discrete step per
 * tick, twelve steps to the cycle. A null tick — the bridge has stamped no
 * profile yet — parks the pulse at phase 0 rather than inventing motion.
 */
export function loadingPulsePhase(tick12: number | null): number {
    if (tick12 === null || !Number.isFinite(tick12)) {
        return 0;
    }
    const wrapped = ((Math.trunc(tick12) % TICK_CYCLE) + TICK_CYCLE) % TICK_CYCLE;
    return wrapped / TICK_CYCLE;
}

/**
 * Opacity for a phase: a cosine fade between the token's min and max, full at
 * phase 0 and dimmest at phase 0.5. Symmetric, so the cycle has no visual seam
 * where it wraps.
 */
export function loadingPulseOpacity(phase: number): number {
    const { minOpacity, maxOpacity } = LOADING_PULSE;
    const safe = Number.isFinite(phase) ? phase : 0;
    const eased = (1 + Math.cos(2 * Math.PI * safe)) / 2;
    return minOpacity + (maxOpacity - minOpacity) * eased;
}

/**
 * The hover text every readiness primitive shows: the id, the live reason when
 * the bridge gave one (the id's canonical meaning when it did not), and the
 * owning track — which is the point of the tooltip per 30.6, because it is what
 * lets a reader tell WHO to chase for a missing field.
 */
export function readinessTooltip(id: BridgeReadinessId, reason?: string): string {
    const detail = reason !== undefined && reason.trim() !== '' ? reason.trim() : readinessMeaning(id);
    return `${id} — ${detail} (owner: track ${readinessOwnerTrack(id)})`;
}

/** Screen-reader equivalent for a readiness mark: the same three facts, spoken. */
export function readinessAriaLabel(id: BridgeReadinessId, reason?: string): string {
    return `Readiness ${id.replace(/_/g, ' ')}. ${readinessTooltip(id, reason)}`;
}

/** Screen-reader equivalent for an empty binding: empty is a RESULT, and the
 *  reader is told so explicitly rather than meeting silence. */
export function emptyStateAriaLabel(hint: string): string {
    return `Nothing here yet. ${hint}`;
}

/** The CSS custom property carrying `epilogos.colour.readiness.id.<id>`. */
export function readinessIdCssVar(id: BridgeReadinessId): string {
    return `--readiness-${id.replace(/_/g, '-')}`;
}

/**
 * The per-id colour, as a `var()` reference rather than a resolved hex.
 *
 * Deliberate: the THEME picks the polarity (styles.css defines the nine vars
 * once per theme, from the same `READINESS_ID_COLOURS` values), so a primitive
 * never has to know which theme it is in and a theme switch needs no re-render.
 * `themeMapping.resolveToken('readiness.id.<id>', …)` is the JS-side resolver
 * for the canvas/WebGL surfaces that cannot reach a custom property.
 */
export function readinessIdColour(id: BridgeReadinessId): string {
    return `var(${readinessIdCssVar(id)})`;
}
