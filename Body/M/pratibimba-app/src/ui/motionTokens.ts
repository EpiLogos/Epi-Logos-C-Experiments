/**
 * Coordinate: M' shell-0 (motion-token source — Track 30.3)
 * Residency: Body/M/pratibimba-app/src/ui/motionTokens.ts
 * Actualises: the consolidated motion grammar — the ratified, precise motion
 *   values named as ONE source (the carrier equivalent of the Theia
 *   `ui-motion-tokens.ts`). The transition tier is DR-UI-4 (VALIDATED
 *   2026-06-03): 0/1 toggle 400 cubic-out · Klein-flip 240 linear · Möbius-return
 *   320 smoothstep — defined HERE as the single source, live on
 *   FaceToggleChrome + styles.css `--face-transition-duration`; DR-UI-4 SUPERSEDES
 *   the design-recon draft's 600ms. The clock tier is the profile-tick itself
 *   (Foundation principle 2): linear, subscribed through the ONE seam
 *   `state/useProfileTick` — never requestAnimationFrame / setInterval. Values
 *   are milliseconds as plain numbers (never `Nms` literals) so they stay a
 *   named source, not a raw duration a consumer copies.
 * Public surface: TRANSITIONS, PROFILE_TICK_EASING, SLERP,
 *   FLOW_STREAMLINE, KLEIN_FLIP, FLOW_WATCHER_DEBOUNCE_MS, LOADING_PULSE.
 * Does NOT own: the tick clock (state/useProfileTick) or the CSS animation
 *   keyframes (styles.css). This module holds NO React import by design: it is
 *   imported by pure-law modules, and a component edge here puts Vite-only
 *   build APIs into their graph.
 * Contract: [[CHROME-CONTRACT]] + rerun tranche [[30.T30.3]] (DR-UI-4).
 */

/** The lemniscate transition configs (DR-UI-4, VALIDATED 2026-06-03) — THE
 *  single source, as the motion grammar's transition tier. Values unchanged:
 *  0/1 toggle 400 cubic-out · Klein-flip 240 linear · Möbius-return 320
 *  smoothstep. `primitives.tsx` re-exports this for its components. */
export const TRANSITIONS = Object.freeze({
    lemniscate01: Object.freeze({ ms: 400, easing: 'cubic-out' as const }),
    kleinFlip: Object.freeze({ ms: 240, easing: 'linear' as const }),
    mobiusReturn: Object.freeze({ ms: 320, easing: 'smoothstep' as const })
});

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

/** `<LoadingPulse>` (30.6): a 200ms-period opacity fade between 0.5 and 1.0
 *  while a binding awaits data. The period is named here rather than in the
 *  component so the "200ms" of the brief is a token, not a literal a consumer
 *  copies. Foundation principle 2 still rules the CLOCK: when the bridge is
 *  available the phase comes from the profile tick and nothing local runs; the
 *  period only governs the local fallback that `bridge_unavailable` allows. */
export const LOADING_PULSE = Object.freeze({
    periodMs: 200,
    minOpacity: 0.5,
    maxOpacity: 1
});
