# Epi-Logos UI Motion Tokens

This contract defines the canonical `epilogos.motion.*` grammar for the [[M']] Theia shell. Motion is derived from the coordinate system and the live kernel profile clock; it is not decorative timing.

## Profile Tick

- `epilogos.motion.profile-tick.duration` is read from `kernel-bridge` `subscribeToProfileTick.intervalMs` for the active profile generation. It is not a free parameter. When the bridge is in `bridge_unavailable` readiness, consumers fall back to `500ms`.
- `epilogos.motion.profile-tick.easing` is `linear`; the tick is the clock.

Source: Track 30.3 cross-link 15.6.

## Lemniscate Transition

- `epilogos.motion.transition.lemniscate.duration`: `600ms`.
- `epilogos.motion.transition.lemniscate.easing`: `cubic-bezier(0.4, 0.0, 0.2, 1)`.
- `epilogos.motion.transition.lemniscate.path`: figure-eight SVG path crossing through the `#4` inflection anchor.
- Reduced motion per DR-WC-DL-4 collapses the transition to a `100ms` snap.

Source: Track 30.3 cross-link 15.5.

## Slerp Tick Choreography

- `epilogos.motion.tick.slerp.angularStep`: `30deg`, the `360deg / 12` SO(3) tick step.
- `epilogos.motion.tick.slerp.choreography`: `RING_QUATERNION_LUT[12]`, a reference to the canonical quaternion-array choreography.
- `epilogos.motion.tick.slerp.kleinBoundaryTick`: `5`, the Hopf-fibre flag flip boundary at tick `5 -> 6`.

Source: Track 30.3 cross-link 15.9.

## Flow Streamline

- `epilogos.motion.flow.streamline.advance`: one position per tick along the six-element DR ring, `200ms`, `ease-out`.
- Implementations read `MathemeHarmonicProfile.ananda_vortex.dr_ring_*` through the shared profile-tick clock.

Source: Track 30.3 cross-links 15.8 and 15.9.

## Klein Flip

- `epilogos.motion.klein-flip.flagDuration`: `300ms`, rotating the Hopf-fibre flag `180deg`.
- `epilogos.motion.klein-flip.crossfadeMs`: `500ms`, cross-fading the active Ananda matrix to its dual.

Source: Track 30.3 cross-link 15.9.

## Flow Watcher

- `epilogos.motion.flow-watcher.debounceMs`: `2000ms`, consumed by `chronos.tranche.complete.quiet` scheduling.

Source: Track 30.3 cross-link 19.11.

## Consumption

Tick-driven widgets consume `SlerpChoreographyClock` / `useSlerpClock()` from `@pratibimba/integrated-composition/design-primitives`. Widgets must not open independent profile-tick subscriptions, and M-extension `src/` code must not introduce `requestAnimationFrame`, `setInterval`, or local `setTimeout` clocks for profile-driven motion.
