/**
 * Coordinate: M' shell-0 (motion-token source — Track 30.3)
 * Residency: Body/M/pratibimba-app/src/ui/motionTokens.ts
 * Actualises: the consolidated motion grammar — the ratified, precise motion
 *   values named as ONE source (the carrier equivalent of the Theia
 *   `ui-motion-tokens.ts`). The transition tier is DR-UI-4 (VALIDATED
 *   2026-06-03): 0/1 toggle 400 cubic-out · Klein-flip 240 linear · Möbius-return
 *   320 smoothstep — its single source is `primitives.tsx` TRANSITIONS, live on
 *   FaceToggleChrome + styles.css `--face-transition-duration`; DR-UI-4 SUPERSEDES
 *   the design-recon draft's 600ms. The clock tier is the profile-tick itself
 *   (Foundation principle 2): linear, subscribed through the ONE seam
 *   `state/useProfileTick` — never requestAnimationFrame / setInterval. Values
 *   are milliseconds as plain numbers (never `Nms` literals) so they stay a
 *   named source, not a raw duration a consumer copies.
 * Public surface: TRANSITIONS (re-export), PROFILE_TICK_EASING, SLERP,
 *   FLOW_STREAMLINE, KLEIN_FLIP, FLOW_WATCHER_DEBOUNCE_MS.
 * Does NOT own: the transition configs themselves (primitives.tsx TRANSITIONS is
 *   the single source), the tick clock (state/useProfileTick), or the CSS
 *   animation keyframes (styles.css).
 * Contract: [[CHROME-CONTRACT]] + rerun tranche [[30.T30.3]] (DR-UI-4).
 */

/** The lemniscate transition configs (DR-UI-4) — single source is primitives.tsx;
 *  re-exported here as the motion grammar's transition tier. */
export { TRANSITIONS } from './primitives';

/** The profile-tick IS the clock (Foundation principle 2): linear, no easing
 *  adds meaning; every tick-driven surface subscribes through state/useProfileTick. */
export const PROFILE_TICK_EASING = 'linear' as const;

/** SLERP choreography over the 12-tick SO(3) double-cover (30.3 / 15.9). */
export const SLERP = Object.freeze({
    /** 360° / 12 ticks. */
    angularStepDeg: 30,
    /** Hopf-fibre flag flip at the tick 5→6 boundary. */
    kleinBoundaryTick: 5
});

/** DR-ring streamline per-tick advance (one position per tick along the 6-ring).
 *  `ms` is a plain number; the value drives the streamline advance animation. */
export const FLOW_STREAMLINE = Object.freeze({ ms: 200, easing: 'ease-out' as const });

/** Hopf-fibre flag flip at tick 5→6: the flag rotates 180° over `flagMs`; the
 *  active Ananda matrix cross-fades to its dual over `crossfadeMs`. */
export const KLEIN_FLIP = Object.freeze({ flagMs: 300, crossfadeMs: 500 });

/** Khora flow-watcher debounce (19.11) before `chronos.tranche.complete.quiet`. */
export const FLOW_WATCHER_DEBOUNCE_MS = 2000;
